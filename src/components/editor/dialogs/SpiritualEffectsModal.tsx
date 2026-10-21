/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Youtube, 
  ExternalLink, 
  Check, 
  Plus, 
  Layers, 
  Flame, 
  Sun, 
  Activity, 
  Cloud 
} from 'lucide-react';
import { SpiritualEffect } from '../../../types';
import { USER_REQUESTED_YOUTUBE_PLAYLIST } from '../../../constants/defaults';

interface SpiritualEffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  effects: SpiritualEffect[];
  onUpdateEffects: (effects: SpiritualEffect[]) => void;
}

export const SpiritualEffectsModal: React.FC<SpiritualEffectsModalProps> = ({
  isOpen,
  onClose,
  effects,
  onUpdateEffects,
}) => {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<'all' | 'lighting' | 'particles' | 'visualizer' | 'vintage'>('all');
  const [youtubeUrl, setYoutubeUrl] = useState<string>(USER_REQUESTED_YOUTUBE_PLAYLIST);
  const [importedMessage, setImportedMessage] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    const updated = effects.map((eff) =>
      eff.id === id ? { ...eff, enabled: !eff.enabled } : eff
    );
    onUpdateEffects(updated);
  };

  const handleIntensityChange = (id: string, intensity: number) => {
    const updated = effects.map((eff) =>
      eff.id === id ? { ...eff, intensity } : eff
    );
    onUpdateEffects(updated);
  };

  // 1-Click activate all signature montage effects from user's YouTube playlist
  const handleApplyYouTubePlaylistPack = () => {
    const updated = effects.map((eff) => {
      // Enable signature montage effects found in YouTube video editing packs
      if (['light_leaks', 'golden_dust', 'audio_spectrum', 'arabesque_vignette'].includes(eff.id)) {
        return { ...eff, enabled: true, intensity: Math.max(eff.intensity, 65) };
      }
      return eff;
    });
    onUpdateEffects(updated);
    setImportedMessage('تم تفعيل حزمة مؤثرات قائمة يوتيوب (تسريبات ضوئية، طيف صوتي، ذرات ذهبية، وتعتيم سينمائي)!');
    setTimeout(() => setImportedMessage(null), 3500);
  };

  const filteredEffects = activeCategory === 'all'
    ? effects
    : effects.filter((e) => e.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006C4C]/30 border border-[#89F8C7]/40 flex items-center justify-center text-[#89F8C7]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6]">
                مكتبة مؤثرات المونتاج وقائمة يوتيوب
              </h3>
              <p className="text-xs text-[#8E9192]">
                تسريبات ضوئية، كروما شاشات سوداء، موجات صوتية، وفلاتر سينمائية
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
          
          {/* YouTube Playlist Integration Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/30 via-[#1E2024] to-[#121316] border border-red-800/40 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#E3E2E6]">
                    حزمة مؤثرات قائمة يوتيوب المختارة
                  </h4>
                  <p className="text-[11px] text-[#8E9192]">
                    مؤثرات مونتاج الفيديو والشاشات السوداء من الرابط المحدد
                  </p>
                </div>
              </div>

              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 shrink-0 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/50"
              >
                <span>فتح القائمة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="رابط قائمة تشغيل أو فيديو مؤثرات يوتيوب..."
                className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl px-3 py-2 text-xs font-mono text-[#C4C7C8] focus:border-red-500/60 outline-none"
              />
              <button
                onClick={handleApplyYouTubePlaylistPack}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تطبيق حزمة المؤثرات</span>
              </button>
            </div>

            {importedMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{importedMessage}</span>
              </div>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#121316] rounded-xl border border-[#2B2C30] overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              جميع المؤثرات ({effects.length})
            </button>
            <button
              onClick={() => setActiveCategory('lighting')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'lighting'
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>إضاءات وتسريبات</span>
            </button>
            <button
              onClick={() => setActiveCategory('particles')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'particles'
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>ذرات وبوكيه</span>
            </button>
            <button
              onClick={() => setActiveCategory('visualizer')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'visualizer'
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>موجات صوتية تفاعلية</span>
            </button>
            <button
              onClick={() => setActiveCategory('vintage')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'vintage'
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>أفلام وكروما قديمة</span>
            </button>
          </div>

          {/* Effects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredEffects.map((effect) => (
              <div
                key={effect.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  effect.enabled
                    ? 'bg-[#202226] border-[#006C4C]'
                    : 'bg-[#17191C] border-[#2B2C30] opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#E3E2E6]">
                          {effect.name}
                        </span>
                        {effect.tag && (
                          <span className="text-[10px] bg-[#121316] text-[#89F8C7] px-1.5 py-0.2 rounded border border-[#2B2C30]">
                            {effect.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8E9192] leading-relaxed">
                        {effect.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggle(effect.id)}
                      className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        effect.enabled ? 'bg-[#006C4C]' : 'bg-[#36373B]'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          effect.enabled ? '-translate-x-5' : '-translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Intensity Slider if enabled */}
                {effect.enabled && (
                  <div className="mt-3 pt-2.5 border-t border-[#2B2C30] space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#C4C7C8]">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-[#89F8C7]" />
                        <span>الشدة:</span>
                      </span>
                      <span className="font-mono text-[#89F8C7]">{effect.intensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={effect.intensity}
                      onChange={(e) => handleIntensityChange(effect.id, parseInt(e.target.value))}
                      className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex items-center justify-between">
          <div className="text-xs text-[#8E9192]">
            المؤثرات المفعلة: <span className="text-[#89F8C7] font-bold">{effects.filter(e => e.enabled).length}</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#006C4C] text-white text-xs font-semibold hover:bg-[#00573c] transition-colors"
          >
            تطبيق المؤثرات
          </button>
        </div>

      </div>
    </div>
  );
};
