/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Scissors, 
  ZoomIn, 
  ZoomOut, 
  Volume2, 
  VolumeX, 
  Music, 
  Type, 
  Sparkles,
  Film,
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { ProjectDraft, MediaClip } from '../../types';

interface TimelineProps {
  draft: ProjectDraft;
  currentTime: number;
  onSeek: (time: number) => void;
  onOpenTextModal: () => void;
  onOpenAudioModal: () => void;
  onOpenEffectsModal: () => void;
  onOpenMediaModal?: () => void;
  onOpenTrimModal?: () => void;
  onSplitAtPlayhead?: () => void;
  onTrimBeforePlayhead?: () => void;
  onTrimAfterPlayhead?: () => void;
  onDeleteClip?: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  draft,
  currentTime,
  onSeek,
  onOpenTextModal,
  onOpenAudioModal,
  onOpenEffectsModal,
  onOpenMediaModal,
  onOpenTrimModal,
  onSplitAtPlayhead,
  onTrimBeforePlayhead,
  onTrimAfterPlayhead,
  onDeleteClip,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [splitNotice, setSplitNotice] = useState<string | null>(null);

  const duration = Math.max(1, draft.duration || 15);

  // Percentage of playhead position
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  // Calculate seek time from client coordinate
  const calculateSeekTime = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = +(ratio * duration).toFixed(2);
    onSeek(newTime);
  }, [duration, onSeek]);

  // Handle drag / scrubbing on timeline
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only respond to primary left click
    if (e.button !== 0) return;
    setIsScrubbing(true);
    calculateSeekTime(e.clientX);
  };

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMouseMove = (e: MouseEvent) => {
      calculateSeekTime(e.clientX);
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, calculateSeekTime]);

  // Touch scrubbing support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsScrubbing(true);
      calculateSeekTime(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      calculateSeekTime(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsScrubbing(false);
  };

  // Time ruler markers
  const markers = [];
  const step = duration <= 15 ? 1 : duration <= 30 ? 2 : duration <= 60 ? 5 : 10;
  for (let s = 0; s <= duration; s += step) {
    markers.push(s);
  }

  const mediaClips: MediaClip[] = draft.mediaClips || [];
  const visualClips = mediaClips.filter((c) => c.type === 'video' || c.type === 'image');
  const audioClips = mediaClips.filter((c) => c.type === 'audio');

  const handleSplit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSplitAtPlayhead) {
      onSplitAtPlayhead();
      setSplitNotice(`تم قص وتقسيم الفيديو بنجاح عند ${currentTime.toFixed(1)} ثانية ✂️`);
    } else {
      setSplitNotice(`تم تحديد نقطة قص عند ${currentTime.toFixed(1)} ثانية`);
    }
    setTimeout(() => setSplitNotice(null), 3000);
  };

  const handleTrimBefore = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentTime <= 0.2) {
      setSplitNotice('المؤشر في بداية الفيديو بالفعل.');
      setTimeout(() => setSplitNotice(null), 2500);
      return;
    }
    if (onTrimBeforePlayhead) {
      onTrimBeforePlayhead();
      setSplitNotice(`تم حذف المقطع ما قبل ${currentTime.toFixed(1)} ثانية بنجاح ✂️`);
      setTimeout(() => setSplitNotice(null), 3000);
    }
  };

  const handleTrimAfter = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentTime >= duration - 0.2) {
      setSplitNotice('المؤشر في نهاية الفيديو بالفعل.');
      setTimeout(() => setSplitNotice(null), 2500);
      return;
    }
    if (onTrimAfterPlayhead) {
      onTrimAfterPlayhead();
      setSplitNotice(`تم إنهاء وقص الفيديو عند ${currentTime.toFixed(1)} ثانية ✂️`);
      setTimeout(() => setSplitNotice(null), 3000);
    }
  };

  return (
    <div className="bg-[#1A1C1E] rounded-2xl border border-[#2B2C30] p-4 space-y-3 shadow-md select-none">
      {splitNotice && (
        <div className="p-2.5 bg-[#006C4C]/40 border border-[#89F8C7]/50 rounded-xl text-xs text-[#89F8C7] text-center font-medium shadow flex items-center justify-center gap-2 animate-in fade-in">
          <Scissors className="w-4 h-4 text-[#89F8C7]" />
          <span>{splitNotice}</span>
        </div>
      )}

      {/* Timeline Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8E9192] border-b border-[#2B2C30] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-[#E3E2E6] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006C4C] animate-pulse"></span>
            <span>الشريط الزمني وقص المؤشر</span>
          </span>
          <span className="font-mono text-[#89F8C7] bg-[#121316] px-2.5 py-1 rounded-lg border border-[#2B2C30] text-xs font-bold">
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>

        {/* Playhead Scissors Actions Group */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Main Cut / Split at Playhead button */}
          <button
            onClick={handleSplit}
            title={`قص وفصل الفيديو إلى جزئين عند موضع المؤشر (${currentTime.toFixed(1)} ثانية)`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600/90 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold transition-all shadow-md active:scale-95 border border-red-400/40"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>قص وتقسيم بالمؤشر ({currentTime.toFixed(1)}s)</span>
          </button>

          {/* Trim before playhead button */}
          {onTrimBeforePlayhead && (
            <button
              onClick={handleTrimBefore}
              title={`حذف الجزء الموجود قبل المؤشر (0s إلى ${currentTime.toFixed(1)}s)`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] hover:text-white transition-colors border border-[#36373B] text-[11px]"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>قص ما قبله</span>
            </button>
          )}

          {/* Trim after playhead button */}
          {onTrimAfterPlayhead && (
            <button
              onClick={handleTrimAfter}
              title={`حذف الجزء الموجود بعد المؤشر (${currentTime.toFixed(1)}s إلى نهاية الفيديو)`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] hover:text-white transition-colors border border-[#36373B] text-[11px]"
            >
              <span>قص ما بعده</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {/* Advanced Trimming Modal Button */}
          {onOpenTrimModal && (
            <button
              onClick={onOpenTrimModal}
              title="فتح لوحة القص والتعديل الدقيقة"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#006C4C]/30 hover:bg-[#006C4C]/50 text-[#89F8C7] font-medium transition-colors border border-[#006C4C]/60 text-[11px]"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>لوحة القص</span>
            </button>
          )}

          {/* Media clips modal button */}
          {onOpenMediaModal && (
            <button
              onClick={onOpenMediaModal}
              title="إدارة الوسائط والطبقات"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#202226] hover:bg-[#2B2C30] text-[#E3E2E6] font-medium transition-colors border border-[#36373B] text-[11px]"
            >
              <Plus className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span>الوسائط</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-[#292A2E] rounded-xl p-0.5 border border-[#36373B] ml-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1 text-[#8E9192] hover:text-white transition-colors"
              title="تصغير الشريط"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-[#C4C7C8]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
              className="p-1 text-[#8E9192] hover:text-white transition-colors"
              title="تكبير الشريط"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Tracks Viewport */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative bg-[#121316] rounded-xl border border-[#2B2C30] overflow-x-auto select-none pt-8 pb-3 px-2 ${
          isScrubbing ? 'cursor-grabbing' : 'cursor-pointer'
        }`}
        style={{ minHeight: '235px' }}
      >
        {/* Time ruler on top */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-[#17191C] border-b border-[#2B2C30] flex items-center px-2 pointer-events-none">
          {markers.map((sec) => (
            <div
              key={sec}
              className="absolute text-[10px] font-mono text-[#8E9192] flex flex-col items-center -translate-x-1/2"
              style={{ left: `${(sec / duration) * 100}%` }}
            >
              <span>{sec}s</span>
              <div className="w-[1px] h-1.5 bg-[#36373B] mt-0.5" />
            </div>
          ))}
        </div>

        {/* Tracks Container */}
        <div className="space-y-2.5 mt-1 pointer-events-auto">
          
          {/* TRACK 1: Video & Visual Clips Track */}
          <div className="flex items-center gap-2 group">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenMediaModal?.();
              }}
              className="w-24 shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-[#C4C7C8] cursor-pointer hover:text-[#89F8C7]"
            >
              <Film className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span className="truncate">فيديو وقص</span>
            </div>
            
            <div className="flex-1 h-13 bg-[#1A1C1E] rounded-lg border border-[#2B2C30] relative overflow-hidden flex items-center p-1 min-h-[48px]">
              
              {/* If no split media clips exist, show the base video segment */}
              {visualClips.length === 0 ? (
                <div 
                  className="w-full h-full bg-gradient-to-r from-[#006C4C]/60 via-[#00875F]/50 to-[#006C4C]/60 border border-[#89F8C7]/50 rounded-md flex items-center justify-between px-3 text-xs shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Film className="w-3.5 h-3.5 text-[#89F8C7] shrink-0" />
                    <span className="font-semibold text-white truncate">
                      {draft.videoSourceName || 'مقطع الفيديو الأساسي'}
                    </span>
                    <span className="text-[10px] font-mono text-[#89F8C7] bg-black/40 px-2 py-0.5 rounded border border-[#89F8C7]/30">
                      {duration.toFixed(1)}s
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#89F8C7] font-medium hidden sm:inline">
                      (حرّك المؤشر وانقر ✂️ للقص)
                    </span>
                    {onOpenMediaModal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMediaModal();
                        }}
                        className="text-[10px] bg-black/50 hover:bg-black/80 text-[#89F8C7] px-2 py-1 rounded border border-[#89F8C7]/40"
                      >
                        + وسائط
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Split clips rendered side-by-side with proportional widths */
                visualClips.map((clip, idx) => {
                  const clipStart = Math.max(0, clip.startTime);
                  const clipEnd = Math.min(duration, clip.endTime);
                  const clipDur = Math.max(0.1, clipEnd - clipStart);
                  const startPct = (clipStart / duration) * 100;
                  const widthPct = Math.max(4, (clipDur / duration) * 100);

                  // Distinguish segments with alternating color styles
                  const isEven = idx % 2 === 0;
                  const bgStyle = isEven 
                    ? 'bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-emerald-400/80 text-emerald-100'
                    : 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-blue-400/80 text-blue-100';

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(clipStart);
                      }}
                      className={`absolute inset-y-1 rounded-md border flex items-center justify-between px-2 text-[11px] truncate shadow-md transition-all hover:brightness-110 ${bgStyle}`}
                      style={{ 
                        left: `${startPct}%`, 
                        width: `calc(${widthPct}% - 2px)`,
                      }}
                      title={`${clip.name} (${clipStart.toFixed(1)}s - ${clipEnd.toFixed(1)}s)`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[9px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold truncate">{clip.name}</span>
                        <span className="text-[9px] font-mono opacity-80 shrink-0">
                          [{clipDur.toFixed(1)}s]
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onDeleteClip && visualClips.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteClip(clip.id);
                            }}
                            title="حذف هذا الجزء المقصوص"
                            className="w-5 h-5 rounded hover:bg-black/60 flex items-center justify-center text-red-300 hover:text-red-200"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* TRACK 2: Original Audio Track */}
          <div className="flex items-center gap-2 group">
            <div className="w-24 shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-[#C4C7C8]">
              {draft.muteOriginalAudio ? (
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#89F8C7]" />
              )}
              <span className={draft.muteOriginalAudio ? 'text-amber-300' : ''}>صوت أصلي</span>
            </div>
            <div className="flex-1 h-9 bg-[#1A1C1E] rounded-lg border border-[#2B2C30] relative overflow-hidden flex items-center px-3">
              {draft.muteOriginalAudio ? (
                <div className="w-full flex items-center justify-between text-[11px] text-amber-400/90 font-medium bg-amber-950/20 px-2 py-1 rounded">
                  <span>تم كتم الصوت الأصلي بالكامل (-an)</span>
                  <span className="text-[10px] bg-amber-900/40 px-1.5 rounded">صامت</span>
                </div>
              ) : (
                <div className="w-full flex items-center gap-1 opacity-70">
                  {/* Stylized waveform bars */}
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#89F8C7] rounded-full"
                      style={{
                        height: `${Math.sin(i * 0.4) * 12 + 14}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TRACK 3: Audio & الشيخ العيد Tracks */}
          <div className="flex items-center gap-2 group">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenAudioModal();
              }}
              className="w-24 shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-[#C4C7C8] cursor-pointer hover:text-[#89F8C7]"
            >
              <Music className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span className="truncate">صوتيات وبديل</span>
            </div>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenAudioModal();
              }}
              className="flex-1 h-10 bg-[#1A1C1E] rounded-lg border border-[#2B2C30] relative overflow-hidden flex items-center px-2 hover:border-[#006C4C] transition-colors"
            >
              {draft.replacedAudio ? (
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#89F8C7] truncate">
                    <span>🎵 {draft.replacedAudio.title}</span>
                    <span className="text-[10px] text-[#8E9192]">({Math.round(draft.replacedAudioVolume * 100)}%)</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-0.5 w-32 h-5">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-[#00875F] rounded-full"
                        style={{ height: `${(i % 5 + 2) * 3}px` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#8E9192] italic flex items-center justify-between w-full">
                  <span>انقر لإدراج صوت الشيخ أو تلاوة قرآنية أو موعظة</span>
                  <span className="text-[10px] text-[#006C4C] font-semibold bg-[#006C4C]/10 px-2 py-0.5 rounded">
                    + إدراج صوت
                  </span>
                </div>
              )}

              {/* Extra uploaded audio clips */}
              {audioClips.map((clip) => {
                const startPct = Math.max(0, (clip.startTime / duration) * 100);
                const widthPct = Math.min(100 - startPct, Math.max(6, ((clip.endTime - clip.startTime) / duration) * 100));

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMediaModal?.();
                    }}
                    className="absolute inset-y-1 bg-emerald-900/70 border border-emerald-400 rounded-md flex items-center justify-between px-2 text-[10px] text-emerald-200 truncate shadow"
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                    title={`صوت: ${clip.name}`}
                  >
                    <span className="truncate">🎵 {clip.name}</span>
                    {onDeleteClip && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClip(clip.id);
                        }}
                        className="w-4 h-4 rounded hover:bg-black/40 flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-red-300" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 4: Text Overlays (Quranic Verses) */}
          <div className="flex items-center gap-2 group">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenTextModal();
              }}
              className="w-24 shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-[#C4C7C8] cursor-pointer hover:text-[#89F8C7]"
            >
              <Type className="w-3.5 h-3.5 text-[#FFDF9E]" />
              <span>نصوص وآيات</span>
            </div>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenTextModal();
              }}
              className="flex-1 h-9 bg-[#1A1C1E] rounded-lg border border-[#2B2C30] relative overflow-hidden flex items-center px-2 hover:border-[#785900] transition-colors"
            >
              {draft.textOverlays.map((txt) => {
                const startPct = (txt.startTime / duration) * 100;
                const widthPct = Math.min(100 - startPct, ((txt.endTime - txt.startTime) / duration) * 100);
                return (
                  <div
                    key={txt.id}
                    className="absolute h-6 rounded bg-[#785900]/40 border border-[#FFDF9E]/60 flex items-center px-2 text-[11px] text-[#FFDF9E] font-amiri font-bold truncate"
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="truncate">
                      {txt.hasAyahBrackets ? `﴿ ${txt.text} ﴾` : txt.text}
                    </span>
                  </div>
                );
              })}
              {draft.textOverlays.length === 0 && (
                <span className="text-xs text-[#8E9192] italic">لا توجد نصوص بعد (+ أضف نص)</span>
              )}
            </div>
          </div>

          {/* TRACK 5: Spiritual Effects Track */}
          <div className="flex items-center gap-2 group">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenEffectsModal();
              }}
              className="w-24 shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-[#C4C7C8] cursor-pointer hover:text-[#89F8C7]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span>المؤثرات</span>
            </div>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenEffectsModal();
              }}
              className="flex-1 h-8 bg-[#1A1C1E] rounded-lg border border-[#2B2C30] relative overflow-hidden flex items-center px-2 hover:border-[#006C4C] transition-colors"
            >
              <div className="flex items-center gap-2">
                {draft.effects.filter((e) => e.enabled).map((eff) => (
                  <span
                    key={eff.id}
                    className="text-[10px] bg-[#006C4C]/30 text-[#89F8C7] border border-[#006C4C]/60 px-2 py-0.5 rounded-md font-medium"
                  >
                    ✨ {eff.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Vertical Playhead with Interactive Scissor Badge Pin */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-red-500 shadow-lg z-30 pointer-events-none transition-none"
          style={{ left: `${playheadPercent}%` }}
        >
          {/* Interactive Scissor Badge Pin on top of playhead cursor */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 pointer-events-auto group">
            <button
              onClick={handleSplit}
              title={`قص الفيديو عند موقع المؤشر الحالي (${currentTime.toFixed(1)} ثانية)`}
              className="w-7 h-6 rounded-md bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg border border-red-300 transition-all active:scale-90 hover:scale-110 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </button>
            {/* Quick Hover Tooltip */}
            <div className="hidden group-hover:flex items-center gap-1 absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 text-[#89F8C7] text-[10px] font-mono px-2 py-0.5 rounded-md border border-[#2B2C30] shadow-xl z-40 pointer-events-none">
              <span>قص هنا</span>
              <span className="text-white font-bold">{currentTime.toFixed(1)}s</span>
            </div>
          </div>

          {/* Pointer needle tip */}
          <div className="w-2.5 h-2.5 bg-red-500 -ml-[4px] mt-2 rotate-45 rounded-xs shadow pointer-events-none" />
        </div>

      </div>
    </div>
  );
};
