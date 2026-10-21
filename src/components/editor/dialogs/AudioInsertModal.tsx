/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, VolumeX, Volume2, Music, Upload, Play, Square, Check, Radio } from 'lucide-react';
import { AudioTrackConfig } from '../../../types';
import { DEFAULT_AUDIO_LIBRARY } from '../../../constants/defaults';
import { audioEngine } from '../../../services/audioEngine';

interface AudioInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  muteOriginalAudio: boolean;
  onToggleMuteOriginal: (muted: boolean) => void;
  originalAudioVolume: number;
  onChangeOriginalVolume: (vol: number) => void;
  replacedAudio?: AudioTrackConfig | null;
  onSelectReplacedAudio: (track: AudioTrackConfig | null) => void;
  replacedAudioVolume: number;
  onChangeReplacedVolume: (vol: number) => void;
}

export const AudioInsertModal: React.FC<AudioInsertModalProps> = ({
  isOpen,
  onClose,
  muteOriginalAudio,
  onToggleMuteOriginal,
  originalAudioVolume,
  onChangeOriginalVolume,
  replacedAudio,
  onSelectReplacedAudio,
  replacedAudioVolume,
  onChangeReplacedVolume,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);

  const handlePreviewTrack = (track: AudioTrackConfig) => {
    if (playingTrackId === track.id) {
      audioEngine.stop();
      setPlayingTrackId(null);
    } else {
      audioEngine.playReplacedTrack(track.synthPreset, replacedAudioVolume, track.audioUrl);
      setPlayingTrackId(track.id);
    }
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      const tempAudio = new Audio();
      tempAudio.src = blobUrl;

      const finishUpload = (dur: number, audioSrc: string) => {
        const customTrack: AudioTrackConfig = {
          id: 'custom_audio_' + Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'ملف صوتي مرفوع من جهازك',
          category: 'nasheed',
          duration: dur,
          audioUrl: audioSrc,
          isCustomUpload: true,
        };
        onSelectReplacedAudio(customTrack);
        onToggleMuteOriginal(true);
        // Automatically start playing so user immediately hears it
        audioEngine.playReplacedTrack(undefined, replacedAudioVolume, audioSrc, 0);
        setPlayingTrackId(customTrack.id);
        setUploadStatus(`تم تحميل وتشغيل: ${customTrack.title}`);
        setTimeout(() => setUploadStatus(null), 4000);
      };

      tempAudio.onloadedmetadata = () => {
        const dur = Math.round(tempAudio.duration) || 60;
        finishUpload(dur, blobUrl);
      };

      tempAudio.onerror = () => {
        finishUpload(60, blobUrl);
      };
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleModalClose = () => {
    audioEngine.stop();
    setPlayingTrackId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-[#89F8C7]/40 flex items-center justify-center text-[#89F8C7]">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6]">إدارة وحجب الصوت (Mute & Replace)</h3>
              <p className="text-xs text-[#8E9192]">كتم الصوت الأصلي واستبداله بتلاوة خاشعة أو صوت هادف</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="w-8 h-8 rounded-lg bg-[#292A2E] text-[#8E9192] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {uploadStatus && (
            <div className="p-3 rounded-xl bg-[#006C4C]/30 border border-[#89F8C7]/50 flex items-center justify-between text-xs text-[#89F8C7] animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#89F8C7]" />
                <span className="font-semibold">{uploadStatus}</span>
              </div>
              <span className="text-[11px] text-[#C4C7C8]">يعمل الآن كمسار صوتي بديل</span>
            </div>
          )}

          {/* SECTION 1: Mute Original Audio Toggle (Feature requested prominently) */}
          <div className="p-4 rounded-xl bg-[#202226] border border-[#2B2C30] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  muteOriginalAudio 
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-600/40' 
                    : 'bg-[#292A2E] text-[#8E9192]'
                }`}>
                  <VolumeX className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#E3E2E6]">
                    كتم الصوت الأصلي للفيديو بالكامل
                  </h4>
                  <p className="text-xs text-[#8E9192]">
                    إلغاء مسار الصوت المسجل مع الفيديو الأصلي كلياً بمكتبة FFmpeg (-an)
                  </p>
                </div>
              </div>

              {/* M3 Toggle Switch */}
              <button
                onClick={() => onToggleMuteOriginal(!muteOriginalAudio)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                  muteOriginalAudio ? 'bg-[#006C4C]' : 'bg-[#36373B]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    muteOriginalAudio ? '-translate-x-7' : '-translate-x-1'
                  }`}
                />
              </button>
            </div>

            {!muteOriginalAudio && (
              <div className="pt-2 border-t border-[#2B2C30]/60">
                <div className="flex items-center justify-between text-xs text-[#8E9192] mb-1">
                  <span>مستوى صوت الفيديو الأصلي:</span>
                  <span className="font-mono text-[#89F8C7]">
                    {Math.round(originalAudioVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={originalAudioVolume}
                  onChange={(e) => onChangeOriginalVolume(parseFloat(e.target.value))}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                />
              </div>
            )}
          </div>

          {/* SECTION 2: Replace with Purposeful Audio Track */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#E3E2E6]">اختر مساراً صوتياً هادفاً</h4>
                <p className="text-xs text-[#8E9192]">تلاوات، أذان، أو أناشيد خالية من الآلات</p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#89F8C7] hover:text-white bg-[#121316] px-3 py-1.5 rounded-lg border border-[#2B2C30] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صوت من جهازك (MP3)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleCustomAudioUpload}
              />
            </div>

            {/* Audio Track List */}
            <div className="space-y-2">
              {DEFAULT_AUDIO_LIBRARY.map((track) => {
                const isSelected = replacedAudio?.id === track.id;
                const isPlaying = playingTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#006C4C]/15 border-[#006C4C]'
                        : 'bg-[#202226] border-[#2B2C30] hover:border-[#36373B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePreviewTrack(track)}
                        title={isPlaying ? 'إيقاف الاستماع' : 'استماع تجريبي'}
                        className="w-9 h-9 rounded-lg bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="text-xs font-bold text-[#E3E2E6]">{track.title}</div>
                        <div className="text-[11px] text-[#8E9192] flex items-center gap-2">
                          <span>{track.artist}</span>
                          <span>·</span>
                          <span>{track.duration} ثانية</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectReplacedAudio(isSelected ? null : track);
                          if (!isSelected) {
                            onToggleMuteOriginal(true); // Auto-mute original
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#006C4C] text-white shadow-sm'
                            : 'bg-[#292A2E] text-[#C4C7C8] hover:text-white'
                        }`}
                      >
                        {isSelected ? 'المسار النشط' : 'اختيار'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* If user uploaded a custom track */}
              {replacedAudio?.isCustomUpload && (
                <div className="p-3.5 rounded-xl border bg-gradient-to-r from-[#006C4C]/25 to-[#1A2E26]/40 border-[#006C4C] flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePreviewTrack(replacedAudio)}
                      title={playingTrackId === replacedAudio.id ? 'إيقاف الاستماع' : 'استماع للملف المرفوع'}
                      className="w-10 h-10 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white flex items-center justify-center transition-transform active:scale-95 shadow"
                    >
                      {playingTrackId === replacedAudio.id ? (
                        <Square className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="text-xs font-bold text-[#89F8C7] flex items-center gap-2">
                        <span>🎵 {replacedAudio.title}</span>
                        <span className="text-[10px] bg-[#006C4C] text-white px-1.5 py-0.2 rounded font-sans">
                          ملفك الصوتي
                        </span>
                      </div>
                      <div className="text-[11px] text-[#C4C7C8] flex items-center gap-2 mt-0.5">
                        <span>المدة: {Math.floor(replacedAudio.duration / 60)}:{(replacedAudio.duration % 60).toString().padStart(2, '0')}</span>
                        <span>·</span>
                        {playingTrackId === replacedAudio.id ? (
                          <span className="text-[#89F8C7] flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#89F8C7]"></span>
                            <span>قيد الاستماع الآن</span>
                          </span>
                        ) : (
                          <span className="text-[#8E9192]">جاهز للمونتاج والاستبدال</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectReplacedAudio(null)}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Replaced Volume Slider if track is selected */}
            {replacedAudio && (
              <div className="p-3 rounded-xl bg-[#121316] border border-[#2B2C30] space-y-1.5 mt-3">
                <div className="flex items-center justify-between text-xs text-[#C4C7C8]">
                  <span>مستوى صوت المسار المستبدل ({replacedAudio.title}):</span>
                  <span className="font-mono text-[#89F8C7]">
                    {Math.round(replacedAudioVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={replacedAudioVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeReplacedVolume(val);
                    audioEngine.setReplacedVolume(val);
                  }}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg"
                />
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex items-center justify-between">
          <div className="text-xs text-[#8E9192]">
            {muteOriginalAudio && replacedAudio ? (
              <span className="text-[#89F8C7]">✅ تم تجهيز الاستبدال التام للصوت</span>
            ) : muteOriginalAudio ? (
              <span className="text-amber-400">⚠️ الصوت الأصلي مكتوم بدون بديل</span>
            ) : (
              <span>الصوت الأصلي قيد العمل</span>
            )}
          </div>
          <button
            onClick={handleModalClose}
            className="px-6 py-2 rounded-xl bg-[#006C4C] text-white text-xs font-semibold hover:bg-[#00573c] transition-colors"
          >
            تطبيق وحفظ
          </button>
        </div>

      </div>
    </div>
  );
};
