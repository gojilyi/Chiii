/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export class FFmpegWasmService {
  private static ffmpegInstance: FFmpeg | null = null;
  private static isLoaded = false;

  /**
   * Initializes and loads the ffmpeg.wasm engine
   */
  static async load(onProgress?: (progress: number) => void): Promise<FFmpeg> {
    if (this.ffmpegInstance && this.isLoaded) {
      return this.ffmpegInstance;
    }

    const ffmpeg = new FFmpeg();

    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress(Math.min(100, Math.max(0, Math.round(progress * 100))));
      });
    }

    // Load wasm binaries
    await ffmpeg.load();
    this.ffmpegInstance = ffmpeg;
    this.isLoaded = true;
    return ffmpeg;
  }

  /**
   * Converts a WebM video Blob to an MP4 Blob using ffmpeg.wasm inside the browser
   * Command: -i input.webm -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac output.mp4
   */
  static async convertWebmToMp4(
    webmBlob: Blob,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const ffmpeg = await this.load(onProgress);

    const inputData = await fetchFile(webmBlob);
    await ffmpeg.writeFile('input.webm', inputData);

    const execCode = await ffmpeg.exec([
      '-i', 'input.webm',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      'output.mp4'
    ]);

    if (execCode !== 0) {
      throw new Error(`ffmpeg.wasm exec failed with code: ${execCode}`);
    }

    const data = await ffmpeg.readFile('output.mp4');

    try {
      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mp4');
    } catch {}

    const u8 = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
    const regularBuffer = new ArrayBuffer(u8.byteLength);
    new Uint8Array(regularBuffer).set(u8);
    return new Blob([regularBuffer], { type: 'video/mp4' });
  }
}


