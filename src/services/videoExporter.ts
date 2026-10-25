/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDraft, BackgroundAdjustments } from '../types';
import { DEFAULT_BACKGROUND_ADJUSTMENTS } from '../constants/defaults';
import { FFmpegWasmService } from './ffmpegWasmService';

export interface VideoExportCallbacks {
  onProgress: (percent: number, stageText: string) => void;
  onSuccess: (filename: string, sizeBytes: number, format: string) => void;
  onError: (errorTitle: string, errorDetails: string) => void;
}

export class VideoExporter {
  /**
   * Selects the preferred video MIME type strictly following the prioritized list:
   * ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
   */
  static getPreferredMimeType(): string {
    if (typeof MediaRecorder === 'undefined') {
      throw new Error('متصفحك لا يدعم واجهة MediaRecorder لتسجيل الفيديو');
    }

    const candidateTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];

    const supported = candidateTypes.find((type) => MediaRecorder.isTypeSupported(type));
    if (!supported) {
      throw new Error('لم يتم العثور على صيغة فيديو مدعومة في المتصفح لتسجيل MediaRecorder');
    }

    return supported;
  }

  /**
   * Preloads an image asynchronously
   */
  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = url;
    });
  }

  /**
   * Draws a complete composite frame onto the rendering context
   */
  private static drawFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    draft: ProjectDraft,
    baseImage: HTMLImageElement,
    clipImagesMap: Map<string, HTMLImageElement>
  ) {
    // 1. Clear background
    ctx.fillStyle = '#0a1411';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Pulse heartbeat motion if enabled
    const pulseEffect = draft.effects.find((e) => e.id === 'pulse_heartbeat' && e.enabled);
    if (pulseEffect) {
      const pulseScale = 1 + Math.sin(currentTime * 3.5) * ((pulseEffect.intensity / 100) * 0.025);
      ctx.translate(width / 2, height / 2);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-width / 2, -height / 2);
    }

    // Subtle zoom (Ken Burns) if enabled
    const zoomEffect = draft.effects.find((e) => e.id === 'subtle_zoom' && e.enabled);
    if (zoomEffect) {
      const durationVal = Math.max(draft.duration || 1, 1);
      const zoomScale = 1 + ((currentTime / durationVal) * (zoomEffect.intensity / 100) * 0.08);
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-width / 2, -height / 2);
    }

    const bgAdj: BackgroundAdjustments = draft.backgroundAdjustments || { ...DEFAULT_BACKGROUND_ADJUSTMENTS };

    // Apply Background Filters
    const filterParts: string[] = [
      `brightness(${bgAdj.brightness}%)`,
      `contrast(${bgAdj.contrast}%)`
    ];
    if (bgAdj.blur > 0) {
      filterParts.push(`blur(${bgAdj.blur}px)`);
    }
    ctx.filter = filterParts.join(' ');

    // Center, Pan, Scale, Flip
    const centerX = width / 2;
    const centerY = height / 2;
    const panX = (bgAdj.panX / 100) * width;
    const panY = (bgAdj.panY / 100) * height;

    ctx.translate(centerX + panX, centerY + panY);
    ctx.scale(bgAdj.scale * (bgAdj.flipHorizontal ? -1 : 1), bgAdj.scale);
    ctx.translate(-centerX, -centerY);

    // Draw Base Image/Video
    if (baseImage && baseImage.complete && baseImage.naturalWidth > 0) {
      ctx.drawImage(baseImage, 0, 0, width, height);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0c1a16');
      bgGrad.addColorStop(0.5, '#122b22');
      bgGrad.addColorStop(1, '#050c0a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
    ctx.filter = 'none';

    // 2. Render Media Clips
    (draft.mediaClips || []).forEach((clip) => {
      if (currentTime >= clip.startTime && currentTime <= clip.endTime) {
        const clipImg = clipImagesMap.get(clip.url);
        if (clipImg && clipImg.complete && clipImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, clip.opacity ?? 1));

          const posX = ((clip.positionX ?? 50) / 100) * width;
          const posY = ((clip.positionY ?? 50) / 100) * height;
          const scale = clip.scale ?? 1;

          ctx.translate(posX, posY);
          ctx.scale(scale, scale);

          const targetW = width * 0.55;
          const aspect = clipImg.naturalHeight / clipImg.naturalWidth;
          const targetH = targetW * aspect;

          ctx.drawImage(clipImg, -targetW / 2, -targetH / 2, targetW, targetH);
          ctx.restore();
        }
      }
    });

    // 3. Render Quranic Text Overlays
    (draft.textOverlays || []).forEach((overlay) => {
      if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
        const posX = (overlay.positionX / 100) * width;
        const posY = (overlay.positionY / 100) * height;

        ctx.save();
        const font = overlay.fontFamily === 'Aref Ruqaa' ? `'Aref Ruqaa', cursive` : `'${overlay.fontFamily}', 'Amiri', serif`;
        ctx.font = `600 ${overlay.fontSize * (width / 400)}px ${font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        const displayText = overlay.hasAyahBrackets
          ? `﴿ ${overlay.text} ﴾`
          : overlay.text;

        if (overlay.backgroundColor) {
          const metrics = ctx.measureText(displayText);
          const boxPadding = 16;
          ctx.fillStyle = overlay.backgroundColor;
          ctx.fillRect(
            posX - metrics.width / 2 - boxPadding,
            posY - overlay.fontSize - 6,
            metrics.width + boxPadding * 2,
            overlay.fontSize * 2 + 12
          );
        }

        ctx.fillStyle = overlay.color || '#FFFFFF';
        ctx.fillText(displayText, posX, posY);
        ctx.restore();
      }
    });

    // 4. Render Animated Calligraphy Story
    const story = draft.calligraphyStory;
    if (story && story.enabled && story.words && story.words.length > 0) {
      const currentMs = currentTime * 1000;
      ctx.save();
      const baseFontSize = (story.fontSize || 38) * (width / 420);
      ctx.font = `bold ${baseFontSize}px 'Aref Ruqaa', cursive, 'Amiri', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const scrollCenterY = height * 0.62;
      const totalWords = story.words;

      const wordsToDisplay = story.mode === 'word_by_word'
        ? totalWords.filter((w) => currentMs >= w.startMs)
        : totalWords;

      if (wordsToDisplay.length > 0) {
        const lineText = wordsToDisplay.map((w) => w.word).join(' ');
        ctx.shadowColor = 'rgba(25, 12, 4, 0.9)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = story.highlightColor || '#FFDF9E';
        ctx.fillText(lineText, width / 2, scrollCenterY);
      }
      ctx.restore();
    }
  }

  /**
   * Main exportVideo execution:
   * 1. Sets up Canvas with strict even dimensions.
   * 2. Captures canvas.captureStream(30).
   * 3. Sets up AudioContext, resumes it, creates MediaStreamDestination, connects audio, and merges tracks.
   * 4. Selects prioritized codec.
   * 5. Runs MediaRecorder.start(1000).
   * 6. Plays from second 0 to project end with requestAnimationFrame rendering.
   * 7. Validates chunks (> 1KB), runs ffmpeg.wasm to convert to MP4 (with fallback to original WebM).
   * 8. Triggers automatic download.
   */
  static async exportVideo(
    draft: ProjectDraft,
    callbacks: VideoExportCallbacks
  ): Promise<void> {
    const { onProgress, onSuccess, onError } = callbacks;

    try {
      onProgress(2, 'جاري فحص دفق الفيديو وضبط الأبعاد الزوجية...');

      // 1. Calculate strictly even canvas dimensions
      let width = 720;
      let height = 1280;
      if (draft.aspectRatio === '16:9') {
        width = 1280;
        height = 720;
      } else if (draft.aspectRatio === '1:1') {
        width = 720;
        height = 720;
      }

      // Guarantee dimensions are strictly even numbers
      if (width % 2 !== 0) width += 1;
      if (height % 2 !== 0) height += 1;

      // Create dedicated offscreen rendering canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        throw new Error('فشل إنشاء سياق رسم Canvas ثنائي الأبعاد');
      }

      // 2. Preload base image & clip assets
      onProgress(5, 'جاري تحميل وسائط الفيديو والصور...');
      const baseImageUrl = draft.videoSourceUrl || '/assets/aistudio/29515ac3-1b7a-4437-8444-84464b32b5fe_33174229.jpeg';
      const baseImage = await this.loadImage(baseImageUrl);

      const clipImagesMap = new Map<string, HTMLImageElement>();
      for (const clip of draft.mediaClips || []) {
        if (!clipImagesMap.has(clip.url)) {
          const img = await this.loadImage(clip.url);
          clipImagesMap.set(clip.url, img);
        }
      }

      // Draw initial frame at t = 0
      this.drawFrame(ctx, width, height, 0, draft, baseImage, clipImagesMap);

      // 3. Setup Video Stream (30 FPS)
      const streamMethod = (canvas as any).captureStream || (canvas as any).mozCaptureStream;
      if (!streamMethod) {
        throw new Error('متصفحك لا يدعم خاصية captureStream لتسجيل الفيديو');
      }
      const videoStream: MediaStream = streamMethod.call(canvas, 30);

      // 4. Setup Single AudioContext & Destination
      let audioCtx: AudioContext | null = null;
      let audioDest: MediaStreamAudioDestinationNode | null = null;
      let audioSourceNode: AudioBufferSourceNode | null = null;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass && draft.replacedAudio?.audioUrl) {
        onProgress(10, 'جاري معالجة ومزامنة صوت التلاوة عبر AudioContext...');
        audioCtx = new AudioContextClass();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        audioDest = audioCtx.createMediaStreamDestination();

        try {
          const audioResp = await fetch(draft.replacedAudio.audioUrl);
          const audioBufferRaw = await audioResp.arrayBuffer();
          const decodedAudio = await audioCtx.decodeAudioData(audioBufferRaw);

          const gainNode = audioCtx.createGain();
          gainNode.gain.value = Math.max(0, Math.min(1, draft.replacedAudioVolume ?? 1));
          gainNode.connect(audioDest);

          audioSourceNode = audioCtx.createBufferSource();
          audioSourceNode.buffer = decodedAudio;
          audioSourceNode.connect(gainNode);

          // Add audio tracks to the video stream
          audioDest.stream.getAudioTracks().forEach((track) => {
            videoStream.addTrack(track);
          });
        } catch (audioErr: any) {
          console.warn('Audio decoding warning:', audioErr);
        }
      }

      // 5. Select prioritized codec
      const mimeType = this.getPreferredMimeType();

      // 6. Initialize MediaRecorder at 8Mbps
      const recorder = new MediaRecorder(videoStream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // 7. Calculate real project duration (longest audio or clip, no fixed limit)
      const audioDuration = draft.replacedAudio
        ? Math.max(0, (draft.replacedAudio.trimEnd || draft.replacedAudio.duration || 0) - (draft.replacedAudio.trimStart || 0))
        : 0;
      const mediaClipsMax = Math.max(0, ...(draft.mediaClips || []).map((c) => c.endTime || 0));
      const totalDuration = Math.max(draft.duration || 0, audioDuration, mediaClipsMax, 1);

      // Start recording with 1000ms timeslices per requirement
      recorder.start(1000);

      const trimStart = draft.replacedAudio?.trimStart || 0;
      if (audioSourceNode) {
        try {
          audioSourceNode.start(0, trimStart, totalDuration);
        } catch {}
      }

      onProgress(15, `بدء تسجيل الفيديو بالسرعة الطبيعية (0.0s إلى ${totalDuration.toFixed(1)}s)...`);

      // 8. Playback loop synchronized with requestAnimationFrame
      const startTime = performance.now();
      const totalDurationMs = totalDuration * 1000;

      await new Promise<void>((resolve, reject) => {
        let isStopped = false;

        const renderStep = () => {
          if (isStopped) return;

          const elapsedMs = performance.now() - startTime;
          const currentSec = Math.min(totalDuration, elapsedMs / 1000);

          // Draw frame with drawImage
          VideoExporter.drawFrame(ctx, width, height, currentSec, draft, baseImage, clipImagesMap);

          const progressPercent = Math.min(85, Math.round(15 + (elapsedMs / totalDurationMs) * 70));
          onProgress(
            progressPercent,
            `تسجيل الإطارات: ${currentSec.toFixed(1)}s / ${totalDuration.toFixed(1)}s (${progressPercent}%)`
          );

          if (elapsedMs >= totalDurationMs) {
            isStopped = true;
            try {
              audioSourceNode?.stop();
              audioCtx?.close().catch(() => {});
            } catch {}

            if (recorder.state !== 'inactive') {
              recorder.stop();
            }
            resolve();
          } else {
            requestAnimationFrame(renderStep);
          }
        };

        recorder.onerror = (recErr: any) => {
          isStopped = true;
          reject(recErr);
        };

        requestAnimationFrame(renderStep);
      });

      // 9. On stop: Validate recorded chunks
      await new Promise<void>((resolve, reject) => {
        recorder.onstop = async () => {
          try {
            onProgress(88, 'جاري فحص حجم البيانات المسجلة وتجهيز ملف الفيديو...');

            const rawBlob = new Blob(chunks, { type: mimeType });

            // Fail if chunks is empty or blob size is less than 1KB
            if (chunks.length === 0 || rawBlob.size < 1024) {
              const err = new Error('فشل التسجيل: حجم ملف الفيديو الناتج أقل من 1KB أو لم يتم التقاط بيانات كافية');
              err.name = 'ExportValidationError';
              throw err;
            }

            let finalBlob = rawBlob;
            let finalFormat = mimeType.includes('mp4') ? 'mp4' : 'webm';

            // 10. Step 4: Convert WebM to MP4 via ffmpeg.wasm if recorded in WebM
            if (finalFormat === 'webm') {
              onProgress(90, 'جاري تحويل الفيديو إلى صيغة MP4 العالمية عبر ffmpeg.wasm...');
              try {
                finalBlob = await FFmpegWasmService.convertWebmToMp4(rawBlob, (wasmPct) => {
                  onProgress(90 + Math.round(wasmPct * 0.08), `تحويل MP4: ${wasmPct}%`);
                });
                finalFormat = 'mp4';
              } catch (wasmErr: any) {
                console.warn('ffmpeg.wasm conversion fallback to WebM:', wasmErr);
                onProgress(96, 'اكتمل التسجيل بصيغة WebM فائقة الجودة...');
                finalBlob = rawBlob;
                finalFormat = 'webm';
              }
            }

            // 11. Trigger automatic file download
            onProgress(98, 'بدء تنزيل ملف الفيديو إلى جهازك...');
            const cleanTitle = draft.title ? draft.title.replace(/\s+/g, '_') : 'فيديو_المشروع';
            const filename = `${cleanTitle}.${finalFormat}`;
            const downloadUrl = URL.createObjectURL(finalBlob);

            const downloadLink = document.createElement('a');
            downloadLink.style.display = 'none';
            downloadLink.href = downloadUrl;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();

            setTimeout(() => {
              if (document.body.contains(downloadLink)) {
                document.body.removeChild(downloadLink);
              }
            }, 600);

            onProgress(100, 'اكتمل إنتاج وتنزيل الفيديو بنجاح!');
            onSuccess(filename, finalBlob.size, finalFormat);
            resolve();
          } catch (err: any) {
            reject(err);
          }
        };
      });

    } catch (error: any) {
      console.error('VideoExporter failure:', error);
      const errorTitle = error.name || 'ExportError';
      const errorDetails = error.message || 'حدث خطأ غير متوقع أثناء معالجة وتصدير الفيديو';
      onError(errorTitle, errorDetails);
    }
  }
}
