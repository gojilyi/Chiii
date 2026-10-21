/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  Film, 
  Image as ImageIcon, 
  Music, 
  Upload, 
  Trash2, 
  Scissors, 
  Sliders, 
  Check, 
  Plus, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Move,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { ProjectDraft, MediaClip, MediaType } from '../../../types';
import { 
  ASSET_MINARET_SUNSET, 
  ASSET_QURAN_LIGHT, 
  ASSET_ARABIC_ORNAMENT 
} from '../../../constants/defaults';
import { ASSET_ANTIQUE_PARCHMENT } from '../../../constants/calligraphyDefaults';
import { ASSET_MOSQUE_ARCHES } from '../../../constants/autoLectureDefaults';

interface MediaClipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ProjectDraft;
  currentTime: number;
  onUpdateDraft: (draft: ProjectDraft) => void;
}

export const MediaClipsModal: React.FC<MediaClipsModalProps> = ({
  isOpen,
  onClose,
  draft,
  currentTime,
  onUpdateDraft,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image' | 'audio'>('all');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const clips: MediaClip[] = draft.mediaClips || [];
  const duration = draft.duration || 15;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Add new Image Clip
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newClip: MediaClip = {
        id: `img_clip_${Date.now()}`,
        type: 'image',
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: url,
        duration: Math.min(duration, 10),
        startTime: Math.min(currentTime, duration - 1),
        endTime: Math.min(duration, Math.min(currentTime, duration - 1) + 6),
        trimStart: 0,
        trimEnd: 0,
        opacity: 0.9,
        scale: 1,
        positionX: 50,
        positionY: 50,
      };

      const updatedClips = [...clips, newClip];
      const updatedDraft = { ...draft, mediaClips: updatedClips };
      onUpdateDraft(updatedDraft);
      setSelectedClipId(newClip.id);
      showNotification(`تمت إضافة الصورة: ${newClip.name}`);
    }
    if (e.target) e.target.value = '';
  };

  // Add new Video Clip
  const handleUploadVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.src = url;

      const finishAdd = (vidDuration: number) => {
        const newClip: MediaClip = {
          id: `vid_clip_${Date.now()}`,
          type: 'video',
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: url,
          duration: vidDuration,
          startTime: 0,
          endTime: Math.min(duration, vidDuration),
          trimStart: 0,
          trimEnd: vidDuration,
          volume: 1,
          opacity: 1,
          scale: 1,
          positionX: 50,
          positionY: 50,
          isMuted: false,
        };

        const updatedClips = [...clips, newClip];
        const updatedDraft = { 
          ...draft, 
          mediaClips: updatedClips,
          videoSourceUrl: url,
          videoSourceName: file.name,
          duration: Math.max(draft.duration, vidDuration),
        };
        onUpdateDraft(updatedDraft);
        setSelectedClipId(newClip.id);
        showNotification(`تمت إضافة وتحديث الفيديو: ${newClip.name}`);
      };

      tempVideo.onloadedmetadata = () => {
        const dur = Math.round(tempVideo.duration) || 15;
        finishAdd(dur);
      };

      tempVideo.onerror = () => {
        finishAdd(15);
      };
    }
    if (e.target) e.target.value = '';
  };

  // Add new Audio Clip
  const handleUploadAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const tempAudio = new Audio(url);

      const finishAdd = (audDuration: number) => {
        const newClip: MediaClip = {
          id: `aud_clip_${Date.now()}`,
          type: 'audio',
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: url,
          duration: audDuration,
          startTime: Math.min(currentTime, duration - 1),
          endTime: Math.min(duration, Math.min(currentTime, duration - 1) + audDuration),
          trimStart: 0,
          trimEnd: audDuration,
          volume: 0.9,
          isMuted: false,
        };

        const updatedClips = [...clips, newClip];
        const updatedDraft = { ...draft, mediaClips: updatedClips };
        onUpdateDraft(updatedDraft);
        setSelectedClipId(newClip.id);
        showNotification(`تمت إضافة المسار الصوتي: ${newClip.name}`);
      };

      tempAudio.onloadedmetadata = () => {
        const dur = Math.round(tempAudio.duration) || 30;
        finishAdd(dur);
      };

      tempAudio.onerror = () => {
        finishAdd(30);
      };
    }
    if (e.target) e.target.value = '';
  };

  // Add Preset Islamic Asset as Clip
  const handleAddPresetAsset = (title: string, url: string) => {
    const newClip: MediaClip = {
      id: `preset_${Date.now()}`,
      type: 'image',
      name: title,
      url: url,
      duration: duration,
      startTime: 0,
      endTime: duration,
      trimStart: 0,
      trimEnd: duration,
      opacity: 0.85,
      scale: 1,
      positionX: 50,
      positionY: 50,
    };

    const updatedClips = [...clips, newClip];
    const updatedDraft = { ...draft, mediaClips: updatedClips };
    onUpdateDraft(updatedDraft);
    setSelectedClipId(newClip.id);
    showNotification(`تمت إضافة ${title} كطبقة صورة في المشروع`);
  };

  // Update specific clip
  const handleUpdateClip = (id: string, updates: Partial<MediaClip>) => {
    const updatedClips = clips.map((c) => (c.id === id ? { ...c, ...updates } : c));
    const updatedDraft = { ...draft, mediaClips: updatedClips };
    onUpdateDraft(updatedDraft);
  };

  // Delete clip (الحذف)
  const handleDeleteClip = (id: string) => {
    const clipToDelete = clips.find((c) => c.id === id);
    const updatedClips = clips.filter((c) => c.id !== id);
    const updatedDraft = { ...draft, mediaClips: updatedClips };
    onUpdateDraft(updatedDraft);
    if (selectedClipId === id) {
      setSelectedClipId(null);
    }
    showNotification(`تم حذف المقطع: ${clipToDelete?.name || ''}`);
  };

  // Split / Cut clip at current playhead (القص عند المؤشر)
  const handleSplitClipAtCurrentTime = (clip: MediaClip) => {
    if (currentTime <= clip.startTime || currentTime >= clip.endTime) {
      alert(`يرجى تحريك مؤشر التشغيل إلى داخل نطاق المقطع (بين ${clip.startTime.toFixed(1)}s و ${clip.endTime.toFixed(1)}s) ليتم قصه`);
      return;
    }

    // Clip 1: start to currentTime
    const clip1: MediaClip = {
      ...clip,
      id: `${clip.id}_part1`,
      name: `${clip.name} (جزء 1)`,
      endTime: currentTime,
    };

    // Clip 2: currentTime to end
    const clip2: MediaClip = {
      ...clip,
      id: `${clip.id}_part2`,
      name: `${clip.name} (جزء 2)`,
      startTime: currentTime,
    };

    const updatedClips = clips.filter((c) => c.id !== clip.id).concat([clip1, clip2]);
    const updatedDraft = { ...draft, mediaClips: updatedClips };
    onUpdateDraft(updatedDraft);
    setSelectedClipId(clip2.id);
    showNotification(`تم قص وفصل المقطع «${clip.name}» إلى جزأين عند ${currentTime.toFixed(1)}s بنجاح!`);
  };

  // Filter clips by active tab
  const filteredClips = activeTab === 'all' 
    ? clips 
    : clips.filter((c) => c.type === activeTab);

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006C4C]/30 border border-[#89F8C7]/40 flex items-center justify-center text-[#89F8C7]">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6] flex items-center gap-2">
                <span>إدارة الوسائط والقص والتعديل والحذف</span>
                <span className="text-[10px] bg-[#006C4C] text-white px-2 py-0.5 rounded-full font-mono">
                  {clips.length} مقاطع
                </span>
              </h3>
              <p className="text-xs text-[#8E9192]">
                إضافة الصور والفيديوهات والصوتيات مع التحكم في التوقيت والقص والموضع والحجم والحذف
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

        {/* Notification Toast */}
        {notification && (
          <div className="bg-[#006C4C] text-white text-xs font-semibold px-4 py-2 text-center animate-in fade-in slide-in-from-top-1">
            {notification}
          </div>
        )}

        {/* Action Toolbar: Add Media Buttons */}
        <div className="p-3 bg-[#17191C] border-b border-[#2B2C30] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] text-xs font-semibold border border-[#36373B] flex items-center gap-1.5 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>+ إضافة صورة</span>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadImage}
            />

            <button
              onClick={() => videoInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] text-xs font-semibold border border-[#36373B] flex items-center gap-1.5 transition-colors"
            >
              <Film className="w-3.5 h-3.5" />
              <span>+ إضافة فيديو</span>
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleUploadVideo}
            />

            <button
              onClick={() => audioInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] text-xs font-semibold border border-[#36373B] flex items-center gap-1.5 transition-colors"
            >
              <Music className="w-3.5 h-3.5" />
              <span>+ إضافة صوت</span>
            </button>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleUploadAudio}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#121316] p-1 rounded-xl border border-[#2B2C30] text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'all' ? 'bg-[#006C4C] text-white' : 'text-[#8E9192] hover:text-white'
              }`}
            >
              الكل ({clips.length})
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'video' ? 'bg-[#006C4C] text-white' : 'text-[#8E9192] hover:text-white'
              }`}
            >
              فيديو
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'image' ? 'bg-[#006C4C] text-white' : 'text-[#8E9192] hover:text-white'
              }`}
            >
              صور
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'audio' ? 'bg-[#006C4C] text-white' : 'text-[#8E9192] hover:text-white'
              }`}
            >
              صوتيات
            </button>
          </div>
        </div>

        {/* Modal Body: Two columns layout */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Clips List (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E3E2E6]">
                قائمة المقاطع المضافة على الشريط الزمني:
              </span>
              <span className="text-[11px] text-[#8E9192]">
                مؤشر التشغيل الحالي: <strong className="text-[#89F8C7] font-mono">{currentTime.toFixed(1)}s</strong>
              </span>
            </div>

            {filteredClips.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121316] border border-dashed border-[#2B2C30] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#202226] flex items-center justify-center mx-auto text-[#8E9192]">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#E3E2E6]">لا توجد مقاطع مضافة في هذا القسم بعد</h4>
                  <p className="text-xs text-[#8E9192] mt-1">
                    استخدم أزرار الإضافة بالأعلى لرفع صور أو فيديوهات أو أصوات، أو اختر من المكتبة الإسلامية أدناه
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredClips.map((clip) => {
                  const isSelected = clip.id === selectedClipId;
                  const clipDur = Math.max(0.1, clip.endTime - clip.startTime);

                  return (
                    <div
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#006C4C]/20 border-[#89F8C7] shadow-md ring-1 ring-[#89F8C7]/50'
                          : 'bg-[#202226] border-[#2B2C30] hover:border-[#3D3F43]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Media Icon Preview */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          clip.type === 'video'
                            ? 'bg-blue-950/40 border-blue-500/40 text-blue-400'
                            : clip.type === 'image'
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                            : 'bg-emerald-950/40 border-emerald-500/40 text-[#89F8C7]'
                        }`}>
                          {clip.type === 'video' ? (
                            <Film className="w-5 h-5" />
                          ) : clip.type === 'image' ? (
                            <ImageIcon className="w-5 h-5" />
                          ) : (
                            <Music className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#E3E2E6] truncate">
                            {clip.name}
                          </div>
                          <div className="text-[11px] text-[#8E9192] flex items-center gap-2 mt-0.5 font-mono">
                            <span className="text-[#89F8C7]">
                              من {clip.startTime.toFixed(1)}s إلى {clip.endTime.toFixed(1)}s
                            </span>
                            <span>·</span>
                            <span>المدة: {clipDur.toFixed(1)}s</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions: Split and Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSplitClipAtCurrentTime(clip);
                          }}
                          title={`قص المقطع عند ${currentTime.toFixed(1)}s`}
                          className="w-8 h-8 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] flex items-center justify-center transition-colors border border-[#36373B]"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClip(clip.id);
                          }}
                          title="حذف هذا المقطع نهائياً"
                          className="w-8 h-8 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center transition-colors border border-red-800/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ready Islamic Backgrounds Library to add as clips */}
            <div className="p-3.5 rounded-xl bg-[#121316] border border-[#2B2C30] space-y-2.5">
              <span className="text-xs font-bold text-[#89F8C7] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إضافة سريعة من خلفيات وزخارف الشيخ العيد:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleAddPresetAsset('مئذنة الغروب', ASSET_MINARET_SUNSET)}
                  className="p-2 rounded-lg bg-[#1A1C1E] hover:bg-[#25272B] border border-[#2B2C30] text-[11px] text-[#C4C7C8] hover:text-white flex flex-col items-center gap-1 transition-colors"
                >
                  <img src={ASSET_MINARET_SUNSET} alt="minaret" className="w-full h-12 object-cover rounded" />
                  <span>مئذنة الغروب</span>
                </button>
                <button
                  onClick={() => handleAddPresetAsset('مصحف النور', ASSET_QURAN_LIGHT)}
                  className="p-2 rounded-lg bg-[#1A1C1E] hover:bg-[#25272B] border border-[#2B2C30] text-[11px] text-[#C4C7C8] hover:text-white flex flex-col items-center gap-1 transition-colors"
                >
                  <img src={ASSET_QURAN_LIGHT} alt="quran" className="w-full h-12 object-cover rounded" />
                  <span>مصحف النور</span>
                </button>
                <button
                  onClick={() => handleAddPresetAsset('مخطوطة عتيقة', ASSET_ANTIQUE_PARCHMENT)}
                  className="p-2 rounded-lg bg-[#1A1C1E] hover:bg-[#25272B] border border-[#2B2C30] text-[11px] text-[#C4C7C8] hover:text-white flex flex-col items-center gap-1 transition-colors"
                >
                  <img src={ASSET_ANTIQUE_PARCHMENT} alt="parchment" className="w-full h-12 object-cover rounded" />
                  <span>مخطوطة عتيقة</span>
                </button>
                <button
                  onClick={() => handleAddPresetAsset('أقواس المسجد', ASSET_MOSQUE_ARCHES)}
                  className="p-2 rounded-lg bg-[#1A1C1E] hover:bg-[#25272B] border border-[#2B2C30] text-[11px] text-[#C4C7C8] hover:text-white flex flex-col items-center gap-1 transition-colors"
                >
                  <img src={ASSET_MOSQUE_ARCHES} alt="arches" className="w-full h-12 object-cover rounded" />
                  <span>أقواس المسجد</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Active Clip Property Editor & Trimming (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            {selectedClip ? (
              <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-4">
                
                <div className="flex items-center justify-between pb-2 border-b border-[#2B2C30]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#89F8C7]" />
                    <span className="text-xs font-bold text-[#E3E2E6]">
                      تعديل وقص: {selectedClip.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#121316] text-[#89F8C7] px-2 py-0.5 rounded font-mono border border-[#2B2C30]">
                    {selectedClip.type === 'video' ? 'فيديو' : selectedClip.type === 'image' ? 'صورة' : 'صوت'}
                  </span>
                </div>

                {/* 1. Trimming (القص وتحديد البداية والنهاية) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#89F8C7] flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5" />
                      <span>القص الزمني (Trim & Range):</span>
                    </span>
                    <button
                      onClick={() => handleSplitClipAtCurrentTime(selectedClip)}
                      className="text-[11px] text-[#FFDF9E] hover:underline flex items-center gap-1"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>قص عند {currentTime.toFixed(1)}s</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#121316] border border-[#2B2C30] space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#8E9192]">
                        <span>وقت البداية:</span>
                        <span className="text-[#89F8C7]">{selectedClip.startTime.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, selectedClip.endTime - 0.5)}
                        step="0.1"
                        value={selectedClip.startTime}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleUpdateClip(selectedClip.id, { startTime: val });
                        }}
                        className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                      />
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#121316] border border-[#2B2C30] space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#8E9192]">
                        <span>وقت النهاية:</span>
                        <span className="text-[#89F8C7]">{selectedClip.endTime.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min={selectedClip.startTime + 0.5}
                        max={duration}
                        step="0.1"
                        value={selectedClip.endTime}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleUpdateClip(selectedClip.id, { endTime: val });
                        }}
                        className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Visual Properties (for images and videos) */}
                {selectedClip.type !== 'audio' && (
                  <div className="space-y-3 pt-2 border-t border-[#2B2C30]">
                    <span className="text-xs font-semibold text-[#89F8C7] flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5" />
                      <span>الموضع والمقاس والشفافية:</span>
                    </span>

                    {/* Scale */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[#8E9192]">
                        <span>الحجم والتكبير (Scale):</span>
                        <span className="font-mono text-[#89F8C7]">
                          {Math.round((selectedClip.scale || 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.05"
                        value={selectedClip.scale || 1}
                        onChange={(e) => {
                          handleUpdateClip(selectedClip.id, { scale: parseFloat(e.target.value) });
                        }}
                        className="w-full accent-[#89F8C7] h-1.5 bg-[#121316] rounded-lg"
                      />
                    </div>

                    {/* Opacity */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[#8E9192]">
                        <span>الشفافية (Opacity):</span>
                        <span className="font-mono text-[#89F8C7]">
                          {Math.round((selectedClip.opacity ?? 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={selectedClip.opacity ?? 1}
                        onChange={(e) => {
                          handleUpdateClip(selectedClip.id, { opacity: parseFloat(e.target.value) });
                        }}
                        className="w-full accent-[#89F8C7] h-1.5 bg-[#121316] rounded-lg"
                      />
                    </div>

                    {/* Position X and Y */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[#8E9192]">
                          <span>الموضع الأفقي X:</span>
                          <span className="font-mono text-[#89F8C7]">{Math.round(selectedClip.positionX ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedClip.positionX ?? 50}
                          onChange={(e) => {
                            handleUpdateClip(selectedClip.id, { positionX: parseInt(e.target.value) });
                          }}
                          className="w-full accent-[#89F8C7] h-1.5 bg-[#121316] rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[#8E9192]">
                          <span>الموضع الرأسي Y:</span>
                          <span className="font-mono text-[#89F8C7]">{Math.round(selectedClip.positionY ?? 50)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedClip.positionY ?? 50}
                          onChange={(e) => {
                            handleUpdateClip(selectedClip.id, { positionY: parseInt(e.target.value) });
                          }}
                          className="w-full accent-[#89F8C7] h-1.5 bg-[#121316] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Audio Volume and Mute (for videos and audio clips) */}
                {selectedClip.type !== 'image' && (
                  <div className="space-y-2 pt-2 border-t border-[#2B2C30]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#89F8C7] flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>مستوى الصوت والكتم:</span>
                      </span>
                      <button
                        onClick={() => {
                          handleUpdateClip(selectedClip.id, { isMuted: !selectedClip.isMuted });
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          selectedClip.isMuted
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
                            : 'bg-[#121316] text-[#C4C7C8] hover:text-white'
                        }`}
                      >
                        {selectedClip.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        <span>{selectedClip.isMuted ? 'الصوت مكتوم' : 'كتم الصوت'}</span>
                      </button>
                    </div>

                    {!selectedClip.isMuted && (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[#8E9192]">
                          <span>شدة الصوت:</span>
                          <span className="font-mono text-[#89F8C7]">
                            {Math.round((selectedClip.volume ?? 1) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={selectedClip.volume ?? 1}
                          onChange={(e) => {
                            handleUpdateClip(selectedClip.id, { volume: parseFloat(e.target.value) });
                          }}
                          className="w-full accent-[#89F8C7] h-1.5 bg-[#121316] rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Delete button */}
                <div className="pt-2 border-t border-[#2B2C30] flex items-center justify-between">
                  <span className="text-[11px] text-[#8E9192]">
                    إزالة هذا المقطع من المشروع نهائياً
                  </span>
                  <button
                    onClick={() => handleDeleteClip(selectedClip.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-700/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المقطع</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#121316] border border-[#2B2C30] text-center space-y-3">
                <Sliders className="w-8 h-8 text-[#8E9192] mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-[#E3E2E6]">اختر مقطعاً لتعديله وقصه</h4>
                  <p className="text-xs text-[#8E9192] mt-1">
                    انقر على أي مقطع من القائمة باليسار لتعديل توقيته، قص البداية أو النهاية، تغيير مقاسه وحذفه
                  </p>
                </div>
              </div>
            )}

            {/* Global Video Trimming Box */}
            <div className="p-4 rounded-xl bg-[#121316] border border-[#2B2C30] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#E3E2E6] flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#89F8C7]" />
                  <span>قص وتحديد مدة الفيديو الكلية (Timeline Duration):</span>
                </span>
                <span className="font-mono text-[#89F8C7]">{draft.duration} ثانية</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="1"
                  value={draft.duration}
                  onChange={(e) => {
                    const newDur = parseInt(e.target.value) || 15;
                    onUpdateDraft({ ...draft, duration: newDur });
                  }}
                  className="flex-1 accent-[#89F8C7] h-1.5 bg-[#202226] rounded-lg"
                />
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={draft.duration}
                  onChange={(e) => {
                    const newDur = Math.max(5, parseInt(e.target.value) || 15);
                    onUpdateDraft({ ...draft, duration: newDur });
                  }}
                  className="w-16 bg-[#202226] border border-[#2B2C30] rounded-lg p-1 text-xs text-[#89F8C7] font-mono text-center outline-none"
                />
                <span className="text-xs text-[#8E9192]">ثانية</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex items-center justify-between">
          <div className="text-xs text-[#8E9192]">
            يتم حفظ التعديلات والقص والحذف تلقائياً في المشروع
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-[#89F8C7]" />
            <span>حفظ ومتابعة المونتاج</span>
          </button>
        </div>

      </div>
    </div>
  );
};
