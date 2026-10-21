/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Copy, 
  Check, 
  Terminal, 
  Sun, 
  Flame, 
  Layers, 
  RotateCcw,
  Eye,
  Zap,
  Activity
} from 'lucide-react';
import { ParticleOverlayItem } from '../../../types';

interface ParticleOverlaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  particleOverlays: ParticleOverlayItem[];
  onUpdateParticles: (particles: ParticleOverlayItem[]) => void;
}

export const ParticleOverlaysModal: React.FC<ParticleOverlaysModalProps> = ({
  isOpen,
  onClose,
  particleOverlays,
  onUpdateParticles,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [selectedFilterId, setSelectedFilterId] = useState<string>('golden_dust');

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = particleOverlays.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    onUpdateParticles(updated);
  };

  const handleIntensityChange = (id: string, intensity: number) => {
    const updated = particleOverlays.map((p) =>
      p.id === id ? { ...p, intensity } : p
    );
    onUpdateParticles(updated);
  };

  const handleCountChange = (id: string, particleCount: number) => {
    const updated = particleOverlays.map((p) =>
      p.id === id ? { ...p, particleCount } : p
    );
    onUpdateParticles(updated);
  };

  const handleSpeedChange = (id: string, speed: 'slow' | 'calm' | 'medium') => {
    const updated = particleOverlays.map((p) =>
      p.id === id ? { ...p, speed } : p
    );
    onUpdateParticles(updated);
  };

  const handleBlendChange = (id: string, blendMode: 'screen' | 'lighter' | 'overlay') => {
    const updated = particleOverlays.map((p) =>
      p.id === id ? { ...p, blendMode } : p
    );
    onUpdateParticles(updated);
  };

  const handleEnableSpiritualPreset = () => {
    const updated = particleOverlays.map((p) => {
      if (p.id === 'golden_dust' || p.id === 'soft_lights_bokeh') {
        return { ...p, enabled: true, intensity: 70 };
      }
      return p;
    });
    onUpdateParticles(updated);
  };

  const handleDisableAll = () => {
    const updated = particleOverlays.map((p) => ({ ...p, enabled: false }));
    onUpdateParticles(updated);
  };

  // Build simulated FFmpeg command for the active particle overlays
  const activeList = particleOverlays.filter((p) => p.enabled);
  const ffmpegSnippet = activeList.length > 0
    ? activeList.map((p, idx) => {
        return `# فلتر: ${p.name}\n` +
          `[0:v]eq=gamma_r=1.12:gamma_g=1.04[v_base]; \\\n` +
          `[1:v]format=yuva420p,colorchannelmixer=aa=${(p.intensity / 100).toFixed(2)}[p_${idx}]; \\\n` +
          `[v_base][p_${idx}]blend=all_mode='${p.blendMode}':all_opacity=${(p.intensity / 100).toFixed(2)}[v_particle_out]`;
      }).join('\n\n')
    : '# لم يتم تفعيل أي فلتر جسيمات حتى الآن. اختر فلتر للبدء.';

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(ffmpegSnippet);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const getParticleIcon = (id: string) => {
    switch (id) {
      case 'golden_dust':
        return <Sparkles className="w-5 h-5 text-[#FFDF9E]" />;
      case 'soft_lights_bokeh':
        return <Sun className="w-5 h-5 text-amber-300" />;
      case 'dawn_god_rays':
        return <Zap className="w-5 h-5 text-amber-200" />;
      case 'emerald_sparkles':
        return <Sparkles className="w-5 h-5 text-[#89F8C7]" />;
      case 'celestial_stardust':
        return <Activity className="w-5 h-5 text-sky-300" />;
      case 'candle_shimmer':
        return <Flame className="w-5 h-5 text-orange-400" />;
      default:
        return <Layers className="w-5 h-5 text-[#89F8C7]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2B2C30] bg-[#121316]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006C4C]/25 border border-[#89F8C7]/30 flex items-center justify-center text-[#89F8C7]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#E3E2E6] font-cairo">
                مكتبة فلاتر الجسيمات والأضواء الهادئة (Particle Overlays)
              </h2>
              <p className="text-xs text-[#8E9192]">
                تأثيرات غبار ذهبي، أضواء بوكيه، وأشعة فجرية تعلو الفيديو بنمط Blend Screen في FFmpeg Kit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#292A2E] text-[#8E9192] hover:text-white hover:bg-[#333539] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-5 py-2.5 bg-[#17191C] border-b border-[#2B2C30] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8E9192]">حزم سريعة:</span>
            <button
              onClick={handleEnableSpiritualPreset}
              className="px-3 py-1 rounded-lg bg-[#006C4C]/30 hover:bg-[#006C4C]/50 text-[#89F8C7] border border-[#006C4C] font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تفعيل الغبار الذهبي والأضواء الهادئة</span>
            </button>
            <button
              onClick={handleDisableAll}
              className="px-2.5 py-1 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-[#8E9192] hover:text-white transition-colors"
            >
              تعطيل الكل
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#89F8C7] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#89F8C7] animate-pulse"></span>
            <span>{activeList.length} فلاتر نشطة على المعاينة المباشرة</span>
          </div>
        </div>

        {/* Body: Two columns layout */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {particleOverlays.map((particle) => {
            const isSelected = selectedFilterId === particle.id;

            return (
              <div
                key={particle.id}
                onClick={() => setSelectedFilterId(particle.id)}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                  particle.enabled
                    ? 'bg-[#1E2024] border-[#006C4C] ring-1 ring-[#89F8C7]/30 shadow-md'
                    : 'bg-[#141518] border-[#2B2C30] hover:border-[#3E4045]'
                }`}
              >
                {/* Title & Switch */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      particle.enabled 
                        ? 'bg-[#006C4C]/30 border-[#89F8C7]/40' 
                        : 'bg-[#292A2E] border-[#36373B]'
                    }`}>
                      {getParticleIcon(particle.id)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#E3E2E6] flex items-center gap-1.5">
                        <span>{particle.name}</span>
                        {particle.enabled && (
                          <span className="text-[10px] font-mono text-[#89F8C7] bg-[#006C4C]/40 px-1.5 py-0.2 rounded">
                            مفعّل
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-[#8E9192] line-clamp-2 mt-0.5">
                        {particle.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(particle.id);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                      particle.enabled ? 'bg-[#006C4C]' : 'bg-[#292A2E]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        particle.enabled ? '-translate-x-5 shadow-md' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Controls (visible if enabled) */}
                {particle.enabled && (
                  <div className="space-y-3 pt-3 border-t border-[#2B2C30]/60 mt-1">
                    {/* Intensity / Opacity */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-[#C4C7C8]">السطوع والشفافية:</span>
                        <span className="font-mono text-[#89F8C7] font-bold">{particle.intensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={particle.intensity}
                        onChange={(e) => handleIntensityChange(particle.id, parseInt(e.target.value))}
                        className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Particle Density */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-[#C4C7C8]">كثافة الذرات:</span>
                        <span className="font-mono text-[#FFDF9E]">{particle.particleCount} جزيء</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="120"
                        value={particle.particleCount}
                        onChange={(e) => handleCountChange(particle.id, parseInt(e.target.value))}
                        className="w-full accent-[#FFDF9E] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Speed & Blend Mode */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-[#8E9192] block mb-1">سرعة التدفق:</span>
                        <div className="flex items-center gap-1 bg-[#121316] p-0.5 rounded-lg border border-[#2B2C30]">
                          {(['slow', 'calm', 'medium'] as const).map((spd) => (
                            <button
                              key={spd}
                              onClick={() => handleSpeedChange(particle.id, spd)}
                              className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${
                                particle.speed === spd
                                  ? 'bg-[#006C4C] text-white'
                                  : 'text-[#8E9192] hover:text-white'
                              }`}
                            >
                              {spd === 'slow' ? 'هادئ' : spd === 'calm' ? 'طبيعي' : 'سريع'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[#8E9192] block mb-1">نمط الدمج (Blend):</span>
                        <select
                          value={particle.blendMode}
                          onChange={(e) => handleBlendChange(particle.id, e.target.value as any)}
                          className="w-full bg-[#121316] border border-[#2B2C30] rounded-lg p-1.5 text-[10px] text-[#E3E2E6] outline-none"
                        >
                          <option value="screen">Screen (شاشة سوداء)</option>
                          <option value="lighter">Lighter (توهج إضافي)</option>
                          <option value="overlay">Overlay (تغطية سينمائية)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FFmpeg Code Snippet Footer */}
        <div className="p-4 bg-[#121316] border-t border-[#2B2C30] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#89F8C7] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>أمر دمج الفلاتر في ffmpeg_kit_flutter:</span>
            </span>
            <button
              onClick={handleCopyCmd}
              className="text-[#89F8C7] hover:text-white inline-flex items-center gap-1 font-mono transition-colors"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd ? 'تم النسخ!' : 'نسخ كود FFmpeg'}</span>
            </button>
          </div>

          <pre className="p-2.5 rounded-lg bg-[#0A0B0D] border border-[#2B2C30] text-[10px] font-mono text-[#FFDF9E] overflow-x-auto whitespace-pre-wrap max-h-20 select-all">
            {ffmpegSnippet}
          </pre>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              تم وحفظ الفلاتر
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
