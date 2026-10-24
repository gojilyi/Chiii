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
  Clock,
  Layers,
  Sparkle
} from 'lucide-react';
import { ProjectDraft, MediaClip, TextOverlay } from '../../types';

export interface SelectedTimelineItem {
  type: 'video' | 'text' | 'audio' | 'clip';
  id: string;
}

interface TimelineProps {
  draft: ProjectDraft;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedItem?: SelectedTimelineItem | null;
  onSelectItem?: (item: SelectedTimelineItem | null) => void;
  onOpenTextModal: () => void;
  onOpenAudioModal: () => void;
  onOpenEffectsModal: () => void;
  onOpenMediaModal?: () => void;
  onOpenTrimModal?: () => void;
  onOpenAudioTrimModal?: () => void;
  onSyncDurationToAudio?: () => void;
  onSplitAtPlayhead?: () => void;
  onTrimBeforePlayhead?: () => void;
  onTrimAfterPlayhead?: () => void;
  onDeleteClip?: (id: string) => void;
  onTrimItemDirect?: (type: 'video' | 'text' | 'audio' | 'clip', id: string, newStart: number, newEnd: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  draft,
  currentTime,
  onSeek,
  selectedItem = null,
  onSelectItem,
  onOpenTextModal,
  onOpenAudioModal,
  onOpenEffectsModal,
  onOpenMediaModal,
  onOpenTrimModal,
  onOpenAudioTrimModal,
  onSyncDurationToAudio,
  onSplitAtPlayhead,
  onTrimBeforePlayhead,
  onTrimAfterPlayhead,
  onDeleteClip,
  onTrimItemDirect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [splitNotice, setSplitNotice] = useState<string | null>(null);

  // Dynamic timeline duration: strictly matches the longest audio or video track
  const audioDuration = draft.replacedAudio
    ? Math.max(0, (draft.replacedAudio.trimEnd || draft.replacedAudio.duration || 0) - (draft.replacedAudio.trimStart || 0))
    : 0;
  const mediaClipsMaxEnd = Math.max(0, ...(draft.mediaClips || []).map((c) => c.endTime || 0));
  const textOverlaysMaxEnd = Math.max(0, ...(draft.textOverlays || []).map((t) => t.endTime || 0));
  const duration = Math.max(draft.duration || 0, audioDuration, mediaClipsMaxEnd, textOverlaysMaxEnd, 1);

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
      setSplitNotice(`تم تقسيم المقطع بنجاح عند ${currentTime.toFixed(1)} ثانية ✂️`);
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
      setSplitNotice(`تم قص ما قبل ${currentTime.toFixed(1)}s بنجاح ✂️`);
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
      setSplitNotice(`تم قص ما بعد ${currentTime.toFixed(1)}s بنجاح ✂️`);
      setTimeout(() => setSplitNotice(null), 3000);
    }
  };

  // Check selection
  const isVideoSelected = selectedItem?.type === 'video';
  const isAudioSelected = selectedItem?.type === 'audio';

  return (
    <div className="bg-[#242424] rounded-2xl border border-[#383838] p-3 space-y-2.5 shadow-xl select-none text-[#E3E2E6]">
      {splitNotice && (
        <div className="p-2 bg-[#F5B800]/20 border border-[#F5B800]/50 rounded-xl text-xs text-[#F5B800] text-center font-bold shadow flex items-center justify-center gap-2 animate-in fade-in">
          <Scissors className="w-4 h-4 text-[#F5B800]" />
          <span>{splitNotice}</span>
        </div>
      )}

      {/* KineMaster Style Timeline Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#A0A0A0] pb-2 border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#F5B800] bg-[#1a1a1a] px-2.5 py-1 rounded-lg border border-[#383838] font-bold text-xs">
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>

          <div className="flex items-center bg-[#1a1a1a] rounded-lg border border-[#383838] p-0.5">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.6, prev - 0.2))}
              className="p-1 text-[#A0A0A0] hover:text-[#F5B800] transition"
              title="تصغير المسار"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-[#E0E0E0]">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.2))}
              className="p-1 text-[#A0A0A0] hover:text-[#F5B800] transition"
              title="تكبير المسار"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Scissors Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSplit}
            title="تقسيم المقطع عند المؤشر"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#333333] hover:bg-[#404040] text-[#F5B800] hover:text-white border border-[#484848] text-xs font-bold transition shadow-sm active:scale-95"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>تقسيم (Split)</span>
          </button>

          {onTrimBeforePlayhead && (
            <button
              onClick={handleTrimBefore}
              title="حذف ما قبل المؤشر"
              className="p-1.5 rounded-lg bg-[#333333] hover:bg-[#404040] text-[#E0E0E0] border border-[#484848] transition active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#F5B800]" />
            </button>
          )}

          {onTrimAfterPlayhead && (
            <button
              onClick={handleTrimAfter}
              title="حذف ما بعد المؤشر"
              className="p-1.5 rounded-lg bg-[#333333] hover:bg-[#404040] text-[#E0E0E0] border border-[#484848] transition active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#F5B800]" />
            </button>
          )}

          {onOpenAudioTrimModal && (
            <button
              onClick={onOpenAudioTrimModal}
              title="فتح مقص الصوت السهل"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#383838] text-[#89F8C7] border border-emerald-500/30 text-xs font-semibold transition"
            >
              <Music className="w-3 h-3 text-[#89F8C7]" />
              <span>مقص الصوت</span>
            </button>
          )}
        </div>
      </div>

      {/* KineMaster Style Timeline Tracks Area */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative bg-[#1a1a1a] rounded-xl border border-[#333333] overflow-x-auto select-none pt-8 pb-3 px-2 ${
          isScrubbing ? 'cursor-grabbing' : 'cursor-pointer'
        }`}
        style={{ minHeight: '230px' }}
      >
        {/* Time ruler on top */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-[#202020] border-b border-[#383838] flex items-center px-2 pointer-events-none">
          {markers.map((sec) => (
            <div
              key={sec}
              className="absolute text-[10px] font-mono text-[#888888] flex flex-col items-center -translate-x-1/2"
              style={{ left: `${(sec / duration) * 100}%` }}
            >
              <span>{sec}s</span>
              <div className="w-[1px] h-1.5 bg-[#444444] mt-0.5" />
            </div>
          ))}
        </div>

        {/* Tracks List */}
        <div className="space-y-2 mt-1 pointer-events-auto">
          
          {/* TRACK 1: MAIN VIDEO TRACK (Filmstrip Thumbnail Cards) */}
          <div className="flex items-center gap-2 group">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem?.({ type: 'video', id: 'main_video' });
              }}
              className="w-20 shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-[#E0E0E0] cursor-pointer hover:text-[#F5B800]"
            >
              <Film className="w-3.5 h-3.5 text-[#F5B800]" />
              <span className="truncate">الفيديو</span>
            </div>
            
            <div className="flex-1 h-14 bg-[#262626] rounded-xl border border-[#383838] relative overflow-hidden flex items-center p-0.5">
              
              {/* If no split media clips exist, show base video card with filmstrip styling */}
              {visualClips.length === 0 ? (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem?.({ type: 'video', id: 'main_video' });
                  }}
                  className={`w-full h-full rounded-lg relative overflow-hidden flex items-center justify-between px-3 text-xs transition-all cursor-pointer ${
                    isVideoSelected 
                      ? 'border-2 border-[#F5B800] bg-[#332b14] shadow-md' 
                      : 'border border-[#444444] bg-[#2a2a2a] hover:border-[#555555]'
                  }`}
                >
                  {/* KineMaster Yellow Trimming Handles when selected */}
                  {isVideoSelected && (
                    <>
                      <div className="absolute left-0 inset-y-0 w-2.5 bg-[#F5B800] flex items-center justify-center cursor-ew-resize z-10 rounded-l">
                        <div className="w-0.5 h-4 bg-black/70 rounded-full" />
                      </div>
                      <div className="absolute right-0 inset-y-0 w-2.5 bg-[#F5B800] flex items-center justify-center cursor-ew-resize z-10 rounded-r">
                        <div className="w-0.5 h-4 bg-black/70 rounded-full" />
                      </div>
                    </>
                  )}

                  {/* Filmstrip thumbnails preview simulation */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none flex overflow-hidden">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="h-full w-14 shrink-0 border-r border-black/50 bg-cover bg-center"
                        style={{ backgroundImage: `url(${draft.videoSourceUrl || draft.thumbnailUrl || ''})` }}
                      />
                    ))}
                  </div>

                  <div className="relative z-0 flex items-center gap-2 truncate">
                    <Film className="w-3.5 h-3.5 text-[#F5B800] shrink-0" />
                    <span className="font-bold text-white truncate">
                      {draft.videoSourceName || 'الفيديو الأساسي'}
                    </span>
                    <span className="text-[10px] font-mono text-[#F5B800] bg-black/50 px-2 py-0.5 rounded border border-[#F5B800]/40">
                      {duration.toFixed(1)}s
                    </span>
                  </div>

                  <div className="relative z-0 flex items-center gap-2 shrink-0">
                    {onOpenMediaModal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMediaModal();
                        }}
                        className="text-[10px] bg-black/60 hover:bg-black/90 text-[#F5B800] px-2.5 py-1 rounded-lg border border-[#F5B800]/40 font-bold"
                      >
                        + وسائط
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Multiple visual clips */
                visualClips.map((clip, idx) => {
                  const clipStart = Math.max(0, clip.startTime);
                  const clipEnd = Math.min(duration, clip.endTime);
                  const clipDur = Math.max(0.1, clipEnd - clipStart);
                  const startPct = (clipStart / duration) * 100;
                  const widthPct = Math.max(4, (clipDur / duration) * 100);
                  const isSelected = selectedItem?.type === 'clip' && selectedItem?.id === clip.id;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem?.({ type: 'clip', id: clip.id });
                        onSeek(clipStart);
                      }}
                      className={`absolute inset-y-0.5 rounded-lg flex items-center justify-between px-2 text-[11px] truncate shadow transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-2 border-[#F5B800] bg-[#3a3014] z-10' 
                          : 'border border-[#444444] bg-[#2d2d2d] hover:bg-[#333333]'
                      }`}
                      style={{ 
                        left: `${startPct}%`, 
                        width: `calc(${widthPct}% - 2px)`,
                      }}
                      title={`${clip.name} (${clipStart.toFixed(1)}s - ${clipEnd.toFixed(1)}s)`}
                    >
                      {isSelected && (
                        <>
                          <div className="absolute left-0 inset-y-0 w-2 bg-[#F5B800] rounded-l cursor-ew-resize" />
                          <div className="absolute right-0 inset-y-0 w-2 bg-[#F5B800] rounded-r cursor-ew-resize" />
                        </>
                      )}

                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-4 h-4 rounded-full bg-black/50 flex items-center justify-center text-[9px] font-bold text-[#F5B800] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white truncate">{clip.name}</span>
                        <span className="text-[9px] font-mono text-[#A0A0A0]">[{clipDur.toFixed(1)}s]</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onDeleteClip && visualClips.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteClip(clip.id);
                            }}
                            title="حذف هذا المقطع"
                            className="w-5 h-5 rounded hover:bg-black/60 flex items-center justify-center text-red-400 hover:text-red-300"
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

            {onOpenMediaModal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMediaModal();
                }}
                className="w-11 h-14 rounded-xl bg-[#2a2a2a] hover:bg-[#383838] border border-dashed border-[#F5B800]/60 hover:border-[#F5B800] text-[#F5B800] flex flex-col items-center justify-center shrink-0 transition active:scale-95 shadow-sm"
                title="إضافة مقطع فيديو جديد (+)"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">+ مقطع</span>
              </button>
            )}
          </div>

          {/* TRACK 2: LAYERS - TEXT OVERLAYS TRACK */}
          <div className="flex items-center gap-2 group">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenTextModal();
              }}
              className="w-20 shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-[#E0E0E0] cursor-pointer hover:text-[#F5B800]"
            >
              <Type className="w-3.5 h-3.5 text-[#FFDF9E]" />
              <span className="truncate">النصوص</span>
            </div>

            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenTextModal();
              }}
              className="flex-1 h-9 bg-[#262626] rounded-xl border border-[#383838] relative overflow-hidden flex items-center px-1"
            >
              {draft.textOverlays.length === 0 ? (
                <div className="text-[11px] text-[#777777] italic px-2 flex items-center justify-between w-full">
                  <span>+ إضافة نص أو آية قرآنية (طبقة نصية)</span>
                  <span className="text-[10px] text-[#F5B800] font-bold bg-[#F5B800]/10 px-2 py-0.5 rounded">
                    + نص
                  </span>
                </div>
              ) : (
                draft.textOverlays.map((overlay: TextOverlay) => {
                  const startPct = Math.max(0, (overlay.startTime / duration) * 100);
                  const endPct = Math.min(100, (overlay.endTime / duration) * 100);
                  const widthPct = Math.max(5, endPct - startPct);
                  const isSelected = selectedItem?.type === 'text' && selectedItem?.id === overlay.id;

                  return (
                    <div
                      key={overlay.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem?.({ type: 'text', id: overlay.id });
                        onSeek(overlay.startTime);
                      }}
                      className={`absolute inset-y-1 rounded-md flex items-center justify-between px-2 text-[10px] font-bold truncate shadow transition cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#F5B800] bg-[#423512] text-[#FFDF9E] z-10'
                          : 'border border-amber-600/40 bg-[#332a18] text-amber-200 hover:brightness-110'
                      }`}
                      style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                    >
                      {isSelected && (
                        <>
                          <div className="absolute left-0 inset-y-0 w-1.5 bg-[#F5B800] rounded-l" />
                          <div className="absolute right-0 inset-y-0 w-1.5 bg-[#F5B800] rounded-r" />
                        </>
                      )}
                      <span className="truncate">{overlay.hasAyahBrackets ? `﴿ ${overlay.text} ﴾` : overlay.text}</span>
                      <span className="text-[9px] opacity-75 font-mono ml-1">({(overlay.endTime - overlay.startTime).toFixed(1)}s)</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* TRACK 3: AUDIO TRACK (Waveform & Sheikh Recording) */}
          <div className="flex items-center gap-2 group">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem?.({ type: 'audio', id: 'main_audio' });
                onOpenAudioModal();
              }}
              className="w-20 shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-[#E0E0E0] cursor-pointer hover:text-[#89F8C7]"
            >
              <Music className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span className="truncate">الصوتيات</span>
            </div>

            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem?.({ type: 'audio', id: 'main_audio' });
              }}
              className={`flex-1 h-11 rounded-xl relative overflow-hidden flex items-center px-2 transition-all cursor-pointer ${
                isAudioSelected
                  ? 'border-2 border-[#F5B800] bg-[#1d352b] shadow-md'
                  : 'border border-[#383838] bg-[#222825] hover:border-[#484848]'
              }`}
            >
              {isAudioSelected && (
                <>
                  <div className="absolute left-0 inset-y-0 w-2.5 bg-[#F5B800] rounded-l cursor-ew-resize z-10" />
                  <div className="absolute right-0 inset-y-0 w-2.5 bg-[#F5B800] rounded-r cursor-ew-resize z-10" />
                </>
              )}

              {draft.replacedAudio ? (
                <div className="w-full flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#89F8C7] truncate">
                    <span>🎵 {draft.replacedAudio.title}</span>
                    {draft.replacedAudio.trimStart !== undefined && draft.replacedAudio.trimEnd !== undefined && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono">
                        {draft.replacedAudio.trimStart.toFixed(1)}s - {draft.replacedAudio.trimEnd.toFixed(1)}s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Simulated Waveform peaks */}
                    <div className="flex items-center gap-0.5 h-5 opacity-80">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#89F8C7] rounded-full"
                          style={{ height: `${Math.sin(i * 0.45) * 8 + 10}px` }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAudioTrimModal?.();
                      }}
                      className="px-2 py-0.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-[#89F8C7] border border-emerald-500/40 text-[10px] font-bold"
                    >
                      قص الصوت
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#777777] italic flex items-center justify-between w-full">
                  <span>+ إدراج صوت الشيخ أو تسجيل صوتي</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAudioModal();
                    }}
                    className="text-[10px] text-[#89F8C7] font-bold bg-[#89F8C7]/10 px-2 py-0.5 rounded"
                  >
                    + إضافة صوت
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* KINEMASTER SIGNATURE PLAYHEAD NEEDLE (Vertical Line with Top Pointer Head) */}
        <div 
          className="absolute top-0 bottom-0 pointer-events-none z-30 transition-none"
          style={{ left: `${playheadPercent}%` }}
        >
          {/* Top Playhead Needle Head */}
          <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center">
            <div className="w-3.5 h-3.5 bg-red-600 rotate-45 transform origin-center shadow-lg -translate-y-1" />
          </div>
          {/* Vertical Needle Line */}
          <div className="w-[2px] h-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)] -translate-x-1/2" />
        </div>

      </div>
    </div>
  );
};
