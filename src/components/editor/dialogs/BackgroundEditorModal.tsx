/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  Sun, 
  Eye, 
  ZoomIn, 
  Move, 
  FlipHorizontal, 
  Upload, 
  BookOpen, 
  Check, 
  Layers, 
  Image as ImageIcon,
  Palette
} from 'lucide-react';
import { ProjectDraft, BackgroundAdjustments } from '../../../types';
import { READY_BACKGROUNDS, ReadyBackgroundItem } from '../../../constants/autoLectureDefaults';
import { DEFAULT_BACKGROUND_ADJUSTMENTS } from '../../../constants/defaults';

interface BackgroundEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ProjectDraft;
  onUpdateDraft: (updated: ProjectDraft) => void;
}

export const BackgroundEditorModal: React.FC<BackgroundEditorModalProps> = ({
  isOpen,
  onClose,
  draft,
  onUpdateDraft,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'gallery' | 'filters' | 'overlays'>('gallery');

  const currentAdjustments: BackgroundAdjustments = draft.backgroundAdjustments || { ...DEFAULT_BACKGROUND_ADJUSTMENTS };

  const handleUpdateAdjustments = (updates: Partial<BackgroundAdjustments>) => {
    const updatedAdj: BackgroundAdjustments = {
      ...currentAdjustments,
      ...updates,
    };
    onUpdateDraft({
      ...draft,
      backgroundAdjustments: updatedAdj,
    });
  };

  const handleSelectBackground = (item: ReadyBackgroundItem) => {
    onUpdateDraft({
      ...draft,
      videoSourceUrl: item.imageUrl,
      videoSourceName: item.name + '.jpg',
      thumbnailUrl: item.imageUrl,
    });
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        onUpdateDraft({
          ...draft,
          videoSourceUrl: resultUrl,
          videoSourceName: file.name,
          thumbnailUrl: resultUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAdjustments = () => {
    onUpdateDraft({
      ...draft,
      backgroundAdjustments: { ...DEFAULT_BACKGROUND_ADJUSTMENTS },
    });
  };

  // Quick 1-click Preset Modes
  const handleApplyPreset = (preset: 'official_iysal' | 'pure_mosque' | 'vintage_amber' | 'clean_portrait') => {
    if (preset === 'official_iysal') {
      handleUpdateAdjustments({
        brightness: 100,
        contrast: 105,
        blur: 0,
        vignette: 25,
        overlayDarkness: 0,
        scale: 1.0,
        panX: 0,
        panY: 0,
        colorGrade: 'warm_gold',
        showGoldArchFrame: false,
        bannerOverlay: {
          enabled: true,
          headerText: 'شرح كتاب',
          mainTitle: 'إيصال السالك',
          subtitle: 'إلى أصول مذهب الإمام مالك',
          positionY: 25,
          positionX: 35,
          scale: 1.0,
        },
        bookGraphicOverlay: {
          enabled: true,
          title: 'إيصال السالك',
          author: 'أصول مذهب مالك',
          positionX: 14,
          positionY: 72,
          scale: 1.0,
        },
      });
    } else if (preset === 'pure_mosque') {
      handleUpdateAdjustments({
        brightness: 105,
        contrast: 110,
        blur: 2,
        vignette: 40,
        overlayDarkness: 10,
        colorGrade: 'emerald_islamic',
        showGoldArchFrame: true,
        bannerOverlay: {
          enabled: false,
          headerText: '',
          mainTitle: '',
          subtitle: '',
          positionY: 25,
          positionX: 35,
          scale: 1.0,
        },
        bookGraphicOverlay: {
          enabled: false,
          title: '',
          author: '',
          positionX: 14,
          positionY: 72,
          scale: 1.0,
        },
      });
    } else if (preset === 'vintage_amber') {
      handleUpdateAdjustments({
        brightness: 95,
        contrast: 115,
        blur: 0,
        vignette: 50,
        overlayDarkness: 15,
        colorGrade: 'vintage_amber',
        showGoldArchFrame: false,
      });
    } else if (preset === 'clean_portrait') {
      handleUpdateAdjustments({
        brightness: 100,
        contrast: 100,
        blur: 4, // subtle bokeh
        vignette: 20,
        overlayDarkness: 0,
        colorGrade: 'none',
        showGoldArchFrame: false,
      });
    }
  };

  const filteredBackgrounds = activeCategory === 'all'
    ? READY_BACKGROUNDS
    : READY_BACKGROUNDS.filter((b) => b.category === activeCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2B2C30] bg-[#17191C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006C4C]/25 text-[#89F8C7] flex items-center justify-center border border-[#006C4C]/40">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#E3E2E6] font-cairo">
                الخلفيات والتعديل عليها
              </h3>
              <p className="text-xs text-[#8E9192]">
                اختر مشهد الخلفية للشيخ وعدّل السطوع، التباين، العزل (البلور)، والإطارات والعناوين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAdjustments}
              title="إعادة ضبط التعديلات للافتراضي"
              className="px-3 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] text-xs font-semibold flex items-center gap-1.5 border border-[#36373B] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] hover:text-white flex items-center justify-center transition border border-[#36373B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141517] border-b border-[#2B2C30] overflow-x-auto">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-[#006C4C] text-white shadow-sm'
                : 'text-[#8E9192] hover:text-[#E3E2E6] hover:bg-[#202226]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#89F8C7]" />
            <span>مكتبة الخلفيات ({READY_BACKGROUNDS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('filters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'filters'
                ? 'bg-[#006C4C] text-white shadow-sm'
                : 'text-[#8E9192] hover:text-[#E3E2E6] hover:bg-[#202226]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#FFDF9E]" />
            <span>السطوع، التباين والعزل</span>
          </button>

          <button
            onClick={() => setActiveTab('overlays')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overlays'
                ? 'bg-[#006C4C] text-white shadow-sm'
                : 'text-[#8E9192] hover:text-[#E3E2E6] hover:bg-[#202226]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#89F8C7]" />
            <span>الإطار، بانر الدرس وكتاب السالك</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* ================= TAB 1: GALLERY & SELECTION ================= */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              
              {/* Category Filter Pills & Upload Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'جميع الخلفيات' },
                    { id: 'iysal_salik', label: 'شرح إيصال السالك' },
                    { id: 'mosque', label: 'مساجد وأروقة' },
                    { id: 'quran', label: 'المصاحف' },
                    { id: 'parchment', label: 'مخطوطة وشمعة' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        activeCategory === cat.id
                          ? 'bg-[#006C4C] text-white'
                          : 'bg-[#202226] text-[#8E9192] hover:text-white border border-[#2B2C30]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] border border-[#36373B] text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة من جهازك</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleCustomUpload}
                />
              </div>

              {/* Background Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredBackgrounds.map((bg) => {
                  const isSelected = draft.videoSourceUrl === bg.imageUrl;
                  return (
                    <div
                      key={bg.id}
                      onClick={() => handleSelectBackground(bg)}
                      className={`relative rounded-xl border overflow-hidden cursor-pointer group transition-all ${
                        isSelected
                          ? 'border-[#89F8C7] ring-2 ring-[#006C4C] shadow-lg'
                          : 'border-[#2B2C30] hover:border-[#46484C] bg-[#121316]'
                      }`}
                    >
                      <div className="relative h-28 sm:h-32 bg-black overflow-hidden">
                        <img
                          src={bg.imageUrl}
                          alt={bg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {isSelected && (
                          <div className="absolute top-2 left-2 bg-[#006C4C] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div className="absolute bottom-1.5 right-2 left-2">
                          <span className="text-[10px] text-[#89F8C7] font-mono block">
                            {bg.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#141517]">
                        <h4 className="text-xs font-bold text-[#E3E2E6] truncate" title={bg.name}>
                          {bg.name}
                        </h4>
                        <p className="text-[10px] text-[#8E9192] line-clamp-1 mt-0.5">
                          {bg.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 1-Click Preset Styles */}
              <div className="pt-3 border-t border-[#2B2C30]">
                <span className="text-xs font-bold text-[#E3E2E6] block mb-2">
                  أنماط وتعديلات جاهزة بضغطة واحدة:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleApplyPreset('official_iysal')}
                    className="p-2.5 rounded-xl bg-[#202226] hover:bg-[#292A2E] border border-[#2B2C30] hover:border-[#89F8C7] text-right transition"
                  >
                    <span className="text-xs font-bold text-[#89F8C7] block">مجلس إيصال السالك</span>
                    <span className="text-[10px] text-[#8E9192]">بانر الدرس + كتاب السالك</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('pure_mosque')}
                    className="p-2.5 rounded-xl bg-[#202226] hover:bg-[#292A2E] border border-[#2B2C30] hover:border-[#89F8C7] text-right transition"
                  >
                    <span className="text-xs font-bold text-[#FFDF9E] block">المحراب مع العزل</span>
                    <span className="text-[10px] text-[#8E9192]">بلور خفيف + إطار مذهب</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('vintage_amber')}
                    className="p-2.5 rounded-xl bg-[#202226] hover:bg-[#292A2E] border border-[#2B2C30] hover:border-[#89F8C7] text-right transition"
                  >
                    <span className="text-xs font-bold text-amber-400 block">الدرس التراثي العتيق</span>
                    <span className="text-[10px] text-[#8E9192]">دفء كهرماني + فينييت</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('clean_portrait')}
                    className="p-2.5 rounded-xl bg-[#202226] hover:bg-[#292A2E] border border-[#2B2C30] hover:border-[#89F8C7] text-right transition"
                  >
                    <span className="text-xs font-bold text-emerald-400 block">بورتريه نقي</span>
                    <span className="text-[10px] text-[#8E9192]">عزل خلفي للشيخ فقط</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: ADJUSTMENTS & FILTERS ================= */}
          {activeTab === 'filters' && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. السطوع والتباين */}
                <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E3E2E6]">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>السطوع والتباين (Brightness & Contrast)</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                      <span>السطوع:</span>
                      <span className="font-mono text-[#89F8C7]">{currentAdjustments.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={currentAdjustments.brightness}
                      onChange={(e) => handleUpdateAdjustments({ brightness: parseInt(e.target.value) })}
                      className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                      <span>التباين:</span>
                      <span className="font-mono text-[#89F8C7]">{currentAdjustments.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={currentAdjustments.contrast}
                      onChange={(e) => handleUpdateAdjustments({ contrast: parseInt(e.target.value) })}
                      className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 2. العزل والضبابية والتعتيم */}
                <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E3E2E6]">
                    <Eye className="w-4 h-4 text-[#89F8C7]" />
                    <span>عزل الخلفية والتعتيم السينمائي (Blur & Vignette)</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                      <span>الضبابية / عزل الخلفية (Blur):</span>
                      <span className="font-mono text-[#89F8C7]">{currentAdjustments.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={currentAdjustments.blur}
                      onChange={(e) => handleUpdateAdjustments({ blur: parseInt(e.target.value) })}
                      className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                      <span>تعتيم الحواف السينمائي (Vignette):</span>
                      <span className="font-mono text-[#89F8C7]">{currentAdjustments.vignette}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentAdjustments.vignette}
                      onChange={(e) => handleUpdateAdjustments({ vignette: parseInt(e.target.value) })}
                      className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 3. التقريب والتحريك */}
                <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E3E2E6]">
                    <ZoomIn className="w-4 h-4 text-[#FFDF9E]" />
                    <span>التقريب والتحريك (Zoom & Pan)</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                      <span>التكبير / الزوم (Scale):</span>
                      <span className="font-mono text-[#89F8C7]">{currentAdjustments.scale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.05"
                      value={currentAdjustments.scale}
                      onChange={(e) => handleUpdateAdjustments({ scale: parseFloat(e.target.value) })}
                      className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#C4C7C8]">
                        <span>تحريك أفقي (X):</span>
                        <span className="font-mono text-[#89F8C7]">{currentAdjustments.panX}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={currentAdjustments.panX}
                        onChange={(e) => handleUpdateAdjustments({ panX: parseInt(e.target.value) })}
                        className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#C4C7C8]">
                        <span>تحريك رأسي (Y):</span>
                        <span className="font-mono text-[#89F8C7]">{currentAdjustments.panY}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={currentAdjustments.panY}
                        onChange={(e) => handleUpdateAdjustments({ panY: parseInt(e.target.value) })}
                        className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. طبقة السواد وقراءة النصوص + عكس الاتجاه */}
                <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E3E2E6]">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>طبقة تعتيم النص وعكس الاتجاه</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                      <span>تعتيم كلي لتوضيح نصوص الآيات:</span>
                      <span className="font-mono text-[#89F8C7]">{currentAdjustments.overlayDarkness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={currentAdjustments.overlayDarkness}
                      onChange={(e) => handleUpdateAdjustments({ overlayDarkness: parseInt(e.target.value) })}
                      className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleUpdateAdjustments({ flipHorizontal: !currentAdjustments.flipHorizontal })}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        currentAdjustments.flipHorizontal
                          ? 'bg-[#006C4C] border-[#89F8C7] text-white'
                          : 'bg-[#121316] border-[#2B2C30] text-[#8E9192] hover:text-white'
                      }`}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      <span>{currentAdjustments.flipHorizontal ? 'معكوسة أفقياً (مفعّل)' : 'عكس اتجاه الصورة أفقياً (مرآة)'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Color Grading Moods */}
              <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E3E2E6]">
                  <Palette className="w-4 h-4 text-[#89F8C7]" />
                  <span>التدرج اللوني السينمائي (Cinematic Color Grading):</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { id: 'none', label: 'طبيعي أصلي', color: 'bg-[#121316]' },
                    { id: 'warm_gold', label: 'ذهبي فجري', color: 'bg-amber-950/60' },
                    { id: 'emerald_islamic', label: 'زمردي إسلامي', color: 'bg-emerald-950/60' },
                    { id: 'vintage_amber', label: 'كهرماني عتيق', color: 'bg-yellow-950/60' },
                    { id: 'serene_blue', label: 'أزرق هادئ', color: 'bg-blue-950/60' },
                    { id: 'monochrome', label: 'أحادي وقور', color: 'bg-neutral-800' },
                  ].map((cg) => (
                    <button
                      key={cg.id}
                      onClick={() => handleUpdateAdjustments({ colorGrade: cg.id as any })}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${
                        currentAdjustments.colorGrade === cg.id
                          ? 'border-[#89F8C7] bg-[#006C4C]/40 text-white shadow-sm'
                          : 'border-[#2B2C30] bg-[#141517] text-[#8E9192] hover:text-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border border-white/20 ${cg.color}`} />
                      <span>{cg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: OVERLAYS (ARCH, BANNER, BOOK) ================= */}
          {activeTab === 'overlays' && (
            <div className="space-y-4">
              
              {/* 1. Golden Arch Frame */}
              <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#E3E2E6]">
                      الإطار والقوس الإسلامي المذهب
                    </h4>
                    <p className="text-xs text-[#8E9192]">
                      إطار هندسي أرابيسك ذهبي مشع يحيط بكادر المشهد
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleUpdateAdjustments({ showGoldArchFrame: !currentAdjustments.showGoldArchFrame })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    currentAdjustments.showGoldArchFrame
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-[#292A2E] text-[#8E9192] hover:text-white'
                  }`}
                >
                  {currentAdjustments.showGoldArchFrame ? 'مفعّل' : 'تفعيل الإطار'}
                </button>
              </div>

              {/* 2. Banner Overlay: شرح كتاب إيصال السالك */}
              <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006C4C]/25 text-[#89F8C7] flex items-center justify-center border border-[#006C4C]/40">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E3E2E6]">
                        بانر عنوان الدرس المذهب («شرح كتاب إيصال السالك»)
                      </h4>
                      <p className="text-xs text-[#8E9192]">
                        شعار القوس المذهب أعلى يسار أو وسط المشهد
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const prev = currentAdjustments.bannerOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bannerOverlay;
                      handleUpdateAdjustments({
                        bannerOverlay: { ...prev, enabled: !prev.enabled }
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      currentAdjustments.bannerOverlay?.enabled
                        ? 'bg-[#006C4C] text-white shadow-sm'
                        : 'bg-[#292A2E] text-[#8E9192] hover:text-white'
                    }`}
                  >
                    {currentAdjustments.bannerOverlay?.enabled ? 'مفعّل' : 'إظهار البانر'}
                  </button>
                </div>

                {currentAdjustments.bannerOverlay?.enabled && (
                  <div className="pt-2 border-t border-[#2B2C30] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-[#8E9192] block mb-1">العنوان العلوي:</label>
                        <input
                          type="text"
                          value={currentAdjustments.bannerOverlay?.headerText || ''}
                          onChange={(e) => {
                            const prev = currentAdjustments.bannerOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bannerOverlay;
                            handleUpdateAdjustments({ bannerOverlay: { ...prev, headerText: e.target.value } });
                          }}
                          className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl px-3 py-1.5 text-xs text-[#E3E2E6] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#8E9192] block mb-1">اسم الكتاب / الدرس:</label>
                        <input
                          type="text"
                          value={currentAdjustments.bannerOverlay?.mainTitle || ''}
                          onChange={(e) => {
                            const prev = currentAdjustments.bannerOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bannerOverlay;
                            handleUpdateAdjustments({ bannerOverlay: { ...prev, mainTitle: e.target.value } });
                          }}
                          className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl px-3 py-1.5 text-xs font-bold text-[#FFDF9E] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#8E9192] block mb-1">العنوان الفرعي:</label>
                        <input
                          type="text"
                          value={currentAdjustments.bannerOverlay?.subtitle || ''}
                          onChange={(e) => {
                            const prev = currentAdjustments.bannerOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bannerOverlay;
                            handleUpdateAdjustments({ bannerOverlay: { ...prev, subtitle: e.target.value } });
                          }}
                          className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl px-3 py-1.5 text-xs text-[#C4C7C8] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                          <span>الموضع الرأسي (Y):</span>
                          <span className="font-mono text-[#89F8C7]">{currentAdjustments.bannerOverlay?.positionY || 25}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          value={currentAdjustments.bannerOverlay?.positionY || 25}
                          onChange={(e) => {
                            const prev = currentAdjustments.bannerOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bannerOverlay;
                            handleUpdateAdjustments({ bannerOverlay: { ...prev, positionY: parseInt(e.target.value) } });
                          }}
                          className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                          <span>حجم البانر:</span>
                          <span className="font-mono text-[#89F8C7]">{(currentAdjustments.bannerOverlay?.scale || 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="1.5"
                          step="0.05"
                          value={currentAdjustments.bannerOverlay?.scale || 1.0}
                          onChange={(e) => {
                            const prev = currentAdjustments.bannerOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bannerOverlay;
                            handleUpdateAdjustments({ bannerOverlay: { ...prev, scale: parseFloat(e.target.value) } });
                          }}
                          className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Book Graphic Overlay: كتاب إيصال السالك على الحامل */}
              <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/40 text-emerald-400 flex items-center justify-center border border-emerald-600/40">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E3E2E6]">
                        مجسم غلاف كتاب إيصال السالك
                      </h4>
                      <p className="text-xs text-[#8E9192]">
                        كتاب إسلامي مجلد بالجلد الأخضر والزخرفة المذهبة
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const prev = currentAdjustments.bookGraphicOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bookGraphicOverlay;
                      handleUpdateAdjustments({
                        bookGraphicOverlay: { ...prev, enabled: !prev.enabled }
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      currentAdjustments.bookGraphicOverlay?.enabled
                        ? 'bg-[#006C4C] text-white shadow-sm'
                        : 'bg-[#292A2E] text-[#8E9192] hover:text-white'
                    }`}
                  >
                    {currentAdjustments.bookGraphicOverlay?.enabled ? 'مفعّل' : 'إظهار الكتاب'}
                  </button>
                </div>

                {currentAdjustments.bookGraphicOverlay?.enabled && (
                  <div className="pt-2 border-t border-[#2B2C30] space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#8E9192] block mb-1">عنوان الكتاب على الغلاف:</label>
                        <input
                          type="text"
                          value={currentAdjustments.bookGraphicOverlay?.title || ''}
                          onChange={(e) => {
                            const prev = currentAdjustments.bookGraphicOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bookGraphicOverlay;
                            handleUpdateAdjustments({ bookGraphicOverlay: { ...prev, title: e.target.value } });
                          }}
                          className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl px-3 py-1.5 text-xs text-[#E3E2E6] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#8E9192] block mb-1">المؤلف / المذهب:</label>
                        <input
                          type="text"
                          value={currentAdjustments.bookGraphicOverlay?.author || ''}
                          onChange={(e) => {
                            const prev = currentAdjustments.bookGraphicOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bookGraphicOverlay;
                            handleUpdateAdjustments({ bookGraphicOverlay: { ...prev, author: e.target.value } });
                          }}
                          className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl px-3 py-1.5 text-xs text-[#C4C7C8] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                          <span>الموضع الأفقي (X):</span>
                          <span className="font-mono text-[#89F8C7]">{currentAdjustments.bookGraphicOverlay?.positionX || 14}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="90"
                          value={currentAdjustments.bookGraphicOverlay?.positionX || 14}
                          onChange={(e) => {
                            const prev = currentAdjustments.bookGraphicOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bookGraphicOverlay;
                            handleUpdateAdjustments({ bookGraphicOverlay: { ...prev, positionX: parseInt(e.target.value) } });
                          }}
                          className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                          <span>حجم الكتاب:</span>
                          <span className="font-mono text-[#89F8C7]">{(currentAdjustments.bookGraphicOverlay?.scale || 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.05"
                          value={currentAdjustments.bookGraphicOverlay?.scale || 1.0}
                          onChange={(e) => {
                            const prev = currentAdjustments.bookGraphicOverlay || DEFAULT_BACKGROUND_ADJUSTMENTS.bookGraphicOverlay;
                            handleUpdateAdjustments({ bookGraphicOverlay: { ...prev, scale: parseFloat(e.target.value) } });
                          }}
                          className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B2C30] bg-[#17191C] flex items-center justify-between">
          <div className="text-xs text-[#8E9192]">
            <span>الخلفية النشطة: </span>
            <span className="text-[#89F8C7] font-semibold">{draft.videoSourceName}</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-bold transition shadow-sm"
          >
            حفظ وإغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
