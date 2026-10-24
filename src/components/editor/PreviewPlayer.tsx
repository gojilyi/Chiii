/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Sparkles, Scissors } from 'lucide-react';
import { ProjectDraft, BackgroundAdjustments } from '../../types';
import { DEFAULT_BACKGROUND_ADJUSTMENTS } from '../../constants/defaults';

interface PreviewPlayerProps {
  draft: ProjectDraft;
  currentTime: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSeek: (time: number) => void;
  onToggleMute: () => void;
  onLoadedMediaDuration?: (duration: number) => void;
  onSplitAtPlayhead?: () => void;
  onTrimBeforePlayhead?: () => void;
  onTrimAfterPlayhead?: () => void;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  draft,
  currentTime,
  isPlaying,
  onPlayToggle,
  onSeek,
  onToggleMute,
  onLoadedMediaDuration,
  onSplitAtPlayhead,
  onTrimBeforePlayhead,
  onTrimAfterPlayhead,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clipImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Dynamic project duration: matches the longest audio or video track, never limited to 16s
  const audioDuration = draft.replacedAudio
    ? Math.max(0, (draft.replacedAudio.trimEnd || draft.replacedAudio.duration || 0) - (draft.replacedAudio.trimStart || 0))
    : 0;
  const mediaClipsMaxEnd = Math.max(0, ...(draft.mediaClips || []).map((c) => c.endTime || 0));
  const totalDuration = Math.max(draft.duration || 0, audioDuration, mediaClipsMaxEnd, 1);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCanvasDimensions = () => {
    switch (draft.aspectRatio) {
      case '9:16':
        return { width: 450, height: 800 };
      case '16:9':
        return { width: 800, height: 450 };
      case '1:1':
        return { width: 600, height: 600 };
    }
  };

  const dims = getCanvasDimensions();

  // Synchronize base video element audio and playback if video source is loaded
  useEffect(() => {
    const video = videoElementRef.current;
    if (!video) return;
    video.muted = draft.muteOriginalAudio;
    video.volume = draft.muteOriginalAudio ? 0 : Math.max(0, Math.min(1, draft.originalAudioVolume));
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, draft.muteOriginalAudio, draft.originalAudioVolume]);

  useEffect(() => {
    const video = videoElementRef.current;
    if (video && Number.isFinite(currentTime) && Math.abs(video.currentTime - currentTime) > 0.35) {
      try {
        video.currentTime = currentTime;
      } catch {
        // ignore
      }
    }
  }, [currentTime]);

  // Real-time canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animTime = 0;

    const render = () => {
      animTime += 0.035;
      ctx.clearRect(0, 0, dims.width, dims.height);

      ctx.save();

      // Check for pulse heartbeat motion
      const pulseEffect = draft.effects.find((e) => e.id === 'pulse_heartbeat' && e.enabled);
      if (pulseEffect) {
        const pulseScale = 1 + Math.sin(animTime * 3.5) * ((pulseEffect.intensity / 100) * 0.025);
        ctx.translate(dims.width / 2, dims.height / 2);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-dims.width / 2, -dims.height / 2);
      }

      // Check for subtle zoom (Ken Burns)
      const zoomEffect = draft.effects.find((e) => e.id === 'subtle_zoom' && e.enabled);
      if (zoomEffect) {
        const zoomScale = 1 + ((currentTime / totalDuration) * (zoomEffect.intensity / 100) * 0.08);
        ctx.translate(dims.width / 2, dims.height / 2);
        ctx.scale(zoomScale, zoomScale);
        ctx.translate(-dims.width / 2, -dims.height / 2);
      }

      // 1. Draw base video or background image with Background Adjustments
      const img = imageElementRef.current;
      const video = videoElementRef.current;
      const isVideoReady = Boolean(video && video.readyState >= 2 && video.videoWidth > 0);
      const isImgReady = Boolean(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
      let drawn = false;

      const bgAdj: BackgroundAdjustments = draft.backgroundAdjustments || { ...DEFAULT_BACKGROUND_ADJUSTMENTS };

      ctx.save();

      // Background Filters (brightness, contrast, blur)
      let filterParts: string[] = [
        `brightness(${bgAdj.brightness}%)`,
        `contrast(${bgAdj.contrast}%)`
      ];
      if (bgAdj.blur > 0) {
        filterParts.push(`blur(${bgAdj.blur}px)`);
      }
      ctx.filter = filterParts.join(' ');

      // Pan, Scale, Flip Horizontal
      const centerX = dims.width / 2;
      const centerY = dims.height / 2;
      const panXOffset = (bgAdj.panX / 100) * dims.width;
      const panYOffset = (bgAdj.panY / 100) * dims.height;

      ctx.translate(centerX + panXOffset, centerY + panYOffset);
      ctx.scale(bgAdj.scale * (bgAdj.flipHorizontal ? -1 : 1), bgAdj.scale);
      ctx.translate(-centerX, -centerY);

      if (isVideoReady && video) {
        try {
          ctx.drawImage(video, 0, 0, dims.width, dims.height);
          drawn = true;
        } catch {
          drawn = false;
        }
      } else if (isImgReady && img) {
        try {
          ctx.drawImage(img, 0, 0, dims.width, dims.height);
          drawn = true;
        } catch {
          drawn = false;
        }
      }

      ctx.restore(); // restore filter, pan, scale, flip
      ctx.filter = 'none';

      if (!drawn) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, dims.height);
        bgGrad.addColorStop(0, '#0c1a16');
        bgGrad.addColorStop(0.5, '#122b22');
        bgGrad.addColorStop(1, '#050c0a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, dims.width, dims.height);

        // Subtle geometric Islamic pattern lines
        ctx.save();
        ctx.strokeStyle = 'rgba(137, 248, 199, 0.05)';
        ctx.lineWidth = 1;
        for (let i = -dims.height; i < dims.width + dims.height; i += 60) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + dims.height, dims.height);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 1.2. Color Grading Filter
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

      // 1.3. Overlay Darkness (Enhances reading for verses)
      if (bgAdj.overlayDarkness > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${bgAdj.overlayDarkness / 100})`;
        ctx.fillRect(0, 0, dims.width, dims.height);
        ctx.restore();
      }

      // 1.4. Vignette Shadow
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

      // 1.5. Golden Arch Frame
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

      // 1.6. Lesson Banner Overlay («شرح كتاب إيصال السالك»)
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

        // Arched badge background
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

        // Inner gold arch
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(255, 223, 140, 0.5)';
        ctx.beginPath();
        ctx.moveTo(-wHalf + 4, hHalf - 4);
        ctx.lineTo(-wHalf + 4, -hHalf + 24);
        ctx.quadraticCurveTo(0, -hHalf - 8, wHalf - 4, -hHalf + 24);
        ctx.lineTo(wHalf - 4, hHalf - 4);
        ctx.closePath();
        ctx.stroke();

        // Text rendering inside banner
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

      // 1.7. Book Graphic Overlay (كتاب إيصال السالك الأخضر)
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

        // Leather cover gradient
        const coverGrad = ctx.createLinearGradient(-bookW / 2, 0, bookW / 2, 0);
        coverGrad.addColorStop(0, '#003824');
        coverGrad.addColorStop(0.2, '#005437');
        coverGrad.addColorStop(0.85, '#00472e');
        coverGrad.addColorStop(1, '#002919');
        ctx.fillStyle = coverGrad;

        ctx.beginPath();
        ctx.roundRect(-bookW / 2, -bookH / 2, bookW, bookH, [5, 10, 10, 5]);
        ctx.fill();

        // Pages edge
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#EDE8DC';
        ctx.fillRect(bookW / 2 - 4, -bookH / 2 + 5, 4, bookH - 10);
        ctx.fillRect(-bookW / 2 + 6, bookH / 2 - 4, bookW - 10, 4);

        // Gold border lines
        ctx.strokeStyle = 'rgba(229, 184, 66, 0.88)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-bookW / 2 + 6, -bookH / 2 + 6, bookW - 14, bookH - 14);

        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(255, 223, 140, 0.5)';
        ctx.strokeRect(-bookW / 2 + 10, -bookH / 2 + 10, bookW - 22, bookH - 22);

        // Book title & medallion
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

      ctx.restore();

      // 2. Render Montage & Spiritual Effects (from YouTube Playlist & Pro Packs)
      const activeEffects = draft.effects.filter((e) => e.enabled);


      activeEffects.forEach((effect) => {
        // A. Light Leaks & Cinematic Flares (تسريبات ضوئية)
        if (effect.id === 'light_leaks') {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const flareX = (Math.sin(animTime * 0.6) * 0.35 + 0.5) * dims.width;
          const flareY = (Math.cos(animTime * 0.4) * 0.25 + 0.3) * dims.height;
          const leakGrad = ctx.createRadialGradient(flareX, flareY, 10, flareX, flareY, dims.width * 0.7);
          const opacity = (effect.intensity / 100) * 0.45;
          leakGrad.addColorStop(0, `rgba(255, 180, 50, ${opacity})`);
          leakGrad.addColorStop(0.4, `rgba(255, 90, 30, ${opacity * 0.6})`);
          leakGrad.addColorStop(0.8, `rgba(180, 50, 10, ${opacity * 0.2})`);
          leakGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = leakGrad;
          ctx.fillRect(0, 0, dims.width, dims.height);
          ctx.restore();
        }

        // B. Audio Spectrum Visualizer (موجات صوتية للقرآن)
        if (effect.id === 'audio_spectrum') {
          ctx.save();
          const barCount = 36;
          const barWidth = (dims.width * 0.7) / barCount;
          const startX = dims.width * 0.15;
          const baseY = dims.height * 0.88;
          ctx.fillStyle = 'rgba(137, 248, 199, 0.85)';
          ctx.shadowColor = 'rgba(137, 248, 199, 0.6)';
          ctx.shadowBlur = 8;

          for (let i = 0; i < barCount; i++) {
            // Harmonic wave reaction
            const wave = Math.abs(Math.sin(i * 0.35 + animTime * 4) * Math.cos(i * 0.2 + animTime * 2.5));
            const barHeight = wave * 45 * (effect.intensity / 100) + 4;
            const x = startX + i * barWidth;
            const y = baseY - barHeight / 2;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
          }
          ctx.restore();
        }

        // C. God Rays (أشعة النور الإلهية)
        if (effect.id === 'god_rays') {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const rayIntensity = (effect.intensity / 100) * 0.32;
          const topRayX = dims.width * 0.5 + Math.sin(animTime * 0.3) * 60;
          
          for (let r = -3; r <= 3; r++) {
            ctx.beginPath();
            ctx.moveTo(topRayX + r * 30, 0);
            ctx.lineTo(topRayX + r * 140 - 80, dims.height);
            ctx.lineTo(topRayX + r * 140 + 80, dims.height);
            ctx.closePath();
            
            const rayGrad = ctx.createLinearGradient(0, 0, 0, dims.height);
            rayGrad.addColorStop(0, `rgba(255, 240, 190, ${rayIntensity * 0.9})`);
            rayGrad.addColorStop(0.7, `rgba(255, 215, 130, ${rayIntensity * 0.4})`);
            rayGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = rayGrad;
            ctx.fill();
          }
          ctx.restore();
        }

        // E. Heavenly Clouds & Mist (سحاب وضباب)
        if (effect.id === 'heavenly_clouds') {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const cloudY = dims.height * 0.82;
          const cloudGrad = ctx.createLinearGradient(0, cloudY, 0, dims.height);
          const cOpacity = (effect.intensity / 100) * 0.35;
          cloudGrad.addColorStop(0, 'transparent');
          cloudGrad.addColorStop(0.5, `rgba(220, 240, 255, ${cOpacity * 0.7})`);
          cloudGrad.addColorStop(1, `rgba(255, 255, 255, ${cOpacity})`);
          ctx.fillStyle = cloudGrad;
          ctx.fillRect(0, cloudY, dims.width, dims.height - cloudY);
          ctx.restore();
        }

        // F. Retro 35mm Film Grain (حبيبات فيلم قديم)
        if (effect.id === 'vintage_film_grain') {
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${(effect.intensity / 100) * 0.055})`;
          for (let i = 0; i < 400; i++) {
            const gx = Math.random() * dims.width;
            const gy = Math.random() * dims.height;
            ctx.fillRect(gx, gy, 1.5, 1.5);
          }
          // Occasional vintage scratch
          if (Math.sin(animTime * 12) > 0.88) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(effect.intensity / 100) * 0.25})`;
            ctx.fillRect(Math.random() * dims.width, 0, 1, dims.height);
          }
          ctx.restore();
        }

        // G. Arabesque Vignette
        if (effect.id === 'arabesque_vignette') {
          const vig = ctx.createRadialGradient(
            dims.width / 2,
            dims.height / 2,
            dims.width * 0.35,
            dims.width / 2,
            dims.height / 2,
            dims.width * 0.75
          );
          vig.addColorStop(0, 'transparent');
          vig.addColorStop(1, `rgba(0, 0, 0, ${(effect.intensity / 100) * 0.8})`);
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, dims.width, dims.height);
        }

        // H. Islamic Gold Geometric Frame (إطار إسلامي مذهب)
        if (effect.id === 'islamic_gold_frame') {
          ctx.save();
          const margin = 18;
          ctx.strokeStyle = `rgba(229, 184, 66, ${(effect.intensity / 100) * 0.85})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(margin, margin, dims.width - margin * 2, dims.height - margin * 2);

          // Inner delicate line
          ctx.strokeStyle = `rgba(229, 184, 66, ${(effect.intensity / 100) * 0.45})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(margin + 6, margin + 6, dims.width - (margin + 6) * 2, dims.height - (margin + 6) * 2);

          // Corner Islamic Arabesque diamond accents
          const cornerSize = 10;
          const corners = [
            [margin + 6, margin + 6],
            [dims.width - margin - 6, margin + 6],
            [margin + 6, dims.height - margin - 6],
            [dims.width - margin - 6, dims.height - margin - 6]
          ];
          ctx.fillStyle = `rgba(229, 184, 66, ${(effect.intensity / 100) * 0.9})`;
          corners.forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }

        // I. Spiritual Glow
        if (effect.id === 'spiritual_glow') {
          const radial = ctx.createRadialGradient(
            dims.width / 2,
            dims.height / 2,
            40,
            dims.width / 2,
            dims.height / 2,
            dims.width * 0.65
          );
          radial.addColorStop(0, `rgba(137, 248, 199, ${(effect.intensity / 100) * 0.22})`);
          radial.addColorStop(1, 'transparent');
          ctx.fillStyle = radial;
          ctx.fillRect(0, 0, dims.width, dims.height);
        }
      });

      // 2.5. Render Multi-Media Clips (Images and Video Overlays added by user)
      const mediaClips = draft.mediaClips || [];
      const activeVisualClips = mediaClips.filter(
        (c) => (c.type === 'image' || c.type === 'video') && currentTime >= c.startTime && currentTime <= c.endTime
      );

      activeVisualClips.forEach((clip) => {
        let clipImg = clipImagesRef.current.get(clip.url);
        if (!clipImg) {
          clipImg = new Image();
          clipImg.src = clip.url;
          clipImagesRef.current.set(clip.url, clipImg);
        }

        if (clipImg.complete && clipImg.naturalWidth > 0) {
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
            // Draw fallback
          }

          ctx.restore();
        }
      });

      // 3. Render Active Text Overlays (Quranic Verses)
      draft.textOverlays.forEach((overlay) => {
        if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
          const posX = (overlay.positionX / 100) * dims.width;
          const posY = (overlay.positionY / 100) * dims.height;

          ctx.save();
          const font = overlay.fontFamily === 'Aref Ruqaa' ? `'Aref Ruqaa', cursive` : `'${overlay.fontFamily}', 'Amiri', serif`;
          ctx.font = `600 ${overlay.fontSize * (dims.width / 400)}px ${font}`;
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

      // 4. Render Animated Calligraphy Handwriting (الرقعة / الديواني مع الصوت والشمعة)
      const story = draft.calligraphyStory;
      if (story && story.enabled && story.words && story.words.length > 0) {
        const currentMs = currentTime * 1000;
        
        ctx.save();
        const baseFontSize = (story.fontSize || 38) * (dims.width / 420);
        ctx.font = `bold ${baseFontSize}px 'Aref Ruqaa', cursive, 'Amiri', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Candle flicker subtle glow on the parchment
        const candleFlicker = Math.sin(animTime * 8) * 0.04 + 0.16;
        const candleGrad = ctx.createRadialGradient(
          dims.width * 0.22,
          dims.height * 0.42,
          10,
          dims.width * 0.22,
          dims.height * 0.42,
          dims.width * 0.65
        );
        candleGrad.addColorStop(0, `rgba(255, 200, 100, ${candleFlicker})`);
        candleGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = candleGrad;
        ctx.fillRect(0, 0, dims.width, dims.height);

        // Position on parchment scroll (around center-lower third)
        const scrollCenterY = dims.height * 0.62;
        const totalWords = story.words;

        // In word_by_word mode: filter words spoken up to now
        // In karaoke mode: show all words, highlight active
        const wordsToDisplay = story.mode === 'word_by_word'
          ? totalWords.filter((w) => currentMs >= w.startMs)
          : totalWords;

        if (wordsToDisplay.length > 0) {
          const lineText = wordsToDisplay.map((w) => w.word).join(' ');
          
          // Outer Calligraphy Ink Shadow
          ctx.shadowColor = 'rgba(25, 12, 4, 0.9)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 3;

          // Draw ink text
          const isAnyActive = totalWords.some((w) => currentMs >= w.startMs && currentMs <= w.endMs);
          
          if (story.mode === 'karaoke') {
            // Segmented draw for karaoke highlight
            let curX = dims.width * 0.85; // RTL start
            const spaceWidth = ctx.measureText(' ').width;

            totalWords.forEach((w) => {
              const isActive = currentMs >= w.startMs && currentMs <= w.endMs;
              const isPast = currentMs > w.endMs;
              const wMetrics = ctx.measureText(w.word);
              
              if (isActive) {
                ctx.fillStyle = story.highlightColor || '#FFDF9E';
                ctx.shadowColor = 'rgba(255, 223, 158, 0.9)';
                ctx.shadowBlur = 16;
              } else if (isPast) {
                ctx.fillStyle = '#E8DEC8';
                ctx.shadowBlur = 6;
              } else {
                ctx.fillStyle = 'rgba(220, 210, 190, 0.45)';
                ctx.shadowBlur = 2;
              }
              
              // Draw word
              ctx.fillText(w.word, curX - wMetrics.width / 2, scrollCenterY);
              curX -= (wMetrics.width + spaceWidth);
            });
          } else {
            // Word by word typewriter appearance with gold ink
            ctx.fillStyle = story.highlightColor || '#FFDF9E';
            if (isAnyActive) {
              ctx.shadowColor = 'rgba(255, 223, 158, 0.8)';
              ctx.shadowBlur = 14;
            }
            ctx.fillText(lineText, dims.width / 2, scrollCenterY);
          }
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dims, draft, currentTime]);

  return (
    <div className="flex flex-col items-center bg-[#242424] rounded-2xl border border-[#383838] p-3 shadow-xl relative overflow-hidden">
      
      {/* Hidden reference media elements */}
      <img
        ref={imageElementRef}
        src={draft.videoSourceUrl}
        alt="Source"
        className="hidden"
      />
      <video
        ref={videoElementRef}
        src={draft.videoSourceUrl}
        className="hidden"
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (dur && Number.isFinite(dur) && dur > 0 && onLoadedMediaDuration) {
            onLoadedMediaDuration(+dur.toFixed(2));
          }
        }}
      />

      {/* Top Status Bar inside Player */}
      <div className="w-full flex items-center justify-between pb-2 px-1 text-xs text-[#A0A0A0]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#F5B800] bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-[#383838] font-bold">
            {draft.aspectRatio}
          </span>
          <span className="truncate max-w-[200px] text-[#E0E0E0] font-medium text-xs">
            {draft.videoSourceName || 'المعاينة الحية'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
              draft.muteOriginalAudio
                ? 'bg-amber-950/40 text-amber-300 border border-amber-600/40'
                : 'bg-[#333333] text-[#A0A0A0] hover:text-white border border-[#444444]'
            }`}
          >
            {draft.muteOriginalAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px]">مكتوم</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#F5B800]" />
                <span className="text-[10px]">الصوت</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screen Aspect Ratio Frame */}
      <div 
        className="relative bg-black rounded-xl overflow-hidden flex items-center justify-center border border-[#383838] shadow-2xl"
        style={{
          width: draft.aspectRatio === '9:16' ? '280px' : draft.aspectRatio === '16:9' ? '500px' : '340px',
          maxWidth: '100%',
          height: draft.aspectRatio === '9:16' ? '460px' : draft.aspectRatio === '16:9' ? '280px' : '340px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={dims.width}
          height={dims.height}
          className="w-full h-full object-contain cursor-pointer"
          onClick={onPlayToggle}
        />

        {/* Center Play Overlay Icon when paused */}
        {!isPlaying && (
          <div 
            onClick={onPlayToggle}
            className="absolute inset-0 bg-black/25 flex items-center justify-center cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-[#F5B800] text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform font-bold">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="w-full mt-2.5 space-y-1.5">
        <div className="relative flex items-center gap-3">
          <span className="text-xs font-mono text-[#F5B800] tabular-nums font-bold">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={totalDuration}
            step="0.1"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 accent-[#F5B800] cursor-pointer h-1.5 bg-[#333333] rounded-lg"
          />
          <span className="text-xs font-mono text-[#A0A0A0] tabular-nums">
            {formatTime(totalDuration)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSeek(0)}
              title="إعادة من البداية"
              className="w-8 h-8 rounded-lg bg-[#333333] hover:bg-[#404040] text-[#C4C7C8] hover:text-white flex items-center justify-center transition border border-[#444444]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onPlayToggle}
              className="h-9 px-4 rounded-xl bg-[#F5B800] hover:bg-[#e0a800] text-black text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>تشغيل</span>
                </>
              )}
            </button>

            {onSplitAtPlayhead && (
              <button
                onClick={onSplitAtPlayhead}
                title="قص وفصل الفيديو عند موضع المؤشر الحالي"
                className="h-8 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-200 hover:text-white flex items-center gap-1.5 transition-all border border-red-500/40 text-xs font-bold shadow-sm active:scale-95"
              >
                <Scissors className="w-3.5 h-3.5 text-red-300" />
                <span className="hidden sm:inline">قص عند المؤشر ({currentTime.toFixed(1)}s)</span>
                <span className="sm:hidden">قص ({currentTime.toFixed(1)}s)</span>
              </button>
            )}

            {onTrimBeforePlayhead && currentTime > 0.5 && (
              <button
                onClick={onTrimBeforePlayhead}
                title="حذف ما قبل المؤشر"
                className="h-8 px-2.5 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-[#C4C7C8] hover:text-white hidden md:flex items-center gap-1 transition-all border border-[#36373B] text-[11px]"
              >
                <span>قص ما قبله</span>
              </button>
            )}

            {onTrimAfterPlayhead && currentTime < totalDuration - 0.5 && (
              <button
                onClick={onTrimAfterPlayhead}
                title="حذف ما بعد المؤشر"
                className="h-8 px-2.5 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-[#C4C7C8] hover:text-white hidden md:flex items-center gap-1 transition-all border border-[#36373B] text-[11px]"
              >
                <span>قص ما بعده</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8E9192]">
            <button 
              onClick={() => {
                if (canvasRef.current?.requestFullscreen) {
                  canvasRef.current.requestFullscreen();
                }
              }}
              title="ملء الشاشة" 
              className="w-8 h-8 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] hover:text-white flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
