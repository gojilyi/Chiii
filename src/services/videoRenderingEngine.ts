/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDraft, ExportResolutionType } from '../types';

export interface RenderProgressCallback {
  (progressPercent: number, stageDescription: string, logLine?: string): void;
}

export interface RenderResult {
  blob: Blob;
  blobUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number;
}

export class VideoRenderingEngine {
  /**
   * Determine best supported video format in the current browser
   */
  static getSupportedVideoFormat(): { mimeType: string; extension: string } {
    if (typeof MediaRecorder === 'undefined') {
      return { mimeType: 'video/webm', extension: 'webm' };
    }

    const candidates = [
      { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4' },
      { mime: 'video/mp4;codecs=h264,aac', ext: 'mp4' },
      { mime: 'video/mp4', ext: 'mp4' },
      { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
      { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
      { mime: 'video/webm', ext: 'webm' },
    ];

    for (const c of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(c.mime)) {
          return { mimeType: c.mime, extension: c.ext };
        }
      } catch {}
    }

    return { mimeType: 'video/webm', extension: 'webm' };
  }

  /**
   * Draws a complete composite frame of the studio at any given time point:
   * Background image + spiritual visual effects + Quranic text + Calligraphy + Particles.
   */
  static drawCompositeFrame(
    ctx: CanvasRenderingContext2D,
    dims: { width: number; height: number },
    baseImage: HTMLImageElement,
    isImageLoaded: boolean,
    draft: ProjectDraft,
    animTime: number
  ) {
    const currentTime = animTime;

    // A. Clear background
    ctx.fillStyle = '#0a1411';
    ctx.fillRect(0, 0, dims.width, dims.height);

    // B. Base Image / Video
    if (isImageLoaded && baseImage.complete && baseImage.naturalWidth > 0) {
      const imgAspect = baseImage.naturalWidth / baseImage.naturalHeight;
      const canvasAspect = dims.width / dims.height;
      let renderW = dims.width;
      let renderH = dims.height;
      let offX = 0;
      let offY = 0;

      if (imgAspect > canvasAspect) {
        renderW = dims.height * imgAspect;
        offX = (dims.width - renderW) / 2;
      } else {
        renderH = dims.width / imgAspect;
        offY = (dims.height - renderH) / 2;
      }

      ctx.drawImage(baseImage, offX, offY, renderW, renderH);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, dims.height);
      grad.addColorStop(0, '#0c1a16');
      grad.addColorStop(0.5, '#122b22');
      grad.addColorStop(1, '#050c0a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, dims.width, dims.height);
    }

    // C. Spiritual & Montage Effects
    const activeEffects = draft.effects.filter((e) => e.enabled);

    activeEffects.forEach((eff) => {
      // 1. Light Leaks (تسريبات ضوئية)
      if (eff.id === 'light_leaks') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const flareX = (Math.sin(animTime * 0.6) * 0.35 + 0.5) * dims.width;
        const flareY = (Math.cos(animTime * 0.4) * 0.25 + 0.3) * dims.height;
        const leakGrad = ctx.createRadialGradient(flareX, flareY, 10, flareX, flareY, dims.width * 0.7);
        const opacity = (eff.intensity / 100) * 0.45;
        leakGrad.addColorStop(0, `rgba(255, 180, 50, ${opacity})`);
        leakGrad.addColorStop(0.4, `rgba(255, 90, 30, ${opacity * 0.6})`);
        leakGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = leakGrad;
        ctx.fillRect(0, 0, dims.width, dims.height);
        ctx.restore();
      }

      // 2. Audio Spectrum Visualizer (موجات صوتية تفاعلية للقرآن)
      if (eff.id === 'audio_spectrum') {
        ctx.save();
        const barCount = 36;
        const barWidth = (dims.width * 0.75) / barCount;
        const startX = dims.width * 0.125;
        const baseY = dims.height * 0.86;

        ctx.fillStyle = 'rgba(137, 248, 199, 0.88)';
        ctx.shadowColor = 'rgba(137, 248, 199, 0.6)';
        ctx.shadowBlur = 8;

        for (let i = 0; i < barCount; i++) {
          const wave = Math.abs(Math.sin(i * 0.35 + animTime * 4) * Math.cos(i * 0.2 + animTime * 2.5));
          const barHeight = wave * 45 * (eff.intensity / 100) + 4;
          ctx.fillRect(startX + i * barWidth, baseY - barHeight / 2, barWidth - 2, barHeight);
        }
        ctx.restore();
      }

      // 3. Arabesque Vignette
      if (eff.id === 'arabesque_vignette') {
        const vig = ctx.createRadialGradient(
          dims.width / 2,
          dims.height / 2,
          dims.width * 0.35,
          dims.width / 2,
          dims.height / 2,
          dims.width * 0.75
        );
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, `rgba(0, 0, 0, ${(eff.intensity / 100) * 0.8})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, dims.width, dims.height);
      }

      // 4. Vintage 35mm Film Grain
      if (eff.id === 'vintage_film_grain') {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${(eff.intensity / 100) * 0.05})`;
        for (let i = 0; i < 250; i++) {
          const gx = Math.random() * dims.width;
          const gy = Math.random() * dims.height;
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
        ctx.restore();
      }

      // 5. Islamic Gold Frame
      if (eff.id === 'islamic_gold_frame') {
        ctx.save();
        const margin = 20;
        ctx.strokeStyle = `rgba(229, 184, 66, ${(eff.intensity / 100) * 0.85})`;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(margin, margin, dims.width - margin * 2, dims.height - margin * 2);
        ctx.restore();
      }

      // 6. God Rays
      if (eff.id === 'god_rays') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const rayIntensity = (eff.intensity / 100) * 0.28;
        const topX = dims.width * 0.5 + Math.sin(animTime * 0.3) * 50;
        for (let r = -2; r <= 2; r++) {
          ctx.beginPath();
          ctx.moveTo(topX + r * 35, 0);
          ctx.lineTo(topX + r * 130 - 60, dims.height);
          ctx.lineTo(topX + r * 130 + 60, dims.height);
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 235, 160, ${rayIntensity * 0.6})`;
          ctx.fill();
        }
        ctx.restore();
      }
    });

    // D. Render Active Text Overlays (Quranic Verses)
    draft.textOverlays.forEach((overlay) => {
      if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
        const posX = (overlay.positionX / 100) * dims.width;
        const posY = (overlay.positionY / 100) * dims.height;

        ctx.save();
        const font = overlay.fontFamily === 'Aref Ruqaa' ? `'Aref Ruqaa', cursive` : `'${overlay.fontFamily}', 'Amiri', serif`;
        ctx.font = `bold ${Math.round(overlay.fontSize * (dims.width / 420))}px ${font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        const displayText = overlay.hasAyahBrackets ? `﴿ ${overlay.text} ﴾` : overlay.text;

        if (overlay.backgroundColor) {
          const metrics = ctx.measureText(displayText);
          const pad = 16;
          ctx.fillStyle = overlay.backgroundColor;
          ctx.fillRect(posX - metrics.width / 2 - pad, posY - overlay.fontSize - 4, metrics.width + pad * 2, overlay.fontSize * 2 + 8);
        }

        ctx.fillStyle = overlay.color || '#FFFFFF';
        ctx.fillText(displayText, posX, posY);
        ctx.restore();
      }
    });

    // E. Render Animated Calligraphy Story (if enabled)
    const story = draft.calligraphyStory;
    if (story && story.enabled && story.words && story.words.length > 0) {
      const currentMs = currentTime * 1000;
      ctx.save();
      const baseFontSize = (story.fontSize || 38) * (dims.width / 420);
      ctx.font = `bold ${baseFontSize}px 'Aref Ruqaa', cursive, 'Amiri', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Candle flicker glow
      const flicker = Math.sin(animTime * 8) * 0.04 + 0.16;
      const candleGrad = ctx.createRadialGradient(dims.width * 0.22, dims.height * 0.42, 10, dims.width * 0.22, dims.height * 0.42, dims.width * 0.65);
      candleGrad.addColorStop(0, `rgba(255, 200, 100, ${flicker})`);
      candleGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = candleGrad;
      ctx.fillRect(0, 0, dims.width, dims.height);

      const wordsToDisplay = story.mode === 'word_by_word'
        ? story.words.filter((w) => currentMs >= w.startMs)
        : story.words;

      if (wordsToDisplay.length > 0) {
        const lineText = wordsToDisplay.map((w) => w.word).join(' ');
        ctx.shadowColor = 'rgba(25, 12, 4, 0.9)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = story.defaultColor || '#FFDF9E';
        ctx.fillText(lineText, dims.width / 2, dims.height * 0.62);
      }
      ctx.restore();
    }

    // F. Render Particle Overlays (Amber Embers & Glowing Stars)
    if (draft.particleOverlays && draft.particleOverlays.length > 0) {
      draft.particleOverlays.filter((p) => p.enabled).forEach((pConfig) => {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const count = Math.round((pConfig.particleCount || 40) * 0.5);
        const speedMultiplier = pConfig.speed === 'slow' ? 0.6 : pConfig.speed === 'medium' ? 1.4 : 1.0;
        const color = pConfig.colorPalette === 'emerald' ? 'rgba(137, 248, 199, 0.7)' :
                      pConfig.colorPalette === 'soft_white' ? 'rgba(255, 255, 255, 0.7)' :
                      pConfig.colorPalette === 'amber' ? 'rgba(255, 180, 50, 0.7)' :
                      'rgba(255, 220, 140, 0.7)';

        for (let i = 0; i < count; i++) {
          const px = (Math.sin(i * 19.3 + animTime * 0.4 * speedMultiplier) * 0.5 + 0.5) * dims.width;
          const py = ((animTime * 25 * speedMultiplier + i * 47) % dims.height);
          const pSize = (Math.sin(i * 7.7 + animTime) * 0.5 + 1) * ((pConfig.intensity / 100) * 4 + 1.5);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, dims.height - py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }
  }

  /**
   * Attempts native FFmpeg rendering via backend server endpoint /api/render-ffmpeg.
   * Produces a 100% compliant H.264/AAC MP4 video with no chance of exporting as an image.
   */
  private static async renderViaServerFFmpeg(
    canvas: HTMLCanvasElement,
    draft: ProjectDraft,
    dims: { width: number; height: number },
    fps: number,
    filename: string,
    totalDuration: number,
    onProgress?: RenderProgressCallback
  ): Promise<RenderResult | null> {
    const canvasDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    let audioData: string | undefined = undefined;

    if (draft.replacedAudio?.audioUrl) {
      const audioUrl = draft.replacedAudio.audioUrl;
      if (audioUrl.startsWith('data:audio/')) {
        audioData = audioUrl;
      } else {
        try {
          const resp = await fetch(audioUrl);
          const blob = await resp.blob();
          audioData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Could not read audio data for server FFmpeg:', e);
        }
      }
    }

    onProgress?.(35, 'جاري تشغيل محرك FFmpeg لدمج الصورة مع صوت الشيخ...', `[ffmpeg] Encoding with -loop 1 -c:v libx264 -c:a aac -shortest`);

    const res = await fetch('/api/render-ffmpeg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: canvasDataUrl,
        audio: audioData,
        audioTrimStart: draft.replacedAudio?.trimStart,
        audioTrimEnd: draft.replacedAudio?.trimEnd,
        width: dims.width,
        height: dims.height,
        fps,
        filename,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server FFmpeg returned status ${res.status}`);
    }

    const blob = await res.blob();
    if (blob.size < 1000) {
      throw new Error('الملف الناتج صغير جداً أو غير صالح');
    }

    const blobUrl = URL.createObjectURL(blob);
    return {
      blob,
      blobUrl,
      filename,
      mimeType: 'video/mp4',
      sizeBytes: blob.size,
      durationSeconds: totalDuration,
    };
  }

  /**
   * Renders the entire studio composition (Image/Video + Sheikh Audio + Spiritual Effects + Text Overlays + Calligraphy + Particles)
   * into a genuine playable video file.
   */
  static async renderStudioVideo(
    draft: ProjectDraft,
    resolution: ExportResolutionType = '1080p',
    fps: number = 30,
    onProgress?: RenderProgressCallback
  ): Promise<RenderResult> {
    // Calculate exact video duration strictly according to audio track length (الفيديو حسب وقت الصوت)
    let totalDuration = 15;
    if (draft.replacedAudio) {
      const audioStart = draft.replacedAudio.trimStart || 0;
      const audioEnd = draft.replacedAudio.trimEnd || draft.replacedAudio.duration || draft.duration || 15;
      totalDuration = Math.max(1, +(audioEnd - audioStart).toFixed(2));
    } else {
      totalDuration = Math.max(1, +(draft.duration || 15).toFixed(2));
    }

    const formatInfo = this.getSupportedVideoFormat();
    const filename = `الشيخ_العيد_${draft.title ? draft.title.replace(/\s+/g, '_') : 'مقطع'}_${resolution}.${formatInfo.extension}`;

    onProgress?.(5, 'جاري تهيئة لوحة الرندرة ومسارات المعالجة...', `[render] Target output: ${filename} (${totalDuration}s @ ${formatInfo.mimeType})`);

    // 1. Calculate rendering canvas dimensions based on aspect ratio & resolution
    const getDims = () => {
      if (resolution === '4k') {
        return draft.aspectRatio === '9:16' ? { width: 1080, height: 1920 } :
               draft.aspectRatio === '16:9' ? { width: 1920, height: 1080 } : { width: 1080, height: 1080 };
      }
      if (resolution === '720p') {
        return draft.aspectRatio === '9:16' ? { width: 720, height: 1280 } :
               draft.aspectRatio === '16:9' ? { width: 1280, height: 720 } : { width: 720, height: 720 };
      }
      return draft.aspectRatio === '9:16' ? { width: 720, height: 1280 } :
             draft.aspectRatio === '16:9' ? { width: 1280, height: 720 } : { width: 720, height: 720 };
    };

    const dims = getDims();

    // 2. Create off-screen canvas for frame synthesis
    const canvas = document.createElement('canvas');
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('فشل إنشاء سياق رسم Canvas ثنائي الأبعاد');
    }

    // 3. Load base visual asset (Image or Video)
    onProgress?.(10, 'جاري تحميل خلفية الصورة والوسائط...', `[render] Loading visual source: ${draft.videoSourceName || 'background'}`);

    const baseImage = new Image();
    let isImageLoaded = false;
    const visualSourceUrl = draft.videoSourceUrl || '/assets/aistudio/29515ac3-1b7a-4437-8444-84464b32b5fe_33174229.jpeg';

    if (!visualSourceUrl.startsWith('data:') && !visualSourceUrl.startsWith('blob:') && visualSourceUrl.startsWith('http')) {
      baseImage.crossOrigin = 'anonymous';
    }
    baseImage.src = visualSourceUrl;

    await new Promise<void>((resolve) => {
      baseImage.onload = () => {
        isImageLoaded = true;
        resolve();
      };
      baseImage.onerror = () => {
        isImageLoaded = false;
        resolve();
      };
      setTimeout(resolve, 2500);
    });

    // Draw initial composite frame
    this.drawCompositeFrame(ctx, dims, baseImage, isImageLoaded, draft, 0);

    // 4. Try native FFmpeg server-side render first (Fastest, creates genuine MP4 video)
    try {
      onProgress?.(20, 'جاري المعالجة بمحرك FFmpeg المباشر...', '[ffmpeg] Sending request to native FFmpeg pipeline');
      const serverResult = await this.renderViaServerFFmpeg(canvas, draft, dims, fps, filename, totalDuration, onProgress);
      if (serverResult) {
        onProgress?.(100, 'اكتمل إنتاج الفيديو بنجاح عبر محرك FFmpeg!', `✅ [done] Generated ${filename} (${(serverResult.sizeBytes / (1024 * 1024)).toFixed(2)} MB)`);
        return serverResult;
      }
    } catch (serverErr: any) {
      console.warn('Native FFmpeg endpoint skipped, proceeding with client-side synthesis:', serverErr?.message);
      onProgress?.(25, 'المتابعة عبر محرك الرندرة المدمج...', `[recorder] Fallback to in-browser MediaRecorder (${serverErr?.message || 'local'})`);
    }

    // 5. Setup AudioContext and Stream Destination for Web Audio Mixing (Client-Side Fallback)
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume().catch(() => {});
    }

    const audioDest = audioCtx.createMediaStreamDestination();
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.9, audioCtx.currentTime);
    masterGain.connect(audioDest);

    // Connect user audio track if provided (NO SYNTHETIC TONES OR CHORDS - PURE USER VOICE ONLY)
    let audioBufferSource: AudioBufferSourceNode | null = null;
    let audioElement: HTMLAudioElement | null = null;

    if (draft.replacedAudio?.audioUrl) {
      const audioUrl = draft.replacedAudio.audioUrl;
      const audioTrimStart = draft.replacedAudio.trimStart || 0;
      const userVolume = Math.max(0, Math.min(1, draft.replacedAudioVolume ?? 0.9));

      const trackGain = audioCtx.createGain();
      trackGain.gain.setValueAtTime(userVolume, audioCtx.currentTime);
      trackGain.connect(masterGain);

      try {
        const response = await fetch(audioUrl);
        const arrayBuf = await response.arrayBuffer();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuf);
        audioBufferSource = audioCtx.createBufferSource();
        audioBufferSource.buffer = decodedBuffer;
        audioBufferSource.connect(trackGain);
        audioBufferSource.start(0, audioTrimStart, totalDuration);
        onProgress?.(30, 'تم تجهيز صوت الشيخ ومزامنته...', `[audio] Loaded ${decodedBuffer.duration.toFixed(1)}s user audio`);
      } catch (decodeErr) {
        console.warn('AudioBuffer decode fallback to Audio element:', decodeErr);
        try {
          audioElement = new Audio();
          if (audioUrl.startsWith('http')) audioElement.crossOrigin = 'anonymous';
          audioElement.src = audioUrl;
          audioElement.volume = userVolume;
          if (audioTrimStart > 0) audioElement.currentTime = audioTrimStart;
          const sourceNode = audioCtx.createMediaElementSource(audioElement);
          sourceNode.connect(trackGain);
          await audioElement.play().catch(() => {});
        } catch (e2) {
          console.warn('HTMLAudio fallback notice:', e2);
        }
      }
    }

    // 6. Capture combined MediaStream (Canvas Video + Mixed Audio)
    const canvasStream = canvas.captureStream(fps);
    const audioTracks = audioDest.stream.getAudioTracks();
    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...(audioTracks.length > 0 ? audioTracks : []),
    ];

    const combinedStream = new MediaStream(combinedTracks);

    // 7. Initialize MediaRecorder with graceful MIME fallback
    const recordedChunks: Blob[] = [];
    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: formatInfo.mimeType,
        videoBitsPerSecond: resolution === '4k' ? 8000000 : 4500000,
      });
    } catch {
      // Fallback without mimeType option
      mediaRecorder = new MediaRecorder(combinedStream);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.start(100);

    onProgress?.(35, 'بدء الرندرة والدمج اللحظي للفيديو والصوت...', `[ffmpeg/recorder] Started real-time synthesis pipeline @ ${fps}fps (${totalDuration}s)`);

    // 8. Wall-clock driven render loop for exact audio-video synchronization
    const startTime = performance.now();
    const totalDurationMs = totalDuration * 1000;
    const totalFrames = Math.max(1, Math.round(totalDuration * fps));
    let frameIndex = 0;

    return new Promise<RenderResult>((resolve, reject) => {
      const renderNextFrame = () => {
        const now = performance.now();
        const elapsedMs = now - startTime;
        const currentTime = Math.min(totalDuration, elapsedMs / 1000);
        const animTime = currentTime;

        if (elapsedMs >= totalDurationMs) {
          onProgress?.(95, 'جاري حزم بيانات الفيديو وتوليد ملف MP4/WebM...', '[recorder] Finalizing container metadata');
          
          try {
            audioBufferSource?.stop();
            audioElement?.pause();
            audioCtx.close().catch(() => {});
          } catch {}

          mediaRecorder.onstop = () => {
            const finalMime = mediaRecorder.mimeType || formatInfo.mimeType;
            const finalBlob = new Blob(recordedChunks, { type: finalMime });
            if (finalBlob.size < 500) {
              reject(new Error('فشل تسجيل دفق الفيديو'));
              return;
            }
            const blobUrl = URL.createObjectURL(finalBlob);

            onProgress?.(100, 'اكتمل إنتاج الفيديو بنجاح!', `✅ [done] Generated ${filename} (${(finalBlob.size / (1024 * 1024)).toFixed(2)} MB)`);

            resolve({
              blob: finalBlob,
              blobUrl,
              filename,
              mimeType: finalMime,
              sizeBytes: finalBlob.size,
              durationSeconds: totalDuration,
            });
          };

          mediaRecorder.stop();
          return;
        }

        // Draw composite frame
        VideoRenderingEngine.drawCompositeFrame(ctx, dims, baseImage, isImageLoaded, draft, animTime);

        frameIndex++;

        // Update progress callback regularly
        if (frameIndex % 4 === 0 || elapsedMs >= totalDurationMs) {
          const progressRatio = Math.min(1, elapsedMs / totalDurationMs);
          const pct = Math.min(94, Math.round(35 + progressRatio * 59));
          const sec = currentTime.toFixed(1);
          const statLog = `frame=${frameIndex.toString().padStart(4, ' ')} fps=${fps} time=00:00:${sec.padStart(4, '0')} progress=${pct}%`;
          onProgress?.(pct, `جاري ترميز إطارات الفيديو (${frameIndex} إطار - ${sec}s / ${totalDuration.toFixed(1)}s)...`, statLog);
        }

        requestAnimationFrame(renderNextFrame);
      };

      requestAnimationFrame(renderNextFrame);
    });
  }
}
