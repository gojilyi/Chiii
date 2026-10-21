/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  PenTool, 
  Mic, 
  Clock, 
  FileText, 
  Download, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Play, 
  Square,
  Copy,
  Layers,
  Flame,
  Volume2
} from 'lucide-react';
import { CalligraphyStoryConfig, TimedWord, ProjectDraft } from '../../../types';
import { 
  SAMPLE_TIMED_SPEECHES, 
  ASSET_ANTIQUE_PARCHMENT, 
  generateSRT, 
  generateASS 
} from '../../../constants/calligraphyDefaults';
import { audioEngine } from '../../../services/audioEngine';

interface CalligraphyAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ProjectDraft;
  onUpdateDraft: (draft: ProjectDraft) => void;
}

export const CalligraphyAudioModal: React.FC<CalligraphyAudioModalProps> = ({
  isOpen,
  onClose,
  draft,
  onUpdateDraft,
}) => {
  if (!isOpen) return null;

  const initialConfig = draft.calligraphyStory || {
    enabled: true,
    fontStyle: 'Aref Ruqaa',
    mode: 'word_by_word',
    highlightColor: '#FFDF9E',
    defaultColor: '#E3E2E6',
    fontSize: 38,
    parchmentBackgroundUrl: ASSET_ANTIQUE_PARCHMENT,
    words: SAMPLE_TIMED_SPEECHES[0].words,
    audioSourceTitle: SAMPLE_TIMED_SPEECHES[0].title,
  };

  const [config, setConfig] = useState<CalligraphyStoryConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'stage1_stt' | 'stage2_style' | 'stage3_render'>('stage1_stt');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [customWordText, setCustomWordText] = useState<string>('');
  const [isPlayingSpeech, setIsPlayingSpeech] = useState<boolean>(false);

  const handleToggleSpeechPreview = () => {
    if (isPlayingSpeech) {
      audioEngine.stop();
      setIsPlayingSpeech(false);
    } else {
      audioEngine.playReplacedTrack('spiritual_drone', 0.85);
      setIsPlayingSpeech(true);
    }
  };

  // Handle Preset speech selection
  const handleSelectPresetSpeech = (presetIndex: number) => {
    const selected = SAMPLE_TIMED_SPEECHES[presetIndex];
    setConfig((prev) => ({
      ...prev,
      words: selected.words,
      audioSourceTitle: selected.title,
    }));
    if (isPlayingSpeech) {
      audioEngine.playReplacedTrack('spiritual_drone', 0.85);
    }
  };

  // Add custom word
  const handleAddWord = () => {
    if (!customWordText.trim()) return;
    const lastWord = config.words[config.words.length - 1];
    const newStart = lastWord ? lastWord.endMs + 200 : 500;
    const newEnd = newStart + 1500;

    const newWord: TimedWord = {
      id: 'w_' + Date.now(),
      word: customWordText.trim(),
      startMs: newStart,
      endMs: newEnd,
    };

    setConfig((prev) => ({
      ...prev,
      words: [...prev.words, newWord],
    }));
    setCustomWordText('');
  };

  // Delete word
  const handleDeleteWord = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      words: prev.words.filter((w) => w.id !== id),
    }));
  };

  // Update word timing
  const handleUpdateWordTime = (id: string, field: 'startMs' | 'endMs', val: number) => {
    setConfig((prev) => ({
      ...prev,
      words: prev.words.map((w) => (w.id === id ? { ...w, [field]: val } : w)),
    }));
  };

  // Simulate Speech-to-Text with Whisper / Google Cloud Speech-to-Text
  const handleSimulateWhisper = () => {
    setIsRecognizing(true);
    setTimeout(() => {
      setIsRecognizing(false);
      setConfig((prev) => ({
        ...prev,
        words: SAMPLE_TIMED_SPEECHES[0].words,
      }));
    }, 1200);
  };

  // Copy file content
  const handleCopyContent = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Download file content (.srt or .ass)
  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Apply to Project Draft
  const handleApplyToProject = () => {
    const updatedDraft: ProjectDraft = {
      ...draft,
      videoSourceUrl: ASSET_ANTIQUE_PARCHMENT, // Set parchment background
      videoSourceName: 'مخطوطة_عتيقة_مع_شمعة.jpg',
      calligraphyStory: config,
      thumbnailUrl: ASSET_ANTIQUE_PARCHMENT,
    };
    onUpdateDraft(updatedDraft);
    onClose();
  };

  const srtContent = generateSRT(config.words);
  const assContent = generateASS(config.words, config.fontStyle);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#785900]/30 border border-[#FFDF9E]/40 flex items-center justify-center text-[#FFDF9E]">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6] flex items-center gap-2">
                <span>تحويل الصوت إلى نص متحرك بخط الريشة (الرقعة / الديواني)</span>
                <span className="text-[10px] bg-[#006C4C] text-white px-2 py-0.5 rounded-full font-sans">
                  ميزة متقدمة
                </span>
              </h3>
              <p className="text-xs text-[#8E9192]">
                تحويل الصوت لنص بتوقيت دقيق ورسم الحروف والكلمات فوق مخطوطة عتيقة مع شمعة
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioEngine.stop();
              setIsPlayingSpeech(false);
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#292A2E] text-[#8E9192] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Stages Stepper / Tabs */}
        <div className="flex items-center border-b border-[#2B2C30] bg-[#17191C] px-4">
          <button
            onClick={() => setActiveTab('stage1_stt')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'stage1_stt'
                ? 'border-[#89F8C7] text-[#89F8C7]'
                : 'border-transparent text-[#8E9192] hover:text-[#E3E2E6]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#121316] text-[11px] font-mono flex items-center justify-center border border-[#2B2C30]">
              1
            </span>
            <span>المرحلة 1: تحويل الصوت وتوقيت الكلمات (STT)</span>
          </button>

          <button
            onClick={() => setActiveTab('stage2_style')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'stage2_style'
                ? 'border-[#89F8C7] text-[#89F8C7]'
                : 'border-transparent text-[#8E9192] hover:text-[#E3E2E6]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#121316] text-[11px] font-mono flex items-center justify-center border border-[#2B2C30]">
              2
            </span>
            <span>المرحلة 2: خط الرقعة ومحاكاة الريشة</span>
          </button>

          <button
            onClick={() => setActiveTab('stage3_render')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'stage3_render'
                ? 'border-[#89F8C7] text-[#89F8C7]'
                : 'border-transparent text-[#8E9192] hover:text-[#E3E2E6]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#121316] text-[11px] font-mono flex items-center justify-center border border-[#2B2C30]">
              3
            </span>
            <span>المرحلة 3: دمج المخطوطة وأمر FFmpeg</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* ================= STAGE 1: SPEECH TO TEXT WITH TIMESTAMPS ================= */}
          {activeTab === 'stage1_stt' && (
            <div className="space-y-5">
              
              {/* Presets & Whisper trigger */}
              <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                      <Mic className="w-4 h-4 text-[#89F8C7]" />
                      <span>اختر مقطعاً صوتياً للشيخ أو استخرج التوقيت</span>
                    </h4>
                    <p className="text-[11px] text-[#8E9192]">
                      محاذاة الكلمات صوتياً بالمللي ثانية (Word-Level Timestamps)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleToggleSpeechPreview}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                        isPlayingSpeech
                          ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                          : 'bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] border border-[#36373B]'
                      }`}
                    >
                      {isPlayingSpeech ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlayingSpeech ? 'إيقاف الاستماع' : 'استماع للصوت'}</span>
                    </button>

                    <button
                      onClick={handleSimulateWhisper}
                      disabled={isRecognizing}
                      className="px-3.5 py-1.5 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#89F8C7]" />
                      <span>{isRecognizing ? 'جاري التحليل الصوتي...' : 'استخراج التوقيت (Whisper API)'}</span>
                    </button>
                  </div>
                </div>

                {/* Preset speech chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {SAMPLE_TIMED_SPEECHES.map((speech, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPresetSpeech(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        config.audioSourceTitle === speech.title
                          ? 'bg-[#006C4C]/30 border-[#006C4C] text-[#89F8C7]'
                          : 'bg-[#121316] border-[#2B2C30] text-[#C4C7C8] hover:text-white'
                      }`}
                    >
                      {speech.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word by word timing table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E3E2E6]">
                    جدول توقيت الكلمات المقروءة ({config.words.length} كلمات):
                  </span>
                  <span className="text-[11px] text-[#8E9192]">
                    يمكنك تعديل توقيت البداية والنهاية لكل كلمة بالمللي ثانية (ms)
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {config.words.map((w, i) => (
                    <div
                      key={w.id}
                      className="p-2.5 rounded-xl bg-[#121316] border border-[#2B2C30] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <span className="w-5 h-5 rounded-md bg-[#202226] font-mono text-[10px] text-[#8E9192] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-ruqaa text-base font-bold text-[#FFDF9E]">
                          {w.word}
                        </span>
                      </div>

                      {/* Time Range inputs */}
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <div className="flex items-center gap-1 bg-[#202226] px-2 py-1 rounded-md border border-[#2B2C30]">
                          <span className="text-[#8E9192]">من:</span>
                          <input
                            type="number"
                            value={w.startMs}
                            onChange={(e) => handleUpdateWordTime(w.id, 'startMs', parseInt(e.target.value) || 0)}
                            className="w-16 bg-transparent text-[#89F8C7] outline-none text-left"
                          />
                          <span className="text-[#8E9192]">ms</span>
                        </div>

                        <div className="flex items-center gap-1 bg-[#202226] px-2 py-1 rounded-md border border-[#2B2C30]">
                          <span className="text-[#8E9192]">إلى:</span>
                          <input
                            type="number"
                            value={w.endMs}
                            onChange={(e) => handleUpdateWordTime(w.id, 'endMs', parseInt(e.target.value) || 0)}
                            className="w-16 bg-transparent text-[#89F8C7] outline-none text-left"
                          />
                          <span className="text-[#8E9192]">ms</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteWord(w.id)}
                        className="w-7 h-7 rounded-lg bg-[#292A2E] hover:bg-red-950/40 text-[#8E9192] hover:text-red-400 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new word input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customWordText}
                    onChange={(e) => setCustomWordText(e.target.value)}
                    placeholder="أضف كلمة جديدة..."
                    className="flex-1 bg-[#121316] border border-[#2B2C30] rounded-xl px-3 py-2 text-xs font-ruqaa text-[#E3E2E6] outline-none focus:border-[#89F8C7]"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                  />
                  <button
                    onClick={handleAddWord}
                    className="px-4 py-2 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#E3E2E6] text-xs font-semibold flex items-center gap-1 transition-colors border border-[#36373B]"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#89F8C7]" />
                    <span>إضافة كلمة</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= STAGE 2: CALLIGRAPHY STYLE & HANDWRITING SIMULATION ================= */}
          {activeTab === 'stage2_style' && (
            <div className="space-y-6">
              
              {/* Calligraphy Preview Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1b1710] to-[#121316] border border-[#785900]/40 flex flex-col items-center justify-center text-center space-y-4 shadow-inner relative overflow-hidden">
                <span className="text-[11px] font-mono text-[#FFDF9E] bg-[#121316]/80 px-2.5 py-1 rounded-md border border-[#785900]/40">
                  معاينة خط الريشة والقلم التقليدي
                </span>
                
                <div 
                  className={`text-2xl sm:text-3xl font-bold tracking-wide transition-all ${
                    config.fontStyle === 'Aref Ruqaa' ? 'font-ruqaa' : 'font-amiri'
                  }`}
                  style={{ color: config.highlightColor }}
                >
                  {config.words.map((w, idx) => (
                    <span 
                      key={w.id} 
                      className={`inline-block mx-1.5 transition-all duration-300 ${
                        idx === 0 ? 'text-[#FFDF9E] drop-shadow-[0_0_12px_rgba(255,223,158,0.7)]' : 'text-[#C4C7C8]/70'
                      }`}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-[#8E9192]">
                  تظهر كل كلمة بتوهج الحبر الذهبي مع اللحظة الدقيقة لنطقها
                </p>
              </div>

              {/* Font Family Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setConfig({ ...config, fontStyle: 'Aref Ruqaa' })}
                  className={`p-3.5 rounded-xl border text-right space-y-1 transition-all ${
                    config.fontStyle === 'Aref Ruqaa'
                      ? 'bg-[#006C4C]/20 border-[#006C4C]'
                      : 'bg-[#121316] border-[#2B2C30]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#E3E2E6] block">خط الرقعة / الديواني</span>
                  <span className="font-ruqaa text-lg font-bold text-[#FFDF9E] block">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ
                  </span>
                  <span className="text-[10px] text-[#8E9192]">رسم الحروف بالريشة التقليدية</span>
                </button>

                <button
                  onClick={() => setConfig({ ...config, fontStyle: 'Amiri' })}
                  className={`p-3.5 rounded-xl border text-right space-y-1 transition-all ${
                    config.fontStyle === 'Amiri'
                      ? 'bg-[#006C4C]/20 border-[#006C4C]'
                      : 'bg-[#121316] border-[#2B2C30]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#E3E2E6] block">خط النسخ القرآني</span>
                  <span className="font-amiri text-lg font-bold text-[#FFDF9E] block">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ
                  </span>
                  <span className="text-[10px] text-[#8E9192]">خط المصحف الشريف الكلاسيكي</span>
                </button>

                <button
                  onClick={() => setConfig({ ...config, fontStyle: 'Cairo' })}
                  className={`p-3.5 rounded-xl border text-right space-y-1 transition-all ${
                    config.fontStyle === 'Cairo'
                      ? 'bg-[#006C4C]/20 border-[#006C4C]'
                      : 'bg-[#121316] border-[#2B2C30]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#E3E2E6] block">خط القاهرة الحديث</span>
                  <span className="font-cairo text-sm font-bold text-[#FFDF9E] block mt-1">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ
                  </span>
                  <span className="text-[10px] text-[#8E9192]">واضح وعصري للمقاطع الدعوية</span>
                </button>
              </div>

              {/* Animation Mode */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#E3E2E6] block">
                  نمط التحريك والكتابة التفاعلية:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setConfig({ ...config, mode: 'word_by_word' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      config.mode === 'word_by_word'
                        ? 'bg-[#006C4C]/20 border-[#006C4C]'
                        : 'bg-[#121316] border-[#2B2C30]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#E3E2E6]">كتابة كلمة بكلمة متزامنة (Word-by-Word)</div>
                    <div className="text-[11px] text-[#8E9192] mt-0.5">
                      تظهر الكلمات تدريجياً بالتزامن مع توقيت نطقها في الصوت
                    </div>
                  </div>

                  <div
                    onClick={() => setConfig({ ...config, mode: 'karaoke' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      config.mode === 'karaoke'
                        ? 'bg-[#006C4C]/20 border-[#006C4C]'
                        : 'bg-[#121316] border-[#2B2C30]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#E3E2E6]">توهج الحبر الكاراوكي (Karaoke Glow)</div>
                    <div className="text-[11px] text-[#8E9192] mt-0.5">
                      النص معروض بالكامل، وتتوهج الكلمة الجاري تلاوتها باللون الذهبي
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Size & Ink Color */}
              <div className="p-3.5 rounded-xl bg-[#121316] border border-[#2B2C30] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#C4C7C8]">
                  <span>حجم خط المخطوطة:</span>
                  <span className="font-mono text-[#89F8C7]">{config.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="26"
                  max="54"
                  value={config.fontSize}
                  onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                />
              </div>

            </div>
          )}

          {/* ================= STAGE 3: VIDEO RENDERING, ASS SUBTITLES & FFMPEG ================= */}
          {activeTab === 'stage3_render' && (
            <div className="space-y-6">
              
              {/* Scene Backdrop Card */}
              <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={ASSET_ANTIQUE_PARCHMENT}
                  alt="Vintage Parchment & Candle"
                  className="w-24 h-36 object-cover rounded-xl border border-[#785900]/50 shadow-md shrink-0"
                />
                <div className="space-y-2 text-right">
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-[#FFDF9E] bg-[#121316] px-2.5 py-0.5 rounded-md border border-[#785900]/40">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>مشهد المخطوطة والشمعة العتيقة</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#E3E2E6]">
                    ورقة كلاسيكية مع شمعة ومحبرة خط عربي
                  </h4>
                  <p className="text-xs text-[#8E9192] leading-relaxed">
                    يتم رسم وتشكيل الحروف فوق هذه المخطوطة مع تأثير خافت لضوء الشمعة التفاعلي.
                  </p>
                </div>
              </div>

              {/* Subtitles Export (.srt & .ass) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#E3E2E6] block">
                  تصدير ملفات الترجمة والتوقيت الدقيقة:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* SRT Card */}
                  <div className="p-3.5 rounded-xl bg-[#121316] border border-[#2B2C30] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E3E2E6]">ملف SubRip (.srt)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyContent(srtContent, 'srt')}
                          className="p-1.5 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-[#8E9192] hover:text-white transition-colors"
                          title="نسخ محتوى SRT"
                        >
                          {copiedType === 'srt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDownloadFile(srtContent, 'sheikh_eid_subtitles.srt')}
                          className="p-1.5 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-[#89F8C7] hover:text-white transition-colors"
                          title="تنزيل ملف SRT"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <pre className="text-[10px] font-mono text-[#8E9192] max-h-24 overflow-y-auto leading-relaxed">
                      {srtContent}
                    </pre>
                  </div>

                  {/* ASS Card */}
                  <div className="p-3.5 rounded-xl bg-[#121316] border border-[#2B2C30] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FFDF9E]">ملف Advanced SubStation (.ass)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyContent(assContent, 'ass')}
                          className="p-1.5 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-[#8E9192] hover:text-white transition-colors"
                          title="نسخ محتوى ASS"
                        >
                          {copiedType === 'ass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDownloadFile(assContent, 'sheikh_eid_calligraphy.ass')}
                          className="p-1.5 rounded-lg bg-[#202226] hover:bg-[#2B2C30] text-[#89F8C7] hover:text-white transition-colors"
                          title="تنزيل ملف ASS"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <pre className="text-[10px] font-mono text-[#8E9192] max-h-24 overflow-y-auto leading-relaxed">
                      {assContent.slice(0, 220)}...
                    </pre>
                  </div>

                </div>
              </div>

              {/* Exact FFmpeg Kit Burn Command */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E3E2E6]">
                    أمر FFmpeg Kit لدمج ورسم الخط الكلاسيكي فوق المخطوطة:
                  </span>
                  <button
                    onClick={() => handleCopyContent(`ffmpeg -loop 1 -i antique_parchment.jpg -i sheikh_audio.mp3 -vf "ass=sheikh_eid_calligraphy.ass" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p output_calligraphy.mp4`, 'ffmpeg_ass')}
                    className="text-[11px] text-[#89F8C7] hover:underline flex items-center gap-1"
                  >
                    {copiedType === 'ffmpeg_ass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === 'ffmpeg_ass' ? 'تم النسخ' : 'نسخ الأمر'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-xl bg-[#0F1012] border border-[#2B2C30] text-[11px] font-mono text-[#89F8C7] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
{`ffmpeg -loop 1 -i antique_parchment.jpg -i sheikh_audio.mp3 \\
  -vf "ass=sheikh_eid_calligraphy.ass:fontsdir=assets/fonts" \\
  -c:v libx264 -tune stillimage -preset medium -crf 20 \\
  -c:a aac -b:a 192k -shortest -pix_fmt yuv420p output_calligraphy.mp4`}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex items-center justify-between">
          <div className="text-xs text-[#8E9192] flex items-center gap-2">
            <span>الخط المختار:</span>
            <span className="font-bold text-[#FFDF9E]">{config.fontStyle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audioEngine.stop();
                setIsPlayingSpeech(false);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#292A2E] text-white text-xs font-medium hover:bg-[#333539] transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleApplyToProject}
              className="px-5 py-2 rounded-xl bg-[#006C4C] text-white text-xs font-semibold hover:bg-[#00573c] transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Check className="w-4 h-4 text-[#89F8C7]" />
              <span>تطبيق المخطوطة والخط في المحرر</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
