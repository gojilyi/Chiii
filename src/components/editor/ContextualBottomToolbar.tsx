/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Scissors, 
  Trash2, 
  Copy, 
  Gauge, 
  Volume2, 
  VolumeX, 
  Palette, 
  RotateCw, 
  Type, 
  Music, 
  Sparkles, 
  Film, 
  X, 
  Clock, 
  AlignJustify, 
  Check, 
  PenTool, 
  Image as ImageIcon,
  Plus,
  Save,
  Download,
  Mic
} from 'lucide-react';
import { ProjectDraft, TextOverlay, MediaClip } from '../../types';
import { SelectedTimelineItem } from './Timeline';

interface ContextualBottomToolbarProps {
  draft: ProjectDraft;
  selectedItem: SelectedTimelineItem | null;
  currentTime: number;
  onDeselect: () => void;
  // Video actions
  onSplitAtPlayhead: () => void;
  onTrimBeforePlayhead: () => void;
  onTrimAfterPlayhead: () => void;
  onDuplicateClip: (id?: string) => void;
  onDeleteClip: (id: string) => void;
  onToggleClipMute: () => void;
  onChangeSpeed: (multiplier: number) => void;
  onOpenVideoTrimModal: () => void;
  onCycleFilter: () => void;
  onRotateClip: () => void;
  // Text actions
  onEditText: (id: string) => void;
  onToggleAyahBrackets: (id: string) => void;
  onToggleTextBox: (id: string) => void;
  onChangeTextColor: (id: string, color: string) => void;
  onChangeTextFont: (id: string, font: string) => void;
  onChangeTextSize: (id: string, delta: number) => void;
  onChangeTextPosition: (id: string, pos: 'top' | 'center' | 'bottom') => void;
  onDeleteText: (id: string) => void;
  // Audio actions
  onOpenAudioTrimModal: () => void;
  onSyncDurationToAudio: () => void;
  onToggleAudioMute: () => void;
  onChangeAudioVolume: (vol: number) => void;
  onDeleteAudio: () => void;
  // Default general actions
  onOpenMedia: () => void;
  onOpenText: () => void;
  onOpenAudio: () => void;
  onOpenVoice: () => void;
  onOpenCalligraphy: () => void;
  onOpenEffects: () => void;
  onOpenParticles: () => void;
  onOpenBackground: () => void;
  onSaveDraft: () => void;
  onExport: () => void;
  savedNotification: boolean;
}

export const ContextualBottomToolbar: React.FC<ContextualBottomToolbarProps> = ({
  draft,
  selectedItem,
  currentTime,
  onDeselect,
  onSplitAtPlayhead,
  onTrimBeforePlayhead,
  onTrimAfterPlayhead,
  onDuplicateClip,
  onDeleteClip,
  onToggleClipMute,
  onChangeSpeed,
  onOpenVideoTrimModal,
  onCycleFilter,
  onRotateClip,
  onEditText,
  onToggleAyahBrackets,
  onToggleTextBox,
  onChangeTextColor,
  onChangeTextFont,
  onChangeTextSize,
  onChangeTextPosition,
  onDeleteText,
  onOpenAudioTrimModal,
  onSyncDurationToAudio,
  onToggleAudioMute,
  onChangeAudioVolume,
  onDeleteAudio,
  onOpenMedia,
  onOpenText,
  onOpenAudio,
  onOpenVoice,
  onOpenCalligraphy,
  onOpenEffects,
  onOpenParticles,
  onOpenBackground,
  onSaveDraft,
  onExport,
  savedNotification,
}) => {
  // Find selected text if applicable
  const selectedTextOverlay = selectedItem?.type === 'text' 
    ? draft.textOverlays.find((t) => t.id === selectedItem.id) 
    : null;

  // Find selected clip if applicable
  const selectedClip = selectedItem?.type === 'clip'
    ? (draft.mediaClips || []).find((c) => c.id === selectedItem.id)
    : null;

  /* ------------------------------------------------------------- */
  /* CASE 1: VIDEO OR CLIP IS SELECTED                              */
  /* ------------------------------------------------------------- */
  if (selectedItem?.type === 'video' || selectedItem?.type === 'clip') {
    return (
      <div className="bg-[#242424] border border-[#383838] rounded-2xl p-2.5 shadow-xl space-y-2 animate-in fade-in select-none">
        <div className="flex items-center justify-between px-2 text-xs border-b border-[#333333] pb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800] animate-pulse" />
            <span className="font-bold text-[#F5B800]">
              أدوات الفيديو: {selectedClip ? selectedClip.name : (draft.videoSourceName || 'الفيديو الأساسي')}
            </span>
          </div>
          <button
            onClick={onDeselect}
            className="flex items-center gap-1 text-[11px] text-[#A0A0A0] hover:text-white px-2 py-0.5 rounded bg-[#333333]"
          >
            <span>إغلاق</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable action buttons (min-height >= 44px) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* 1. Split at playhead */}
          <button
            onClick={onSplitAtPlayhead}
            className="h-11 min-w-[90px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-bold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <Scissors className="w-4 h-4 text-[#F5B800]" />
            <span>تقسيم (Split)</span>
          </button>

          {/* 2. Trim Left / Before */}
          <button
            onClick={onTrimBeforePlayhead}
            className="h-11 min-w-[85px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <span>قص البداية</span>
          </button>

          {/* 3. Trim Right / After */}
          <button
            onClick={onTrimAfterPlayhead}
            className="h-11 min-w-[85px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <span>قص النهاية</span>
          </button>

          {/* 4. Precision Trimmer */}
          <button
            onClick={onOpenVideoTrimModal}
            className="h-11 min-w-[85px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <Scissors className="w-3.5 h-3.5 text-emerald-400" />
            <span>مقص دقيق</span>
          </button>

          {/* 5. Duplicate */}
          <button
            onClick={() => onDuplicateClip(selectedClip?.id)}
            className="h-11 min-w-[80px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <Copy className="w-4 h-4 text-[#F5B800]" />
            <span>تكرار</span>
          </button>

          {/* 6. Speed */}
          <button
            onClick={() => onChangeSpeed(1.25)}
            className="h-11 min-w-[80px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <Gauge className="w-4 h-4 text-sky-400" />
            <span>سرعة</span>
          </button>

          {/* 7. Sound/Mute */}
          <button
            onClick={onToggleClipMute}
            className="h-11 min-w-[80px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
          >
            {draft.muteOriginalAudio ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span>صامت</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>الصوت</span>
              </>
            )}
          </button>

          {/* 8. Filter / Colors */}
          <button
            onClick={onCycleFilter}
            className="h-11 min-w-[85px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span>فلتر ألوان</span>
          </button>

          {/* 9. Rotate */}
          <button
            onClick={onRotateClip}
            className="h-11 min-w-[80px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <RotateCw className="w-4 h-4 text-[#F5B800]" />
            <span>تدوير</span>
          </button>

          {/* 10. Delete (if clip) */}
          {selectedClip && (
            <button
              onClick={() => onDeleteClip(selectedClip.id)}
              className="h-11 min-w-[80px] px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 flex items-center justify-center gap-1.5 text-xs font-bold border border-red-500/40 shrink-0 transition active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* CASE 2: TEXT OVERLAY IS SELECTED                              */
  /* ------------------------------------------------------------- */
  if (selectedItem?.type === 'text' && selectedTextOverlay) {
    return (
      <div className="bg-[#242424] border border-[#383838] rounded-2xl p-2.5 shadow-xl space-y-2 animate-in fade-in select-none">
        <div className="flex items-center justify-between px-2 text-xs border-b border-[#333333] pb-1.5">
          <div className="flex items-center gap-2 truncate max-w-[240px]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFDF9E] animate-pulse" />
            <span className="font-bold text-[#FFDF9E] truncate">
              نص: {selectedTextOverlay.text}
            </span>
          </div>
          <button
            onClick={onDeselect}
            className="flex items-center gap-1 text-[11px] text-[#A0A0A0] hover:text-white px-2 py-0.5 rounded bg-[#333333]"
          >
            <span>إغلاق</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable text toolbar buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* Edit text */}
          <button
            onClick={() => onEditText(selectedTextOverlay.id)}
            className="h-11 min-w-[95px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1.5 text-xs font-bold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <Type className="w-4 h-4 text-[#F5B800]" />
            <span>تعديل النص</span>
          </button>

          {/* Ayah Brackets Toggle */}
          <button
            onClick={() => onToggleAyahBrackets(selectedTextOverlay.id)}
            className={`h-11 min-w-[105px] px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border shrink-0 transition active:scale-95 ${
              selectedTextOverlay.hasAyahBrackets
                ? 'bg-[#F5B800] text-black border-[#F5B800]'
                : 'bg-[#333333] text-white border-[#484848] hover:bg-[#404040]'
            }`}
          >
            <span className="font-bold">﴿ ﴾ أقواس الآيات</span>
          </button>

          {/* Background Box Toggle */}
          <button
            onClick={() => onToggleTextBox(selectedTextOverlay.id)}
            className={`h-11 min-w-[95px] px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border shrink-0 transition active:scale-95 ${
              selectedTextOverlay.backgroundColor
                ? 'bg-[#F5B800]/20 text-[#F5B800] border-[#F5B800]/50'
                : 'bg-[#333333] text-white border-[#484848] hover:bg-[#404040]'
            }`}
          >
            <span>خلفية النص</span>
          </button>

          {/* Colors */}
          {(['#FFFFFF', '#FFDF9E', '#89F8C7', '#FFD166', '#EF4444'] as string[]).map((c) => (
            <button
              key={c}
              onClick={() => onChangeTextColor(selectedTextOverlay.id, c)}
              className="w-11 h-11 rounded-xl flex items-center justify-center border border-[#484848] shrink-0 transition active:scale-95"
              style={{ backgroundColor: c }}
              title={`لون: ${c}`}
            >
              {selectedTextOverlay.color === c && (
                <Check className="w-4 h-4 text-black font-bold" />
              )}
            </button>
          ))}

          {/* Size + / - */}
          <button
            onClick={() => onChangeTextSize(selectedTextOverlay.id, 2)}
            className="h-11 min-w-[70px] px-2 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1 text-xs font-bold border border-[#484848] shrink-0"
          >
            <span>حجم +</span>
          </button>

          <button
            onClick={() => onChangeTextSize(selectedTextOverlay.id, -2)}
            className="h-11 min-w-[70px] px-2 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center gap-1 text-xs font-bold border border-[#484848] shrink-0"
          >
            <span>حجم -</span>
          </button>

          {/* Positions */}
          <button
            onClick={() => onChangeTextPosition(selectedTextOverlay.id, 'top')}
            className="h-11 min-w-[65px] px-2 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center text-xs font-semibold border border-[#484848] shrink-0"
          >
            <span>أعلى</span>
          </button>

          <button
            onClick={() => onChangeTextPosition(selectedTextOverlay.id, 'center')}
            className="h-11 min-w-[65px] px-2 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center text-xs font-semibold border border-[#484848] shrink-0"
          >
            <span>وسط</span>
          </button>

          <button
            onClick={() => onChangeTextPosition(selectedTextOverlay.id, 'bottom')}
            className="h-11 min-w-[65px] px-2 rounded-xl bg-[#333333] hover:bg-[#404040] text-white flex items-center justify-center text-xs font-semibold border border-[#484848] shrink-0"
          >
            <span>أسفل</span>
          </button>

          {/* Delete text */}
          <button
            onClick={() => onDeleteText(selectedTextOverlay.id)}
            className="h-11 min-w-[75px] px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 flex items-center justify-center gap-1.5 text-xs font-bold border border-red-500/40 shrink-0 transition active:scale-95"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>حذف</span>
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* CASE 3: AUDIO TRACK IS SELECTED                               */
  /* ------------------------------------------------------------- */
  if (selectedItem?.type === 'audio') {
    return (
      <div className="bg-[#242424] border border-[#383838] rounded-2xl p-2.5 shadow-xl space-y-2 animate-in fade-in select-none">
        <div className="flex items-center justify-between px-2 text-xs border-b border-[#333333] pb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#89F8C7] animate-pulse" />
            <span className="font-bold text-[#89F8C7]">
              أدوات الصوت: {draft.replacedAudio ? draft.replacedAudio.title : 'الصوت المضاف'}
            </span>
          </div>
          <button
            onClick={onDeselect}
            className="flex items-center gap-1 text-[11px] text-[#A0A0A0] hover:text-white px-2 py-0.5 rounded bg-[#333333]"
          >
            <span>إغلاق</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable audio toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* Easy Audio Trimmer */}
          <button
            onClick={onOpenAudioTrimModal}
            className="h-11 min-w-[115px] px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-[#89F8C7] flex items-center justify-center gap-1.5 text-xs font-bold border border-emerald-500/40 shrink-0 transition active:scale-95"
          >
            <Scissors className="w-4 h-4 text-[#89F8C7]" />
            <span>مقص الصوت السهل</span>
          </button>

          {/* Sync Video Duration to Audio */}
          <button
            onClick={onSyncDurationToAudio}
            className="h-11 min-w-[135px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-[#89F8C7] flex items-center justify-center gap-1.5 text-xs font-bold border border-[#484848] shrink-0 transition active:scale-95"
          >
            <Clock className="w-4 h-4 text-[#89F8C7]" />
            <span>الفيديو حسب وقت الصوت</span>
          </button>

          {/* Volume Adjuster */}
          <div className="h-11 px-3 rounded-xl bg-[#333333] border border-[#484848] flex items-center gap-2 shrink-0">
            <Volume2 className="w-4 h-4 text-[#89F8C7]" />
            <span className="text-xs text-white">المستوى:</span>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={draft.replacedAudioVolume}
              onChange={(e) => onChangeAudioVolume(parseFloat(e.target.value))}
              className="w-20 accent-[#89F8C7]"
            />
            <span className="text-xs font-mono text-[#89F8C7]">
              {Math.round(draft.replacedAudioVolume * 100)}%
            </span>
          </div>

          {/* Delete Audio */}
          <button
            onClick={onDeleteAudio}
            className="h-11 min-w-[85px] px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 flex items-center justify-center gap-1.5 text-xs font-bold border border-red-500/40 shrink-0 transition active:scale-95"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>حذف الصوت</span>
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* CASE 4: DEFAULT (NOTHING SELECTED) - KINEMASTER ACCESS BAR    */
  /* ------------------------------------------------------------- */
  return (
    <div className="bg-[#242424] border border-[#383838] rounded-2xl p-2.5 shadow-xl">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        
        {/* 1. Media (وسائط) */}
        <button
          onClick={onOpenMedia}
          className="h-11 min-w-[95px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-[#F5B800] flex items-center justify-center gap-1.5 text-xs font-bold border border-[#484848] shrink-0 transition active:scale-95"
        >
          <Film className="w-4 h-4 text-[#F5B800]" />
          <span>+ وسائط</span>
        </button>

        {/* 2. Text (نص) */}
        <button
          onClick={onOpenText}
          className="h-11 min-w-[90px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-[#FFDF9E] flex items-center justify-center gap-1.5 text-xs font-bold border border-[#484848] shrink-0 transition active:scale-95"
        >
          <Type className="w-4 h-4 text-[#FFDF9E]" />
          <span>+ نص</span>
        </button>

        {/* 3. Audio (صوت) */}
        <button
          onClick={onOpenAudio}
          className="h-11 min-w-[90px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-[#89F8C7] flex items-center justify-center gap-1.5 text-xs font-bold border border-[#484848] shrink-0 transition active:scale-95"
        >
          <Music className="w-4 h-4 text-[#89F8C7]" />
          <span>+ صوت</span>
        </button>

        {/* 4. Voice Rec (تسجيل) */}
        <button
          onClick={onOpenVoice}
          className="h-11 min-w-[95px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-red-400 flex items-center justify-center gap-1.5 text-xs font-bold border border-[#484848] shrink-0 transition active:scale-95"
        >
          <Mic className="w-4 h-4 text-red-400" />
          <span>تسجيل (Voice)</span>
        </button>

        {/* 5. Calligraphy STT (خط الريشة) */}
        <button
          onClick={onOpenCalligraphy}
          className="h-11 min-w-[105px] px-3 rounded-xl bg-gradient-to-r from-[#785900]/30 to-[#574300]/20 hover:from-[#785900]/50 hover:to-[#574300]/40 text-[#FFDF9E] flex items-center justify-center gap-1.5 text-xs font-bold border border-[#FFDF9E]/40 shrink-0 transition active:scale-95"
        >
          <PenTool className="w-4 h-4 text-[#FFDF9E]" />
          <span>خط الريشة STT</span>
        </button>

        {/* 6. Effects (مؤثرات) */}
        <button
          onClick={onOpenEffects}
          className="h-11 min-w-[90px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-[#E0E0E0] flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#F5B800]" />
          <span>المؤثرات</span>
        </button>

        {/* 7. Background (خلفية) */}
        <button
          onClick={onOpenBackground}
          className="h-11 min-w-[90px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-[#E0E0E0] flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
        >
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>الخلفية</span>
        </button>

        {/* 8. Save Draft */}
        <button
          onClick={onSaveDraft}
          className="h-11 min-w-[85px] px-3 rounded-xl bg-[#333333] hover:bg-[#404040] text-[#E0E0E0] flex items-center justify-center gap-1.5 text-xs font-semibold border border-[#484848] shrink-0 transition active:scale-95"
        >
          {savedNotification ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">تم الحفظ</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#A0A0A0]" />
              <span>حفظ</span>
            </>
          )}
        </button>

        {/* 9. Export Video (تصدير) */}
        <button
          onClick={onExport}
          className="h-11 min-w-[100px] px-4 rounded-xl bg-[#F5B800] hover:bg-[#e0a800] text-black flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 transition shadow-sm active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>تصدير</span>
        </button>

      </div>
    </div>
  );
};
