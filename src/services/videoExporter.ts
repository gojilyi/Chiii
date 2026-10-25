/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDraft, BackgroundAdjustments } from '../types';
import { DEFAULT_BACKGROUND_ADJUSTMENTS } from '../constants/defaults';
import { FFmpegWasmService, AudioTrackItem } from './ffmpegWasmService';

export interface VideoExportCallbacks {
  onProgress: (percent: number, stageText: string) => void;
  onSuccess: (filename: string, sizeBytes: number, format: string) => void;
  onError: (errorTitle: string, errorDetails: string) => void;
}

export class VideoExporter {
  /**
   * Helper to preload an image asynchronously with crossOrigin="anonymous"
   */
  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn('Failed to load image asset:', url);
        resolve(img);
      };
      img.src = url;
    });
  }

  /**
   * Helper to preload a video element asynchronously with crossOrigin="anonymous"
   */
  private static loadVideo(url: string): Promise<HTMLVideoElement> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      let resolved = false;
      const onReady = () => {
        if (!resolved) {
          resolved = true;
          resolve(video);
        }
      };

      video.addEventListener('loadedmetadata', onReady);
      video.addEventListener('canplay', onReady);
      video.addEventListener('error', () => {
        console.warn('Failed to load video asset:', url);
        onReady();
      });

      // Safety timeout after 5s
      setTimeout(onReady, 5000);
      video.src = url;
    });
  }

  /**
   * Seeks a video element to a target time and awaits the seeked event
   */
  private static seekVideo(video: HTMLVideoElement, targetTime: number): Promise<void> {
    return new Promise((resolve) => {
      if (!video || !Number.isFinite(targetTime)) {
        resolve();
        return;
      }

      const clampedTime = Math.max(0, Math.min(targetTime, video.duration || targetTime));
      if (Math.abs(video.currentTime - clampedTime) < 0.02) {
        resolve();
        return;
      }

      let resolved = false;
      const onSeeked = () => {
        if (!resolved) {
          resolved = true;
          video.removeEventListener('seeked', onSeeked);
          resolve();
        }
      };

      video.addEventListener('seeked', onSeeked);
      try {
        video.currentTime = clampedTime;
      } catch {
        onSeeked();
      }

      // Safeguard timeout so rendering never hangs on dropped seek events
      setTimeout(onSeeked, 120);
    });
  }

  /**
   * Draws a composite video frame onto the canvas context with all layers
   */
  private static drawFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    totalDuration: number,
    draft: ProjectDraft,
    baseMedia: HTMLImageElement | HTMLVideoElement | null,
    clipElementsMap: Map<string, HTMLImageElement | HTMLVideoElement>
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
      const durationVal = Math.max(totalDuration || 1, 1);
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

    // Draw Base Image or Video
    let drawn = false;
    if (baseMedia instanceof HTMLVideoElement && baseMedia.readyState >= 2 && baseMedia.videoWidth > 0) {
      try {
        ctx.drawImage(baseMedia, 0, 0, width, height);
        drawn = true;
      } catch {}
    } else if (baseMedia instanceof HTMLImageElement && baseMedia.complete && baseMedia.naturalWidth > 0) {
      try {
        ctx.drawImage(baseMedia, 0, 0, width, height);
        drawn = true;
      } catch {}
    }

    ctx.restore();
    ctx.filter = 'none';

    if (!drawn) {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0c1a16');
      bgGrad.addColorStop(0.5, '#122b22');
      bgGrad.addColorStop(1, '#050c0a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 1.2 Color Grading Filter
    if (bgAdj.colorGrade && bgAdj.colorGrade !== 'none') {
      ctx.save();
      if (bgAdj.colorGrade === 'warm_gold') {
        ctx.fillStyle = 'rgba(255, 190, 70, 0.18)';
        ctx.fillRect(0, 0, width, height);
      } else if (bgAdj.colorGrade === 'emerald_islamic') {
        ctx.fillStyle = 'rgba(0, 108, 76, 0.22)';
        ctx.fillRect(0, 0, width, height);
      } else if (bgAdj.colorGrade === 'vintage_amber') {
        ctx.fillStyle = 'rgba(200, 130, 40, 0.22)';
        ctx.fillRect(0, 0, width, height);
      } else if (bgAdj.colorGrade === 'serene_blue') {
        ctx.fillStyle = 'rgba(30, 90, 150, 0.18)';
        ctx.fillRect(0, 0, width, height);
      } else if (bgAdj.colorGrade === 'monochrome') {
        ctx.fillStyle = 'rgba(120, 120, 120, 0.25)';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
    }

    // 1.3 Overlay Darkness
    if (bgAdj.overlayDarkness > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${bgAdj.overlayDarkness / 100})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 1.4 Vignette Shadow
    if (bgAdj.vignette > 0) {
      ctx.save();
      const vigGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.32,
        width / 2,
        height / 2,
        width * 0.72
      );
      vigGrad.addColorStop(0, 'transparent');
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${(bgAdj.vignette / 100) * 0.85})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 1.5 Golden Arch Frame
    if (bgAdj.showGoldArchFrame) {
      ctx.save();
      const pad = 24 * (width / 720);
      ctx.strokeStyle = 'rgba(235, 195, 75, 0.85)';
      ctx.lineWidth = 3.5 * (width / 720);
      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.moveTo(pad, height - pad);
      ctx.lineTo(pad, pad + 70);
      ctx.quadraticCurveTo(width / 2, pad - 20, width - pad, pad + 70);
      ctx.lineTo(width - pad, height - pad);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // 1.6 Lesson Banner Overlay
    if (bgAdj.bannerOverlay?.enabled) {
      const b = bgAdj.bannerOverlay;
      const bScale = (b.scale || 1.0) * (width / 720);
      const bx = (b.positionX / 100) * width;
      const by = (b.positionY / 100) * height;

      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(bScale, bScale);

      const bannerW = 320;
      const bannerH = 110;
      const wHalf = bannerW / 2;
      const hHalf = bannerH / 2;

      ctx.fillStyle = 'rgba(15, 30, 24, 0.92)';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(-wHalf, -hHalf, bannerW, bannerH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#A3E635';
      ctx.font = 'bold 18px "Cairo", sans-serif';
      ctx.fillText(b.headerText || 'شرح كتاب', 0, -hHalf + 28);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px "Amiri", serif';
      ctx.fillText(b.mainTitle || 'إيصال السالك', 0, -hHalf + 60);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '14px "Cairo", sans-serif';
      ctx.fillText(b.subtitle || 'إلى أصول مذهب الإمام مالك', 0, -hHalf + 88);

      ctx.restore();
    }

    // 2. Render Media Clips
    (draft.mediaClips || []).forEach((clip) => {
      if (currentTime >= clip.startTime && currentTime <= clip.endTime) {
        const el = clipElementsMap.get(clip.url);
        if (el) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, clip.opacity ?? 1));

          const posX = ((clip.positionX ?? 50) / 100) * width;
          const posY = ((clip.positionY ?? 50) / 100) * height;
          const scale = clip.scale ?? 1;

          ctx.translate(posX, posY);
          ctx.scale(scale, scale);

          const targetW = width * 0.55;
          let elW = 1;
          let elH = 1;

          if (el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0) {
            elW = el.naturalWidth;
            elH = el.naturalHeight;
            const targetH = targetW * (elH / elW);
            ctx.drawImage(el, -targetW / 2, -targetH / 2, targetW, targetH);
          } else if (el instanceof HTMLVideoElement && el.readyState >= 2 && el.videoWidth > 0) {
            elW = el.videoWidth;
            elH = el.videoHeight;
            const targetH = targetW * (elH / elW);
            ctx.drawImage(el, -targetW / 2, -targetH / 2, targetW, targetH);
          }

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
        ctx.font = `600 ${overlay.fontSize * (width / 420)}px ${font}`;
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
          const boxPadding = 16 * (width / 420);
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
   * Main Kinemaster-style Export Pipeline:
   * 1. Render all frames strictly onto canvas without live playback -> saved to ffmpeg virtual FS as frame_%05d.jpg
   * 2. Prepare audio with ffmpeg atrim, adelay, volume, amix -> mixed_audio.aac
   * 3. Encode final MP4 with ffmpeg libx264 ultrafast + aac -> output.mp4
   * 4. Trigger automatic download of output.mp4 and clean up virtual FS
   */
  static async exportVideo(
    draft: ProjectDraft,
    callbacks: VideoExportCallbacks
  ): Promise<void> {
    const { onProgress, onSuccess, onError } = callbacks;

    const temporaryVirtualFiles: string[] = [];

    try {
      onProgress(1, 'جاري تهيئة محرك الرندرة والتشفير (Kinemaster Render & Encode)...');

      // Initialize ffmpeg.wasm
      await FFmpegWasmService.load((pct) => {
        onProgress(Math.min(5, Math.round(pct * 0.05)), 'جاري تحميل محرك ffmpeg.wasm...');
      });

      // 1. Calculate dimensions (Strictly even numbers)
      let width = 720;
      let height = 1280;
      if (draft.aspectRatio === '16:9') {
        width = 1280;
        height = 720;
      } else if (draft.aspectRatio === '1:1') {
        width = 720;
        height = 720;
      }
      if (width % 2 !== 0) width += 1;
      if (height % 2 !== 0) height += 1;

      const fps = 30;

      // Calculate total duration based on all active tracks
      const audioDuration = draft.replacedAudio
        ? Math.max(0, (draft.replacedAudio.trimEnd || draft.replacedAudio.duration || 0) - (draft.replacedAudio.trimStart || 0))
        : 0;
      const mediaClipsMaxEnd = Math.max(0, ...(draft.mediaClips || []).map((c) => c.endTime || 0));
      const totalDuration = Math.max(draft.duration || 0, audioDuration, mediaClipsMaxEnd, 1);
      const totalFrames = Math.max(1, Math.ceil(totalDuration * fps));

      onProgress(4, `أبعاد الفيديو: ${width}x${height} | الإطارات: ${totalFrames} إطار (${totalDuration.toFixed(1)} ثانية)`);

      // 2. Preload Media Elements (Images & Videos with crossOrigin="anonymous")
      onProgress(6, 'جاري تحميل وسائط الفيديو والصور مع تفعيل crossOrigin...');

      let baseMedia: HTMLImageElement | HTMLVideoElement | null = null;
      const baseSource = draft.videoSourceUrl || '/assets/aistudio/29515ac3-1b7a-4437-8444-84464b32b5fe_33174229.jpeg';
      const isBaseVideo = draft.isCustomVideo || /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(baseSource);

      if (isBaseVideo) {
        baseMedia = await this.loadVideo(baseSource);
      } else {
        baseMedia = await this.loadImage(baseSource);
      }

      const clipElementsMap = new Map<string, HTMLImageElement | HTMLVideoElement>();
      for (const clip of draft.mediaClips || []) {
        if (!clipElementsMap.has(clip.url)) {
          if (clip.type === 'video') {
            const vid = await this.loadVideo(clip.url);
            clipElementsMap.set(clip.url, vid);
          } else {
            const img = await this.loadImage(clip.url);
            clipElementsMap.set(clip.url, img);
          }
        }
      }

      // Create offscreen rendering canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        throw new Error('فشل إنشاء سياق رسم Canvas ثنائي الأبعاد');
      }

      // =========================================================================
      // PHASE 1: RENDER FRAMES (0% to 70%)
      // =========================================================================
      onProgress(8, 'بدء رندرة إطارات الفيديو (Render Phase)...');

      for (let i = 0; i < totalFrames; i++) {
        const t = i / fps;

        // Synchronize and seek active videos at time t
        if (baseMedia instanceof HTMLVideoElement) {
          const baseTime = (draft.trimStart || 0) + t;
          await this.seekVideo(baseMedia, baseTime);
        }

        for (const clip of draft.mediaClips || []) {
          if (clip.type === 'video' && t >= clip.startTime && t <= clip.endTime) {
            const clipVid = clipElementsMap.get(clip.url);
            if (clipVid instanceof HTMLVideoElement) {
              const clipLocalTime = (clip.trimStart || 0) + (t - clip.startTime);
              await this.seekVideo(clipVid, clipLocalTime);
            }
          }
        }

        // Draw composite frame onto canvas
        this.drawFrame(ctx, width, height, t, totalDuration, draft, baseMedia, clipElementsMap);

        // Convert canvas frame to JPEG (0.92 quality)
        const frameBlob: Blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error(`فشل إنشاء Blob للإطار رقم ${i + 1}`));
          }, 'image/jpeg', 0.92);
        });

        const frameBuffer = await frameBlob.arrayBuffer();
        const frameIndexStr = String(i + 1).padStart(5, '0');
        const frameFilename = `frame_${frameIndexStr}.jpg`;

        await FFmpegWasmService.writeFile(frameFilename, new Uint8Array(frameBuffer));
        temporaryVirtualFiles.push(frameFilename);

        // Mobile memory optimization: batch yield control every 5 frames
        if (i % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        // Update progress smoothly from 8% to 70%
        const renderPct = 8 + Math.round(((i + 1) / totalFrames) * 62);
        if (i % 3 === 0 || i === totalFrames - 1) {
          onProgress(
            renderPct,
            `جاري رندرة الإطارات: ${i + 1} من ${totalFrames} (${renderPct}%) - الزمن: ${t.toFixed(1)}s`
          );
        }
      }

      onProgress(70, 'اكتملت رندرة جميع الإطارات بنجاح!');

      // =========================================================================
      // PHASE 2: AUDIO PROCESSING & MIXING (70% to 80%)
      // =========================================================================
      onProgress(72, 'جاري تجهيز وقراءة ملفات الصوت...');

      const audioTracksToMix: AudioTrackItem[] = [];

      // 1. Replaced audio track (e.g. Sheikh recitation or recorded voice)
      if (draft.replacedAudio?.audioUrl) {
        try {
          const resp = await fetch(draft.replacedAudio.audioUrl);
          const buf = await resp.arrayBuffer();
          const audioFilename = 'input_audio_replaced.dat';
          await FFmpegWasmService.writeFile(audioFilename, new Uint8Array(buf));
          temporaryVirtualFiles.push(audioFilename);

          audioTracksToMix.push({
            filename: audioFilename,
            url: draft.replacedAudio.audioUrl,
            trimStart: draft.replacedAudio.trimStart || 0,
            trimEnd: draft.replacedAudio.trimEnd,
            startTime: draft.replacedAudioStartTime || 0,
            volume: draft.replacedAudioVolume ?? 1
          });
        } catch (audErr) {
          console.warn('Could not fetch replaced audio track:', audErr);
        }
      }

      // 2. Audio or video clips with sound
      let clipAudioIndex = 0;
      for (const clip of draft.mediaClips || []) {
        if ((clip.type === 'audio' || clip.type === 'video') && !clip.isMuted && (clip.volume ?? 1) > 0) {
          try {
            const resp = await fetch(clip.url);
            const buf = await resp.arrayBuffer();
            const audioFilename = `input_audio_clip_${clipAudioIndex++}.dat`;
            await FFmpegWasmService.writeFile(audioFilename, new Uint8Array(buf));
            temporaryVirtualFiles.push(audioFilename);

            audioTracksToMix.push({
              filename: audioFilename,
              url: clip.url,
              trimStart: clip.trimStart || 0,
              trimEnd: clip.trimEnd,
              startTime: clip.startTime || 0,
              volume: clip.volume ?? 1
            });
          } catch (clipAudErr) {
            console.warn('Could not fetch clip audio track:', clipAudErr);
          }
        }
      }

      // 3. Base video original audio (if not muted)
      if (isBaseVideo && !draft.muteOriginalAudio && (draft.originalAudioVolume || 0) > 0 && draft.videoSourceUrl) {
        try {
          const resp = await fetch(draft.videoSourceUrl);
          const buf = await resp.arrayBuffer();
          const audioFilename = 'input_audio_base.dat';
          await FFmpegWasmService.writeFile(audioFilename, new Uint8Array(buf));
          temporaryVirtualFiles.push(audioFilename);

          audioTracksToMix.push({
            filename: audioFilename,
            url: draft.videoSourceUrl,
            trimStart: draft.trimStart || 0,
            trimEnd: draft.trimEnd,
            startTime: 0,
            volume: draft.originalAudioVolume
          });
        } catch (baseAudErr) {
          console.warn('Could not fetch base video audio:', baseAudErr);
        }
      }

      onProgress(75, 'جاري دمج المسارات الصوتية (atrim, adelay, volume, amix)...');
      const mixedAudioFilename = await FFmpegWasmService.mixAudio(audioTracksToMix, totalDuration);
      temporaryVirtualFiles.push(mixedAudioFilename);

      onProgress(80, 'اكتمل دمج الصوت! بدء مرحلة الترميز والإنتاج (Encode Phase)...');

      // =========================================================================
      // PHASE 3: ENCODE FRAMES & AUDIO TO MP4 (80% to 100%)
      // =========================================================================
      onProgress(83, 'جاري تشفير الفيديو بـ libx264 و aac إلى ملف MP4...');

      const mp4Blob = await FFmpegWasmService.encodeFramesToMp4(
        mixedAudioFilename,
        (encodePct) => {
          const overallPct = 83 + Math.round(encodePct * 0.15);
          onProgress(overallPct, `جاري تشفير MP4: ${overallPct}%...`);
        }
      );

      // Validate output
      if (!mp4Blob || mp4Blob.size < 1024) {
        throw new Error('فشل تسجيل الفيديو: حجم ملف MP4 الناتج غير صالح (أقل من 1KB)');
      }

      onProgress(99, 'اكتمل إنتاج MP4 بنجاح! جاري بدء التنزيل التلقائي...');

      // Automatic download of output.mp4
      const cleanTitle = (draft.title || 'فيديو_المشروع')
        .trim()
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, '_');
      const filename = `${cleanTitle}.mp4`;

      const downloadUrl = URL.createObjectURL(mp4Blob);
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
        URL.revokeObjectURL(downloadUrl);
      }, 2000);

      onSuccess(filename, mp4Blob.size, 'MP4');

    } catch (err: any) {
      console.error('VideoExporter error:', err);
      const errName = err?.name || 'ExportError';
      const errMsg = err?.message || 'حدث خطأ غير متوقع أثناء معالجة ورندرة الفيديو';
      onError(`فشل تصدير الفيديو (${errName})`, errMsg);
    } finally {
      // Clean up temporary virtual files from ffmpeg FS
      for (const f of temporaryVirtualFiles) {
        try {
          await FFmpegWasmService.deleteFile(f);
        } catch {}
      }
      try {
        await FFmpegWasmService.deleteFile('output.mp4');
      } catch {}
    }
  }
}
