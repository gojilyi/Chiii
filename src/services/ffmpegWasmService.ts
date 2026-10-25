/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface AudioTrackItem {
  filename: string;
  url: string;
  trimStart: number;
  trimEnd?: number;
  startTime: number; // timeline delay in seconds
  volume: number;    // 0.0 to 2.0
}

export class FFmpegWasmService {
  private static ffmpegInstance: FFmpeg | null = null;
  private static isLoaded = false;
  private static isLoading = false;

  /**
   * Initializes and loads the ffmpeg.wasm engine
   * Tries local server static route /ffmpeg first, then falls back to unpkg CDN.
   */
  static async load(onProgress?: (progress: number) => void): Promise<FFmpeg> {
    if (this.ffmpegInstance && this.isLoaded) {
      return this.ffmpegInstance;
    }

    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.ffmpegInstance && this.isLoaded) {
        return this.ffmpegInstance;
      }
    }

    this.isLoading = true;

    try {
      const ffmpeg = new FFmpeg();

      if (onProgress) {
        ffmpeg.on('progress', ({ progress }) => {
          onProgress(Math.min(100, Math.max(0, Math.round(progress * 100))));
        });
      }

      // 1. Try local server endpoint first
      try {
        const coreURL = await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript');
        const wasmURL = await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm');
        await ffmpeg.load({ coreURL, wasmURL });
      } catch (localErr) {
        console.warn('Local ffmpeg core load failed, attempting CDN fallback:', localErr);
        const cdnBase = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        const coreURL = await toBlobURL(`${cdnBase}/ffmpeg-core.js`, 'text/javascript');
        const wasmURL = await toBlobURL(`${cdnBase}/ffmpeg-core.wasm`, 'application/wasm');
        await ffmpeg.load({ coreURL, wasmURL });
      }

      this.ffmpegInstance = ffmpeg;
      this.isLoaded = true;
      return ffmpeg;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Writes a file to ffmpeg virtual FS
   */
  static async writeFile(filename: string, data: Uint8Array | string): Promise<void> {
    const ffmpeg = await this.load();
    await ffmpeg.writeFile(filename, data);
  }

  /**
   * Reads a file from ffmpeg virtual FS as a clean ArrayBuffer-backed Uint8Array
   */
  static async readFile(filename: string): Promise<Uint8Array> {
    const ffmpeg = await this.load();
    const data = await ffmpeg.readFile(filename);
    if (data instanceof Uint8Array) {
      const regularBuffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(regularBuffer).set(data);
      return new Uint8Array(regularBuffer);
    }
    const encoded = new TextEncoder().encode(String(data));
    const regularBuffer = new ArrayBuffer(encoded.byteLength);
    new Uint8Array(regularBuffer).set(encoded);
    return new Uint8Array(regularBuffer);
  }

  /**
   * Deletes a file from ffmpeg virtual FS
   */
  static async deleteFile(filename: string): Promise<void> {
    if (!this.ffmpegInstance) return;
    try {
      await this.ffmpegInstance.deleteFile(filename);
    } catch {}
  }

  /**
   * Executes an ffmpeg command
   */
  static async exec(args: string[]): Promise<number> {
    const ffmpeg = await this.load();
    return await ffmpeg.exec(args);
  }

  /**
   * Mixes audio tracks using ffmpeg atrim, adelay, volume, and amix
   * Outputs mixed_audio.aac in ffmpeg's virtual FS
   */
  static async mixAudio(
    tracks: AudioTrackItem[],
    totalDuration: number
  ): Promise<string> {
    const ffmpeg = await this.load();
    const outputAudioFilename = 'mixed_audio.aac';

    // Delete existing mixed audio if present
    try {
      await ffmpeg.deleteFile(outputAudioFilename);
    } catch {}

    // Case 1: No audio tracks -> Generate silence for the project duration
    if (!tracks || tracks.length === 0) {
      const durationSafe = Math.max(1, Math.round(totalDuration || 5));
      const code = await ffmpeg.exec([
        '-f', 'lavfi',
        '-i', 'anullsrc=r=44100:cl=stereo',
        '-t', String(durationSafe),
        '-c:a', 'aac',
        '-y',
        outputAudioFilename
      ]);
      if (code !== 0) {
        throw new Error(`فشل إنشاء مسار الصوت الصامت (رمز: ${code})`);
      }
      return outputAudioFilename;
    }

    // Case 2: Exactly 1 audio track
    if (tracks.length === 1) {
      const t = tracks[0];
      const delayMs = Math.max(0, Math.round((t.startTime || 0) * 1000));
      const trimStart = Math.max(0, t.trimStart || 0);
      const volume = Math.max(0, Math.min(2, t.volume ?? 1));

      const filterParts: string[] = [];
      if (t.trimEnd && t.trimEnd > trimStart) {
        filterParts.push(`atrim=start=${trimStart}:end=${t.trimEnd}`);
      } else if (trimStart > 0) {
        filterParts.push(`atrim=start=${trimStart}`);
      }
      filterParts.push('asetpts=PTS-STARTPTS');
      if (delayMs > 0) {
        filterParts.push(`adelay=${delayMs}|${delayMs}`);
      }
      filterParts.push(`volume=${volume.toFixed(2)}`);
      filterParts.push('aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo');

      const filterStr = `[0:a]${filterParts.join(',')}[aout]`;

      const code = await ffmpeg.exec([
        '-i', t.filename,
        '-filter_complex', filterStr,
        '-map', '[aout]',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-y',
        outputAudioFilename
      ]);

      if (code !== 0) {
        // Fallback: direct transcode without filter if complex filter failed
        await ffmpeg.exec([
          '-i', t.filename,
          '-c:a', 'aac',
          '-b:a', '192k',
          '-y',
          outputAudioFilename
        ]);
      }
      return outputAudioFilename;
    }

    // Case 3: Multiple audio tracks -> atrim, adelay, volume, amix
    const inputArgs: string[] = [];
    const filterChains: string[] = [];
    const mixLabels: string[] = [];

    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      inputArgs.push('-i', t.filename);

      const delayMs = Math.max(0, Math.round((t.startTime || 0) * 1000));
      const trimStart = Math.max(0, t.trimStart || 0);
      const volume = Math.max(0, Math.min(2, t.volume ?? 1));

      const parts: string[] = [];
      if (t.trimEnd && t.trimEnd > trimStart) {
        parts.push(`atrim=start=${trimStart}:end=${t.trimEnd}`);
      } else if (trimStart > 0) {
        parts.push(`atrim=start=${trimStart}`);
      }
      parts.push('asetpts=PTS-STARTPTS');
      if (delayMs > 0) {
        parts.push(`adelay=${delayMs}|${delayMs}`);
      }
      parts.push(`volume=${volume.toFixed(2)}`);

      filterChains.push(`[${i}:a]${parts.join(',')}[a${i}]`);
      mixLabels.push(`[a${i}]`);
    }

    const mixChain = `${mixLabels.join('')}amix=inputs=${tracks.length}:duration=longest:dropout_transition=0,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[aout]`;
    const fullFilter = `${filterChains.join(';')};${mixChain}`;

    const execArgs = [
      ...inputArgs,
      '-filter_complex', fullFilter,
      '-map', '[aout]',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-y',
      outputAudioFilename
    ];

    const code = await ffmpeg.exec(execArgs);
    if (code !== 0) {
      throw new Error(`فشل دمج مسارات الصوت عبر ffmpeg amix (رمز الخطأ: ${code})`);
    }

    return outputAudioFilename;
  }

  /**
   * Encodes frames and audio into an MP4 video file
   * Command: ffmpeg -framerate 30 -i frame_%05d.jpg -i mixed_audio.aac -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac -shortest output.mp4
   */
  static async encodeFramesToMp4(
    audioFilename: string | null,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const ffmpeg = await this.load(onProgress);
    const outputFilename = 'output.mp4';

    try {
      await ffmpeg.deleteFile(outputFilename);
    } catch {}

    const args: string[] = [
      '-framerate', '30',
      '-i', 'frame_%05d.jpg'
    ];

    if (audioFilename) {
      args.push('-i', audioFilename);
      args.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-shortest',
        '-y',
        outputFilename
      );
    } else {
      args.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-y',
        outputFilename
      );
    }

    const code = await ffmpeg.exec(args);
    if (code !== 0) {
      throw new Error(`فشل تشفير الفيديو النهائي بـ ffmpeg libx264 (رمز الخطأ: ${code})`);
    }

    const outputData = await this.readFile(outputFilename);
    const regularBuffer = new ArrayBuffer(outputData.byteLength);
    new Uint8Array(regularBuffer).set(outputData);

    return new Blob([regularBuffer], { type: 'video/mp4' });
  }
}
