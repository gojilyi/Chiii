/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Save, 
  Download, 
  VolumeX, 
  Volume2, 
  Check, 
  Sparkles,
  Smartphone,
  Monitor,
  Square,
  PenTool,
  Scissors,
  Clock,
  Undo2,
  Redo2,
  Film,
  Type,
  Music,
  Mic,
  Image as ImageIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Plus
} from 'lucide-react';
import { 
  ProjectDraft, 
  TextOverlay, 
  SpiritualEffect, 
  AudioTrackConfig, 
  AspectRatioType, 
  ParticleOverlayItem, 
  MediaClip 
} from '../types';
import { PreviewPlayer } from './editor/PreviewPlayer';
import { Timeline, SelectedTimelineItem } from './editor/Timeline';
import { ContextualBottomToolbar } from './editor/ContextualBottomToolbar';
import { TextOverlayModal } from './editor/dialogs/TextOverlayModal';
import { AudioInsertModal } from './editor/dialogs/AudioInsertModal';
import { SpiritualEffectsModal } from './editor/dialogs/SpiritualEffectsModal';
import { ExportDialog } from './editor/dialogs/ExportDialog';
import { CalligraphyAudioModal } from './editor/dialogs/CalligraphyAudioModal';
import { ParticleOverlaysModal } from './editor/dialogs/ParticleOverlaysModal';
import { MediaClipsModal } from './editor/dialogs/MediaClipsModal';
import { VideoTrimModal } from './editor/dialogs/VideoTrimModal';
import { EasyAudioTrimModal } from './editor/dialogs/EasyAudioTrimModal';
import { VoiceRecordModal } from './editor/dialogs/VoiceRecordModal';
import { BackgroundEditorModal } from './editor/dialogs/BackgroundEditorModal';
import { EditorWorkspaceTabs } from './editor/EditorWorkspaceTabs';
import { StorageService } from '../services/storageService';
import { audioEngine, extractMediaDuration } from '../services/audioEngine';
import { DEFAULT_PARTICLE_OVERLAYS, DEFAULT_BACKGROUND_ADJUSTMENTS } from '../constants/defaults';

interface VideoEditorScreenProps {
  draft: ProjectDraft;
  onBackToHome: () => void;
  onUpdateDraft: (draft: ProjectDraft) => void;
}

export const VideoEditorScreen: React.FC<VideoEditorScreenProps> = ({
  draft: initialDraft,
  onBackToHome,
  onUpdateDraft,
}) => {
  const [draft, setDraft] = useState<ProjectDraft>(initialDraft);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SelectedTimelineItem | null>(null);
  const [isLayerFlyoutOpen, setIsLayerFlyoutOpen] = useState<boolean>(false);
  const [showAdvancedLibrary, setShowAdvancedLibrary] = useState<boolean>(false);

  // Undo / Redo history stack
  const [history, setHistory] = useState<ProjectDraft[]>([initialDraft]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals state
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isParticlesModalOpen, setIsParticlesModalOpen] = useState(false);
  const [isTrimModalOpen, setIsTrimModalOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isCalligraphyModalOpen, setIsCalligraphyModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isAudioTrimModalOpen, setIsAudioTrimModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

  // Dynamic project duration: matches the longest track (Audio, video source, or clips)
  const audioDuration = draft.replacedAudio
    ? Math.max(0, (draft.replacedAudio.trimEnd || draft.replacedAudio.duration || 0) - (draft.replacedAudio.trimStart || 0))
    : 0;
  const mediaClipsMaxEnd = Math.max(0, ...(draft.mediaClips || []).map((c) => c.endTime || 0));
  const textOverlaysMaxEnd = Math.max(0, ...(draft.textOverlays || []).map((t) => t.endTime || 0));
  const duration = Math.max(draft.duration || 0, audioDuration, mediaClipsMaxEnd, textOverlaysMaxEnd, 1);

  const playIntervalRef = useRef<number | null>(null);

  // Commit change and push to Undo/Redo history
  const pushDraftState = (updated: ProjectDraft) => {
    setDraft(updated);
    onUpdateDraft(updated);
    StorageService.saveProject(updated);

    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      if (next.length >= 30) {
        next.shift();
      }
      return [...next, updated];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      const prevDraft = history[newIdx];
      setHistoryIndex(newIdx);
      setDraft(prevDraft);
      onUpdateDraft(prevDraft);
      StorageService.saveProject(prevDraft);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      const nextDraft = history[newIdx];
      setHistoryIndex(newIdx);
      setDraft(nextDraft);
      onUpdateDraft(nextDraft);
      StorageService.saveProject(nextDraft);
    }
  };

  // Auto-detect and sync real audio duration from audio URL using Web Audio decode
  useEffect(() => {
    if (draft.replacedAudio?.audioUrl) {
      extractMediaDuration(draft.replacedAudio.audioUrl).then((realDur) => {
        if (realDur > 0 && Math.abs((draft.replacedAudio?.duration || 0) - realDur) > 0.5) {
          const updatedAudio = {
            ...draft.replacedAudio!,
            duration: realDur,
            trimEnd: draft.replacedAudio!.trimEnd && draft.replacedAudio!.trimEnd > 0 ? draft.replacedAudio!.trimEnd : realDur,
          };
          const updatedDraft: ProjectDraft = {
            ...draft,
            replacedAudio: updatedAudio,
            duration: Math.max(draft.duration || 0, realDur),
          };
          pushDraftState(updatedDraft);
        }
      });
    }
  }, [draft.replacedAudio?.audioUrl]);

  // Synchronize playback timer
  useEffect(() => {
    if (isPlaying) {
      if (draft.replacedAudio) {
        audioEngine.playReplacedTrack(
          draft.replacedAudio.synthPreset,
          draft.replacedAudioVolume,
          draft.replacedAudio.audioUrl,
          currentTime
        );
      }

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
  }, [isPlaying, duration, draft.replacedAudio, draft.replacedAudioVolume]);

  // Synchronize timeline media audio clips with playback and current time
  useEffect(() => {
    audioEngine.syncMediaClips(draft.mediaClips || [], currentTime, isPlaying);
  }, [isPlaying, currentTime, draft.mediaClips]);

  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    audioEngine.seek(time);
    audioEngine.syncMediaClips(draft.mediaClips || [], time, isPlaying);
  };

  // Delete clip from timeline
  const handleDeleteClip = (id: string) => {
    const updatedClips = (draft.mediaClips || []).filter((c) => c.id !== id);
    const updated = { ...draft, mediaClips: updatedClips };
    if (selectedItem?.id === id) setSelectedItem(null);
    pushDraftState(updated);
  };

  // 1. Split clip at current playhead cursor position
  const handleSplitAtPlayhead = () => {
    const isImage = (draft.videoSourceUrl?.toLowerCase().endsWith('.jpg') || 
                     draft.videoSourceUrl?.toLowerCase().endsWith('.png') || 
                     draft.videoSourceUrl?.toLowerCase().endsWith('.jpeg') ||
                     draft.videoSourceUrl?.toLowerCase().endsWith('.webp'));
    
    const clips: MediaClip[] = (draft.mediaClips && draft.mediaClips.length > 0)
      ? [...draft.mediaClips]
      : [
          {
            id: `clip_base_${Date.now()}`,
            type: isImage ? 'image' : 'video',
            name: draft.videoSourceName || 'المقطع الأساسي',
            url: draft.videoSourceUrl,
            duration: duration,
            startTime: 0,
            endTime: duration,
            trimStart: draft.trimStart || 0,
            trimEnd: draft.trimEnd || duration,
            volume: 1,
            opacity: 1,
            scale: 1,
          }
        ];

    const targetClipIndex = clips.findIndex((c) => currentTime > c.startTime && currentTime < c.endTime);
    if (targetClipIndex === -1) {
      return;
    }

    const targetClip = clips[targetClipIndex];
    const splitOffset = +(currentTime - targetClip.startTime).toFixed(2);

    const part1: MediaClip = {
      ...targetClip,
      id: `${targetClip.id}_p1_${Date.now()}`,
      name: `${targetClip.name.replace(/ \(جزء \d+\)/, '')} (جزء 1)`,
      endTime: +currentTime.toFixed(2),
      trimEnd: +((targetClip.trimStart || 0) + splitOffset).toFixed(2),
    };

    const part2: MediaClip = {
      ...targetClip,
      id: `${targetClip.id}_p2_${Date.now()}`,
      name: `${targetClip.name.replace(/ \(جزء \d+\)/, '')} (جزء 2)`,
      startTime: +currentTime.toFixed(2),
      trimStart: +((targetClip.trimStart || 0) + splitOffset).toFixed(2),
    };

    clips.splice(targetClipIndex, 1, part1, part2);
    const updated = { ...draft, mediaClips: clips };
    setSelectedItem({ type: 'clip', id: part2.id });
    pushDraftState(updated);
  };

  // 2. Trim video before current playhead cursor
  const handleTrimBeforePlayhead = () => {
    if (currentTime <= 0.2 || currentTime >= duration) return;
    const cutAmount = +currentTime.toFixed(2);
    const newDuration = Math.max(1, +(duration - cutAmount).toFixed(2));

    const updated: ProjectDraft = {
      ...draft,
      duration: newDuration,
      trimStart: +((draft.trimStart || 0) + cutAmount).toFixed(2),
    };

    if (draft.mediaClips && draft.mediaClips.length > 0) {
      const remainingClips = draft.mediaClips
        .filter((c) => c.endTime > cutAmount)
        .map((c) => ({
          ...c,
          startTime: Math.max(0, +(c.startTime - cutAmount).toFixed(2)),
          endTime: Math.max(0.2, +(c.endTime - cutAmount).toFixed(2)),
          trimStart: c.startTime < cutAmount ? +((c.trimStart || 0) + (cutAmount - c.startTime)).toFixed(2) : c.trimStart,
        }));
      updated.mediaClips = remainingClips;
    }

    pushDraftState(updated);
    setCurrentTime(0);
  };

  // 3. Trim video after current playhead cursor
  const handleTrimAfterPlayhead = () => {
    if (currentTime <= 0.5 || currentTime >= duration) return;
    const newDuration = Math.max(1, +currentTime.toFixed(2));

    const updated: ProjectDraft = {
      ...draft,
      duration: newDuration,
      trimEnd: +((draft.trimStart || 0) + newDuration).toFixed(2),
    };

    if (draft.mediaClips && draft.mediaClips.length > 0) {
      const remainingClips = draft.mediaClips
        .filter((c) => c.startTime < newDuration)
        .map((c) => ({
          ...c,
          endTime: Math.min(newDuration, c.endTime),
          trimEnd: c.endTime > newDuration ? +((c.trimStart || 0) + (newDuration - c.startTime)).toFixed(2) : c.trimEnd,
        }));
      updated.mediaClips = remainingClips;
    }

    pushDraftState(updated);
  };

  // Duplicate clip
  const handleDuplicateClip = (clipId?: string) => {
    const clips = [...(draft.mediaClips || [])];
    if (clips.length > 0 && clipId) {
      const target = clips.find((c) => c.id === clipId);
      if (target) {
        const copyDuration = target.endTime - target.startTime;
        const newClip: MediaClip = {
          ...target,
          id: `clip_${Date.now()}`,
          name: `${target.name} (نسخة)`,
          startTime: duration,
          endTime: +(duration + copyDuration).toFixed(2),
        };
        clips.push(newClip);
        const updated = {
          ...draft,
          mediaClips: clips,
          duration: +(duration + copyDuration).toFixed(2),
        };
        setSelectedItem({ type: 'clip', id: newClip.id });
        pushDraftState(updated);
        return;
      }
    }

    // Default duplicate main video
    const newClip: MediaClip = {
      id: `clip_copy_${Date.now()}`,
      type: 'video',
      name: `${draft.videoSourceName || 'الفيديو'} (نسخة)`,
      url: draft.videoSourceUrl,
      duration: duration,
      startTime: duration,
      endTime: +(duration * 2).toFixed(2),
      trimStart: 0,
      trimEnd: duration,
      volume: 1,
      opacity: 1,
      scale: 1,
    };
    const updated = {
      ...draft,
      mediaClips: [...clips, newClip],
      duration: +(duration * 2).toFixed(2),
    };
    setSelectedItem({ type: 'clip', id: newClip.id });
    pushDraftState(updated);
  };

  // Toggle Mute / Sound
  const handleToggleMute = () => {
    const updated: ProjectDraft = {
      ...draft,
      muteOriginalAudio: !draft.muteOriginalAudio,
      originalAudioVolume: draft.muteOriginalAudio ? 1 : 0,
    };
    pushDraftState(updated);
  };

  // Save draft
  const handleSaveDraft = () => {
    StorageService.saveProject(draft);
    onUpdateDraft(draft);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Switch Aspect Ratio
  const handleSwitchAspectRatio = (ratio: AspectRatioType) => {
    const updated: ProjectDraft = {
      ...draft,
      aspectRatio: ratio,
    };
    pushDraftState(updated);
  };

  // Easy Audio Trimmer Save Handler
  const handleSaveAudioTrim = (trimStart: number, trimEnd: number, syncVideoDuration: boolean) => {
    if (!draft.replacedAudio) return;
    const updatedAudio: AudioTrackConfig = {
      ...draft.replacedAudio,
      trimStart,
      trimEnd,
    };
    const trimmedDuration = Math.max(0.5, +(trimEnd - trimStart).toFixed(2));
    const updated: ProjectDraft = {
      ...draft,
      replacedAudio: updatedAudio,
      duration: syncVideoDuration ? trimmedDuration : draft.duration,
      syncDurationToAudio: syncVideoDuration,
    };
    pushDraftState(updated);
    setCurrentTime(0);
    audioEngine.stop();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Sync Video Duration to Audio length
  const handleSyncDurationToAudio = (customDur?: number) => {
    const audioDur = customDur || (draft.replacedAudio?.trimEnd && draft.replacedAudio.trimStart !== undefined
      ? +(draft.replacedAudio.trimEnd - draft.replacedAudio.trimStart).toFixed(2)
      : draft.replacedAudio?.duration || draft.duration || 15);

    const updated: ProjectDraft = {
      ...draft,
      duration: Math.max(1, +audioDur.toFixed(2)),
      syncDurationToAudio: true,
    };
    pushDraftState(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Text Overlay modifications
  const handleToggleAyahBrackets = (textId: string) => {
    const updatedTexts = draft.textOverlays.map((t) => 
      t.id === textId ? { ...t, hasAyahBrackets: !t.hasAyahBrackets } : t
    );
    pushDraftState({ ...draft, textOverlays: updatedTexts });
  };

  const handleToggleTextBox = (textId: string) => {
    const updatedTexts = draft.textOverlays.map((t) => 
      t.id === textId 
        ? { ...t, backgroundColor: t.backgroundColor ? '' : 'rgba(0, 0, 0, 0.65)' } 
        : t
    );
    pushDraftState({ ...draft, textOverlays: updatedTexts });
  };

  const handleChangeTextColor = (textId: string, color: string) => {
    const updatedTexts = draft.textOverlays.map((t) => 
      t.id === textId ? { ...t, color } : t
    );
    pushDraftState({ ...draft, textOverlays: updatedTexts });
  };

  const handleChangeTextSize = (textId: string, delta: number) => {
    const updatedTexts = draft.textOverlays.map((t) => 
      t.id === textId ? { ...t, fontSize: Math.max(12, Math.min(80, t.fontSize + delta)) } : t
    );
    pushDraftState({ ...draft, textOverlays: updatedTexts });
  };

  const handleChangeTextPosition = (textId: string, pos: 'top' | 'center' | 'bottom') => {
    const posY = pos === 'top' ? 22 : pos === 'center' ? 50 : 78;
    const updatedTexts = draft.textOverlays.map((t) => 
      t.id === textId ? { ...t, positionY: posY } : t
    );
    pushDraftState({ ...draft, textOverlays: updatedTexts });
  };

  const handleDeleteText = (textId: string) => {
    const updatedTexts = draft.textOverlays.filter((t) => t.id !== textId);
    if (selectedItem?.id === textId) setSelectedItem(null);
    pushDraftState({ ...draft, textOverlays: updatedTexts });
  };

  // Cycle color filters
  const handleCycleFilter = () => {
    const currentFilter = draft.effects.find((e) => e.id === 'spiritual_glow' && e.enabled);
    const nextEffect = !currentFilter;
    const updatedEffects = draft.effects.map((e) => 
      e.id === 'spiritual_glow' ? { ...e, enabled: nextEffect, intensity: 65 } : e
    );
    pushDraftState({ ...draft, effects: updatedEffects });
  };

  // Rotate clip / adjust brightness
  const handleRotateClip = () => {
    const currentAdjust = draft.backgroundAdjustments || DEFAULT_BACKGROUND_ADJUSTMENTS;
    pushDraftState({
      ...draft,
      backgroundAdjustments: {
        ...currentAdjust,
        brightness: currentAdjust.brightness === 100 ? 115 : 100,
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. KINEMASTER TOP NAVIGATION BAR                              */}
      {/* ------------------------------------------------------------- */}
      <header className="h-14 bg-[#242424] border-b border-[#333333] px-3 sm:px-5 flex items-center justify-between sticky top-0 z-40">
        
        {/* Left: Back button (Touch target >= 44px) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="w-11 h-11 rounded-xl bg-[#2e2e2e] hover:bg-[#383838] text-[#C4C7C8] hover:text-white flex items-center justify-center transition border border-[#404040] active:scale-95 shadow-sm"
            title="رجوع إلى المشاريع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Project Title */}
          <div className="hidden sm:block">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => {
                const updated = { ...draft, title: e.target.value };
                pushDraftState(updated);
              }}
              className="text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-[#484848] focus:border-[#F5B800] outline-none px-1 transition"
            />
          </div>
        </div>

        {/* Center: Undo & Redo stack + Aspect ratio */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Undo Button (>= 44px) */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="w-11 h-11 rounded-xl bg-[#2e2e2e] hover:bg-[#383838] disabled:opacity-30 disabled:pointer-events-none text-[#E0E0E0] hover:text-[#F5B800] flex items-center justify-center transition border border-[#404040] active:scale-95"
            title="تراجع (Undo)"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          {/* Redo Button (>= 44px) */}
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="w-11 h-11 rounded-xl bg-[#2e2e2e] hover:bg-[#383838] disabled:opacity-30 disabled:pointer-events-none text-[#E0E0E0] hover:text-[#F5B800] flex items-center justify-center transition border border-[#404040] active:scale-95"
            title="إعادة (Redo)"
          >
            <Redo2 className="w-5 h-5" />
          </button>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center bg-[#1a1a1a] rounded-xl border border-[#383838] p-1">
            {(['9:16', '16:9', '1:1'] as AspectRatioType[]).map((r) => (
              <button
                key={r}
                onClick={() => handleSwitchAspectRatio(r)}
                className={`h-8 px-2.5 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1 ${
                  draft.aspectRatio === r
                    ? 'bg-[#F5B800] text-black shadow-sm'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                {r === '9:16' && <Smartphone className="w-3.5 h-3.5" />}
                {r === '16:9' && <Monitor className="w-3.5 h-3.5" />}
                {r === '1:1' && <Square className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{r}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Save & Prominent Export Button */}
        <div className="flex items-center gap-2">
          {/* Quick Save */}
          <button
            onClick={handleSaveDraft}
            className="h-11 px-3 rounded-xl bg-[#2e2e2e] hover:bg-[#383838] text-[#C4C7C8] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-[#404040] active:scale-95"
            title="حفظ المسودة"
          >
            {savedNotification ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400 font-bold">تم الحفظ!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">حفظ</span>
              </>
            )}
          </button>

          {/* Prominent Gold Export Button (KineMaster Style) */}
          <button
            onClick={() => setIsExportDialogOpen(true)}
            className="h-11 px-4 sm:px-5 rounded-xl bg-[#F5B800] hover:bg-[#e0a800] text-[#1a1a1a] text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-md hover:shadow-amber-500/20 active:scale-95"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span>تصدير</span>
          </button>
        </div>

      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN WORKSPACE: PREVIEW & KINEMASTER VERTICAL SIDE DOCK     */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 flex flex-col gap-3">
        
        {/* Preview Area Row with Side Tools */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-3 w-full">
          
          {/* Main Video Preview Player */}
          <div className="flex-1 w-full max-w-2xl flex justify-center">
            <PreviewPlayer
              draft={draft}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
              onSeek={handleSeek}
              onToggleMute={handleToggleMute}
              onLoadedMediaDuration={(realDur) => {
                if (realDur > 0 && Math.abs((draft.duration || 0) - realDur) > 0.5 && !draft.replacedAudio) {
                  const updated = { ...draft, duration: realDur, trimEnd: realDur };
                  pushDraftState(updated);
                }
              }}
              onSplitAtPlayhead={handleSplitAtPlayhead}
              onTrimBeforePlayhead={handleTrimBeforePlayhead}
              onTrimAfterPlayhead={handleTrimAfterPlayhead}
            />
          </div>

          {/* KINEMASTER VERTICAL SIDE DOCK (Right side of Preview) */}
          <aside className="w-full lg:w-28 flex lg:flex-col items-center justify-center gap-2 bg-[#242424] border border-[#383838] p-2.5 rounded-2xl shadow-xl shrink-0 overflow-x-auto">
            
            {/* 1. Media (وسائط) */}
            <button
              onClick={() => setIsMediaModalOpen(true)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2e2e2e] hover:bg-[#383838] hover:border-[#F5B800] text-white flex flex-col items-center justify-center gap-1 transition border border-[#404040] shrink-0 active:scale-95 shadow-sm group"
            >
              <Film className="w-5 h-5 text-[#F5B800] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#E0E0E0]">وسائط</span>
            </button>

            {/* 2. Layer (طبقة) with flyout */}
            <div className="relative">
              <button
                onClick={() => setIsLayerFlyoutOpen((prev) => !prev)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition border shrink-0 active:scale-95 shadow-sm group ${
                  isLayerFlyoutOpen
                    ? 'bg-[#F5B800] text-black border-[#F5B800]'
                    : 'bg-[#2e2e2e] hover:bg-[#383838] text-white border-[#404040]'
                }`}
              >
                <Layers className={`w-5 h-5 ${isLayerFlyoutOpen ? 'text-black' : 'text-[#FFDF9E]'}`} />
                <span className="text-[10px] font-bold">طبقة</span>
              </button>

              {/* Layer Flyout Menu */}
              {isLayerFlyoutOpen && (
                <div className="absolute right-0 top-full mt-2 lg:right-full lg:top-0 lg:mr-2 z-50 bg-[#282828] border border-[#444444] rounded-2xl p-2 shadow-2xl w-48 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="text-[11px] text-[#A0A0A0] px-2 py-1 border-b border-[#383838] font-bold flex items-center justify-between">
                    <span>إضافة طبقة جديدة</span>
                    <button onClick={() => setIsLayerFlyoutOpen(false)}>
                      <X className="w-3.5 h-3.5 text-[#A0A0A0]" />
                    </button>
                  </div>

                  {/* Add Text */}
                  <button
                    onClick={() => {
                      setIsLayerFlyoutOpen(false);
                      setIsTextModalOpen(true);
                    }}
                    className="w-full h-11 px-3 rounded-xl hover:bg-[#333333] text-white flex items-center gap-2 text-xs font-semibold transition"
                  >
                    <Type className="w-4 h-4 text-[#FFDF9E]" />
                    <span>نص أو آية قرآنية</span>
                  </button>

                  {/* Calligraphy STT */}
                  <button
                    onClick={() => {
                      setIsLayerFlyoutOpen(false);
                      setIsCalligraphyModalOpen(true);
                    }}
                    className="w-full h-11 px-3 rounded-xl hover:bg-[#333333] text-white flex items-center gap-2 text-xs font-semibold transition"
                  >
                    <PenTool className="w-4 h-4 text-[#FFDF9E]" />
                    <span>خط الرقعة والشمعة (STT)</span>
                  </button>

                  {/* Spiritual Effects */}
                  <button
                    onClick={() => {
                      setIsLayerFlyoutOpen(false);
                      setIsEffectsModalOpen(true);
                    }}
                    className="w-full h-11 px-3 rounded-xl hover:bg-[#333333] text-white flex items-center gap-2 text-xs font-semibold transition"
                  >
                    <Sparkles className="w-4 h-4 text-[#F5B800]" />
                    <span>المؤثرات الروحانية</span>
                  </button>

                  {/* Particle Overlays */}
                  <button
                    onClick={() => {
                      setIsLayerFlyoutOpen(false);
                      setIsParticlesModalOpen(true);
                    }}
                    className="w-full h-11 px-3 rounded-xl hover:bg-[#333333] text-white flex items-center gap-2 text-xs font-semibold transition"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>الجسيمات والأضواء</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Audio (صوت) */}
            <button
              onClick={() => setIsAudioModalOpen(true)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2e2e2e] hover:bg-[#383838] hover:border-[#89F8C7] text-white flex flex-col items-center justify-center gap-1 transition border border-[#404040] shrink-0 active:scale-95 shadow-sm group"
            >
              <Music className="w-5 h-5 text-[#89F8C7] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#E0E0E0]">صوت</span>
            </button>

            {/* 4. Voice (تسجيل صوتي) */}
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2e2e2e] hover:bg-[#383838] hover:border-red-500 text-white flex flex-col items-center justify-center gap-1 transition border border-[#404040] shrink-0 active:scale-95 shadow-sm group"
            >
              <Mic className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#E0E0E0]">تسجيل</span>
            </button>

            {/* 5. Background (خلفية) */}
            <button
              onClick={() => setIsBackgroundModalOpen(true)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2e2e2e] hover:bg-[#383838] hover:border-emerald-500 text-white flex flex-col items-center justify-center gap-1 transition border border-[#404040] shrink-0 active:scale-95 shadow-sm group"
            >
              <ImageIcon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#E0E0E0]">الخلفية</span>
            </button>

          </aside>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. KINEMASTER BOTTOM TIMELINE AREA                            */}
        {/* ------------------------------------------------------------- */}
        <section className="w-full">
          <Timeline
            draft={draft}
            currentTime={currentTime}
            onSeek={handleSeek}
            selectedItem={selectedItem}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenTextModal={() => setIsTextModalOpen(true)}
            onOpenAudioModal={() => setIsAudioModalOpen(true)}
            onOpenEffectsModal={() => setIsEffectsModalOpen(true)}
            onOpenMediaModal={() => setIsMediaModalOpen(true)}
            onOpenTrimModal={() => setIsTrimModalOpen(true)}
            onOpenAudioTrimModal={() => setIsAudioTrimModalOpen(true)}
            onSyncDurationToAudio={() => handleSyncDurationToAudio()}
            onDeleteClip={handleDeleteClip}
            onSplitAtPlayhead={handleSplitAtPlayhead}
            onTrimBeforePlayhead={handleTrimBeforePlayhead}
            onTrimAfterPlayhead={handleTrimAfterPlayhead}
          />
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 4. CONTEXTUAL DYNAMIC BOTTOM TOOLBAR                          */}
        {/* ------------------------------------------------------------- */}
        <section className="w-full">
          <ContextualBottomToolbar
            draft={draft}
            selectedItem={selectedItem}
            currentTime={currentTime}
            onDeselect={() => setSelectedItem(null)}
            // Video actions
            onSplitAtPlayhead={handleSplitAtPlayhead}
            onTrimBeforePlayhead={handleTrimBeforePlayhead}
            onTrimAfterPlayhead={handleTrimAfterPlayhead}
            onDuplicateClip={handleDuplicateClip}
            onDeleteClip={handleDeleteClip}
            onToggleClipMute={handleToggleMute}
            onChangeSpeed={(spd) => {}}
            onOpenVideoTrimModal={() => setIsTrimModalOpen(true)}
            onCycleFilter={handleCycleFilter}
            onRotateClip={handleRotateClip}
            // Text actions
            onEditText={(id) => setIsTextModalOpen(true)}
            onToggleAyahBrackets={handleToggleAyahBrackets}
            onToggleTextBox={handleToggleTextBox}
            onChangeTextColor={handleChangeTextColor}
            onChangeTextFont={(id, font) => {
              const validFont = font as 'Amiri' | 'Aref Ruqaa' | 'Cairo' | 'serif' | 'sans-serif';
              const updated = draft.textOverlays.map((t) => t.id === id ? { ...t, fontFamily: validFont } : t);
              pushDraftState({ ...draft, textOverlays: updated });
            }}
            onChangeTextSize={handleChangeTextSize}
            onChangeTextPosition={handleChangeTextPosition}
            onDeleteText={handleDeleteText}
            // Audio actions
            onOpenAudioTrimModal={() => setIsAudioTrimModalOpen(true)}
            onSyncDurationToAudio={() => handleSyncDurationToAudio()}
            onToggleAudioMute={handleToggleMute}
            onChangeAudioVolume={(vol) => {
              const updated = { ...draft, replacedAudioVolume: vol };
              pushDraftState(updated);
            }}
            onDeleteAudio={() => {
              const updated = { ...draft, replacedAudio: null };
              setSelectedItem(null);
              pushDraftState(updated);
            }}
            // Default actions
            onOpenMedia={() => setIsMediaModalOpen(true)}
            onOpenText={() => setIsTextModalOpen(true)}
            onOpenAudio={() => setIsAudioModalOpen(true)}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onOpenCalligraphy={() => setIsCalligraphyModalOpen(true)}
            onOpenEffects={() => setIsEffectsModalOpen(true)}
            onOpenParticles={() => setIsParticlesModalOpen(true)}
            onOpenBackground={() => setIsBackgroundModalOpen(true)}
            onSaveDraft={handleSaveDraft}
            onExport={() => setIsExportDialogOpen(true)}
            savedNotification={savedNotification}
          />
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 5. ADVANCED PRESET LIBRARY & ACCORDION (OPTIONAL DRAWER)       */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full pt-2">
          <button
            onClick={() => setShowAdvancedLibrary((prev) => !prev)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#242424] hover:bg-[#2b2b2b] border border-[#383838] text-xs font-bold text-[#A0A0A0] hover:text-white flex items-center justify-between transition"
          >
            <span>مكتبة القوالب، الآيات، التلاوات، والأحاديث الجاهزة</span>
            {showAdvancedLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvancedLibrary && (
            <div className="mt-3">
              <EditorWorkspaceTabs
                draft={draft}
                onUpdateDraft={(updated: ProjectDraft) => {
                  pushDraftState(updated);
                }}
                onOpenCalligraphyModal={() => setIsCalligraphyModalOpen(true)}
                onOpenExportDialog={() => setIsExportDialogOpen(true)}
                onOpenParticlesModal={() => setIsParticlesModalOpen(true)}
                onOpenAudioModal={() => setIsAudioModalOpen(true)}
                onSyncDurationToAudio={() => handleSyncDurationToAudio()}
                onOpenBackgroundModal={() => setIsBackgroundModalOpen(true)}
              />
            </div>
          )}
        </div>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* 6. MODALS & DIALOGS                                            */}
      {/* ------------------------------------------------------------- */}
      {isTextModalOpen && (
        <TextOverlayModal
          isOpen={isTextModalOpen}
          onClose={() => setIsTextModalOpen(false)}
          textOverlays={draft.textOverlays}
          duration={duration}
          onSaveOverlays={(overlays: TextOverlay[]) => {
            const updated = { ...draft, textOverlays: overlays };
            pushDraftState(updated);
          }}
        />
      )}

      {isAudioModalOpen && (
        <AudioInsertModal
          isOpen={isAudioModalOpen}
          onClose={() => setIsAudioModalOpen(false)}
          muteOriginalAudio={draft.muteOriginalAudio}
          onToggleMuteOriginal={(muted: boolean) => {
            const updated = { ...draft, muteOriginalAudio: muted };
            pushDraftState(updated);
          }}
          originalAudioVolume={draft.originalAudioVolume}
          onChangeOriginalVolume={(vol: number) => {
            const updated = { ...draft, originalAudioVolume: vol };
            pushDraftState(updated);
          }}
          replacedAudio={draft.replacedAudio}
          onSelectReplacedAudio={(track: AudioTrackConfig | null) => {
            const updated = { ...draft, replacedAudio: track };
            pushDraftState(updated);
          }}
          replacedAudioVolume={draft.replacedAudioVolume}
          onChangeReplacedVolume={(vol: number) => {
            const updated = { ...draft, replacedAudioVolume: vol };
            pushDraftState(updated);
          }}
          onOpenAudioTrim={() => setIsAudioTrimModalOpen(true)}
          onSyncDurationToAudio={handleSyncDurationToAudio}
        />
      )}

      {isVoiceModalOpen && (
        <VoiceRecordModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onSaveVoiceTrack={(track: AudioTrackConfig) => {
            const updated = { ...draft, replacedAudio: track };
            pushDraftState(updated);
          }}
        />
      )}

      {isAudioTrimModalOpen && (
        <EasyAudioTrimModal
          isOpen={isAudioTrimModalOpen}
          onClose={() => setIsAudioTrimModalOpen(false)}
          draft={draft}
          currentTime={currentTime}
          onSaveAudioTrim={handleSaveAudioTrim}
        />
      )}

      {isEffectsModalOpen && (
        <SpiritualEffectsModal
          isOpen={isEffectsModalOpen}
          onClose={() => setIsEffectsModalOpen(false)}
          effects={draft.effects}
          onUpdateEffects={(effects: SpiritualEffect[]) => {
            const updated = { ...draft, effects };
            pushDraftState(updated);
          }}
        />
      )}

      {isCalligraphyModalOpen && (
        <CalligraphyAudioModal
          isOpen={isCalligraphyModalOpen}
          onClose={() => setIsCalligraphyModalOpen(false)}
          draft={draft}
          onUpdateDraft={(updated: ProjectDraft) => {
            pushDraftState(updated);
          }}
        />
      )}

      {isParticlesModalOpen && (
        <ParticleOverlaysModal
          isOpen={isParticlesModalOpen}
          onClose={() => setIsParticlesModalOpen(false)}
          particleOverlays={draft.particleOverlays || DEFAULT_PARTICLE_OVERLAYS}
          onUpdateParticles={(particles: ParticleOverlayItem[]) => {
            const updated = { ...draft, particleOverlays: particles };
            pushDraftState(updated);
          }}
        />
      )}

      {isTrimModalOpen && (
        <VideoTrimModal
          isOpen={isTrimModalOpen}
          onClose={() => setIsTrimModalOpen(false)}
          draft={draft}
          currentTime={currentTime}
          onSeek={handleSeek}
          onUpdateDraft={(updated) => {
            pushDraftState(updated);
          }}
        />
      )}

      {isExportDialogOpen && (
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          draft={draft}
        />
      )}

      {isMediaModalOpen && (
        <MediaClipsModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          draft={draft}
          currentTime={currentTime}
          onUpdateDraft={(updated) => {
            pushDraftState(updated);
          }}
        />
      )}

      {isBackgroundModalOpen && (
        <BackgroundEditorModal
          isOpen={isBackgroundModalOpen}
          onClose={() => setIsBackgroundModalOpen(false)}
          draft={draft}
          onUpdateDraft={(updated) => {
            pushDraftState(updated);
          }}
        />
      )}

    </div>
  );
};
