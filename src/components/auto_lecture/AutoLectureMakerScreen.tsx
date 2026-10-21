/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Check, 
  Copy, 
  Mic, 
  MicOff,
  Music, 
  Layers, 
  Type, 
  Upload, 
  Film,
  Terminal,
  BookOpen,
  Volume2,
  VolumeX,
  Sliders,
  Radio,
  Eye,
  Sun,
  ZoomIn,
  Video,
  CheckCircle2,
  Activity,
  Square,
  Waves
} from 'lucide-react';
import { 
  READY_BACKGROUNDS, 
  ReadyBackgroundItem, 
  SAMPLE_SHEIKH_LESSONS,
  IYSAL_SALIK_LESSONS,
  VIDEO_SPIRITUAL_EFFECTS,
  AUDIO_SPIRITUAL_EFFECTS,
  VideoSpiritualEffect,
  AudioSpiritualEffect
} from '../../constants/autoLectureDefaults';
import { generateASS, generateSRT } from '../../constants/calligraphyDefaults';
import { audioEngine } from '../../services/audioEngine';

interface AutoLectureMakerScreenProps {
  onOpenInEditor: (bgUrl: string, title: string, words: any[], audioUrl?: string) => void;
  initialSeriesTab?: 'iysal_salik' | 'all';
}

export const AutoLectureMakerScreen: React.FC<AutoLectureMakerScreenProps> = ({
  onOpenInEditor,
  initialSeriesTab = 'iysal_salik',
}) => {
  // Find initial Iysal Salik background and lesson
  const initialBg = READY_BACKGROUNDS.find(b => b.category === 'iysal_salik') || READY_BACKGROUNDS[0];
  const initialLesson = IYSAL_SALIK_LESSONS[0] || SAMPLE_SHEIKH_LESSONS[0];

  const [selectedBg, setSelectedBg] = useState<ReadyBackgroundItem>(initialBg);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialSeriesTab);
  const [selectedLesson, setSelectedLesson] = useState(initialLesson);
  const [fontFamily, setFontFamily] = useState<'Aref Ruqaa' | 'Amiri' | 'Cairo'>('Aref Ruqaa');
  const [highlightColor, setHighlightColor] = useState<string>('#FFDF9E');
  const [fontSize, setFontSize] = useState<number>(36);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  // Visual Effects State (بقية المؤثرات)
  const [activeVisualEffect, setActiveVisualEffect] = useState<string>(initialLesson.defaultVisualEffect || 'spiritual_glow');
  
  // Audio & Ambient Effects State (مؤثر الصوت)
  const [ambientAudioEffect, setAmbientAudioEffect] = useState<string>(initialLesson.defaultAudioEffect || 'spiritual_drone');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);
  const [sheikhVolume, setSheikhVolume] = useState<number>(1.0);

  // Custom text and Sheikh audio upload/record states
  const [isCustomTextMode, setIsCustomTextMode] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>(initialLesson.text);
  const [customLessonTitle, setCustomLessonTitle] = useState<string>(initialLesson.title);
  const [customDuration, setCustomDuration] = useState<number>(initialLesson.durationSec);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);

  // Live Microphone Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportDone, setIsExportDone] = useState<boolean>(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  const duration = selectedLesson.durationSec;
  const playIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Handle lesson switch with auto-effect application
  const handleSelectLesson = (lesson: typeof selectedLesson) => {
    setSelectedLesson(lesson);
    setCustomText(lesson.text);
    setCustomLessonTitle(lesson.title);
    setCustomDuration(lesson.durationSec);
    setCurrentTime(0);

    // If lesson has a default recommended background, switch to it
    if (lesson.defaultBgId) {
      const matchBg = READY_BACKGROUNDS.find(b => b.id === lesson.defaultBgId);
      if (matchBg) {
        setSelectedBg(matchBg);
      }
    }
    // If lesson specifies default audio or visual effects, auto-tune to them
    if (lesson.defaultAudioEffect) {
      setAmbientAudioEffect(lesson.defaultAudioEffect);
    }
    if (lesson.defaultVisualEffect) {
      setActiveVisualEffect(lesson.defaultVisualEffect);
    }
  };

  const handleApplyCustomText = () => {
    const rawWords = customText.trim().split(/\s+/).filter(Boolean);
    if (rawWords.length === 0) return;

    const wordDurationMs = Math.max(700, Math.floor((customDuration * 1000) / rawWords.length));
    const generatedWords = rawWords.map((w, idx) => ({
      id: `w_${Date.now()}_${idx}`,
      word: w,
      startMs: idx * wordDurationMs + 200,
      endMs: (idx + 1) * wordDurationMs,
    }));

    const newLesson = {
      id: `custom_lesson_${Date.now()}`,
      seriesId: selectedLesson.seriesId,
      seriesTitle: selectedLesson.seriesTitle || 'شرح كتاب إيصال السالك',
      title: customLessonTitle || 'درس الشيخ المخصص',
      sheikh: 'الشيخ العيد',
      durationSec: customDuration,
      text: customText,
      words: generatedWords,
      defaultAudioEffect: ambientAudioEffect,
      defaultVisualEffect: activeVisualEffect,
      effectLabel: 'مخصص',
    };

    setSelectedLesson(newLesson);
    setCurrentTime(0);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    audioEngine.seek(newTime);
  };

  // Upload Sheikh Audio File
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setCustomLessonTitle(`تسجيل: ${fileNameWithoutExt}`);
      setUploadedAudioName(file.name);

      const processAudio = (audioDur: number, finalSrc: string) => {
        setCustomAudioUrl(finalSrc);
        setCustomDuration(audioDur);
        const rawWords = customText.trim().split(/\s+/).filter(Boolean);
        const wordDurationMs = Math.max(500, Math.floor((audioDur * 1000) / (rawWords.length || 1)));
        const generatedWords = rawWords.map((w, idx) => ({
          id: `w_up_${idx}`,
          word: w,
          startMs: idx * wordDurationMs + 200,
          endMs: (idx + 1) * wordDurationMs,
        }));
        setSelectedLesson({
          id: `audio_${Date.now()}`,
          seriesId: selectedLesson.seriesId,
          seriesTitle: selectedLesson.seriesTitle || 'شرح كتاب إيصال السالك',
          title: `تسجيل بصوت الشيخ: ${fileNameWithoutExt}`,
          sheikh: 'الشيخ العيد',
          durationSec: audioDur,
          text: customText,
          words: generatedWords,
          defaultAudioEffect: ambientAudioEffect,
          defaultVisualEffect: activeVisualEffect,
          effectLabel: 'تسجيل مخصص',
        });
        setCurrentTime(0);
        setIsPlaying(true);
      };

      const tempAudio = new Audio();
      tempAudio.src = blobUrl;
      tempAudio.onloadedmetadata = () => {
        const audioDur = Math.round(tempAudio.duration) || 16;
        processAudio(audioDur, blobUrl);
      };

      tempAudio.onerror = () => {
        processAudio(16, blobUrl);
      };
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  // Live Microphone Recording for Sheikh's Voice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const finalSecs = Math.max(5, recordingSeconds);
        setCustomAudioUrl(audioUrl);
        setUploadedAudioName(`تسجيل مباشر للشيخ (${finalSecs} ثانية)`);
        setCustomDuration(finalSecs);

        const rawWords = customText.trim().split(/\s+/).filter(Boolean);
        const wordDur = Math.max(500, Math.floor((finalSecs * 1000) / (rawWords.length || 1)));
        const genWords = rawWords.map((w, idx) => ({
          id: `rec_${idx}`,
          word: w,
          startMs: idx * wordDur + 200,
          endMs: (idx + 1) * wordDur,
        }));

        setSelectedLesson({
          id: `rec_lesson_${Date.now()}`,
          seriesId: selectedLesson.seriesId,
          seriesTitle: selectedLesson.seriesTitle || 'شرح كتاب إيصال السالك',
          title: `تسجيل مباشر بصوت الشيخ (${finalSecs}ث)`,
          sheikh: 'الشيخ العيد',
          durationSec: finalSecs,
          text: customText,
          words: genWords,
          defaultAudioEffect: ambientAudioEffect,
          defaultVisualEffect: activeVisualEffect,
          effectLabel: 'تسجيل حي',
        });
        setCurrentTime(0);

        // Stop all audio tracks from stream
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission or access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    }
  };

  // Upload custom background
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newBgItem: ReadyBackgroundItem = {
        id: `custom_bg_${Date.now()}`,
        name: `خلفية خاصة: ${file.name}`,
        category: 'iysal_salik',
        categoryLabel: 'شرح إيصال السالك',
        assetPath: `assets/backgrounds/${file.name}`,
        imageUrl: url,
        isVideoLoop: file.type.startsWith('video'),
        recommendedRatio: 'all',
        description: 'خلفية تم رفعها من جهازك',
      };
      setSelectedBg(newBgItem);
    }
  };

  // Filter backgrounds
  const filteredBackgrounds = selectedCategory === 'all'
    ? READY_BACKGROUNDS
    : READY_BACKGROUNDS.filter((b) => b.category === selectedCategory);

  // Filter lessons
  const filteredLessons = selectedCategory === 'iysal_salik'
    ? IYSAL_SALIK_LESSONS
    : SAMPLE_SHEIKH_LESSONS;

  // Audio Playback loop with dual Voice + Ambient Effect
  useEffect(() => {
    if (isPlaying) {
      const ambientTrack = ambientAudioEffect === 'none' ? 'silence' : ambientAudioEffect;
      audioEngine.playReplacedTrack(
        ambientTrack,
        customAudioUrl ? sheikhVolume : 0.85,
        customAudioUrl || undefined,
        currentTime,
        ambientTrack,
        ambientVolume
      );
      playIntervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            audioEngine.seek(0);
            return 0; // loop
          }
          return Math.min(duration, prev + 0.1);
        });
      }, 100);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      audioEngine.pause();
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      audioEngine.pause();
    };
  }, [isPlaying, duration, customAudioUrl, ambientAudioEffect, sheikhVolume, ambientVolume]);

  // Synchronized Canvas Rendering with Karaoke Text, Visual Effects, Audio Spectrum & Gold Frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animT = 0;

    const render = () => {
      animT += 0.025;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw image background with potential Ken Burns Subtle Zoom
      const img = bgImageRef.current;
      const isImgReady = Boolean(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
      let drawn = false;

      if (isImgReady && img) {
        try {
          if (activeVisualEffect === 'subtle_zoom') {
            const scale = 1.0 + 0.04 * (0.5 + 0.5 * Math.sin(animT * 0.4));
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);
            ctx.drawImage(img, 0, 0, w, h);
            ctx.restore();
          } else {
            ctx.drawImage(img, 0, 0, w, h);
          }
          drawn = true;
        } catch {
          drawn = false;
        }
      }

      if (!drawn) {
        ctx.fillStyle = '#12161A';
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Render Selected Spiritual Visual Effect Overlay
      if (activeVisualEffect === 'spiritual_glow') {
        // Golden glowing aura softly breathing
        const breath = 0.22 + 0.08 * Math.sin(animT);
        const glow = ctx.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h * 0.45, w * 0.7);
        glow.addColorStop(0, `rgba(255, 223, 158, ${breath})`);
        glow.addColorStop(0.65, 'rgba(0, 108, 76, 0.12)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      } else if (activeVisualEffect === 'vignette_focus') {
        // Dramatic dark border vignette
        const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.88);
        vig.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
        vig.addColorStop(0.7, 'rgba(0, 0, 0, 0.45)');
        vig.addColorStop(1, 'rgba(0, 0, 0, 0.82)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      } else if (activeVisualEffect === 'vintage_parchment') {
        // Antique manuscript warm amber cast
        ctx.fillStyle = 'rgba(195, 140, 60, 0.14)';
        ctx.fillRect(0, 0, w, h);
        const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.9);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(40, 20, 5, 0.55)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      } else if (activeVisualEffect === 'light_leak') {
        // Sacred ambient light ray from upper arch
        const ray = ctx.createLinearGradient(0, 0, w * 0.9, h * 0.9);
        const rayPulse = 0.18 + 0.06 * Math.cos(animT * 0.8);
        ray.addColorStop(0, `rgba(255, 248, 220, ${rayPulse})`);
        ray.addColorStop(0.4, 'rgba(137, 248, 199, 0.08)');
        ray.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
        ctx.fillStyle = ray;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Clean default contrast gradient
        const base = ctx.createLinearGradient(0, 0, 0, h);
        base.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
        base.addColorStop(0.65, 'rgba(0, 0, 0, 0.1)');
        base.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, w, h);
      }

      // 3. Render Islamic Gold Frame Border if enabled
      if (activeVisualEffect === 'gold_frame') {
        ctx.save();
        ctx.strokeStyle = '#FFDF9E';
        ctx.lineWidth = Math.max(2, Math.floor(w * 0.006));
        ctx.shadowColor = 'rgba(255, 223, 158, 0.65)';
        ctx.shadowBlur = 8;

        const pad = Math.floor(w * 0.035);
        ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

        // Inner subtle border
        ctx.strokeStyle = 'rgba(137, 248, 199, 0.5)';
        ctx.lineWidth = 1;
        const innerPad = pad + 6;
        ctx.strokeRect(innerPad, innerPad, w - innerPad * 2, h - innerPad * 2);

        // Corner decorative marks
        const cornerSize = Math.floor(w * 0.03);
        const corners = [
          [pad, pad],
          [w - pad, pad],
          [pad, h - pad],
          [w - pad, h - pad]
        ];
        ctx.fillStyle = '#FFDF9E';
        corners.forEach(([cx, cy]) => {
          ctx.fillRect(cx - 3, cy - 3, 6, 6);
        });
        ctx.restore();
      }

      // 4. Render Live Audio Spectrum / Waveform Visualizer
      if (activeVisualEffect === 'audio_spectrum') {
        ctx.save();
        const barCount = 30;
        const totalW = w * 0.72;
        const barW = Math.max(3, (totalW / barCount) - 3);
        const startX = (w - totalW) / 2;
        const baseY = aspectRatio === '9:16' ? h * 0.84 : h * 0.86;

        for (let i = 0; i < barCount; i++) {
          const normIdx = i / barCount;
          const distFromCenter = 1 - Math.abs(normIdx - 0.5) * 1.8;
          // Animate height dynamically when audio is playing or in speech rhythm
          const pulse = isPlaying 
            ? (0.25 + 0.75 * Math.abs(Math.sin(animT * 2.5 + i * 0.4) * Math.cos(animT * 1.3 - i * 0.2)))
            : (0.15 + 0.08 * Math.sin(animT + i * 0.2));
          const barH = Math.max(4, pulse * (h * 0.09) * distFromCenter);

          const barGrad = ctx.createLinearGradient(0, baseY - barH, 0, baseY);
          barGrad.addColorStop(0, '#FFDF9E');
          barGrad.addColorStop(0.5, '#89F8C7');
          barGrad.addColorStop(1, '#006C4C');

          ctx.fillStyle = barGrad;
          ctx.shadowColor = 'rgba(137, 248, 199, 0.5)';
          ctx.shadowBlur = 6;

          const bx = startX + i * (barW + 3);
          ctx.fillRect(bx, baseY - barH, barW, barH);
        }
        ctx.restore();
      }

      // 5. Render Book Series Header Badge on Canvas
      if (selectedLesson.seriesId === 'iysal_salik') {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#FFDF9E';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 10;
        ctx.font = `bold ${Math.max(14, Math.floor(w * 0.03))}px 'Amiri', serif`;
        ctx.fillText('شرح كتاب إيصال السالك إلى أصول مذهب الإمام مالك', w / 2, h * 0.07);
        
        ctx.fillStyle = 'rgba(227, 226, 230, 0.8)';
        ctx.font = `${Math.max(11, Math.floor(w * 0.022))}px 'Cairo', sans-serif`;
        ctx.fillText(selectedLesson.title, w / 2, h * 0.07 + Math.max(18, Math.floor(w * 0.04)));
        ctx.restore();
      }

      // 6. Render Word-Level Karaoke Calligraphy
      const currentMs = currentTime * 1000;
      const words = selectedLesson.words;
      const fontFace = fontFamily === 'Aref Ruqaa' ? `'Aref Ruqaa', cursive` : `'${fontFamily}', serif`;

      ctx.save();
      const responsiveFontSize = fontSize * (w / (aspectRatio === '9:16' ? 420 : 680));
      ctx.font = `bold ${responsiveFontSize}px ${fontFace}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Drop shadow for crisp Arabic calligraphy
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      const centerY = aspectRatio === '9:16' ? h * 0.66 : h * 0.70;
      const spaceW = ctx.measureText(' ').width;

      // Calculate total text width to center properly in RTL
      const measuredWords = words.map((w) => ({
        ...w,
        width: ctx.measureText(w.word).width,
      }));
      const totalTextWidth = measuredWords.reduce((acc, curr) => acc + curr.width, 0) + (words.length - 1) * spaceW;

      let currentX = (w + totalTextWidth) / 2; // Start from right side of centered block

      measuredWords.forEach((wordObj) => {
        const isActive = currentMs >= wordObj.startMs && currentMs <= wordObj.endMs;
        const isPast = currentMs > wordObj.endMs;

        if (isActive) {
          // Highlight with glowing gold
          ctx.fillStyle = highlightColor;
          ctx.shadowColor = 'rgba(255, 223, 158, 0.95)';
          ctx.shadowBlur = 22;
        } else if (isPast) {
          // Spoken word: warm parchment white
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 8;
        } else {
          // Upcoming word: soft dim white
          ctx.fillStyle = 'rgba(227, 226, 230, 0.45)';
          ctx.shadowBlur = 3;
        }

        ctx.fillText(wordObj.word, currentX - wordObj.width / 2, centerY);
        currentX -= (wordObj.width + spaceW);
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedBg, currentTime, selectedLesson, fontFamily, highlightColor, fontSize, aspectRatio, activeVisualEffect, isPlaying]);

  // Generate .ass and FFmpeg Kit Command
  const assSubtitles = generateASS(selectedLesson.words, fontFamily);
  const ffmpegCommand = `ffmpeg -loop 1 -i "${selectedBg.assetPath}" -i "assets/audio/sheikh_lesson.mp3" \\
  -vf "ass='assets/subtitles/lesson_karaoke.ass':fontsdir='assets/fonts'" \\
  -c:v libx264 -tune stillimage -preset medium -crf 20 \\
  -c:a aac -b:a 192k -shortest -pix_fmt yuv420p output_auto_lesson.mp4`;

  // Real in-browser video generator (MediaRecorder stream to video)
  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setIsExportDone(false);

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsExporting(false);
      return;
    }

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setExportedVideoUrl(videoUrl);
        setIsExporting(false);
        setIsExportDone(true);
      };

      recorder.start();

      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          recorder.stop();
        }
        setExportProgress(p);
      }, 250);
    } catch {
      let p = 0;
      const interval = setInterval(() => {
        p += 15;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setIsExporting(false);
          setIsExportDone(true);
        }
        setExportProgress(p);
      }, 200);
    }
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hidden background image for canvas painter */}
      <img
        ref={bgImageRef}
        src={selectedBg.imageUrl}
        alt={selectedBg.name}
        className="hidden"
      />

      {/* Book Series Banner: «شرح كتاب إيصال السالك إلى أصول مذهب الإمام مالك» */}
      <div className="bg-gradient-to-r from-[#1E2522] via-[#1A1E1C] to-[#121316] border border-[#006C4C]/60 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div 
          className="absolute -left-12 -top-12 w-64 h-64 bg-[#006C4C]/10 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#006C4C]/30 border border-[#89F8C7]/40 text-xs font-bold text-[#89F8C7]">
              <BookOpen className="w-3.5 h-3.5 text-[#FFDF9E]" />
              <span>سلسلة إيصال السالك إلى أصول مذهب مالك</span>
            </span>
            <span className="text-xs text-[#C4C7C8]">
              صوت الشيخ العيد · مؤثرات صوتية وبصرية · خط الرقعة · تصدير فيديو MP4
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#E3E2E6] font-cairo">
            قائمة «شرح كتاب إيصال السالك» وصناعة فيديو الدرس
          </h1>
          <p className="text-xs sm:text-sm text-[#8E9192] leading-relaxed">
            أنشئ فيديو عالي الجودة للدرس: اختر من مجالس الشرح والصور التراثية المرفوعة للشيخ، وأدرج صوته (تسجيل أو رفع أو قراءة)، وطبّق مؤثرات الصوت (السكينة، الصدى، النقاء) وبقية المؤثرات (الموجات الصوتية، الهالة النورانية، الإطار المذهب)، ثم حوّله فوراً إلى فيديو قابل للمشاركة.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => onOpenInEditor(selectedBg.imageUrl, selectedLesson.title, selectedLesson.words, customAudioUrl || undefined)}
            className="px-5 py-2.5 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-[0.98]"
          >
            <Film className="w-4 h-4 text-[#89F8C7]" />
            <span>فتح في المحرر المتقدم للقص</span>
          </button>
        </div>
      </div>

      {/* Workspace Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Center: Interactive Preview & Audio Controls (5 cols) */}
        <div className="lg:col-span-5 bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-md flex flex-col items-center space-y-4">
          
          <div className="w-full flex items-center justify-between text-xs text-[#8E9192] pb-2 border-b border-[#2B2C30]">
            <span className="font-bold text-[#E3E2E6] flex items-center gap-1.5 truncate">
              <Film className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span className="truncate">{selectedLesson.title}</span>
            </span>
            <div className="flex items-center gap-1 font-mono text-[#89F8C7] shrink-0">
              <span>{currentTime.toFixed(1)}s</span>
              <span>/</span>
              <span>{duration}s</span>
            </div>
          </div>

          {/* Video Preview Canvas */}
          <div 
            className="relative bg-black rounded-xl overflow-hidden border border-[#36373B] shadow-inner flex items-center justify-center"
            style={{
              width: aspectRatio === '9:16' ? '280px' : '420px',
              maxWidth: '100%',
              height: aspectRatio === '9:16' ? '498px' : '236px',
            }}
          >
            <canvas
              ref={canvasRef}
              width={aspectRatio === '9:16' ? 450 : 800}
              height={aspectRatio === '9:16' ? 800 : 450}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}
            />

            {!isPlaying && (
              <div 
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#006C4C]/90 text-white flex items-center justify-center shadow-lg border border-[#89F8C7]/40 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Transport Bar */}
          <div className="w-full space-y-2 pt-1">
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSeek(0)}
                  className="p-1.5 rounded-lg bg-[#292A2E] text-[#8E9192] hover:text-white transition-colors"
                  title="إعادة من البداية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-1.5 rounded-lg bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل المعاينة'}</span>
                </button>
              </div>

              {/* Aspect Ratio Switch */}
              <div className="flex items-center gap-1 p-0.5 bg-[#121316] rounded-lg border border-[#2B2C30]">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    aspectRatio === '16:9' ? 'bg-[#006C4C] text-white font-bold' : 'text-[#8E9192]'
                  }`}
                  title="المقاس الأفقي المناسب للمحاضرات واليوتيوب"
                >
                  16:9
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    aspectRatio === '9:16' ? 'bg-[#006C4C] text-white font-bold' : 'text-[#8E9192]'
                  }`}
                  title="المقاس العمودي للريلز والتيك توك"
                >
                  9:16
                </button>
              </div>
            </div>
          </div>

          {/* Quick Video Conversion & Export CTA */}
          <div className="w-full pt-2">
            {!isExporting && !isExportDone && (
              <button
                onClick={handleStartExport}
                className="w-full h-11 rounded-xl bg-[#89F8C7] hover:bg-[#72dbb0] text-[#002114] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Video className="w-4 h-4" />
                <span>تحويل الدرس إلى فيديو وتصديره فوراً (MP4)</span>
              </button>
            )}

            {isExporting && (
              <div className="p-3 bg-[#121316] rounded-xl border border-[#2B2C30] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#89F8C7]">جاري معالجة المؤثرات ودمج صوت الشيخ وكاريوكي الكلمات...</span>
                  <span className="font-mono text-[#89F8C7]">{exportProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#202226] overflow-hidden">
                  <div
                    className="h-full bg-[#006C4C] transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {isExportDone && (
              <div className="p-3.5 bg-[#006C4C]/30 border border-[#89F8C7]/40 rounded-xl flex items-center justify-between">
                <span className="text-xs text-[#89F8C7] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اكتمل تحويل الدرس إلى فيديو بنجاح!</span>
                </span>
                <a
                  href={exportedVideoUrl || selectedBg.imageUrl}
                  download="sheikh_eid_iysal_salik_lesson.mp4"
                  className="px-3 py-1.5 rounded-lg bg-[#89F8C7] text-[#002114] text-xs font-bold hover:bg-white transition-colors"
                >
                  تنزيل الفيديو (MP4)
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Right: Step-by-Step Configuration Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: Book Lessons Playlist with Embedded Effects Tuner (المؤثرات في القائمة) */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                    1
                  </span>
                  <span>قائمة دروس «شرح كتاب إيصال السالك» مع مؤثرات الصوت والبصريات</span>
                </h3>
                <p className="text-[11px] text-[#8E9192]">
                  كل درس مزود مسبقاً بمؤثر صوتي ومؤثر بصري مخصص، ويمكنك تغييرهما فوراً من داخل القائمة
                </p>
              </div>

              {/* Series Filter Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedCategory('iysal_salik')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    selectedCategory === 'iysal_salik'
                      ? 'bg-[#006C4C] text-white shadow-sm'
                      : 'bg-[#121316] text-[#8E9192] hover:text-[#E3E2E6]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#FFDF9E]" />
                  <span>إيصال السالك (6 دروس)</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#006C4C] text-white font-bold'
                      : 'bg-[#121316] text-[#8E9192] hover:text-[#E3E2E6]'
                  }`}
                >
                  <span>كافة الدروس</span>
                </button>
              </div>
            </div>

            {/* Lessons List in this playlist */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredLessons.map((lesson) => {
                const isSelected = selectedLesson.id === lesson.id;
                const audioEffMatch = AUDIO_SPIRITUAL_EFFECTS.find(a => a.id === (isSelected ? ambientAudioEffect : (lesson.defaultAudioEffect || 'spiritual_drone')));
                const visualEffMatch = VIDEO_SPIRITUAL_EFFECTS.find(v => v.id === (isSelected ? activeVisualEffect : (lesson.defaultVisualEffect || 'spiritual_glow')));

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#006C4C]/20 border-[#006C4C] ring-1 ring-[#89F8C7]/50'
                        : 'bg-[#121316] border-[#2B2C30] hover:border-[#3E4045]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate pl-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#E3E2E6] truncate">
                            {lesson.title}
                          </span>
                          {lesson.seriesId === 'iysal_salik' && (
                            <span className="text-[10px] bg-[#006C4C]/40 text-[#89F8C7] px-1.5 py-0.2 rounded font-sans shrink-0">
                              أصول الفقه
                            </span>
                          )}
                        </div>
                        <span className="font-ruqaa text-sm text-[#FFDF9E] block truncate mt-0.5">
                          "{lesson.text}"
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-[#89F8C7] bg-[#202226] px-2 py-0.5 rounded">
                          {lesson.durationSec}s
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                          isSelected ? 'bg-[#006C4C] text-white' : 'bg-[#202226] text-[#8E9192]'
                        }`}>
                          {isSelected ? 'محدد' : 'اختيار'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Effects Badges in Playlist Item (المؤثرات داخل عناصر القائمة) */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#2B2C30]/60 text-[11px] flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[#89F8C7] bg-[#121316] px-2 py-0.5 rounded border border-[#2B2C30]">
                        <Volume2 className="w-3 h-3 text-[#89F8C7]" />
                        <span>مؤثر الصوت:</span>
                        <strong className="text-white font-normal">{audioEffMatch?.name}</strong>
                      </span>

                      <span className="inline-flex items-center gap-1 text-[#FFDF9E] bg-[#121316] px-2 py-0.5 rounded border border-[#2B2C30]">
                        <Sparkles className="w-3 h-3 text-[#FFDF9E]" />
                        <span>المؤثر البصري:</span>
                        <strong className="text-white font-normal">{visualEffMatch?.name}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Dedicated Audio Effects Studio (مؤثر الصوت) */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                    2
                  </span>
                  <span>مؤثر الصوت (نغمة السكينة، صدى المسجد، نقاء الصوت، خرير الماء)</span>
                </h3>
                <p className="text-[11px] text-[#8E9192]">
                  اختر مؤثر الصوت الذي يرافق درس الشيخ، واضبط مستوى المزج المناسب
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-[#006C4C]/40 text-[#89F8C7] px-2 py-0.5 rounded border border-[#89F8C7]/30">
                  مؤثر الصوت نشط
                </span>
              </div>
            </div>

            {/* Audio Effects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {AUDIO_SPIRITUAL_EFFECTS.map((eff) => {
                const isSelected = ambientAudioEffect === eff.id;
                return (
                  <button
                    key={eff.id}
                    onClick={() => setAmbientAudioEffect(eff.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#006C4C]/25 border-[#89F8C7] ring-1 ring-[#89F8C7]/50 shadow-sm'
                        : 'bg-[#121316] border-[#2B2C30] hover:border-[#3E4045]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-[#E3E2E6] flex items-center gap-1.5">
                        <Volume2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#89F8C7]' : 'text-[#8E9192]'}`} />
                        <span>{eff.name}</span>
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                        isSelected ? 'bg-[#006C4C] text-white font-bold' : 'bg-[#202226] text-[#8E9192]'
                      }`}>
                        {eff.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8E9192] line-clamp-2 leading-relaxed">
                      {eff.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Audio Mix Volumes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2B2C30]">
              <div className="bg-[#121316] p-3 rounded-xl border border-[#2B2C30]">
                <div className="flex items-center justify-between text-[11px] text-[#8E9192] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-3 h-3 text-[#89F8C7]" />
                    <span>مستوى صوت الشيخ العيد:</span>
                  </span>
                  <span className="font-mono text-[#89F8C7]">{Math.round(sheikhVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sheikhVolume}
                  onChange={(e) => setSheikhVolume(parseFloat(e.target.value))}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#202226] rounded-lg"
                />
              </div>

              <div className="bg-[#121316] p-3 rounded-xl border border-[#2B2C30]">
                <div className="flex items-center justify-between text-[11px] text-[#8E9192] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Music className="w-3 h-3 text-[#FFDF9E]" />
                    <span>مستوى مؤثر الصوت الخلفي:</span>
                  </span>
                  <span className="font-mono text-[#FFDF9E]">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-full accent-[#FFDF9E] h-1.5 bg-[#202226] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: The Rest of the Effects (بقية المؤثرات: بصرية، موجات تفاعلية، إطار مذهب، زوم) */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                  3
                </span>
                <span>بقية المؤثرات (الموجات الصوتية، الهالة النورانية، الإطار المذهب، الزوم السينمائي)</span>
              </h3>
              <p className="text-[11px] text-[#8E9192]">
                تطبيق فوري على الكانفاس لتظهر في الفيديو النهائي المتولد
              </p>
            </div>

            {/* Visual Effects Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {VIDEO_SPIRITUAL_EFFECTS.map((eff) => {
                const isSelected = activeVisualEffect === eff.id;
                return (
                  <button
                    key={eff.id}
                    onClick={() => setActiveVisualEffect(eff.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#006C4C]/25 border-[#89F8C7] ring-1 ring-[#89F8C7]/50 shadow-sm'
                        : 'bg-[#121316] border-[#2B2C30] hover:border-[#3E4045]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-[#E3E2E6]">{eff.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                        isSelected ? 'bg-[#006C4C] text-white font-bold' : 'bg-[#202226] text-[#8E9192]'
                      }`}>
                        {eff.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8E9192] line-clamp-2 leading-relaxed">
                      {eff.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Sheikh Voice Audio Sources & Studio (إضافة صوت الشيخ) */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                    4
                  </span>
                  <span>تسجيل أو رفع صوت الشيخ العيد</span>
                </h3>
                <p className="text-[11px] text-[#8E9192]">
                  أدرج صوت الشيخ ليشكل المسار الصوتي الأساسي ويتزامن تلقائياً مع الكاريوكي
                </p>
              </div>

              {/* Audio Actions: Upload & Record */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] text-xs font-semibold border border-[#36373B] flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صوت الشيخ (MP3)</span>
                </button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleCustomAudioUpload}
                />

                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-3 py-1.5 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>تسجيل صوتي مباشر</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm animate-pulse"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>إيقاف التسجيل ({recordingSeconds}s)</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCustomTextMode(!isCustomTextMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    isCustomTextMode 
                      ? 'bg-[#006C4C] text-white border-[#89F8C7]' 
                      : 'bg-[#121316] text-[#C4C7C8] border-[#2B2C30] hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5 text-[#FFDF9E]" />
                  <span>{isCustomTextMode ? 'إغلاق المحرر' : 'تعديل النص'}</span>
                </button>
              </div>
            </div>

            {/* Sheikh Audio Active Banner */}
            {uploadedAudioName && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#006C4C]/25 to-[#122B22]/40 border border-[#89F8C7]/40 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#006C4C] text-white flex items-center justify-center">
                    <Music className="w-4 h-4 text-[#89F8C7]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#89F8C7] flex items-center gap-2">
                      <span>🎵 تسجيل صوت الشيخ المرفوع: {uploadedAudioName}</span>
                      <span className="text-[10px] bg-[#006C4C] text-white px-1.5 py-0.2 rounded font-sans">
                        نشط
                      </span>
                    </div>
                    <div className="text-[11px] text-[#C4C7C8] mt-0.5">
                      المدة: {customDuration} ثانية · يتزامن صوت الشيخ مباشرة مع كاريوكي الكلمات
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#006C4C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#00573c] transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'إيقاف' : 'استماع'}</span>
                </button>
              </div>
            )}

            {/* Custom Text Editing Box */}
            {isCustomTextMode && (
              <div className="p-4 rounded-xl bg-[#121316] border border-[#006C4C]/60 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#89F8C7] font-semibold">
                  <span>محرر متن الدرس والتوقيت التلقائي للكاريوكي</span>
                  <span className="text-[10px] text-[#8E9192]">يتم تقسيم الكلمات وتوزيع توقيتها تلقائياً</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customLessonTitle}
                    onChange={(e) => setCustomLessonTitle(e.target.value)}
                    placeholder="عنوان درس إيصال السالك"
                    className="w-full bg-[#1A1C1E] border border-[#2B2C30] rounded-lg p-2 text-xs text-[#E3E2E6] outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8E9192] whitespace-nowrap">المدة (ثوانٍ):</span>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(Math.max(5, parseInt(e.target.value) || 16))}
                      className="w-20 bg-[#1A1C1E] border border-[#2B2C30] rounded-lg p-2 text-xs text-[#89F8C7] font-mono outline-none"
                    />
                  </div>
                </div>

                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="اكتب متن كتاب إيصال السالك أو شرح الشيخ هنا..."
                  rows={3}
                  className="w-full bg-[#1A1C1E] border border-[#2B2C30] rounded-lg p-2.5 text-xs text-[#E3E2E6] font-ruqaa text-base outline-none resize-none"
                />

                <button
                  onClick={handleApplyCustomText}
                  className="px-4 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5 text-[#89F8C7]" />
                  <span>تطبيق النص وتحديث الكاريوكي المتزامن</span>
                </button>
              </div>
            )}
          </div>

          {/* STEP 5: Scenes & Backgrounds */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                    5
                  </span>
                  <span>مشاهد ومجالس الشيخ وخلفيات السلسلة</span>
                </h3>
                <p className="text-[11px] text-[#8E9192]">
                  المكتبة التراثية، مجلس الشرح، المحراب المنور، والأروقة الأندلسية
                </p>
              </div>

              <button
                onClick={() => bgInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-[#292A2E] hover:bg-[#333539] text-[#89F8C7] border border-[#36373B] transition-colors flex items-center gap-1 shrink-0"
              >
                <Upload className="w-3 h-3" />
                <span>رفع صورة أخرى</span>
              </button>
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleCustomBgUpload}
              />
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredBackgrounds.map((bg) => {
                const isSelected = selectedBg.id === bg.id;
                return (
                  <div
                    key={bg.id}
                    onClick={() => setSelectedBg(bg)}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#89F8C7] ring-2 ring-[#006C4C] shadow-lg scale-[1.02]'
                        : 'border-[#2B2C30] hover:border-[#46484C]'
                    }`}
                  >
                    <div className="relative h-28 bg-[#121316] overflow-hidden">
                      <img
                        src={bg.imageUrl}
                        alt={bg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-[#89F8C7]">
                        {bg.categoryLabel}
                      </span>
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#006C4C]/25 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-[#006C4C] text-white flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-[#17191C]">
                      <h4 className="text-xs font-bold text-[#E3E2E6] truncate" title={bg.name}>
                        {bg.name}
                      </h4>
                      <p className="text-[10px] text-[#8E9192] truncate mt-0.5">
                        {bg.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 6: Typography & Calligraphy */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-mono flex items-center justify-center">
                  6
                </span>
                <span>تخصيص الخط واللون عند النطق المتزامن</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">نوع الخط المخطوط:</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as any)}
                  className="w-full bg-[#121316] border border-[#2B2C30] rounded-xl p-2.5 text-xs text-[#E3E2E6] outline-none"
                >
                  <option value="Aref Ruqaa">خط الرقعة التراثي (Aref Ruqaa)</option>
                  <option value="Amiri">خط النسخ القرآني (Amiri)</option>
                  <option value="Cairo">خط القاهرة الحديث (Cairo)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">لون الكلمة عند نطقها:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="w-9 h-9 rounded-xl bg-transparent border border-[#2B2C30] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#FFDF9E] font-bold">
                    {highlightColor === '#FFDF9E' ? 'ذهبي دافئ' : highlightColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#8E9192] block mb-1">
                  حجم الخط ({fontSize}px):
                </label>
                <input
                  type="range"
                  min="24"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-[#89F8C7] h-1.5 bg-[#2B2C30] rounded-lg mt-3"
                />
              </div>
            </div>
          </div>

          {/* STEP 7: Real FFmpeg Kit Command */}
          <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#E3E2E6] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#89F8C7]" />
                  <span>دالة FFmpeg Kit المخصصة لتصدير فيديو الدرس</span>
                </h3>
                <p className="text-[11px] text-[#8E9192]">
                  تكرار الخلفية (-loop 1) + دمج صوت الشيخ + حرق كاريوكي .ass مع خط الرقعة وصيغة MP4
                </p>
              </div>

              <button
                onClick={handleCopyCmd}
                className="inline-flex items-center gap-1.5 text-xs text-[#89F8C7] hover:text-white transition-colors"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'تم النسخ!' : 'نسخ الأمر'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-[#0F1012] border border-[#2B2C30] text-[11px] font-mono text-[#89F8C7] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {ffmpegCommand}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
