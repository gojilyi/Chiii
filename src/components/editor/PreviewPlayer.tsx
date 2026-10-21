/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Sparkles } from 'lucide-react';
import { ProjectDraft } from '../../types';

interface PreviewPlayerProps {
  draft: ProjectDraft;
  currentTime: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSeek: (time: number) => void;
  onToggleMute: () => void;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  draft,
  currentTime,
  isPlaying,
  onPlayToggle,
  onSeek,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clipImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

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
        const zoomScale = 1 + ((currentTime / (draft.duration || 15)) * (zoomEffect.intensity / 100) * 0.08);
        ctx.translate(dims.width / 2, dims.height / 2);
        ctx.scale(zoomScale, zoomScale);
        ctx.translate(-dims.width / 2, -dims.height / 2);
      }

      // 1. Draw base video or background image
      const img = imageElementRef.current;
      const video = videoElementRef.current;
      const isVideoReady = Boolean(video && video.readyState >= 2 && video.videoWidth > 0);
      const isImgReady = Boolean(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
      let drawn = false;

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
    <div className="flex flex-col items-center bg-[#1A1C1E] rounded-2xl border border-[#2B2C30] p-4 shadow-md relative overflow-hidden">
      
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
      />

      {/* Top Status Bar inside Player */}
      <div className="w-full flex items-center justify-between pb-3 px-1 text-xs text-[#8E9192]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#89F8C7] bg-[#121316] px-2 py-0.5 rounded border border-[#2B2C30]">
            {draft.aspectRatio}
          </span>
          <span className="truncate max-w-[200px] text-[#E3E2E6] font-medium">
            {draft.videoSourceName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#89F8C7] bg-[#121316] px-2 py-0.5 rounded border border-[#2B2C30]">
            <Sparkles className="w-3 h-3 text-[#FFDF9E]" />
            <span>مؤثرات المونتاج مفعّلة ({draft.effects.filter(e => e.enabled).length})</span>
          </span>

          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              draft.muteOriginalAudio
                ? 'bg-amber-950/40 text-amber-300 border border-amber-600/40'
                : 'bg-[#292A2E] text-[#C4C7C8] hover:text-white border border-[#36373B]'
            }`}
          >
            {draft.muteOriginalAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span>الصوت الأصلي مكتوم</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#89F8C7]" />
                <span>الصوت الأصلي مفعّل</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screen Aspect Ratio Frame */}
      <div 
        className="relative bg-black rounded-xl overflow-hidden flex items-center justify-center border border-[#333539] shadow-inner"
        style={{
          width: draft.aspectRatio === '9:16' ? '280px' : draft.aspectRatio === '16:9' ? '520px' : '360px',
          maxWidth: '100%',
          height: draft.aspectRatio === '9:16' ? '498px' : draft.aspectRatio === '16:9' ? '292px' : '360px',
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
            <div className="w-14 h-14 rounded-full bg-[#006C4C]/90 text-white flex items-center justify-center shadow-lg border border-[#89F8C7]/40 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="w-full mt-3 space-y-2">
        <div className="relative flex items-center gap-3">
          <span className="text-xs font-mono text-[#89F8C7] tabular-nums">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={draft.duration || 15}
            step="0.1"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 accent-[#89F8C7] cursor-pointer h-1.5 bg-[#2B2C30] rounded-lg"
          />
          <span className="text-xs font-mono text-[#8E9192] tabular-nums">
            {formatTime(draft.duration || 15)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSeek(0)}
              title="إعادة من البداية"
              className="w-8 h-8 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] hover:text-white flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onPlayToggle}
              className="h-8 px-4 rounded-lg bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>تشغيل المعاينة</span>
                </>
              )}
            </button>
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
