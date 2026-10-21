/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Type, Music, Sparkles, VolumeX, Save, Download, PenTool, Film, Scissors } from 'lucide-react';

interface BottomToolbarProps {
  onOpenText: () => void;
  onOpenAudio: () => void;
  onOpenEffects: () => void;
  onOpenTrim: () => void;
  onOpenMuteReplace: () => void;
  onOpenCalligraphy: () => void;
  onOpenMedia?: () => void;
  onSaveDraft: () => void;
  onExport: () => void;
  isMuted: boolean;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onOpenText,
  onOpenAudio,
  onOpenEffects,
  onOpenTrim,
  onOpenMuteReplace,
  onOpenCalligraphy,
  onOpenMedia,
  onSaveDraft,
  onExport,
  isMuted,
}) => {
  return (
    <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-2.5 shadow-lg">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        
        {/* Button 1: إضافة الوسائط والقص والحذف (Media & Clips) */}
        {onOpenMedia && (
          <button
            onClick={onOpenMedia}
            className="h-12 rounded-xl bg-gradient-to-r from-[#006C4C]/40 to-[#00875F]/30 hover:from-[#006C4C]/60 hover:to-[#00875F]/50 text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-bold border border-[#89F8C7]/50 active:scale-[0.98] shadow-sm"
          >
            <Scissors className="w-4 h-4 text-[#89F8C7]" />
            <span>الوسائط والطبقات</span>
          </button>
        )}

        {/* Button 2: خط الريشة والمخطوطة (Calligraphy & STT) */}
        <button
          onClick={onOpenCalligraphy}
          className="h-12 rounded-xl bg-gradient-to-r from-[#785900]/40 to-[#574300]/30 hover:from-[#785900]/60 hover:to-[#574300]/50 text-[#FFDF9E] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-bold border border-[#FFDF9E]/50 active:scale-[0.98] shadow-sm"
        >
          <PenTool className="w-4 h-4 text-[#FFDF9E]" />
          <span>خط الريشة (STT)</span>
        </button>

        {/* Button 3: إضافة نص (Text) */}
        <button
          onClick={onOpenText}
          className="h-12 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] hover:text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold border border-[#36373B] active:scale-[0.98]"
        >
          <Type className="w-4 h-4 text-[#FFDF9E]" />
          <span>إضافة نص</span>
        </button>

        {/* Button 4: إدراج صوت (Audio) */}
        <button
          onClick={onOpenAudio}
          className="h-12 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] hover:text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold border border-[#36373B] active:scale-[0.98]"
        >
          <Music className="w-4 h-4 text-[#89F8C7]" />
          <span>إدراج صوت</span>
        </button>

        {/* Button 5: المؤثرات الدينية (Spiritual Effects) */}
        <button
          onClick={onOpenEffects}
          className="h-12 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] hover:text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold border border-[#36373B] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-[#89F8C7]" />
          <span>المؤثرات</span>
        </button>

        {/* Button 6: أدوات قص وتعديل الفيديو (Video Trimming & Cutting) */}
        <button
          onClick={onOpenTrim}
          className="h-12 rounded-xl bg-gradient-to-r from-[#004A33]/50 to-[#006C4C]/40 hover:from-[#006C4C]/60 hover:to-[#00875F]/50 text-[#89F8C7] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-bold border border-[#89F8C7]/60 active:scale-[0.98] shadow-sm"
        >
          <Scissors className="w-4 h-4 text-[#89F8C7]" />
          <span>قص وتعديل</span>
        </button>

        {/* Button 7: كتم وحجب الصوت (Mute & Replace) */}
        <button
          onClick={onOpenMuteReplace}
          className={`h-12 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold border active:scale-[0.98] ${
            isMuted
              ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-600/40'
              : 'bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] border-[#36373B]'
          }`}
        >
          <VolumeX className="w-4 h-4 text-amber-400" />
          <span>كتم الصوت</span>
        </button>

        {/* Button 8: حفظ المسودة (Save Draft) */}
        <button
          onClick={onSaveDraft}
          className="h-12 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold shadow-sm active:scale-[0.98]"
        >
          <Save className="w-4 h-4 text-[#89F8C7]" />
          <span>حفظ</span>
        </button>

        {/* Button 9: تصدير FFmpeg (Export) */}
        <button
          onClick={onExport}
          className="h-12 rounded-xl bg-[#89F8C7] hover:bg-[#72dbb0] text-[#002114] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-bold shadow-sm active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>تصدير</span>
        </button>

      </div>
    </div>
  );
};
