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
  PenTool
} from 'lucide-react';
import { ProjectDraft, TextOverlay, SpiritualEffect, AudioTrackConfig, AspectRatioType, ParticleOverlayItem, MediaClip } from '../types';
import { PreviewPlayer } from './editor/PreviewPlayer';
import { Timeline } from './editor/Timeline';
import { BottomToolbar } from './editor/BottomToolbar';
import { TextOverlayModal } from './editor/dialogs/TextOverlayModal';
import { AudioInsertModal } from './editor/dialogs/AudioInsertModal';
import { SpiritualEffectsModal } from './editor/dialogs/SpiritualEffectsModal';
import { ExportDialog } from './editor/dialogs/ExportDialog';
import { CalligraphyAudioModal } from './editor/dialogs/CalligraphyAudioModal';
import { ParticleOverlaysModal } from './editor/dialogs/ParticleOverlaysModal';
import { MediaClipsModal } from './editor/dialogs/MediaClipsModal';
import { VideoTrimModal } from './editor/dialogs/VideoTrimModal';
import { EditorWorkspaceTabs } from './editor/EditorWorkspaceTabs';
import { StorageService } from '../services/storageService';
import { audioEngine } from '../services/audioEngine';
import { DEFAULT_PARTICLE_OVERLAYS } from '../constants/defaults';

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

  // Modals state
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isParticlesModalOpen, setIsParticlesModalOpen] = useState(false);
  const [isTrimModalOpen, setIsTrimModalOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isCalligraphyModalOpen, setIsCalligraphyModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const duration = draft.duration || 15;
  const playIntervalRef = useRef<number | null>(null);

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
    setDraft(updated);
    onUpdateDraft(updated);
    StorageService.saveProject(updated);
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
    setDraft(updated);
    onUpdateDraft(updated);
    StorageService.saveProject(updated);
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

    setDraft(updated);
    onUpdateDraft(updated);
    StorageService.saveProject(updated);
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

    setDraft(updated);
    onUpdateDraft(updated);
    StorageService.saveProject(updated);
  };

  // Quick Mute / Replace Toggle
  const handleToggleMute = () => {
    const updated: ProjectDraft = {
      ...draft,
      muteOriginalAudio: !draft.muteOriginalAudio,
      originalAudioVolume: draft.muteOriginalAudio ? 1 : 0,
    };
    setDraft(updated);
    onUpdateDraft(updated);
    StorageService.saveProject(updated);
  };

  // Save draft
  const handleSaveDraft = () => {
    StorageService.saveProject(draft);
    onUpdateDraft(draft);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Switch Aspect Ratio inside editor
  const handleSwitchAspectRatio = (ratio: AspectRatioType) => {
    const updated: ProjectDraft = {
      ...draft,
      aspectRatio: ratio,
    };
    setDraft(updated);
    onUpdateDraft(updated);
    StorageService.saveProject(updated);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] pb-12 pt-4 px-4 sm:px-6 lg:px-8 space-y-5 max-w-7xl mx-auto">
      
      {/* Editor Subheader & Navigation */}
      <div className="bg-[#1A1C1E] border border-[#2B2C30] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Back and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="w-9 h-9 rounded-xl bg-[#292A2E] hover:bg-[#333539] text-[#C4C7C8] hover:text-white flex items-center justify-center transition-colors border border-[#36373B]"
            title="العودة للشاشة الرئيسية"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => {
                const updated = { ...draft, title: e.target.value };
                setDraft(updated);
                onUpdateDraft(updated);
              }}
              className="text-sm sm:text-base font-bold text-[#E3E2E6] bg-transparent border-b border-transparent hover:border-[#46484C] focus:border-[#89F8C7] outline-none px-1"
            />
            <div className="flex items-center gap-2 text-[11px] text-[#8E9192] px-1">
              <span>المحرر النشط</span>
              <span>·</span>
              <span>{draft.aspectRatio}</span>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Switcher Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#121316] rounded-xl border border-[#2B2C30]">
          {(['9:16', '16:9', '1:1'] as AspectRatioType[]).map((r) => (
            <button
              key={r}
              onClick={() => handleSwitchAspectRatio(r)}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                draft.aspectRatio === r
                  ? 'bg-[#006C4C] text-white shadow-sm'
                  : 'text-[#8E9192] hover:text-[#E3E2E6]'
              }`}
            >
              {r === '9:16' && <Smartphone className="w-3.5 h-3.5" />}
              {r === '16:9' && <Monitor className="w-3.5 h-3.5" />}
              {r === '1:1' && <Square className="w-3.5 h-3.5" />}
              <span>{r}</span>
            </button>
          ))}
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Calligraphy STT Button */}
          <button
            onClick={() => setIsCalligraphyModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#785900]/40 to-[#574300]/30 hover:from-[#785900]/60 hover:to-[#574300]/50 text-[#FFDF9E] text-xs font-bold border border-[#FFDF9E]/50 flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
          >
            <PenTool className="w-3.5 h-3.5 text-[#FFDF9E]" />
            <span>خط الريشة (STT)</span>
          </button>

          {/* Quick Mute Indicator Button */}
          <button
            onClick={handleToggleMute}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              draft.muteOriginalAudio
                ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                : 'bg-[#292A2E] text-[#C4C7C8] border-[#36373B] hover:text-white'
            }`}
          >
            {draft.muteOriginalAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span>صوت الفيديو محجوب</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#89F8C7]" />
                <span>حجب الصوت الأصلي</span>
              </>
            )}
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-1.5 rounded-xl bg-[#006C4C] hover:bg-[#00573c] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
          >
            {savedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#89F8C7]" />
                <span>تم الحفظ!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>حفظ المسودة</span>
              </>
            )}
          </button>

          {/* Export Dialog Trigger */}
          <button
            onClick={() => setIsExportDialogOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#89F8C7] hover:bg-[#72dbb0] text-[#002114] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير</span>
          </button>
        </div>

      </div>

      {/* Main Video Preview Player */}
      <PreviewPlayer
        draft={draft}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayToggle={handlePlayToggle}
        onSeek={handleSeek}
        onToggleMute={handleToggleMute}
        onSplitAtPlayhead={handleSplitAtPlayhead}
        onTrimBeforePlayhead={handleTrimBeforePlayhead}
        onTrimAfterPlayhead={handleTrimAfterPlayhead}
      />

      {/* Direct Editing Tabs & Previous Menus (النصوص، الصوت، مؤثرات يوتيوب، خط الريشة، المقاس) */}
      <EditorWorkspaceTabs
        draft={draft}
        onUpdateDraft={(updated: ProjectDraft) => {
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
        onOpenCalligraphyModal={() => setIsCalligraphyModalOpen(true)}
        onOpenExportDialog={() => setIsExportDialogOpen(true)}
        onOpenParticlesModal={() => setIsParticlesModalOpen(true)}
      />

      {/* Middle Interactive Timeline */}
      <Timeline
        draft={draft}
        currentTime={currentTime}
        onSeek={handleSeek}
        onOpenTextModal={() => setIsTextModalOpen(true)}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
        onOpenEffectsModal={() => setIsEffectsModalOpen(true)}
        onOpenMediaModal={() => setIsMediaModalOpen(true)}
        onOpenTrimModal={() => setIsTrimModalOpen(true)}
        onDeleteClip={handleDeleteClip}
        onSplitAtPlayhead={handleSplitAtPlayhead}
        onTrimBeforePlayhead={handleTrimBeforePlayhead}
        onTrimAfterPlayhead={handleTrimAfterPlayhead}
      />

      {/* Bottom Action Toolbar */}
      <BottomToolbar
        onOpenText={() => setIsTextModalOpen(true)}
        onOpenAudio={() => setIsAudioModalOpen(true)}
        onOpenEffects={() => setIsEffectsModalOpen(true)}
        onOpenTrim={() => setIsTrimModalOpen(true)}
        onOpenMuteReplace={() => setIsAudioModalOpen(true)}
        onOpenCalligraphy={() => setIsCalligraphyModalOpen(true)}
        onOpenMedia={() => setIsMediaModalOpen(true)}
        onSaveDraft={handleSaveDraft}
        onExport={() => setIsExportDialogOpen(true)}
        isMuted={draft.muteOriginalAudio}
      />

      {/* Modals */}
      <TextOverlayModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        textOverlays={draft.textOverlays}
        duration={duration}
        onSaveOverlays={(overlays: TextOverlay[]) => {
          const updated = { ...draft, textOverlays: overlays };
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
      />

      <AudioInsertModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        muteOriginalAudio={draft.muteOriginalAudio}
        onToggleMuteOriginal={(muted: boolean) => {
          const updated = { ...draft, muteOriginalAudio: muted };
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
        originalAudioVolume={draft.originalAudioVolume}
        onChangeOriginalVolume={(vol: number) => {
          const updated = { ...draft, originalAudioVolume: vol };
          setDraft(updated);
          onUpdateDraft(updated);
        }}
        replacedAudio={draft.replacedAudio}
        onSelectReplacedAudio={(track: AudioTrackConfig | null) => {
          const updated = { ...draft, replacedAudio: track };
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
        replacedAudioVolume={draft.replacedAudioVolume}
        onChangeReplacedVolume={(vol: number) => {
          const updated = { ...draft, replacedAudioVolume: vol };
          setDraft(updated);
          onUpdateDraft(updated);
        }}
      />

      <SpiritualEffectsModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        effects={draft.effects}
        onUpdateEffects={(effects: SpiritualEffect[]) => {
          const updated = { ...draft, effects };
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
      />

      <CalligraphyAudioModal
        isOpen={isCalligraphyModalOpen}
        onClose={() => setIsCalligraphyModalOpen(false)}
        draft={draft}
        onUpdateDraft={(updated: ProjectDraft) => {
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
      />

      <ParticleOverlaysModal
        isOpen={isParticlesModalOpen}
        onClose={() => setIsParticlesModalOpen(false)}
        particleOverlays={draft.particleOverlays || DEFAULT_PARTICLE_OVERLAYS}
        onUpdateParticles={(particles: ParticleOverlayItem[]) => {
          const updated = { ...draft, particleOverlays: particles };
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
      />

      <VideoTrimModal
        isOpen={isTrimModalOpen}
        onClose={() => setIsTrimModalOpen(false)}
        draft={draft}
        currentTime={currentTime}
        onSeek={handleSeek}
        onUpdateDraft={(updated) => {
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        draft={draft}
      />

      <MediaClipsModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        draft={draft}
        currentTime={currentTime}
        onUpdateDraft={(updated) => {
          setDraft(updated);
          onUpdateDraft(updated);
          StorageService.saveProject(updated);
        }}
      />

    </div>
  );
};
