/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Clock, 
  Volume2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Link2
} from 'lucide-react';
import { ProjectDraft, AudioTrackConfig } from '../../../types';
import { audioEngine } from '../../../services/audioEngine';

interface EasyAudioTrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ProjectDraft;
  currentTime: number;
  onSaveAudioTrim: (trimStart: number, trimEnd: number, syncVideoDuration: boolean) => void;
}

export const EasyAudioTrimModal: React.FC<EasyAudioTrimModalProps> = ({
  isOpen,
  onClose,
  draft,
  currentTime,
  onSaveAudioTrim,
}) => {
  const audioTrack: AudioTrackConfig | null = draft.replacedAudio || null;
  const totalDuration = Math.max(1, audioTrack?.duration || draft.duration || 15);

  const initialStart = audioTrack?.trimStart !== undefined ? audioTrack.trimStart : 0;
  const initialEnd = audioTrack?.trimEnd !== undefined ? audioTrack.trimEnd : totalDuration;

  const [trimStart, setTrimStart] = useState<number>(initialStart);
  const [trimEnd, setTrimEnd] = useState<number>(initialEnd);
  const [syncVideoDuration, setSyncVideoDuration] = useState<boolean>(true);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [previewTime, setPreviewTime] = useState<number>(initialStart);

  const previewIntervalRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Formatter for seconds (mm:ss.s)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const selectedDuration = Math.max(0.1, +(trimEnd - trimStart).toFixed(2));

  // Clean up audio playback on unmount or close
  useEffect(() => {
    return () => {
      if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      audioEngine.stop();
    };
  }, []);

  // Handle Play/Stop trimmed audio segment
  const handleTogglePreview = () => {
    if (isPreviewPlaying) {
      if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      audioEngine.stop();
      setIsPreviewPlaying(false);
    } else {
      setIsPreviewPlaying(true);
      setPreviewTime(trimStart);

      // If audio has real URL
      if (audioTrack?.audioUrl) {
        if (!previewAudioRef.current) {
          previewAudioRef.current = new Audio(audioTrack.audioUrl);
        }
        const audio = previewAudioRef.current;
        audio.currentTime = trimStart;
        audio.play().catch(() => {});
      } else {
        // Synthesizer preview
        audioEngine.playReplacedTrack(audioTrack?.synthPreset, 0.85, undefined, trimStart);
      }

      const startTime = Date.now();
      const currentStart = trimStart;

      previewIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const cur = currentStart + elapsed;

        if (cur >= trimEnd) {
          if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
          if (previewAudioRef.current) previewAudioRef.current.pause();
          audioEngine.stop();
          setIsPreviewPlaying(false);
          setPreviewTime(trimStart);
        } else {
          setPreviewTime(+cur.toFixed(2));
        }
      }, 50);
    }
  };

  // Quick Cut: Trim before playhead
  const handleTrimBeforePlayhead = () => {
    const newStart = Math.min(currentTime, trimEnd - 0.5);
    setTrimStart(Math.max(0, +newStart.toFixed(1)));
  };

  // Quick Cut: Trim after playhead
  const handleTrimAfterPlayhead = () => {
    const newEnd = Math.max(currentTime, trimStart + 0.5);
    setTrimEnd(Math.min(totalDuration, +newEnd.toFixed(1)));
  };

  // Reset Trim
  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(totalDuration);
  };

  // Apply & Save
  const handleSave = () => {
    if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
    if (previewAudioRef.current) previewAudioRef.current.pause();
    audioEngine.stop();

    onSaveAudioTrim(trimStart, trimEnd, syncVideoDuration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-[#89F8C7]/40 flex items-center justify-center text-[#89F8C7]">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6] flex items-center gap-2">
                <span>مقص الصوت السهل والسريع (Easy Audio Trimmer)</span>
                <span className="text-[10px] bg-[#006C4C] text-white px-2 py-0.5 rounded-full font-sans">
                  تحكم دقيق
                </span>
              </h3>
              <p className="text-xs text-[#8E9192]">
                قص صوت الشيخ وتحديد البداية والنهاية ومزامنة مدة الفيديو مع الصوت فوراً
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
          
          {/* Active Audio Track Banner */}
          <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2B2C30] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#006C4C]/30 text-[#89F8C7] flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#E3E2E6]">
                  {audioTrack?.title || 'تسجيل الشيخ (الصوت النشط)'}
                </div>
                <div className="text-[11px] text-[#8E9192]">
                  المدة الكلية الأصلية: <span className="font-mono text-[#89F8C7]">{formatTime(totalDuration)}</span> ({totalDuration} ثانية)
                </div>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-[#8E9192] block">المدة بعد القص:</span>
              <span className="text-sm font-bold font-mono text-[#89F8C7]">
                {formatTime(selectedDuration)}
              </span>
            </div>
          </div>

          {/* Visual Waveform & Interactive Range Display */}
          <div className="p-4 rounded-xl bg-[#121316] border border-[#2B2C30] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8E9192]">
              <span className="flex items-center gap-1.5 font-semibold text-[#E3E2E6]">
                <Clock className="w-3.5 h-3.5 text-[#89F8C7]" />
                <span>الشريط البصري لقص وتحديد الصوت:</span>
              </span>
              <span className="font-mono text-[#89F8C7] text-xs">
                من {formatTime(trimStart)} إلى {formatTime(trimEnd)}
              </span>
            </div>

            {/* Stylized Interactive Waveform Track */}
            <div className="relative h-18 bg-[#1A1C1E] rounded-xl border border-[#2B2C30] overflow-hidden flex items-center px-2">
              
              {/* Highlighted Selected Audio Segment */}
              <div 
                className="absolute inset-y-1 bg-gradient-to-r from-[#006C4C]/60 via-[#00875F]/60 to-[#006C4C]/60 border-x-2 border-[#89F8C7] rounded-md transition-all shadow-md flex items-center justify-center"
                style={{
                  left: `${(trimStart / totalDuration) * 100}%`,
                  width: `${((trimEnd - trimStart) / totalDuration) * 100}%`,
                }}
              >
                <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded shadow pointer-events-none">
                  المقطع المحدد ({selectedDuration}s)
                </span>
              </div>

              {/* Waveform Bars */}
              <div className="w-full flex items-center gap-1 pointer-events-none relative z-10 opacity-75">
                {Array.from({ length: 48 }).map((_, i) => {
                  const barTime = (i / 48) * totalDuration;
                  const isInside = barTime >= trimStart && barTime <= trimEnd;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${
                        isInside ? 'bg-[#89F8C7]' : 'bg-[#36373B]'
                      }`}
                      style={{
                        height: `${Math.sin(i * 0.45) * 18 + 22}px`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Playhead position pin if previewing */}
              {isPreviewPlaying && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                  style={{ left: `${(previewTime / totalDuration) * 100}%` }}
                >
                  <div className="w-2 h-2 bg-red-500 rotate-45 -ml-[3px]" />
                </div>
              )}
            </div>

            {/* Range dual sliders for easy cutting */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8E9192] flex items-center gap-1">
                    <span>🟢 بداية الصوت:</span>
                    <strong className="text-white font-mono">{formatTime(trimStart)}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTrimStart((s) => Math.max(0, +(s - 0.5).toFixed(1)))}
                      className="px-2 py-0.5 bg-[#202226] text-[11px] rounded hover:bg-[#2B2C30] text-[#C4C7C8]"
                    >
                      -0.5s
                    </button>
                    <button
                      onClick={() => setTrimStart((s) => Math.min(trimEnd - 0.5, +(s + 0.5).toFixed(1)))}
                      className="px-2 py-0.5 bg-[#202226] text-[11px] rounded hover:bg-[#2B2C30] text-[#C4C7C8]"
                    >
                      +0.5s
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="0.1"
                  value={trimStart}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < trimEnd) setTrimStart(val);
                  }}
                  className="w-full accent-[#89F8C7] cursor-pointer h-1.5 bg-[#2B2C30] rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8E9192] flex items-center gap-1">
                    <span>🔴 نهاية الصوت:</span>
                    <strong className="text-white font-mono">{formatTime(trimEnd)}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTrimEnd((e) => Math.max(trimStart + 0.5, +(e - 0.5).toFixed(1)))}
                      className="px-2 py-0.5 bg-[#202226] text-[11px] rounded hover:bg-[#2B2C30] text-[#C4C7C8]"
                    >
                      -0.5s
                    </button>
                    <button
                      onClick={() => setTrimEnd((e) => Math.min(totalDuration, +(e + 0.5).toFixed(1)))}
                      className="px-2 py-0.5 bg-[#202226] text-[11px] rounded hover:bg-[#2B2C30] text-[#C4C7C8]"
                    >
                      +0.5s
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="0.1"
                  value={trimEnd}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > trimStart) setTrimEnd(val);
                  }}
                  className="w-full accent-red-500 cursor-pointer h-1.5 bg-[#2B2C30] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Quick Cutting Action Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#E3E2E6] block">
              أوامر القص السريعة بنقرة واحدة:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleTrimBeforePlayhead}
                title={`جعل بداية الصوت تبدأ من موضع المؤشر الحالي (${currentTime.toFixed(1)} ثانية)`}
                className="p-2.5 rounded-xl bg-[#202226] hover:bg-[#2B2C30] border border-[#2B2C30] text-xs font-semibold text-[#C4C7C8] hover:text-white flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>قص ما قبل المؤشر ({currentTime.toFixed(1)}s)</span>
              </button>

              <button
                onClick={handleTrimAfterPlayhead}
                title={`إنهاء الصوت عند موضع المؤشر الحالي (${currentTime.toFixed(1)} ثانية)`}
                className="p-2.5 rounded-xl bg-[#202226] hover:bg-[#2B2C30] border border-[#2B2C30] text-xs font-semibold text-[#C4C7C8] hover:text-white flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Scissors className="w-3.5 h-3.5 text-red-400" />
                <span>قص ما بعد المؤشر ({currentTime.toFixed(1)}s)</span>
              </button>

              <button
                onClick={handleReset}
                title="إعادة الصوت كاملاً بدون أي قص"
                className="p-2.5 rounded-xl bg-[#202226] hover:bg-[#2B2C30] border border-[#2B2C30] text-xs font-semibold text-[#8E9192] hover:text-white flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إلغاء القص (كامل الصوت)</span>
              </button>
            </div>
          </div>

          {/* Listen to Trimmed Segment Button */}
          <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2B2C30] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#E3E2E6]">
                معاينة واستماع المقطع المقصوص
              </div>
              <div className="text-[11px] text-[#8E9192]">
                استمع للمقطع المحدد فقط للتأكد من مواضع كلام الشيخ بدقة
              </div>
            </div>

            <button
              onClick={handleTogglePreview}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 ${
                isPreviewPlaying
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-[#006C4C] text-white hover:bg-[#00573c]'
              }`}
            >
              {isPreviewPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف المعاينة ({formatTime(previewTime)})</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>استماع للمقطع المحدد ({selectedDuration}s)</span>
                </>
              )}
            </button>
          </div>

          {/* KEY USER REQUEST: "لا تضع فديو أو صوت أو صورة طويلة الفديو حسب وقت الصوت" */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#006C4C]/25 to-[#17191C] border border-[#89F8C7]/40 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Link2 className="w-5 h-5 text-[#89F8C7] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#89F8C7]">
                    مزامنة مدة الفيديو تلقائياً مع وقت الصوت (الفيديو حسب وقت الصوت)
                  </h4>
                  <p className="text-[11px] text-[#C4C7C8] leading-relaxed mt-0.5">
                    يتم ضبط طول مشروع الفيديو كاملاً تلقائياً ليطابق مدة هذا المقطع الصوتي (<strong className="text-white font-mono">{selectedDuration} ثانية</strong>) بالضبط، لمنع أي شاشة سوداء أو زيادة غير مرغوبة في الفيديو.
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => setSyncVideoDuration(!syncVideoDuration)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors shrink-0 focus:outline-none ${
                  syncVideoDuration ? 'bg-[#006C4C]' : 'bg-[#36373B]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    syncVideoDuration ? '-translate-x-7' : '-translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex items-center justify-between bg-[#17191C]">
          <span className="text-xs text-[#8E9192]">
            المدة النهائية: <span className="font-mono text-[#89F8C7] font-bold">{selectedDuration}s</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] text-xs font-semibold transition"
            >
              إلغاء
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-[#89F8C7] hover:bg-white text-[#002114] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>تطبيق القص وحفظ التعديل</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
