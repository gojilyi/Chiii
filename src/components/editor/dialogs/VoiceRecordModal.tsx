/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Check, X, AlertCircle, RotateCcw } from 'lucide-react';
import { ProjectDraft, AudioTrackConfig } from '../../../types';

interface VoiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVoiceTrack: (track: AudioTrackConfig) => void;
}

export const VoiceRecordModal: React.FC<VoiceRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveVoiceTrack,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [title, setTitle] = useState('تسجيل صوتي خاص');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecordingCleanup();
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
      setRecordedBlob(null);
      setRecordedUrl(null);
      setRecordDuration(0);
      setIsPlayingPreview(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      setRecordedBlob(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 200);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setErrorMsg('تعذر الوصول إلى الميكروفون. يرجى التأكد من منح الإذن للمتصفح.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePreview = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(() => setIsPlayingPreview(false));
    }
  };

  const handleSave = () => {
    if (!recordedUrl || !recordedBlob) return;
    const finalTrack: AudioTrackConfig = {
      id: `voice_${Date.now()}`,
      title: title || 'تسجيل صوتي',
      artist: 'تسجيل المستخدم المباشر',
      category: 'sheikh_recording',
      duration: Math.max(1, recordDuration),
      trimStart: 0,
      trimEnd: Math.max(1, recordDuration),
      audioUrl: recordedUrl,
    };
    onSaveVoiceTrack(finalTrack);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#242424] border border-[#383838] rounded-2xl w-full max-w-md p-5 text-right shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Mic className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">تسجيل صوتي مباشر (Voice)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#333333] hover:bg-[#444444] text-[#A0A0A0] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Recording Visualizer & Center Button */}
        <div className="flex flex-col items-center justify-center py-6 bg-[#1a1a1a] rounded-xl border border-[#333333] space-y-4">
          <div className="text-2xl font-mono font-bold text-[#F5B800] tabular-nums">
            {Math.floor(recordDuration / 60).toString().padStart(2, '0')}:
            {(recordDuration % 60).toString().padStart(2, '0')}
          </div>

          {/* Central Mic Button */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center shadow-lg transition active:scale-95 group"
            >
              <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1">ابدأ</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-red-700 animate-pulse text-white flex flex-col items-center justify-center shadow-lg transition active:scale-95"
            >
              <Square className="w-7 h-7 fill-current" />
              <span className="text-[10px] font-bold mt-1">إيقاف</span>
            </button>
          )}

          <p className="text-xs text-[#888888]">
            {isRecording ? 'جاري التسجيل الآن... اضغط لإيقافه' : 'اضغط على زر الميكروفون لبدء التسجيل'}
          </p>
        </div>

        {/* Preview of recording */}
        {recordedUrl && (
          <div className="space-y-3 bg-[#1e1e1e] p-3 rounded-xl border border-[#333333]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5B800]">معاينة التسجيل الصوتي</span>
              <button
                onClick={togglePreview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5B800] hover:bg-[#e0a800] text-black text-xs font-bold transition"
              >
                {isPlayingPreview ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف المعاينة</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>استماع</span>
                  </>
                )}
              </button>
            </div>

            <audio
              ref={previewAudioRef}
              src={recordedUrl}
              onEnded={() => setIsPlayingPreview(false)}
              className="hidden"
            />

            <div>
              <label className="block text-[11px] text-[#A0A0A0] mb-1">اسم المقطع الصوتي:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F5B800]"
                placeholder="تسجيل تلاوة أو تعليق"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#333333]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#333333] hover:bg-[#444444] text-[#C4C7C8] text-xs font-semibold transition"
          >
            إلغاء
          </button>
          <button
            disabled={!recordedUrl}
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#F5B800] hover:bg-[#e0a800] disabled:opacity-40 disabled:pointer-events-none text-black text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>إدراج في المشروع</span>
          </button>
        </div>

      </div>
    </div>
  );
};
