/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDraft, ExportResolutionType, BackgroundAdjustments } from '../types';
import { DEFAULT_BACKGROUND_ADJUSTMENTS } from '../constants/defaults';

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
   * Evaluates video/mp4 first, then video/webm variants per user specifications
   */
  static getSupportedVideoFormat(): { mimeType: string; extension: string } {
    if (typeof MediaRecorder === 'undefined') {
      return { mimeType: 'video/webm', extension: 'webm' };
    }

    const candidates = [
      // 1. Try MP4 first
      { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4' },
      { mime: 'video/mp4;codecs=h264,aac', ext: 'mp4' },
      { mime: 'video/mp4', ext: 'mp4' },
      // 2. Try WebM VP9 next
      { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
      { mime: 'video/webm;codecs=vp9', ext: 'webm' },
      // 3. Fallback to standard WebM VP8 / default
      { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
      { mime: 'video/webm', ext: 'webm' },
    ];

    for (const c of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(c.mime)) {
          return { mimeType: c.mime, extension: c.ext };
        }
      } catch {
        // Continue checking
      }
    }

    return { mimeType: 'video/webm', extension: 'webm' };
  }

  /**
   * Draws a complete composite frame of the studio at any given time point:
   * Background image/video + Adjustments + Spiritual visual effects + Quranic text + Calligraphy + Particles + Media Clips.
   * Completely synchronized with PreviewPlayer.
   */
  static drawCompositeFrame(
    ctx: CanvasRenderingContext2D,
    dims: { width: number; height: number },
    baseImage: HTMLImageElement,
    isImageLoaded: boolean,
    draft: ProjectDraft,
    animTime: number,
    clipImagesMap?: Map<string, HTMLImageElement>
  ) {
    const currentTime = animTime;

    // A. Clear background
    ctx.fillStyle = '#0a1411';
    ctx.fillRect(0, 0, dims.width, dims.height);

    ctx.save();

    // Pulse heartbeat motion
    const pulseEffect = draft.effects.find((e) => e.id === 'pulse_heartbeat' && e.enabled);
    if (pulseEffect) {
      const pulseScale = 1 + Math.sin(animTime * 3.5) * ((pulseEffect.intensity / 100) * 0.025);
      ctx.translate(dims.width / 2, dims.height / 2);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-dims.width / 2, -dims.height / 2);
    }

    // Subtle zoom (Ken Burns)
    const zoomEffect = draft.effects.find((e) => e.id === 'subtle_zoom' && e.enabled);
    if (zoomEffect) {
      const durationVal = Math.max(draft.duration || 0, 1);
      const zoomScale = 1 + ((currentTime / durationVal) * (zoomEffect.intensity / 100) * 0.08);
      ctx.translate(dims.width / 2, dims.height / 2);
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-dims.width / 2, -dims.height / 2);
    }

    const bgAdj: BackgroundAdjustments = draft.backgroundAdjustments || { ...DEFAULT_BACKGROUND_ADJUSTMENTS };

    // B. Base Image / Video with Filters & Transformations
    ctx.save();

    const filterParts: string[] = [
      `brightness(${bgAdj.brightness}%)`,
      `contrast(${bgAdj.contrast}%)`
    ];
    if (bgAdj.blur > 0) {
      filterParts.push(`blur(${bgAdj.blur}px)`);
    }
    ctx.filter = filterParts.join(' ');

    const centerX = dims.width / 2;
    const centerY = dims.height / 2;
    const panXOffset = (bgAdj.panX / 100) * dims.width;
    const panYOffset = (bgAdj.panY / 100) * dims.height;

    ctx.translate(centerX + panXOffset, centerY + panYOffset);
    ctx.scale(bgAdj.scale * (bgAdj.flipHorizontal ? -1 : 1), bgAdj.scale);
    ctx.translate(-centerX, -centerY);

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

    ctx.restore();
    ctx.filter = 'none';

    // B.1. Color Grading Filter
    if (bgAdj.colorGrade && bgAdj.colorGrade !== 'none') {
      ctx.save();
      if (bgAdj.colorGrade === 'warm_gold') {
        ctx.fillStyle = 'rgba(255, 190, 70, 0.18)';
        ctx.fillRect(0, 0, dims.width, dims.height);
      } else if (bgAdj.colorGrade === 'emerald_islamic') {
        ctx.fillStyle = 'rgba(0, 108, 76, 0.22)';
        ctx.fillRect(0, 0, dims.width, dims.height);
      } else if (bgAdj.colorGrade === 'vintage_amber') {
        ctx.fillStyle = 'rgba(200, 130, 40, 0.22)';
        ctx.fillRect(0, 0, dims.width, dims.height);
      } else if (bgAdj.colorGrade === 'serene_blue') {
        ctx.fillStyle = 'rgba(30, 90, 150, 0.18)';
        ctx.fillRect(0, 0, dims.width, dims.height);
      } else if (bgAdj.colorGrade === 'monochrome') {
        ctx.fillStyle = 'rgba(120, 120, 120, 0.25)';
        ctx.fillRect(0, 0, dims.width, dims.height);
      }
      ctx.restore();
    }

    // B.2. Overlay Darkness
    if (bgAdj.overlayDarkness > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${bgAdj.overlayDarkness / 100})`;
      ctx.fillRect(0, 0, dims.width, dims.height);
      ctx.restore();
    }

    // B.3. Vignette
    if (bgAdj.vignette > 0) {
      ctx.save();
      const vigGrad = ctx.createRadialGradient(
        dims.width / 2,
        dims.height / 2,
        dims.width * 0.32,
        dims.width / 2,
        dims.height / 2,
        dims.width * 0.72
      );
      vigGrad.addColorStop(0, 'transparent');
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${(bgAdj.vignette / 100) * 0.85})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, dims.width, dims.height);
      ctx.restore();
    }

    // B.4. Golden Arch Frame
    if (bgAdj.showGoldArchFrame) {
      ctx.save();
      const pad = 16;
      ctx.strokeStyle = 'rgba(235, 195, 75, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      ctx.moveTo(pad, dims.height - pad);
      ctx.lineTo(pad, pad + 50);
      ctx.quadraticCurveTo(dims.width / 2, pad - 15, dims.width - pad, pad + 50);
      ctx.lineTo(dims.width - pad, dims.height - pad);
      ctx.closePath();
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 235, 150, 0.45)';
      ctx.beginPath();
      ctx.moveTo(pad + 5, dims.height - pad - 5);
      ctx.lineTo(pad + 5, pad + 54);
      ctx.quadraticCurveTo(dims.width / 2, pad - 8, dims.width - pad - 5, pad + 54);
      ctx.lineTo(dims.width - pad - 5, dims.height - pad - 5);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // B.5. Lesson Banner Overlay
    if (bgAdj.bannerOverlay?.enabled) {
      const b = bgAdj.bannerOverlay;
      const bScale = b.scale || 1.0;
      const bx = (b.positionX / 100) * dims.width;
      const by = (b.positionY / 100) * dims.height;

      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(bScale, bScale);

      const bannerW = Math.min(dims.width * 0.48, 260);
      const bannerH = 100;
      const wHalf = bannerW / 2;
      const hHalf = bannerH / 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;

      const bGrad = ctx.createLinearGradient(0, -hHalf, 0, hHalf);
      bGrad.addColorStop(0, 'rgba(25, 18, 10, 0.88)');
      bGrad.addColorStop(0.5, 'rgba(15, 11, 7, 0.94)');
      bGrad.addColorStop(1, 'rgba(8, 6, 4, 0.98)');
      ctx.fillStyle = bGrad;

      ctx.beginPath();
      ctx.moveTo(-wHalf, hHalf);
      ctx.lineTo(-wHalf, -hHalf + 22);
      ctx.quadraticCurveTo(0, -hHalf - 14, wHalf, -hHalf + 22);
      ctx.lineTo(wHalf, hHalf);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(229, 184, 66, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(255, 223, 140, 0.5)';
      ctx.beginPath();
      ctx.moveTo(-wHalf + 4, hHalf - 4);
      ctx.lineTo(-wHalf + 4, -hHalf + 24);
      ctx.quadraticCurveTo(0, -hHalf - 8, wHalf - 4, -hHalf + 24);
      ctx.lineTo(wHalf - 4, hHalf - 4);
      ctx.closePath();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px "Cairo", sans-serif';
      ctx.fillText(b.headerText || 'شرح كتاب', 0, -20);

      ctx.fillStyle = '#FFDF9E';
      ctx.font = 'bold 26px "Aref Ruqaa", "Amiri", serif';
      ctx.shadowColor = 'rgba(255, 200, 50, 0.85)';
      ctx.shadowBlur = 12;
      ctx.fillText(b.mainTitle || 'إيصال السالك', 0, 8);

      ctx.fillStyle = '#E3E2E6';
      ctx.font = '600 11px "Cairo", sans-serif';
      ctx.shadowBlur = 4;
      ctx.fillText(b.subtitle || 'إلى أصول مذهب الإمام مالك', 0, 32);

      ctx.restore();
    }

    // B.6. Book Graphic Overlay
    if (bgAdj.bookGraphicOverlay?.enabled) {
      const bk = bgAdj.bookGraphicOverlay;
      const bkScale = bk.scale || 1.0;
      const bkx = (bk.positionX / 100) * dims.width;
      const bky = (bk.positionY / 100) * dims.height;

      ctx.save();
      ctx.translate(bkx, bky);
      ctx.scale(bkScale, bkScale);
      ctx.rotate(-0.1);

      const bookW = 95;
      const bookH = 138;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 8;

      const coverGrad = ctx.createLinearGradient(-bookW / 2, 0, bookW / 2, 0);
      coverGrad.addColorStop(0, '#003824');
      coverGrad.addColorStop(0.2, '#005437');
      coverGrad.addColorStop(0.85, '#00472e');
      coverGrad.addColorStop(1, '#002919');
      ctx.fillStyle = coverGrad;

      ctx.beginPath();
      ctx.roundRect(-bookW / 2, -bookH / 2, bookW, bookH, [5, 10, 10, 5]);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#EDE8DC';
      ctx.fillRect(bookW / 2 - 4, -bookH / 2 + 5, 4, bookH - 10);
      ctx.fillRect(-bookW / 2 + 6, bookH / 2 - 4, bookW - 10, 4);

      ctx.strokeStyle = 'rgba(229, 184, 66, 0.88)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-bookW / 2 + 6, -bookH / 2 + 6, bookW - 14, bookH - 14);

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(255, 223, 140, 0.5)';
      ctx.strokeRect(-bookW / 2 + 10, -bookH / 2 + 10, bookW - 22, bookH - 22);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 15px "Aref Ruqaa", "Amiri", serif';
      ctx.fillText(bk.title || 'إيصال السالك', 0, -12);

      ctx.fillStyle = '#E0D0FF';
      ctx.font = '9px "Cairo", sans-serif';
      ctx.fillText(bk.author || 'أصول مذهب مالك', 0, 8);

      ctx.fillStyle = 'rgba(229, 184, 66, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 30, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
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

        // Inner delicate line
        ctx.strokeStyle = `rgba(229, 184, 66, ${(eff.intensity / 100) * 0.45})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(margin + 6, margin + 6, dims.width - (margin + 6) * 2, dims.height - (margin + 6) * 2);

        // Corner accents
        const corners = [
          [margin + 6, margin + 6],
          [dims.width - margin - 6, margin + 6],
          [margin + 6, dims.height - margin - 6],
          [dims.width - margin - 6, dims.height - margin - 6]
        ];
        ctx.fillStyle = `rgba(229, 184, 66, ${(eff.intensity / 100) * 0.9})`;
        corners.forEach(([cx, cy]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        });
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

      // 7. Spiritual Glow
      if (eff.id === 'spiritual_glow') {
        ctx.save();
        const radial = ctx.createRadialGradient(
          dims.width / 2,
          dims.height / 2,
          40,
          dims.width / 2,
          dims.height / 2,
          dims.width * 0.65
        );
        radial.addColorStop(0, `rgba(137, 248, 199, ${(eff.intensity / 100) * 0.22})`);
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, dims.width, dims.height);
        ctx.restore();
      }

      // 8. Golden Dust
      if (eff.id === 'golden_dust') {
        ctx.save();
        ctx.fillStyle = `rgba(255, 240, 180, ${(eff.intensity / 100) * 0.35})`;
        for (let i = 0; i < 40; i++) {
          const dx = (Math.sin(i * 13.5 + animTime * 0.5) * 0.5 + 0.5) * dims.width;
          const dy = ((animTime * 15 + i * 37) % dims.height);
          ctx.beginPath();
          ctx.arc(dx, dims.height - dy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    // D. Render Multi-Media Clips (Images / Overlays added by user)
    const mediaClips = draft.mediaClips || [];
    const activeVisualClips = mediaClips.filter(
      (c) => (c.type === 'image' || c.type === 'video') && currentTime >= c.startTime && currentTime <= c.endTime
    );

    activeVisualClips.forEach((clip) => {
      const clipImg = clipImagesMap?.get(clip.url);
      if (clipImg && clipImg.complete && clipImg.naturalWidth > 0) {
        ctx.save();
        const posX = (dims.width * (clip.positionX ?? 50)) / 100;
        const posY = (dims.height * (clip.positionY ?? 50)) / 100;
        const scale = clip.scale ?? 1;
        const opacity = clip.opacity ?? 1;

        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.translate(posX, posY);
        ctx.scale(scale, scale);

        const targetW = dims.width * 0.55;
        const aspect = clipImg.naturalHeight / clipImg.naturalWidth;
        const targetH = targetW * aspect;

        try {
          ctx.drawImage(clipImg, -targetW / 2, -targetH / 2, targetW, targetH);
        } catch {
          // Ignore drawing error for unready frames
        }
        ctx.restore();
      }
    });

    // E. Render Active Text Overlays (Quranic Verses)
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

    // F. Render Animated Calligraphy Story (if enabled)
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

    // G. Render Particle Overlays (Amber Embers & Glowing Stars)
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

    ctx.restore();
  }

  /**
   * Pre-loads an image URL safely
   */
  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      if (!url.startsWith('data:') && !url.startsWith('blob:') && url.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = url;
    });
  }

  /**
   * Renders the studio composition into a genuine, downloadable video file (MP4 or WebM)
   * using the MediaRecorder API, canvas.captureStream(30), and AudioContext integration.
   * Completely avoids saving frame snapshots as images.
   */
  static async renderStudioVideo(
    draft: ProjectDraft,
    resolution: ExportResolutionType = '1080p',
    fps: number = 30,
    onProgress?: RenderProgressCallback
  ): Promise<RenderResult> {
    // 1. Calculate duration strictly matching audio track or longest clip - NO arbitrary 16s limits!
    const audioTrack = draft.replacedAudio;
    let audioTrimStart = 0;
    let totalDuration = 0;

    if (audioTrack) {
      audioTrimStart = audioTrack.trimStart || 0;
      const audioEnd = audioTrack.trimEnd || audioTrack.duration;
      if (audioEnd && audioEnd > audioTrimStart) {
        totalDuration = +(audioEnd - audioTrimStart).toFixed(2);
      }
    }

    if (totalDuration <= 0 && draft.duration) {
      totalDuration = +draft.duration.toFixed(2);
    }

    // Ensure project duration covers any media clips or text overlays
    if (draft.mediaClips && draft.mediaClips.length > 0) {
      const maxClipEnd = Math.max(...draft.mediaClips.map((c) => c.endTime || 0));
      if (maxClipEnd > totalDuration) {
        totalDuration = +maxClipEnd.toFixed(2);
      }
    }
    if (draft.textOverlays && draft.textOverlays.length > 0) {
      const maxTextEnd = Math.max(...draft.textOverlays.map((t) => t.endTime || 0));
      if (maxTextEnd > totalDuration) {
        totalDuration = +maxTextEnd.toFixed(2);
      }
    }

    if (totalDuration <= 0) {
      totalDuration = 30;
    }

    // Determine format according to priority: video/mp4 first, then video/webm variants
    const formatInfo = this.getSupportedVideoFormat();
    const cleanTitle = draft.title ? draft.title.replace(/\s+/g, '_') : 'مقطع_الشيخ_العيد';
    const filename = `${cleanTitle}_${resolution}.${formatInfo.extension}`;

    onProgress?.(5, 'جاري تهيئة لوحة الرندرة ومسارات المعالجة...', `[render] Target output: ${filename} (${totalDuration}s @ ${formatInfo.mimeType})`);

    // 2. Calculate rendering dimensions based on aspect ratio & resolution
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

    // 3. Create rendering canvas
    const canvas = document.createElement('canvas');
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('فشل إنشاء سياق رسم Canvas ثنائي الأبعاد');
    }

    // 4. Preload all visual media (Base Image + Multi-Media Clips) so canvas never draws blank
    onProgress?.(10, 'جاري تحميل خلفية الصورة والوسائط...', `[render] Loading visual source: ${draft.videoSourceName || 'background'}`);

    const visualSourceUrl = draft.videoSourceUrl || '/assets/aistudio/29515ac3-1b7a-4437-8444-84464b32b5fe_33174229.jpeg';
    const baseImage = await this.loadImage(visualSourceUrl);
    const isImageLoaded = baseImage.complete && baseImage.naturalWidth > 0;

    const clipImagesMap = new Map<string, HTMLImageElement>();
    const visualClips = (draft.mediaClips || []).filter((c) => c.type === 'image' || c.type === 'video');
    for (const clip of visualClips) {
      if (!clipImagesMap.has(clip.url)) {
        const loaded = await this.loadImage(clip.url);
        clipImagesMap.set(clip.url, loaded);
      }
    }

    // 5. Draw initial frame at t = 0 to guarantee the canvas is primed before stream capture
    this.drawCompositeFrame(ctx, dims, baseImage, isImageLoaded, draft, 0, clipImagesMap);

    // 6. Audio Integration via AudioContext & MediaStreamDestination
    let audioCtx: AudioContext | null = null;
    let audioDest: MediaStreamAudioDestinationNode | null = null;
    let audioBufferSource: AudioBufferSourceNode | null = null;
    let audioElement: HTMLAudioElement | null = null;

    try {
      const AudioCtxConstructor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxConstructor) {
        audioCtx = new AudioCtxConstructor();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume().catch(() => {});
        }
        audioDest = audioCtx.createMediaStreamDestination();

        if (draft.replacedAudio?.audioUrl) {
          const audioUrl = draft.replacedAudio.audioUrl;
          const userVolume = Math.max(0, Math.min(1, draft.replacedAudioVolume ?? 0.95));

          const gainNode = audioCtx.createGain();
          gainNode.gain.setValueAtTime(userVolume, audioCtx.currentTime);
          gainNode.connect(audioDest);

          try {
            const resp = await fetch(audioUrl);
            const arrayBuf = await resp.arrayBuffer();
            const decodedBuffer = await audioCtx.decodeAudioData(arrayBuf);
            const realAudioDuration = +(decodedBuffer.duration).toFixed(2);

            // If audio duration is longer or project duration not yet set, expand to the full real duration of audio!
            if (realAudioDuration > totalDuration || !draft.replacedAudio.trimEnd || draft.syncDurationToAudio) {
              totalDuration = Math.max(1, +(realAudioDuration - audioTrimStart).toFixed(2));
            }

            audioBufferSource = audioCtx.createBufferSource();
            audioBufferSource.buffer = decodedBuffer;
            audioBufferSource.connect(gainNode);
            onProgress?.(20, 'تم تجهيز صوت الشيخ ومزامنته مع الفيديو...', `[audio] Decoded audio buffer: ${realAudioDuration}s`);
          } catch (decodeErr) {
            console.warn('AudioBuffer decode fallback to HTMLAudioElement:', decodeErr);
            try {
              audioElement = new Audio();
              if (audioUrl.startsWith('http')) audioElement.crossOrigin = 'anonymous';
              audioElement.src = audioUrl;
              audioElement.volume = userVolume;
              if (audioTrimStart > 0) audioElement.currentTime = audioTrimStart;
              audioElement.onloadedmetadata = () => {
                if (audioElement && audioElement.duration && Number.isFinite(audioElement.duration)) {
                  const elemDur = +(audioElement.duration).toFixed(2);
                  if (elemDur > totalDuration || !draft.replacedAudio?.trimEnd) {
                    totalDuration = Math.max(1, +(elemDur - audioTrimStart).toFixed(2));
                  }
                }
              };
              const elemSource = audioCtx.createMediaElementSource(audioElement);
              elemSource.connect(gainNode);
            } catch (e2) {
              console.warn('HTMLAudio fallback notice:', e2);
            }
          }
        }
      }
    } catch (audioErr) {
      console.warn('AudioContext setup skipped or not supported:', audioErr);
    }

    // 7. Create Canvas Stream (30 frames per second)
    const streamMethod = (canvas as any).captureStream || (canvas as any).mozCaptureStream;
    if (!streamMethod) {
      throw new Error('متصفحك لا يدعم خاصية captureStream لتسجيل الفيديو');
    }
    const canvasStream: MediaStream = streamMethod.call(canvas, fps);

    // Merge Audio Tracks if audio exists
    const audioTracks = audioDest ? audioDest.stream.getAudioTracks() : [];
    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...(audioTracks.length > 0 ? audioTracks : []),
    ];
    const combinedStream = new MediaStream(combinedTracks);

    // 8. Initialize MediaRecorder with prioritized container & codec
    const recordedChunks: Blob[] = [];
    let mediaRecorder: MediaRecorder;

    const bitRate = resolution === '4k' ? 9000000 : resolution === '720p' ? 3000000 : 5500000;

    try {
      mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: formatInfo.mimeType,
        videoBitsPerSecond: bitRate,
      });
    } catch {
      try {
        mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
      } catch {
        mediaRecorder = new MediaRecorder(combinedStream);
      }
    }

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    // 9. Start recording & playback synchronized from start to end (Normal 1x speed)
    onProgress?.(25, 'بدء تسجيل الفيديو اللحظي...', `[recorder] Started MediaRecorder @ ${fps}fps (${totalDuration}s)`);

    mediaRecorder.start(100);

    let audioHasEnded = false;
    if (audioBufferSource) {
      try {
        audioBufferSource.onended = () => {
          audioHasEnded = true;
        };
        audioBufferSource.start(0, audioTrimStart, totalDuration);
      } catch (e) {
        console.warn('AudioBuffer start notice:', e);
      }
    } else if (audioElement) {
      audioElement.onended = () => {
        audioHasEnded = true;
      };
      audioElement.play().catch(() => {});
    }

    const startTime = performance.now();
    const totalDurationMs = totalDuration * 1000;
    let frameIndex = 0;

    return new Promise<RenderResult>((resolve, reject) => {
      let isCompleted = false;

      const stopAndFinalize = () => {
        if (isCompleted) return;
        isCompleted = true;

        onProgress?.(96, 'جاري حزم بيانات الفيديو وتوليد الملف النهائي...', '[recorder] Finalizing video blob...');

        try {
          audioBufferSource?.stop();
          audioElement?.pause();
          audioCtx?.close().catch(() => {});
        } catch {}

        mediaRecorder.onstop = () => {
          const finalMime = mediaRecorder.mimeType || formatInfo.mimeType;
          const finalBlob = new Blob(recordedChunks, { type: finalMime });

          if (finalBlob.size < 500) {
            reject(new Error('فشل تسجيل دفق الفيديو: لم يتم التقاط بيانات كافية'));
            return;
          }

          const blobUrl = URL.createObjectURL(finalBlob);

          // 10. Automatically trigger download of video file per user requirement
          try {
            const downloadLink = document.createElement('a');
            downloadLink.style.display = 'none';
            downloadLink.href = blobUrl;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            setTimeout(() => {
              if (document.body.contains(downloadLink)) {
                document.body.removeChild(downloadLink);
              }
            }, 500);
          } catch (dlErr) {
            console.warn('Automatic download trigger notification:', dlErr);
          }

          onProgress?.(100, 'اكتمل إنتاج وتنزيل الفيديو بنجاح!', `✅ [done] Generated ${filename} (${(finalBlob.size / (1024 * 1024)).toFixed(2)} MB)`);

          resolve({
            blob: finalBlob,
            blobUrl,
            filename,
            mimeType: finalMime,
            sizeBytes: finalBlob.size,
            durationSeconds: totalDuration,
          });
        };

        try {
          mediaRecorder.stop();
        } catch (stopErr) {
          reject(stopErr);
        }
      };

      const renderLoop = () => {
        if (isCompleted) return;

        const now = performance.now();
        const elapsedMs = now - startTime;
        const currentSec = Math.min(totalDuration, elapsedMs / 1000);

        // Stop recording when total time is reached OR when audio onended fires after playing
        if (elapsedMs >= totalDurationMs || (audioHasEnded && elapsedMs >= 500)) {
          stopAndFinalize();
          return;
        }

        // Draw composite frame for this exact time stamp
        VideoRenderingEngine.drawCompositeFrame(
          ctx,
          dims,
          baseImage,
          isImageLoaded,
          draft,
          currentSec,
          clipImagesMap
        );

        frameIndex++;

        // Update progress callback smoothly
        if (frameIndex % 3 === 0 || elapsedMs >= totalDurationMs) {
          const ratio = Math.min(1, elapsedMs / totalDurationMs);
          const pct = Math.min(95, Math.round(25 + ratio * 70));
          const secFormatted = currentSec.toFixed(1);
          const logLine = `frame=${frameIndex.toString().padStart(4, ' ')} fps=${fps} time=${secFormatted}s / ${totalDuration.toFixed(1)}s progress=${pct}%`;
          onProgress?.(pct, `جاري تسجيل إطارات الفيديو (${frameIndex} إطار - ${secFormatted}ث / ${totalDuration.toFixed(1)}ث)...`, logLine);
        }

        requestAnimationFrame(renderLoop);
      };

      requestAnimationFrame(renderLoop);
    });
  }
}
