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
      if (MediaRecorder.isTypeSupported(c.mime)) {
        return { mimeType: c.mime, extension: c.ext };
      }
    }

    return { mimeType: 'video/webm', extension: 'webm' };
  }

  /**
   * Renders the entire studio composition (Image/Video + Sheikh Audio + Spiritual Effects + Text Overlays + Calligraphy + Particles)
   * into a genuine playable video file using HTML5 Canvas and MediaRecorder.
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

    onProgress?.(20, 'جاري تهيئة المسار الصوتي للشيخ والمؤثرات...', `[render] Audio setup for: ${draft.replacedAudio?.title || 'ambient'}`);

    // 4. Setup AudioContext and Stream Destination for Web Audio Mixing
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume().catch(() => {});
    }

    const audioDest = audioCtx.createMediaStreamDestination();
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);
    masterGain.connect(audioDest);

    // Create spiritual harmonic chord accompaniment
    const baseFreqs = [146.83, 220.0, 174.61, 293.66]; // Bayati serenity
    const activeOscillators: OscillatorNode[] = [];

    baseFreqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      oscGain.gain.setValueAtTime(0.08 / baseFreqs.length, audioCtx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      activeOscillators.push(osc);
    });

    // 5. Connect user audio element if provided
    let audioElement: HTMLAudioElement | null = null;
    if (draft.replacedAudio?.audioUrl) {
      try {
        audioElement = new Audio();
        if (draft.replacedAudio.audioUrl.startsWith('http')) {
          audioElement.crossOrigin = 'anonymous';
        }
        audioElement.src = draft.replacedAudio.audioUrl;
        audioElement.volume = Math.max(0, Math.min(1, draft.replacedAudioVolume || 0.8));
        const audioTrimStart = draft.replacedAudio.trimStart || 0;
        if (audioTrimStart > 0) {
          audioElement.currentTime = audioTrimStart;
        }
        const sourceNode = audioCtx.createMediaElementSource(audioElement);
        sourceNode.connect(masterGain);
        await audioElement.play().catch(() => {});
      } catch (err) {
        console.warn('MediaElementSource error or CORS, relying on synthesizer:', err);
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

    // 7. Initialize MediaRecorder
    const recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: formatInfo.mimeType,
      videoBitsPerSecond: resolution === '4k' ? 8000000 : 4500000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.start(100);

    onProgress?.(30, 'بدء الرندرة اللحظية للإطارات والمؤثرات...', `[ffmpeg/recorder] Started encoding pipeline @ ${fps}fps`);

    // 8. Render loop across duration
    const totalFrames = Math.round(totalDuration * fps);
    let frameIndex = 0;

    return new Promise<RenderResult>((resolve) => {
      const renderNextFrame = () => {
        if (frameIndex >= totalFrames) {
          onProgress?.(95, 'جاري حزم بيانات الفيديو وتوليد ملف MP4/WebM...', '[recorder] Finalizing container metadata');
          
          try {
            audioElement?.pause();
            activeOscillators.forEach((osc) => {
              try { osc.stop(); osc.disconnect(); } catch {}
            });
            audioCtx.close().catch(() => {});
          } catch {}

          mediaRecorder.onstop = () => {
            const finalBlob = new Blob(recordedChunks, { type: formatInfo.mimeType });
            const blobUrl = URL.createObjectURL(finalBlob);

            onProgress?.(100, 'اكتمل إنتاج الفيديو بنجاح!', `✅ [done] Generated ${filename} (${(finalBlob.size / (1024 * 1024)).toFixed(2)} MB)`);

            resolve({
              blob: finalBlob,
              blobUrl,
              filename,
              mimeType: formatInfo.mimeType,
              sizeBytes: finalBlob.size,
              durationSeconds: totalDuration,
            });
          };

          mediaRecorder.stop();
          return;
        }

        const currentTime = (frameIndex / totalFrames) * totalDuration;
        const animTime = currentTime;

        // --- DRAW FRAME COMPOSITE ---

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

        frameIndex++;

        // Update progress callback every 4 frames
        if (frameIndex % 4 === 0 || frameIndex === totalFrames) {
          const pct = Math.min(94, Math.round(30 + (frameIndex / totalFrames) * 64));
          const sec = currentTime.toFixed(1);
          const statLog = `frame=${frameIndex.toString().padStart(4, ' ')} fps=${fps} time=00:00:${sec.padStart(4, '0')} progress=${pct}%`;
          onProgress?.(pct, `جاري ترميز إطارات الفيديو (${frameIndex}/${totalFrames} إطار)...`, statLog);
        }

        requestAnimationFrame(renderNextFrame);
      };

      requestAnimationFrame(renderNextFrame);
    });
  }
}
