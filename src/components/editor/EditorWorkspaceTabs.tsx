/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Type, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  PenTool, 
  Monitor, 
  Smartphone, 
  Square, 
  Check, 
  Plus, 
  Sliders, 
  Youtube, 
  ExternalLink,
  Flame,
  Music,
  Upload,
  Layers,
  Sun,
  Activity,
  Film
} from 'lucide-react';
import { 
  ProjectDraft, 
  TextOverlay, 
  SpiritualEffect, 
  AudioTrackConfig, 
  AspectRatioType,
  ParticleOverlayItem
} from '../../types';
import { 
  QURANIC_VERSE_PRESETS, 
  HADITH_PRESETS, 
  DEFAULT_AUDIO_LIBRARY, 
  USER_REQUESTED_YOUTUBE_PLAYLIST,
  ASSET_MINARET_SUNSET,
  ASSET_QURAN_LIGHT,
  ASSET_ARABIC_ORNAMENT,
  DEFAULT_PARTICLE_OVERLAYS
} from '../../constants/defaults';
import { ASSET_ANTIQUE_PARCHMENT, SAMPLE_TIMED_SPEECHES } from '../../constants/calligraphyDefaults';
import { audioEngine } from '../../services/audioEngine';

interface EditorWorkspaceTabsProps {
  draft: ProjectDraft;
  onUpdateDraft: (draft: ProjectDraft) => void;
  onOpenCalligraphyModal: () => void;
  onOpenExportDialog: () => void;
  onOpenParticlesModal?: () => void;
}

export const EditorWorkspaceTabs: React.FC<EditorWorkspaceTabsProps> = ({
  draft,
  onUpdateDraft,
  onOpenCalligraphyModal,
  onOpenExportDialog,
  onOpenParticlesModal,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'effects' | 'particles' | 'calligraphy' | 'ratio'>('text');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // 1. Text Overlay quick edit
  const activeOverlay = draft.textOverlays[0] || {
    id: 'txt_' + Date.now(),
    text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    fontFamily: 'Aref Ruqaa',
    fontSize: 28,
    color: '#FFFFFF',
    hasAyahBrackets: true,
    alignment: 'center',
    positionX: 50,
    positionY: 80,
    startTime: 0,
    endTime: draft.duration || 15,
    animation: 'fade',
  };

  const handleUpdateTextOverlay = (updates: Partial<TextOverlay>) => {
    const updatedOverlays = draft.textOverlays.length > 0
      ? draft.textOverlays.map((o, idx) => (idx === 0 ? { ...o, ...updates } : o))
      : [{ ...activeOverlay, ...updates }];

    onUpdateDraft({
      ...draft,
      textOverlays: updatedOverlays,
    });
  };

  // 2. Audio Mute & Replace
  const handleToggleMute = () => {
    const newMute = !draft.muteOriginalAudio;
    onUpdateDraft({
      ...draft,
      muteOriginalAudio: newMute,
      originalAudioVolume: newMute ? 0 : 1,
    });
    showToast(newMute ? 'تم كتم الصوت الأصلي بالكامل (-an)' : 'تم تفعيل الصوت الأصلي');
  };

  const handleSelectAudio = (track: AudioTrackConfig | null) => {
    onUpdateDraft({
      ...draft,
      replacedAudio: track,
      muteOriginalAudio: track ? true : draft.muteOriginalAudio,
    });
    if (track) {
      audioEngine.playReplacedTrack(track.synthPreset, draft.replacedAudioVolume, track.audioUrl);
      showToast(`تم تعيين المسار الصوتي: ${track.title}`);
    } else {
      audioEngine.stop();
      showToast('تم إلغاء المسار الصوتي البديل');
    }
  };

  // 3. Effects Toggles & Sliders
  const handleToggleEffect = (id: string) => {
    const updated = draft.effects.map((e) =>
      e.id === id ? { ...e, enabled: !e.enabled } : e
    );
    onUpdateDraft({ ...draft, effects: updated });
  };

  const handleEffectIntensity = (id: string, intensity: number) => {
    const updated = draft.effects.map((e) =>
      e.id === id ? { ...e, intensity } : e
    );
    onUpdateDraft({ ...draft, effects: updated });
  };

  // 1-Click activate all YouTube playlist effects
  const handleApplyYouTubePlaylist = () => {
    const updated = draft.effects.map((eff) => {
      if (['light_leaks', 'golden_dust', 'audio_spectrum', 'arabesque_vignette'].includes(eff.id)) {
        return { ...eff, enabled: true, intensity: Math.max(eff.intensity, 65) };
      }
      return eff;
    });
    onUpdateDraft({ ...draft, effects: updated });
    showToast('تم تفعيل حزمة مؤثرات قائمة يوتيوب بنجاح!');
  };

  // 4. Aspect Ratio and Background
  const handleSwitchRatio = (ratio: AspectRatioType) => {
    onUpdateDraft({ ...draft, aspectRatio: ratio });
    showToast(`تم تغيير المقاس إلى ${ratio}`);
  };

  const handleSwitchBackground = (url: string, name: string) => {
    onUpdateDraft({
      ...draft,
      videoSourceUrl: url,
      videoSourceName: name,
      thumbnailUrl: url,
    });
    showToast(`تم تغيير الخلفية إلى ${name}`);
  };

  return (
    <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl shadow-md overflow-hidden">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-[#006C4C] text-white text-xs font-semibold px-4 py-2 text-center animate-in fade-in duration-150">
          {toastMsg}
        </div>
      )}

      {/* Main Tabs Navigation Header */}
      <div className="flex items-center gap-1 p-2 bg-[#17191C] border-b border-[#2B2C30] overflow-x-auto">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'text'
              ? 'bg-[#006C4C] text-white shadow-sm'
              : 'text-[#8E9192] hover:text-[#E3E2E6] hover:bg-[#202226]'
          }`}
        >
          <Type className="w-4 h-4 text-[#FFDF9E]" />
          <span>النصوص والآيات</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audio'
              ? 'bg-[#006C4C] text-white shadow-sm'
              : 'text-[#8E9192] hover:text-[#E3E2E6] hover:bg-[#202226]'
          }`}
        >
          <Music className="w-4 h-4 text-[#89F8C7]" />
          <span>الصوت والكتم</span>
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'effects'
              ? 'bg-[#006C4C] text-white shadow-sm'
              : 'text-[#8E9192] hover:text-[#E3E2E6] hover:bg-[#202226]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#89F8C7]" />
          <span>مؤثرات يوتيوب والكروما</span>
        </button>

        <button
          onClick={() => setActiveTab('calligraphy')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'calligraphy'
              ? 'bg-[#006C4C] text-white shadow-sm'
              : 'text-[#FFDF9E] hover:text-white hover:bg-[#202226]'
          }`}
        >
          <PenTool className="w-4 h-4 text-[#FFDF9E]" />
          <span>خط الريشة والمخطوطة</span>
        </button>

        <button
          onClick={() => setActiveTab('ratio')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ratio'
              ? 'bg-[#006C4C] text-white shadow-sm'
              : 'text-[#8E9192] hover:text-[#E3E2E6] hover:bg-[#202226]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#89F8C7]" />
          <span>المقاس والخلفية</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-5">
        
        {/* ================= TAB 1: TEXT & QURANIC VERSES ================= */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#E3E2E6] block mb-1.5">
                تعديل النص المعروض على الفيديو مباشرة:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={activeOverlay.text}
                  onChange={(e) => handleUpdateTextOverlay({ text: e.target.value })}
                  className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl px-4 py-2.5 text-sm font-amiri font-bold text-[#FFDF9E] focus:border-[#89F8C7] outline-none"
                  placeholder="اكتب النص أو اختر آية من القائمة أدناه..."
                />
              </div>
            </div>

            {/* Quick 1-Click Verse Presets */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#8E9192] block">اختر آية قرآنية لإدراجها فوراً:</span>
              <div className="flex flex-wrap gap-2">
                {QURANIC_VERSE_PRESETS.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => handleUpdateTextOverlay({ text: v.text, hasAyahBrackets: true })}
                    className="px-3 py-1.5 rounded-lg bg-[#202226] hover:bg-[#292A2E] text-xs font-amiri font-bold text-[#FFDF9E] border border-[#2B2C30] hover:border-[#89F8C7] transition-all"
                  >
                    ﴿ {v.text} ﴾
                  </button>
                ))}
              </div>
            </div>

            {/* Font family, brackets, and size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">نوع الخط العربي:</label>
                <select
                  value={activeOverlay.fontFamily}
                  onChange={(e) => handleUpdateTextOverlay({ fontFamily: e.target.value as any })}
                  className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl p-2 text-xs text-[#E3E2E6] outline-none"
                >
                  <option value="Aref Ruqaa">خط الرقعة والديواني (Aref Ruqaa)</option>
                  <option value="Amiri">خط النسخ القرآني (Amiri)</option>
                  <option value="Cairo">خط القاهرة الحديث (Cairo)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">الأقواس القرآنية:</label>
                <button
                  onClick={() => handleUpdateTextOverlay({ hasAyahBrackets: !activeOverlay.hasAyahBrackets })}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-colors ${
                    activeOverlay.hasAyahBrackets
                      ? 'bg-[#006C4C] border-[#89F8C7] text-white'
                      : 'bg-[#121316] border-[#2B2C30] text-[#8E9192]'
                  }`}
                >
                  {activeOverlay.hasAyahBrackets ? 'مُحاط بالأقواس ﴿ ﴾' : 'بدون أقواس قرآنية'}
                </button>
              </div>

              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">
                  حجم الخط ({activeOverlay.fontSize}px):
                </label>
                <input
                  type="range"
                  min="20"
                  max="46"
                  value={activeOverlay.fontSize}
                  onChange={(e) => handleUpdateTextOverlay({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg mt-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: AUDIO & MUTE ================= */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            
            {/* Big Mute Toggle */}
            <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  draft.muteOriginalAudio ? 'bg-amber-950/50 text-amber-400 border border-amber-600/50' : 'bg-[#292A2E] text-[#8E9192]'
                }`}>
                  <VolumeX className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#E3E2E6]">
                    كتم وحجب صوت الفيديو الأصلي بالكامل (-an)
                  </h4>
                  <p className="text-xs text-[#8E9192]">
                    إزالة التراك الصوتي الأصلي تماماً لدمج صوت الشيخ أو التلاوة
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleMute}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  draft.muteOriginalAudio
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-[#292A2E] text-[#C4C7C8] hover:text-white'
                }`}
              >
                {draft.muteOriginalAudio ? 'مكتوم ومحجوب' : 'كتم الصوت'}
              </button>
            </div>

            {/* Audio Track Library */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#E3E2E6] block">
                اختر مساراً صوتياً هادفاً:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_AUDIO_LIBRARY.map((track) => {
                  const isSelected = draft.replacedAudio?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectAudio(isSelected ? null : track)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#006C4C]/25 border-[#89F8C7]'
                          : 'bg-[#121316] border-[#2B2C30] hover:border-[#3E4045]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base">{isSelected ? '🔊' : '🎵'}</span>
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#E3E2E6] block truncate">
                            {track.title}
                          </span>
                          <span className="text-[10px] text-[#8E9192]">
                            {track.artist} · {track.duration}ث
                          </span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md shrink-0 ${
                        isSelected ? 'bg-[#006C4C] text-white' : 'bg-[#202226] text-[#8E9192]'
                      }`}>
                        {isSelected ? 'محدد' : 'اختيار'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volume sliders */}
            {draft.replacedAudio && (
              <div className="p-3.5 rounded-xl bg-[#121316] border border-[#2B2C30] space-y-1">
                <div className="flex items-center justify-between text-xs text-[#C4C7C8]">
                  <span>مستوى صوت التلاوة المستبدلة ({draft.replacedAudio.title}):</span>
                  <span className="font-mono text-[#89F8C7]">
                    {Math.round(draft.replacedAudioVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={draft.replacedAudioVolume}
                  onChange={(e) => onUpdateDraft({ ...draft, replacedAudioVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: YOUTUBE PLAYLIST & CHROMA EFFECTS ================= */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            
            {/* YouTube Playlist Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/30 via-[#202226] to-[#121316] border border-red-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#E3E2E6] block">
                    قائمة مؤثرات يوتيوب والشاشات السوداء
                  </span>
                  <span className="text-[10px] text-[#8E9192]">
                    تسريبات ضوئية، كروما، موجات صوتية، وذرات بوكيه متطابقة
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyYouTubePlaylist}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  تفعيل حزمة المؤثرات
                </button>
                <a
                  href={USER_REQUESTED_YOUTUBE_PLAYLIST}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#C4C7C8] hover:text-white bg-[#121316] px-2.5 py-1.5 rounded-xl border border-[#2B2C30] flex items-center gap-1"
                >
                  <span>رابط القائمة</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Effects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {draft.effects.map((eff) => (
                <div
                  key={eff.id}
                  className={`p-3 rounded-xl border transition-all ${
                    eff.enabled
                      ? 'bg-[#202226] border-[#006C4C]'
                      : 'bg-[#121316] border-[#2B2C30] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#E3E2E6] truncate">
                      {eff.name}
                    </span>
                    <button
                      onClick={() => handleToggleEffect(eff.id)}
                      className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        eff.enabled ? 'bg-[#006C4C]' : 'bg-[#36373B]'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          eff.enabled ? '-translate-x-5' : '-translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {eff.enabled && (
                    <div className="mt-2 pt-2 border-t border-[#2B2C30] space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#8E9192]">
                        <span>الشدة:</span>
                        <span className="font-mono text-[#89F8C7]">{eff.intensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={eff.intensity}
                        onChange={(e) => handleEffectIntensity(eff.id, parseInt(e.target.value))}
                        className="w-full accent-[#89F8C7] h-1 bg-[#2B2C30] rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 4: CALLIGRAPHY & PARCHMENT ================= */}
        {activeTab === 'calligraphy' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#201c13] to-[#121316] border border-[#785900]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={ASSET_ANTIQUE_PARCHMENT}
                  alt="Parchment & Candle"
                  className="w-16 h-20 object-cover rounded-xl border border-[#FFDF9E]/30 shrink-0"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#FFDF9E]">
                    مشهد المخطوطة العتيقة والشمعة (خط الرقعة بالريشة)
                  </h4>
                  <p className="text-[11px] text-[#8E9192]">
                    كتابة متحركة كلمة بكلمة متزامنة مع تلاوة ونطق الشيخ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSwitchBackground(ASSET_ANTIQUE_PARCHMENT, 'مخطوطة_عتيقة_مع_شمعة.jpg')}
                  className="px-3.5 py-2 rounded-xl bg-[#785900] hover:bg-[#8f6a00] text-white text-xs font-bold transition-all shadow-sm"
                >
                  تعيين كخلفية للمشهد
                </button>
                <button
                  onClick={onOpenCalligraphyModal}
                  className="px-3.5 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-bold transition-all shadow-sm"
                >
                  تعديل توقيت الكلمات (STT)
                </button>
              </div>
            </div>

            {/* Timed words preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#E3E2E6] block">
                الكلمات الموقّتة حالياً:
              </span>
              <div className="flex flex-wrap gap-2">
                {(draft.calligraphyStory?.words || SAMPLE_TIMED_SPEECHES[0].words).map((w, i) => (
                  <span
                    key={w.id}
                    className="px-3 py-1.5 rounded-lg bg-[#202226] border border-[#2B2C30] font-ruqaa text-sm font-bold text-[#FFDF9E] flex items-center gap-2"
                  >
                    <span>{w.word}</span>
                    <span className="text-[10px] font-mono text-[#89F8C7] font-sans">
                      ({w.startMs / 1000}s)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: ASPECT RATIO & BACKGROUND ================= */}
        {activeTab === 'ratio' && (
          <div className="space-y-4">
            
            {/* Aspect Ratio Switcher */}
            <div>
              <span className="text-xs font-bold text-[#E3E2E6] block mb-2">
                اختر مقاس الفيديو المطلوب:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSwitchRatio('9:16')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    draft.aspectRatio === '9:16'
                      ? 'bg-[#006C4C] border-[#89F8C7] text-white font-bold'
                      : 'bg-[#121316] border-[#2B2C30] text-[#8E9192]'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">9:16 (ريلز وقصص)</span>
                </button>

                <button
                  onClick={() => handleSwitchRatio('16:9')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    draft.aspectRatio === '16:9'
                      ? 'bg-[#006C4C] border-[#89F8C7] text-white font-bold'
                      : 'bg-[#121316] border-[#2B2C30] text-[#8E9192]'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-xs">16:9 (يوتيوب)</span>
                </button>

                <button
                  onClick={() => handleSwitchRatio('1:1')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    draft.aspectRatio === '1:1'
                      ? 'bg-[#006C4C] border-[#89F8C7] text-white font-bold'
                      : 'bg-[#121316] border-[#2B2C30] text-[#8E9192]'
                  }`}
                >
                  <Square className="w-5 h-5" />
                  <span className="text-xs">1:1 (مربع)</span>
                </button>
              </div>
            </div>

            {/* Background Image / Scene Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#E3E2E6] block">
                اختر مشهد أو خلفية الفيديو:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'مشهد المئذنة الذهبي', url: ASSET_MINARET_SUNSET },
                  { name: 'مصحف المسجد العتيق', url: ASSET_QURAN_LIGHT },
                  { name: 'المخطوطة والشمعة', url: ASSET_ANTIQUE_PARCHMENT },
                  { name: 'زخرفة إسلامية ذهبية', url: ASSET_ARABIC_ORNAMENT },
                ].map((bg, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSwitchBackground(bg.url, bg.name + '.mp4')}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${
                      draft.videoSourceUrl === bg.url
                        ? 'border-[#89F8C7] ring-2 ring-[#006C4C]'
                        : 'border-[#2B2C30] hover:border-[#46484C]'
                    }`}
                  >
                    <img src={bg.url} alt={bg.name} className="w-full h-24 object-cover" />
                    <div className="p-2 text-center text-[11px] font-semibold text-[#E3E2E6] bg-[#121316]">
                      {bg.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
