/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
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
  Sliders
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
  onDeleteClip,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = React.useState<number>(1);
  const duration = draft.duration || 15;

  const [splitNotice, setSplitNotice] = React.useState<string | null>(null);

  // Calculate percentage of playhead position
  const playheadPercent = (currentTime / duration) * 100;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  // Time ruler markers
  const markers = [];
  const step = duration <= 20 ? 2 : duration <= 60 ? 5 : 10;
  for (let s = 0; s <= duration; s += step) {
    markers.push(s);
  }

  const mediaClips: MediaClip[] = draft.mediaClips || [];
  const visualClips = mediaClips.filter((c) => c.type === 'video' || c.type === 'image');
  const audioClips = mediaClips.filter((c) => c.type === 'audio');

  const handleSplit = () => {
    if (onSplitAtPlayhead) {
      onSplitAtPlayhead();
    } else {
      setSplitNotice(`تم تحديد نقطة قص (Split) عند ${currentTime.toFixed(1)} ثانية`);
      setTimeout(() => setSplitNotice(null), 2500);
    }
  };

  return (
    <div className="bg-[#1A1C1E] rounded-2xl border border-[#2B2C30] p-4 space-y-3 shadow-md">
      {splitNotice && (
        <div className="p-2 bg-[#006C4C]/40 border border-[#89F8C7]/50 rounded-lg text-xs text-[#89F8C7] text-center font-medium animate-in fade-in">
          {splitNotice}
        </div>
      )}

      {/* Timeline Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8E9192] border-b border-[#2B2C30] pb-2.5">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#E3E2E6] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006C4C]"></span>
            <span>الشريط الزمني المتقدم (Multi-Track Timeline)</span>
          </span>
          <span className="font-mono text-[#89F8C7] bg-[#121316] px-2.5 py-0.5 rounded-lg border border-[#2B2C30]">
            {currentTime.toFixed(1)}s / {duration}s
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Dedicated Video Trimming & Cutting Tools Button */}
          {onOpenTrimModal && (
            <button
              onClick={onOpenTrimModal}
              title="فتح نافذة قص وتعديل الفيديو المتقدمة"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#006C4C]/40 hover:bg-[#006C4C]/65 text-[#89F8C7] font-semibold transition-all border border-[#89F8C7]/50 shadow-sm active:scale-95"
            >
              <Scissors className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span>أدوات قص الفيديو وتعديله</span>
            </button>
          )}

          {/* Quick Media & Trimming Manager button */}
          {onOpenMediaModal && (
            <button
              onClick={onOpenMediaModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-[#E3E2E6] font-semibold transition-all border border-[#36373B] shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span>الوسائط والطبقات</span>
            </button>
          )}

          <button
            onClick={handleSplit}
            title="قص وفصل المقطع عند موقع المؤشر الحالي"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] hover:text-white transition-colors border border-[#36373B]"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>قص عند المؤشر ({currentTime.toFixed(1)}s)</span>
          </button>

          <div className="flex items-center bg-[#292A2E] rounded-lg p-0.5 border border-[#36373B]">
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
        onClick={handleTimelineClick}
        className="relative bg-[#121316] rounded-xl border border-[#2B2C30] overflow-x-auto cursor-pointer select-none pt-7 pb-2 px-2"
        style={{ minHeight: '230px' }}
      >
        {/* Time ruler on top */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-[#17191C] border-b border-[#2B2C30] flex items-center px-2 pointer-events-none">
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
        <div className="space-y-2 mt-2">
          
          {/* TRACK 1: Video & Images Track (Multi-Clip) */}
          <div className="flex items-center gap-2 group">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenMediaModal?.();
              }}
              className="w-24 shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-[#C4C7C8] cursor-pointer hover:text-[#89F8C7]"
            >
              <Film className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span>فيديو وصور</span>
            </div>
            <div className="flex-1 h-12 bg-[#1A1C1E] rounded-lg border border-[#2B2C30] relative overflow-hidden flex items-center px-1">
              {/* Base background / video */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#006C4C]/40 to-[#00875F]/30 border-r-2 border-[#89F8C7] rounded-l-lg flex items-center justify-between px-3"
                style={{ width: '100%' }}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-semibold text-[#E3E2E6] truncate">
                    {draft.videoSourceName}
                  </span>
                  <span className="text-[10px] font-mono text-[#89F8C7] bg-[#121316]/80 px-1.5 py-0.5 rounded">
                    {duration}s
                  </span>
                </div>

                {onOpenMediaModal && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMediaModal();
                    }}
                    className="text-[10px] bg-[#121316]/70 hover:bg-[#121316] text-[#89F8C7] px-2 py-0.5 rounded border border-[#2B2C30] shrink-0"
                  >
                    + إضافة مقطع
                  </button>
                )}
              </div>

              {/* Overlaid clips blocks */}
              {visualClips.map((clip) => {
                const startPct = Math.max(0, (clip.startTime / duration) * 100);
                const widthPct = Math.min(100 - startPct, Math.max(5, ((clip.endTime - clip.startTime) / duration) * 100));

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMediaModal?.();
                    }}
                    className={`absolute inset-y-1 rounded-md border flex items-center justify-between px-2 text-[11px] truncate shadow transition-all ${
                      clip.type === 'video'
                        ? 'bg-blue-900/60 border-blue-400 text-blue-200'
                        : 'bg-amber-900/60 border-amber-400 text-amber-200'
                    }`}
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                    title={`${clip.name} (${clip.startTime.toFixed(1)}s - ${clip.endTime.toFixed(1)}s)`}
                  >
                    <div className="flex items-center gap-1 truncate">
                      {clip.type === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                      <span className="truncate">{clip.name}</span>
                    </div>

                    {onDeleteClip && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClip(clip.id);
                        }}
                        title="حذف هذا المقطع"
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

          {/* TRACK 3: Replaced & Extra Audio Tracks */}
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
                  {/* Audio Waveform visualization */}
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
                  <span>انقر لإدراج تلاوة خاشعة أو أنشودة هادفة أو مقطع صوتي</span>
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

        {/* Vertical Red Playhead Indicator */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-red-500 shadow-md pointer-events-none z-20"
          style={{ left: `${playheadPercent}%` }}
        >
          {/* Playhead Top Pin */}
          <div className="w-3 h-3 bg-red-500 -ml-[5px] -mt-1 rotate-45 rounded-xs" />
        </div>

      </div>
    </div>
  );
};
