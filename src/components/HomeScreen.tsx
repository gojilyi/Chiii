/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Square, 
  Clock, 
  Trash2, 
  Copy, 
  Plus, 
  ArrowLeft, 
  Upload, 
  SlidersHorizontal,
  VolumeX,
  FileVideo,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { AspectRatioType, ProjectDraft } from '../types';
import { ASPECT_RATIO_OPTIONS, ASSET_MINARET_SUNSET, ASSET_QURAN_LIGHT, ASSET_ARABIC_ORNAMENT } from '../constants/defaults';
import {
  ASSET_IYSAL_LIBRARY,
  ASSET_IYSAL_GESTURE,
  ASSET_IYSAL_WHITE_MOSQUE,
  ASSET_IYSAL_WOODEN_MINBAR
} from '../constants/autoLectureDefaults';

interface HomeScreenProps {
  drafts: ProjectDraft[];
  onSelectRatio: (ratio: AspectRatioType, customVideoUrl?: string, customVideoName?: string) => void;
  onResumeDraft: (draft: ProjectDraft) => void;
  onDuplicateDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onOpenAutoLessons?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  drafts,
  onSelectRatio,
  onResumeDraft,
  onDuplicateDraft,
  onDeleteDraft,
  onOpenAutoLessons,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRatioForUpload, setSelectedRatioForUpload] = React.useState<AspectRatioType>('9:16');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSelectRatio(selectedRatioForUpload, url, file.name);
    }
  };

  const getAspectIcon = (id: AspectRatioType) => {
    switch (id) {
      case '9:16':
        return <Smartphone className="w-5 h-5 text-[#89F8C7]" />;
      case '16:9':
        return <Monitor className="w-5 h-5 text-[#89F8C7]" />;
      case '1:1':
        return <Square className="w-5 h-5 text-[#89F8C7]" />;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      {/* Subtle modern geometric Islamic pattern watermark backdrop */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.035] bg-repeat"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #006C4C 1px, transparent 1px), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%2389F8C7' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px, 60px 60px',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A1C1E] border border-[#2B2C30] text-xs text-[#89F8C7]">
            <span className="w-2 h-2 rounded-full bg-[#006C4C]"></span>
            <span>بمعايير Material Design 3 ومكتبة FFmpeg Kit</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#E3E2E6] font-cairo">
            مونتاج الفيديو الإسلامي والهادف
          </h1>
          <p className="text-sm text-[#8E9192] leading-relaxed">
            أنشئ مقاطع دعوية وقرآنية احترافية، مع ميزة حجب وكتم الصوت الأصلي، وإدراج تلاوات خاشعة، وحفظ تلقائي للمسودات.
          </p>
        </div>

        {/* Feature Spotlight: Iysal Al-Salik Playlist & Auto Lesson Maker */}
        {onOpenAutoLessons && (
          <div className="bg-gradient-to-r from-[#004A33]/50 via-[#162720]/60 to-[#121316] border border-[#006C4C] rounded-2xl p-6 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all hover:border-[#89F8C7]/60 relative overflow-hidden">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#006C4C]/40 border border-[#89F8C7]/40 text-xs font-bold text-[#89F8C7]">
                  <BookOpen className="w-3.5 h-3.5 text-[#FFDF9E]" />
                  <span>سلسلة حصرية: شرح كتاب إيصال السالك</span>
                </span>
                <span className="text-xs text-[#8E9192]">
                  أصول مذهب الإمام مالك · صوت الشيخ العيد · مؤثرات الفيديو
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#E3E2E6] font-cairo">
                قائمة «شرح كتاب إيصال السالك» وصناعة الفيديو
              </h2>
              <p className="text-xs sm:text-sm text-[#C4C7C8] leading-relaxed">
                أنشئ فيديو متكاملاً لمجالس الشرح: اختر من المشاهد الستة المرفوعة للشيخ (المكتبة التراثية، المحراب المضاء، المنبر الخشبي)، وأضف صوت الشيخ (تسجيل مباشر أو ملف صوتي)، وطبّق الهالات النورانية والكاريوكي بخط الرقعة.
              </p>

              {/* Mini Thumbnail Gallery of the Book Scenes */}
              <div className="flex items-center gap-2 pt-1">
                {[
                  { img: ASSET_IYSAL_LIBRARY, label: 'المكتبة التراثية' },
                  { img: ASSET_IYSAL_GESTURE, label: 'مجلس الشرح' },
                  { img: ASSET_IYSAL_WHITE_MOSQUE, label: 'المحراب المنور' },
                  { img: ASSET_IYSAL_WOODEN_MINBAR, label: 'المنبر الخشبي' },
                ].map((item, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden w-16 h-10 border border-[#2B2C30] shrink-0 group">
                    <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                ))}
                <span className="text-[11px] text-[#89F8C7] font-mono mr-1">+ 6 مشاهد ومجالس علم</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-auto">
              <button
                onClick={onOpenAutoLessons}
                className="px-6 py-3 rounded-xl bg-[#89F8C7] hover:bg-[#72dbb0] text-[#002114] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                <span>فتح قائمة شرح إيصال السالك</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Aspect Ratio Selection Cards (Material Design 3 Filled Buttons & Subtle Elevation) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#E3E2E6]">اختر مقاس الفيديو للبدء</h2>
              <p className="text-xs text-[#8E9192]">حدد الأبعاد المناسبة لمنصتك المفضلة</p>
            </div>
            
            <button
              onClick={() => {
                setSelectedRatioForUpload('9:16');
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#89F8C7] hover:text-white bg-[#1E2024] hover:bg-[#2B2C30] px-3.5 py-2 rounded-xl border border-[#333539] transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع ملف (فيديو / صوت / صورة)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*,image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ASPECT_RATIO_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                className="group relative bg-[#1E2024] hover:bg-[#25272B] rounded-2xl border border-[#2B2C30] hover:border-[#006C4C]/60 p-6 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {/* Visual Ratio Indicator Box */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#292A2E] flex items-center justify-center border border-[#333539]">
                      {getAspectIcon(opt.id)}
                    </div>
                    <span className="text-xs font-mono text-[#8E9192] bg-[#121316] px-2.5 py-1 rounded-md border border-[#2B2C30]">
                      {opt.dimensions}
                    </span>
                  </div>

                  {/* Ratio Silhouette Illustration */}
                  <div className="h-32 rounded-xl bg-[#121316]/80 border border-[#2B2C30] flex items-center justify-center p-3 relative overflow-hidden">
                    <div 
                      className="border-2 border-dashed border-[#006C4C]/60 bg-[#006C4C]/10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        width: opt.id === '9:16' ? '54px' : opt.id === '16:9' ? '120px' : '80px',
                        height: opt.id === '9:16' ? '96px' : opt.id === '16:9' ? '68px' : '80px',
                      }}
                    >
                      <span className="text-[11px] font-bold text-[#89F8C7] font-mono">
                        {opt.id}
                      </span>
                    </div>

                    {/* Subtle aesthetic backdrop thumbnail */}
                    <img 
                      src={opt.id === '9:16' ? ASSET_MINARET_SUNSET : opt.id === '16:9' ? ASSET_QURAN_LIGHT : ASSET_ARABIC_ORNAMENT} 
                      alt={opt.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#E3E2E6]">{opt.title}</h3>
                    <p className="text-xs text-[#8E9192] mt-0.5">{opt.subtitle}</p>
                    <p className="text-[11px] text-[#00875F] dark:text-[#89F8C7]/80 mt-2 font-medium">
                      {opt.recommendedFor}
                    </p>
                  </div>
                </div>

                {/* Material 3 Filled Solid Button */}
                <div className="pt-6">
                  <button
                    onClick={() => onSelectRatio(opt.id)}
                    className="w-full h-11 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all group-hover:bg-[#00875F]"
                  >
                    <span>بدء التعديل بهذا المقاس</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Saved Drafts (نظام حفظ المشاريع - قاعدة البيانات المحلية Hive/Isar) */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#2B2C30] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#E3E2E6] flex items-center gap-2">
                <span>المسودات والمشاريع المحفوظة</span>
                <span className="text-xs font-normal text-[#8E9192] bg-[#1E2024] px-2 py-0.5 rounded-full border border-[#2B2C30]">
                  {drafts.length} مشاريع
                </span>
              </h2>
              <p className="text-xs text-[#8E9192]">محفوظة تلقائياً في قاعدة البيانات المحلية (Local Hive Box) لسهولة العودة والتعديل</p>
            </div>
            
            <button
              onClick={() => onSelectRatio('9:16')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#006C4C] hover:bg-[#00573c] px-3 py-1.5 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مشروع جديد</span>
            </button>
          </div>

          {drafts.length === 0 ? (
            <div className="bg-[#1E2024] rounded-2xl border border-dashed border-[#2B2C30] p-12 text-center space-y-3">
              <FileVideo className="w-10 h-10 text-[#46484C] mx-auto" />
              <h4 className="text-sm font-semibold text-[#E3E2E6]">لا توجد مسودات محفوظة حتى الآن</h4>
              <p className="text-xs text-[#8E9192] max-w-sm mx-auto">
                اختر مقاساً بالأعلى لبدء أول مشروع مونتاج لك، وسيقوم النظام بحفظ جميع التعديلات تلقائياً.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {drafts.map((draft) => {
                const dateStr = new Date(draft.updatedAt).toLocaleDateString('ar-SA', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={draft.id}
                    className="bg-[#1E2024] rounded-2xl border border-[#2B2C30] overflow-hidden hover:border-[#3E4045] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Thumbnail Header */}
                      <div className="relative h-40 bg-[#121316] overflow-hidden">
                        <img
                          src={draft.thumbnailUrl || ASSET_MINARET_SUNSET}
                          alt={draft.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E2024] via-transparent to-black/30" />
                        
                        {/* Aspect Ratio Badge */}
                        <div className="absolute top-3 right-3 bg-[#121316]/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-[#89F8C7] border border-[#2B2C30]">
                          {draft.aspectRatio}
                        </div>

                        {/* Mute status badge */}
                        {draft.muteOriginalAudio && (
                          <div className="absolute top-3 left-3 bg-[#121316]/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-amber-300 flex items-center gap-1 border border-[#2B2C30]">
                            <VolumeX className="w-3 h-3" />
                            <span>الصوت الأصلي مكتوم</span>
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm font-bold text-[#E3E2E6] truncate" title={draft.title}>
                          {draft.title}
                        </h3>

                        <div className="flex items-center gap-2 text-[11px] text-[#8E9192]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>آخر تعديل: {dateStr}</span>
                          <span aria-hidden="true">·</span>
                          <span>{draft.duration} ثانية</span>
                        </div>

                        {draft.replacedAudio && (
                          <div className="text-[11px] text-[#89F8C7] truncate bg-[#121316] px-2 py-1 rounded border border-[#2B2C30]">
                            🎵 {draft.replacedAudio.title}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 pt-0 border-t border-[#2B2C30]/60 mt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onResumeDraft(draft)}
                        className="flex-1 h-9 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>متابعة التعديل</span>
                      </button>

                      <button
                        onClick={() => onDuplicateDraft(draft.id)}
                        title="تكرار المسودة"
                        className="w-9 h-9 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] hover:text-white flex items-center justify-center transition-colors border border-[#36373B]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteDraft(draft.id)}
                        title="حذف المسودة"
                        className="w-9 h-9 rounded-xl bg-[#292A2E] hover:bg-red-950/40 text-[#C4C7C8] hover:text-red-400 flex items-center justify-center transition-colors border border-[#36373B]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
