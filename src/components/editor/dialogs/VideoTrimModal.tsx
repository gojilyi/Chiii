/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  FastForward, 
  Clock, 
  Split, 
  Volume2, 
  Film,
  Sparkles
} from 'lucide-react';
import { ProjectDraft } from '../../../types';

interface VideoTrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ProjectDraft;
  currentTime: number;
  onUpdateDraft: (updated: ProjectDraft) => void;
  onSeek: (time: number) => void;
}

export const VideoTrimModal: React.FC<VideoTrimModalProps> = ({
  isOpen,
  onClose,
  draft,
  currentTime,
  onUpdateDraft,
  onSeek,
}) => {
  if (!isOpen) return null;

  const totalDuration = draft.duration || 15;
  const [trimStart, setTrimStart] = useState<number>(draft.trimStart || 0);
  const [trimEnd, setTrimEnd] = useState<number>(draft.trimEnd && draft.trimEnd > 0 ? draft.trimEnd : totalDuration);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [localCurrentTime, setLocalCurrentTime] = useState<number>(currentTime);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<number | null>(null);

  // Sync with prop
  useEffect(() => {
    setTrimStart(draft.trimStart || 0);
    setTrimEnd(draft.trimEnd && draft.trimEnd > 0 ? draft.trimEnd : totalDuration);
  }, [draft.trimStart, draft.trimEnd, totalDuration]);

  // Trimmed duration
  const trimmedDuration = Math.max(0.5, +(trimEnd - trimStart).toFixed(2));

  // Sync video element time
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - localCurrentTime) > 0.25) {
      videoRef.current.currentTime = localCurrentTime;
    }
  }, [localCurrentTime]);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setLocalCurrentTime((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          if (next >= trimEnd) {
            setIsPlaying(false);
            return trimStart;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, trimEnd, trimStart, playbackSpeed]);

  const togglePlay = () => {
    if (localCurrentTime >= trimEnd || localCurrentTime < trimStart) {
      setLocalCurrentTime(trimStart);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSetStartAtCurrent = () => {
    const newStart = Math.min(localCurrentTime, trimEnd - 0.5);
    setTrimStart(newStart);
  };

  const handleSetEndAtCurrent = () => {
    const newEnd = Math.max(localCurrentTime, trimStart + 0.5);
    setTrimEnd(newEnd);
  };

  const handleResetTrim = () => {
    setTrimStart(0);
    setTrimEnd(totalDuration);
    setLocalCurrentTime(0);
    setIsPlaying(false);
  };

  const handleApplyTrim = () => {
    const updated: ProjectDraft = {
      ...draft,
      trimStart: trimStart > 0 ? trimStart : undefined,
      trimEnd: trimEnd < totalDuration ? trimEnd : undefined,
      duration: Math.round(trimmedDuration) || draft.duration,
    };
    onUpdateDraft(updated);
    onSeek(trimStart);
    onClose();
  };

  const handleSplitClipAtCurrent = () => {
    // Splits at localCurrentTime: creates a cut point and updates trimEnd, saving the rest as a clip
    if (localCurrentTime > trimStart + 0.5 && localCurrentTime < trimEnd - 0.5) {
      const splitTime = +localCurrentTime.toFixed(2);
      const updated: ProjectDraft = {
        ...draft,
        trimEnd: splitTime,
        duration: Math.round(splitTime - trimStart) || draft.duration,
        mediaClips: [
          ...(draft.mediaClips || []),
          {
            id: `clip_${Date.now()}`,
            type: 'video',
            name: `${draft.videoSourceName || 'مقطع'} (الجزء 2)`,
            url: draft.videoSourceUrl,
            duration: totalDuration,
            startTime: splitTime,
            endTime: trimEnd,
            trimStart: splitTime,
            trimEnd: trimEnd,
          }
        ]
      };
      onUpdateDraft(updated);
      setTrimEnd(splitTime);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006C4C]/25 border border-[#89F8C7]/30 flex items-center justify-center text-[#89F8C7]">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6] flex items-center gap-2">
                <span>أدوات قص وتعديل الفيديو (Trimming & Cutting)</span>
                <span className="text-[10px] bg-[#006C4C] text-white px-2 py-0.5 rounded-full font-mono">
                  {trimmedDuration}s
                </span>
              </h3>
              <p className="text-xs text-[#8E9192]">
                قص أطراف الفيديو بدقة الأجزاء من الثانية، تقسيم المشاهد وتعديل السرعة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#292A2E] text-[#8E9192] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Video Preview Card */}
          <div className="relative rounded-2xl bg-[#0F1012] border border-[#2B2C30] overflow-hidden flex flex-col items-center justify-center p-3">
            <div className="relative max-h-56 w-full flex items-center justify-center rounded-xl overflow-hidden bg-black/60">
              {draft.videoSourceUrl ? (
                draft.videoSourceUrl.match(/\.(jpeg|jpg|png|webp|svg)($|\?)/i) ? (
                  <img
                    src={draft.videoSourceUrl}
                    alt="معاينة"
                    className="max-h-52 object-contain"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={draft.videoSourceUrl}
                    className="max-h-52 object-contain"
                  />
                )
              ) : (
                <div className="py-16 text-center text-xs text-[#8E9192]">
                  لا يوجد مسار فيديو محدد
                </div>
              )}

              {/* Time display badge */}
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-[#89F8C7] border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#89F8C7]" />
                <span>{localCurrentTime.toFixed(1)}s / {totalDuration}s</span>
              </div>
            </div>

            {/* Play / Pause & Quick Controls */}
            <div className="flex items-center justify-center gap-3 mt-3 w-full">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-[#006C4C] hover:bg-[#00875F] text-white flex items-center justify-center transition active:scale-95 shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              
              <button
                onClick={() => setLocalCurrentTime(trimStart)}
                className="px-3 py-1.5 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-xs text-[#E3E2E6] border border-[#36373B] transition"
                title="الرجوع لبداية القص"
              >
                بداية القص ({trimStart.toFixed(1)}s)
              </button>

              <button
                onClick={() => setLocalCurrentTime(trimEnd)}
                className="px-3 py-1.5 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-xs text-[#E3E2E6] border border-[#36373B] transition"
                title="الذهاب لنهاية القص"
              >
                نهاية القص ({trimEnd.toFixed(1)}s)
              </button>
            </div>
          </div>

          {/* Interactive Visual Trimmer Bar */}
          <div className="p-4 rounded-xl bg-[#17191C] border border-[#2B2C30] space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#E3E2E6] flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#89F8C7]" />
                <span>شريط تحديد نطاق القص (Trim Range):</span>
              </span>
              <span className="text-[11px] text-[#89F8C7] font-mono">
                المدة المحفوظة: {trimmedDuration} ثانية
              </span>
            </div>

            {/* Range Scrubber Track */}
            <div className="relative h-12 bg-[#202226] rounded-xl border border-[#2B2C30] overflow-hidden select-none">
              
              {/* Cut-out / Inactive region start */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-black/65 border-r-2 border-red-500/70 z-10 flex items-center justify-end px-1"
                style={{ width: `${(trimStart / totalDuration) * 100}%` }}
              >
                <span className="text-[9px] text-red-400 font-mono hidden sm:inline">محذوف</span>
              </div>

              {/* Active Kept Video Region */}
              <div 
                className="absolute top-0 bottom-0 bg-[#006C4C]/35 border-y-2 border-[#89F8C7] z-0 flex items-center justify-between px-2"
                style={{
                  left: `${(trimStart / totalDuration) * 100}%`,
                  width: `${((trimEnd - trimStart) / totalDuration) * 100}%`
                }}
              >
                <div className="w-1.5 h-5 bg-[#89F8C7] rounded-full"></div>
                <span className="text-[10px] font-bold text-[#89F8C7] font-mono">
                  {trimmedDuration}s
                </span>
                <div className="w-1.5 h-5 bg-[#89F8C7] rounded-full"></div>
              </div>

              {/* Cut-out / Inactive region end */}
              <div 
                className="absolute top-0 bottom-0 right-0 bg-black/65 border-l-2 border-red-500/70 z-10 flex items-center px-1"
                style={{ width: `${((totalDuration - trimEnd) / totalDuration) * 100}%` }}
              >
                <span className="text-[9px] text-red-400 font-mono hidden sm:inline">محذوف</span>
              </div>

              {/* Playhead indicator */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-amber-400 z-20 shadow-md transition-all pointer-events-none"
                style={{ left: `${(localCurrentTime / totalDuration) * 100}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 -translate-x-[3px] -mt-1 shadow-sm"></div>
              </div>

              {/* Click to seek */}
              <input
                type="range"
                min={0}
                max={totalDuration}
                step={0.1}
                value={localCurrentTime}
                onChange={(e) => setLocalCurrentTime(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
              />
            </div>

            {/* Start & End Sliders and Direct Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Start Trim Input */}
              <div className="p-3 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9192]">نقطة بداية الفيديو (Trim Start):</span>
                  <span className="font-mono text-[#89F8C7] font-bold">{trimStart.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, trimEnd - 0.5)}
                  step={0.1}
                  value={trimStart}
                  onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                  className="w-full accent-[#006C4C]"
                />
                <button
                  onClick={handleSetStartAtCurrent}
                  className="w-full py-1.5 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] border border-[#36373B] text-[11px] font-semibold transition flex items-center justify-center gap-1"
                >
                  <Scissors className="w-3 h-3" />
                  <span>قص البداية عند المؤشر ({localCurrentTime.toFixed(1)}s)</span>
                </button>
              </div>

              {/* End Trim Input */}
              <div className="p-3 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9192]">نقطة نهاية الفيديو (Trim End):</span>
                  <span className="font-mono text-[#89F8C7] font-bold">{trimEnd.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min={Math.min(totalDuration, trimStart + 0.5)}
                  max={totalDuration}
                  step={0.1}
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                  className="w-full accent-[#006C4C]"
                />
                <button
                  onClick={handleSetEndAtCurrent}
                  className="w-full py-1.5 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] border border-[#36373B] text-[11px] font-semibold transition flex items-center justify-center gap-1"
                >
                  <Scissors className="w-3 h-3" />
                  <span>قص النهاية عند المؤشر ({localCurrentTime.toFixed(1)}s)</span>
                </button>
              </div>

            </div>
          </div>

          {/* Quick Actions & Speed Controls */}
          <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2B2C30] flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Split Button */}
            <button
              onClick={handleSplitClipAtCurrent}
              className="px-3.5 py-2 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] border border-[#36373B] font-semibold transition flex items-center gap-1.5"
            >
              <Split className="w-3.5 h-3.5 text-blue-400" />
              <span>تقسيم المقطع هنا</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8E9192] text-[11px]">سرعة العرض:</span>
              {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition ${
                    playbackSpeed === spd
                      ? 'bg-[#006C4C] text-white shadow-sm'
                      : 'bg-[#17191C] text-[#8E9192] hover:text-white border border-[#2B2C30]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetTrim}
              className="px-3 py-1.5 rounded-lg text-xs text-[#8E9192] hover:text-red-300 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>استعادة الطول الكامل ({totalDuration}s)</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex items-center justify-between bg-[#17191C]">
          <div className="text-xs text-[#8E9192]">
            المدة النهائية بعد القص: <strong className="text-[#89F8C7] font-mono">{trimmedDuration} ثانية</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-white text-xs font-semibold transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleApplyTrim}
              className="px-5 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00875F] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Check className="w-4 h-4 text-[#89F8C7]" />
              <span>تطبيق القص في المونتاج</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
