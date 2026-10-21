/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, BookOpen, Trash2, Check } from 'lucide-react';
import { TextOverlay } from '../../../types';
import { QURANIC_VERSE_PRESETS, HADITH_PRESETS } from '../../../constants/defaults';

interface TextOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  textOverlays: TextOverlay[];
  onSaveOverlays: (overlays: TextOverlay[]) => void;
  duration: number;
}

export const TextOverlayModal: React.FC<TextOverlayModalProps> = ({
  isOpen,
  onClose,
  textOverlays,
  onSaveOverlays,
  duration,
}) => {
  if (!isOpen) return null;

  const [overlays, setOverlays] = useState<TextOverlay[]>(textOverlays);
  const [activeTab, setActiveTab] = useState<'custom' | 'quran' | 'hadith'>('quran');
  
  // New or editing text state
  const [currentText, setCurrentText] = useState('وَقُل رَّبِّ زِدْنِي عِلْمًا');
  const [fontFamily, setFontFamily] = useState<'Amiri' | 'Cairo'>('Amiri');
  const [fontSize, setFontSize] = useState<number>(28);
  const [hasAyahBrackets, setHasAyahBrackets] = useState<boolean>(true);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [positionY, setPositionY] = useState<number>(80);

  const handleAddText = (textToAdd?: string, isAyah: boolean = true) => {
    const newOverlay: TextOverlay = {
      id: 'txt_' + Date.now(),
      text: textToAdd || currentText,
      fontFamily,
      fontSize,
      color: textColor,
      hasAyahBrackets: isAyah,
      alignment: 'center',
      positionX: 50,
      positionY,
      startTime: 0,
      endTime: duration,
      animation: 'fade',
    };
    const updated = [...overlays, newOverlay];
    setOverlays(updated);
    onSaveOverlays(updated);
  };

  const handleDelete = (id: string) => {
    const updated = overlays.filter((o) => o.id !== id);
    setOverlays(updated);
    onSaveOverlays(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#785900]/30 border border-[#FFDF9E]/40 flex items-center justify-center text-[#FFDF9E]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6]">إضافة نصوص وآيات قرآنية</h3>
              <p className="text-xs text-[#8E9192]">تخصيص الخطوط والزخارف القرآنية ﴿ ﴾</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#292A2E] text-[#8E9192] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[#121316] rounded-xl border border-[#2B2C30]">
            <button
              onClick={() => setActiveTab('quran')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'quran'
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              آيات قرآنية جاهزة
            </button>
            <button
              onClick={() => setActiveTab('hadith')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'hadith'
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              أحاديث وحِكم نبوية
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'custom'
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              كتابة نص مخصص
            </button>
          </div>

          {/* Tab 1: Quranic Verses */}
          {activeTab === 'quran' && (
            <div className="space-y-3">
              <span className="text-xs text-[#8E9192] block">اختر آية لإدراجها مباشرة مع الأقواس القرآنية:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QURANIC_VERSE_PRESETS.map((verse, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddText(verse.text, true)}
                    className="p-3 rounded-xl bg-[#202226] hover:bg-[#2B2C30] border border-[#2B2C30] hover:border-[#006C4C] text-right space-y-1 transition-all group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#89F8C7]">
                      <span>سورة {verse.surah}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        + إدراج
                      </span>
                    </div>
                    <div className="font-amiri text-base font-bold text-[#FFDF9E]">
                      ﴿ {verse.text} ﴾
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Hadith Presets */}
          {activeTab === 'hadith' && (
            <div className="space-y-3">
              <span className="text-xs text-[#8E9192] block">اختر حديثاً شريفاً مأثوراً:</span>
              <div className="grid grid-cols-1 gap-2.5">
                {HADITH_PRESETS.map((hadith, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddText(hadith.text, false)}
                    className="p-3 rounded-xl bg-[#202226] hover:bg-[#2B2C30] border border-[#2B2C30] hover:border-[#006C4C] text-right flex items-center justify-between transition-all group"
                  >
                    <div>
                      <span className="text-[11px] text-[#8E9192] block">{hadith.source}</span>
                      <span className="font-amiri text-base text-[#E3E2E6] font-bold">
                        قال رسول الله ﷺ: "{hadith.text}"
                      </span>
                    </div>
                    <span className="text-xs text-[#89F8C7] font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-2">
                      + إدراج
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Custom Text */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#C4C7C8] block mb-1.5">
                  نص العبارة أو الآية:
                </label>
                <textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  rows={3}
                  className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl p-3 text-sm text-[#E3E2E6] focus:border-[#89F8C7] outline-none"
                  placeholder="اكتب هنا النص المراد عرضه..."
                />
              </div>

              {/* Typography & Style Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#C4C7C8] block mb-1.5">نوع الخط:</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as 'Amiri' | 'Cairo')}
                    className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl p-2.5 text-xs text-[#E3E2E6] outline-none"
                  >
                    <option value="Amiri">خط النسخ القرآني (Amiri)</option>
                    <option value="Cairo">خط القاهرة الحديث (Cairo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#C4C7C8] block mb-1.5">
                    حجم الخط ({fontSize}px):
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg mt-3"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#121316] border border-[#2B2C30]">
                <div className="text-xs">
                  <span className="font-semibold text-[#E3E2E6] block">إحاطة بالأقواس القرآنية ﴿ ﴾</span>
                  <span className="text-[#8E9192]">توضع تلقائياً حول النص بوقار</span>
                </div>
                <button
                  onClick={() => setHasAyahBrackets(!hasAyahBrackets)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                    hasAyahBrackets
                      ? 'bg-[#006C4C] border-[#89F8C7] text-white'
                      : 'border-[#46484C] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Position slider */}
              <div>
                <label className="text-xs font-medium text-[#C4C7C8] block mb-1">
                  الموضع الرأسي على الفيديو ({positionY}% من الأعلى):
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={positionY}
                  onChange={(e) => setPositionY(parseInt(e.target.value))}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                />
              </div>

              <button
                onClick={() => handleAddText()}
                className="w-full h-11 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة هذا النص إلى الفيديو</span>
              </button>
            </div>
          )}

          {/* Active Overlays List */}
          <div className="space-y-2 pt-2 border-t border-[#2B2C30]">
            <span className="text-xs font-semibold text-[#C4C7C8] block">
              النصوص المضافة حالياً ({overlays.length}):
            </span>
            {overlays.length === 0 ? (
              <p className="text-xs text-[#8E9192] italic">لا توجد نصوص بعد في هذا المشروع.</p>
            ) : (
              <div className="space-y-2">
                {overlays.map((ov) => (
                  <div
                    key={ov.id}
                    className="p-3 rounded-xl bg-[#121316] border border-[#2B2C30] flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <span className="font-amiri text-sm text-[#FFDF9E] font-bold block truncate">
                        {ov.hasAyahBrackets ? `﴿ ${ov.text} ﴾` : ov.text}
                      </span>
                      <span className="text-[10px] text-[#8E9192]">
                        الخط: {ov.fontFamily} · الحجم: {ov.fontSize}px · الموضع: {ov.positionY}%
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(ov.id)}
                      className="w-8 h-8 rounded-lg bg-[#292A2E] hover:bg-red-950/40 text-[#8E9192] hover:text-red-400 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#006C4C] text-white text-xs font-semibold hover:bg-[#00573c] transition-colors"
          >
            تم والحفظ
          </button>
        </div>

      </div>
    </div>
  );
};
