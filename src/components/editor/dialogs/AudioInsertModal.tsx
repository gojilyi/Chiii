/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  VolumeX, 
  Volume2, 
  Music, 
  Upload, 
  Play, 
  Square, 
  Check, 
  Scissors, 
  Clock, 
  Mic, 
  MicOff, 
  Trash2, 
  Sparkles,
  FileAudio,
  Radio,
  AlertCircle
} from 'lucide-react';
import { AudioTrackConfig } from '../../../types';
import { audioEngine, extractMediaDuration } from '../../../services/audioEngine';

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
  onOpenAudioTrim?: () => void;
  onSyncDurationToAudio?: (dur: number) => void;
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
  onOpenAudioTrim,
  onSyncDurationToAudio,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Live microphone recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  // Stop playback when modal unmounts
  useEffect(() => {
    return () => {
      audioEngine.stop();
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else if (replacedAudio?.audioUrl) {
      audioEngine.playReplacedTrack(undefined, replacedAudioVolume, replacedAudio.audioUrl, replacedAudio.trimStart || 0);
      setIsPlaying(true);
    }
  };

  const processAudioFile = async (file: File | Blob, customTitle?: string) => {
    setIsProcessing(true);
    try {
      const realDur = await extractMediaDuration(file);
      const duration = realDur > 0 ? realDur : 30;
      const blobUrl = URL.createObjectURL(file);
      const title = customTitle || (file instanceof File ? file.name.replace(/\.[^/.]+$/, '') : `تسجيل الشيخ ${new Date().toLocaleTimeString('ar-SA')}`);

      const newTrack: AudioTrackConfig = {
        id: 'user_audio_' + Date.now(),
        title,
        artist: 'تسجيل حقيقي محمل من جهازك',
        category: 'sheikh_recording',
        duration,
        audioUrl: blobUrl,
        isCustomUpload: true,
        trimStart: 0,
        trimEnd: duration,
      };

      onSelectReplacedAudio(newTrack);
      onToggleMuteOriginal(true); // Automatically mute original video sound

      // Automatically sync video duration to this exact recording!
      if (onSyncDurationToAudio) {
        onSyncDurationToAudio(duration);
      }

      // Automatically play so user immediately verifies
      audioEngine.playReplacedTrack(undefined, replacedAudioVolume, blobUrl, 0);
      setIsPlaying(true);

      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const timeFormatted = mins > 0 ? `${mins} دقيقة و ${secs} ثانية` : `${secs} ثانية`;

      setUploadStatus(`تم تحميل "${title}" بنجاح، وضبط مدة الفيديو تلقائياً لتطابق الصوت (${timeFormatted})`);
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (err: any) {
      console.error('Audio upload failed:', err);
      setUploadStatus('حدث خطأ أثناء قراءة ملف الصوت، يرجى تجربة ملف آخر بصيغة MP3 أو M4A.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('audio/') || /\.(mp3|m4a|wav|aac|ogg|opus|flac|amr)$/i.test(file.name))) {
      processAudioFile(file);
    }
  };

  // Live microphone recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioFile(audioBlob, `تسجيل صوتي مباشر (${new Date().toLocaleTimeString('ar-EG')})`);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setUploadStatus('تعذر الوصول إلى الميكروفون، يرجى منح الإذن أو رفع ملف مسجل مسبقاً.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
    }
  };

  const handleRemoveTrack = () => {
    audioEngine.stop();
    setIsPlaying(false);
    onSelectReplacedAudio(null);
    setUploadStatus('تمت إزالة التسجيل الصوتي.');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const handleModalClose = () => {
    audioEngine.stop();
    setIsPlaying(false);
    if (isRecording) {
      handleStopRecording();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2C30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-[#89F8C7]/40 flex items-center justify-center text-[#89F8C7]">
              <FileAudio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E3E2E6]">رفع وتسجيل صوت الشيخ (Audio Studio)</h3>
              <p className="text-xs text-[#8E9192]">رفع ملف صوتي حقيقي وضبط مدة الفيديو حسب التسجيل تلقائياً</p>
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
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Notification / Success Status */}
          {uploadStatus && (
            <div className="p-3.5 rounded-xl bg-[#006C4C]/25 border border-[#89F8C7]/50 flex items-center justify-between text-xs text-[#89F8C7] animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#89F8C7] shrink-0" />
                <span className="font-semibold leading-relaxed">{uploadStatus}</span>
              </div>
            </div>
          )}

          {/* SECTION 1: Automatic Duration Notice (Addressing user screenshot) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#006C4C]/20 to-[#17191C] border border-[#89F8C7]/30 flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#89F8C7] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#89F8C7]">مدة الفيديو تتحدد تلقائياً حسب طول الصوت:</span>
              <p className="text-[#C4C7C8] leading-relaxed">
                تم إلغاء شريط التحديد اليدوي؛ بمجرد رفع صوت الشيخ، يصبح طول الفيديو مطابقاً تماماً لمدة التسجيل وينتهي تلقائياً عند نهايته دون تقطيع أو شاشة سوداء.
              </p>
            </div>
          </div>

          {/* SECTION 2: Prominent Upload Area (Fixed for Mobile & All Extensions) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#E3E2E6] flex items-center justify-between">
              <span>اختر ملف صوت الشيخ من جهازك أو الهاتف:</span>
              <span className="text-[11px] text-[#89F8C7] font-normal">MP3, M4A, WAV, AAC, OPUS, OGG</span>
            </label>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                isDragging 
                  ? 'border-[#89F8C7] bg-[#89F8C7]/10 scale-[1.01]' 
                  : 'border-[#36373B] bg-[#121316] hover:border-[#89F8C7]/60 hover:bg-[#1A1C1E]'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#006C4C]/20 border border-[#89F8C7]/40 flex items-center justify-center text-[#89F8C7] shadow-inner">
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-[#89F8C7] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <div className="text-center space-y-1">
                <div className="text-sm font-bold text-[#E3E2E6]">
                  {isProcessing ? 'جاري فك تشفير وقراءة مدة الصوت بدقة...' : 'اضغط لاختيار ملف الصوت من الجهاز أو الجوال'}
                </div>
                <p className="text-xs text-[#8E9192]">
                  أو اسحب وأفلت الملف الصوتي هنا مباشرة
                </p>
              </div>

              <button
                type="button"
                className="mt-1 px-5 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-bold transition shadow-md flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>استعراض ملفات الصوت</span>
              </button>

              {/* Hidden Multi-format Audio Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.opus,.flac,.amr,audio/mpeg,audio/wav,audio/x-m4a,audio/aac,audio/ogg,audio/flac,audio/mp4"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            {/* Quick Live Microphone Recording Alternative */}
            <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2B2C30] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isRecording ? 'bg-red-950/70 text-red-400 border border-red-500/50 animate-pulse' : 'bg-[#292A2E] text-[#8E9192]'
                }`}>
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#E3E2E6]">
                    {isRecording ? 'جاري التسجيل الحي للمقطع...' : 'أو سجل صوت الشيخ مباشرة عبر الميكروفون'}
                  </div>
                  <div className="text-[11px] text-[#8E9192]">
                    {isRecording ? (
                      <span className="text-red-400 font-mono font-bold">
                        المدة: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    ) : (
                      'تسجيل صوت فوري من ميكروفون الجوال أو الكمبيوتر'
                    )}
                  </div>
                </div>
              </div>

              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>إيقاف وحفظ</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="px-4 py-2 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] border border-[#36373B] text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>بدء التسجيل</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 3: Current Selected Track Display */}
          {replacedAudio && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#006C4C]/25 to-[#1A2E26]/40 border border-[#006C4C] space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    title={isPlaying ? 'إيقاف مؤقت' : 'استماع'}
                    className="w-12 h-12 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0"
                  >
                    {isPlaying ? (
                      <Square className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    )}
                  </button>

                  <div>
                    <div className="text-sm font-bold text-[#89F8C7] flex items-center gap-2">
                      <span>{replacedAudio.title}</span>
                      <span className="text-[10px] bg-[#006C4C] text-white px-2 py-0.5 rounded-full font-mono">
                        الملف النشط
                      </span>
                    </div>
                    <div className="text-xs text-[#C4C7C8] flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[#89F8C7]">
                        ⏱️ الطول: {Math.floor(replacedAudio.duration / 60)}:{(replacedAudio.duration % 60).toString().padStart(2, '0')} ({replacedAudio.duration} ثانية)
                      </span>
                      <span>·</span>
                      {isPlaying ? (
                        <span className="text-[#89F8C7] flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-[#89F8C7]"></span>
                          <span>قيد الاستماع الآن</span>
                        </span>
                      ) : (
                        <span className="text-[#8E9192]">جاهز للدمج مع الفيديو</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRemoveTrack}
                  title="حذف هذا المسار الصوتي"
                  className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5 pt-1 border-t border-[#2B2C30]">
                <div className="flex items-center justify-between text-xs text-[#C4C7C8]">
                  <span>مستوى صوت التسجيل في الفيديو:</span>
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
                  className="w-full accent-[#89F8C7] h-2 bg-[#2B2C30] rounded-lg cursor-pointer"
                />
              </div>

              {/* Audio Trim & Sync Actions */}
              <div className="pt-2 border-t border-[#2B2C30] flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-[#8E9192]">
                  {replacedAudio.trimStart !== undefined && replacedAudio.trimEnd !== undefined && replacedAudio.trimEnd > 0 ? (
                    <span className="text-[#89F8C7] font-semibold">
                      ✂️ مقصوص من {replacedAudio.trimStart.toFixed(1)}s إلى {replacedAudio.trimEnd.toFixed(1)}s (المدة: {(replacedAudio.trimEnd - replacedAudio.trimStart).toFixed(1)}s)
                    </span>
                  ) : (
                    <span>يتم إنتاج الفيديو بكامل طول هذا الصوت</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {onOpenAudioTrim && (
                    <button
                      onClick={() => {
                        handleModalClose();
                        onOpenAudioTrim();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-[#89F8C7] border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>قص مقطع من الصوت</span>
                    </button>
                  )}

                  {onSyncDurationToAudio && (
                    <button
                      onClick={() => {
                        const targetDur = (replacedAudio.trimEnd && replacedAudio.trimStart !== undefined && replacedAudio.trimEnd > replacedAudio.trimStart)
                          ? (replacedAudio.trimEnd - replacedAudio.trimStart)
                          : replacedAudio.duration;
                        onSyncDurationToAudio(targetDur);
                        setUploadStatus(`تمت مزامنة مدة الفيديو مع هذا الصوت (${targetDur.toFixed(1)} ثانية)`);
                        setTimeout(() => setUploadStatus(null), 3500);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#89F8C7]" />
                      <span>تحديث المزامنة</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SECTION 4: Original Video Audio Muting */}
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
                  <h4 className="text-xs font-bold text-[#E3E2E6]">
                    كتم الصوت الأصلي للفيديو
                  </h4>
                  <p className="text-[11px] text-[#8E9192]">
                    إلغاء أي ضجيج مرافق للفيديو الأصلي لصفاء تسجيل الشيخ
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
                <div className="flex items-center justify-between text-[11px] text-[#8E9192] mb-1">
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

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B2C30] flex items-center justify-between bg-[#17191C]">
          <div className="text-xs text-[#8E9192]">
            {replacedAudio ? (
              <span className="text-[#89F8C7] font-semibold">
                ✅ المسار جاهز: {replacedAudio.title} ({replacedAudio.duration} ثانية)
              </span>
            ) : (
              <span>لم يتم اختيار صوت بديل بعد</span>
            )}
          </div>
          <button
            onClick={handleModalClose}
            className="px-6 py-2 rounded-xl bg-[#006C4C] text-white text-xs font-bold hover:bg-[#00573c] transition-colors shadow-sm"
          >
            تأكيد والعودة للمونتاج
          </button>
        </div>

      </div>
    </div>
  );
};
