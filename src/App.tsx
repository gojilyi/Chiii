/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AspectRatioType, ProjectDraft } from './types';
import { StorageService } from './services/storageService';
import { 
  ASSET_MINARET_SUNSET, 
  ASSET_QURAN_LIGHT, 
  ASSET_ARABIC_ORNAMENT,
  DEFAULT_AUDIO_LIBRARY, 
  DEFAULT_SPIRITUAL_EFFECTS, 
  DEFAULT_TEXT_OVERLAY 
} from './constants/defaults';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { VideoEditorScreen } from './components/VideoEditorScreen';
import { FlutterCodeHub } from './components/flutter/FlutterCodeHub';
import { AutoLectureMakerScreen } from './components/auto_lecture/AutoLectureMakerScreen';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'editor' | 'flutter_code' | 'drafts' | 'auto_lessons'>('home');
  const [drafts, setDrafts] = useState<ProjectDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<ProjectDraft | null>(null);

  // Initialize and load drafts from local database (Hive / IndexedDB simulation)
  useEffect(() => {
    const loadedDrafts = StorageService.getProjects();
    setDrafts(loadedDrafts);

    const activeId = StorageService.getActiveProjectId();
    if (activeId) {
      const found = loadedDrafts.find((d) => d.id === activeId);
      if (found) {
        setActiveDraft(found);
      } else if (loadedDrafts.length > 0) {
        setActiveDraft(loadedDrafts[0]);
      }
    } else if (loadedDrafts.length > 0) {
      setActiveDraft(loadedDrafts[0]);
    }

    // Hydrate from IndexedDB in the background and refresh if new items exist
    StorageService.initStorage().then(() => {
      setDrafts(StorageService.getProjects());
    });
  }, []);

  const refreshDrafts = () => {
    setDrafts(StorageService.getProjects());
  };

  // Start new project with selected aspect ratio and uploaded media
  const handleSelectRatio = (
    ratio: AspectRatioType, 
    customVideoUrl?: string, 
    customVideoName?: string
  ) => {
    const timestamp = Date.now();
    const defaultThumbnail = 
      ratio === '9:16' ? ASSET_MINARET_SUNSET : 
      ratio === '16:9' ? ASSET_QURAN_LIGHT : ASSET_ARABIC_ORNAMENT;

    const isAudio = /\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(customVideoName || '');

    const newDraft: ProjectDraft = {
      id: `draft_${timestamp}`,
      title: customVideoName 
        ? (isAudio ? `مشروع صوتي: ${customVideoName}` : `مشروع: ${customVideoName}`)
        : `مشروع جديد (${ratio})`,
      aspectRatio: ratio,
      createdAt: timestamp,
      updatedAt: timestamp,
      duration: isAudio ? 30 : 15,
      videoSourceUrl: isAudio ? defaultThumbnail : (customVideoUrl || defaultThumbnail),
      videoSourceName: customVideoName || (ratio === '9:16' ? 'مشهد المئذنة الذهبي.mp4' : ratio === '16:9' ? 'مصحف المسجد العتيق.mp4' : 'زخرفة إسلامية.mp4'),
      isCustomVideo: !!customVideoUrl && !isAudio,
      muteOriginalAudio: true, // Default to mute original audio as requested
      originalAudioVolume: 0,
      replacedAudio: isAudio && customVideoUrl
        ? {
            id: `uploaded_audio_${timestamp}`,
            title: customVideoName?.replace(/\.[^/.]+$/, '') || 'تسجيل صوتي',
            artist: 'ملف مرفوع من جهازك',
            category: 'nasheed',
            duration: 30,
            audioUrl: customVideoUrl,
            isCustomUpload: true,
            type: 'file',
          }
        : DEFAULT_AUDIO_LIBRARY[0], // Recitation
      replacedAudioVolume: 0.9,
      replacedAudioStartTime: 0,
      textOverlays: [
        {
          ...DEFAULT_TEXT_OVERLAY,
          id: `txt_${timestamp}`,
          text: ratio === '9:16' ? 'وَقُل رَّبِّ زِدْنِي عِلْمًا' : 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
        }
      ],
      imageOverlays: [],
      effects: DEFAULT_SPIRITUAL_EFFECTS,
      thumbnailUrl: isAudio ? defaultThumbnail : (customVideoUrl || defaultThumbnail),
    };

    StorageService.saveProject(newDraft);
    setActiveDraft(newDraft);
    refreshDrafts();
    setActiveTab('editor');
  };

  const handleResumeDraft = (draft: ProjectDraft) => {
    setActiveDraft(draft);
    StorageService.setActiveProjectId(draft.id);
    setActiveTab('editor');
  };

  const handleDuplicateDraft = (id: string) => {
    const copy = StorageService.duplicateProject(id);
    refreshDrafts();
    if (copy) {
      setActiveDraft(copy);
    }
  };

  const handleDeleteDraft = (id: string) => {
    StorageService.deleteProject(id);
    refreshDrafts();
    if (activeDraft?.id === id) {
      const remaining = StorageService.getProjects();
      setActiveDraft(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleUpdateDraft = (updated: ProjectDraft) => {
    setActiveDraft(updated);
    refreshDrafts();
  };

  const handleOpenAutoLessonInEditor = (bgUrl: string, title: string, words: any[], audioUrl?: string) => {
    const timestamp = Date.now();
    const joinedText = words.map((w: any) => w.word).join(' ');
    const newDraft: ProjectDraft = {
      id: `draft_${timestamp}`,
      title: `درس تلقائي: ${title}`,
      aspectRatio: '9:16',
      createdAt: timestamp,
      updatedAt: timestamp,
      duration: 16,
      videoSourceUrl: bgUrl,
      videoSourceName: `${title}.jpg`,
      isCustomVideo: true,
      muteOriginalAudio: true,
      originalAudioVolume: 0,
      replacedAudio: audioUrl
        ? {
            id: `custom_audio_${timestamp}`,
            title: title,
            artist: 'الشيخ العيد',
            category: 'nasheed',
            duration: 16,
            audioUrl: audioUrl,
            isCustomUpload: true,
          }
        : DEFAULT_AUDIO_LIBRARY[0],
      replacedAudioVolume: 0.9,
      replacedAudioStartTime: 0,
      textOverlays: [
        {
          ...DEFAULT_TEXT_OVERLAY,
          id: `txt_${timestamp}`,
          text: joinedText || 'قِيَامُ اللَّيْلِ مِشْكَاةُ النُّورِ',
          fontFamily: 'Aref Ruqaa',
          fontSize: 32,
          color: '#FFDF9E',
        }
      ],
      imageOverlays: [],
      effects: DEFAULT_SPIRITUAL_EFFECTS,
      thumbnailUrl: bgUrl,
    };

    try {
      StorageService.saveProject(newDraft);
    } catch (_) {}
    setActiveDraft(newDraft);
    refreshDrafts();
    setActiveTab('editor');
  };

  const currentEditorDraft = activeDraft || (drafts.length > 0 ? drafts[0] : StorageService.seedInitialDrafts()[0]);

  return (
    <div className="min-h-screen bg-[#121316] text-[#E3E2E6] flex flex-col font-cairo selection:bg-[#006C4C] selection:text-white">
      {/* Material 3 Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProject={() => setActiveTab('home')}
        hasActiveProject={true}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeScreen
            drafts={drafts}
            onSelectRatio={handleSelectRatio}
            onResumeDraft={handleResumeDraft}
            onDuplicateDraft={handleDuplicateDraft}
            onDeleteDraft={handleDeleteDraft}
            onOpenAutoLessons={() => setActiveTab('auto_lessons')}
          />
        )}

        {activeTab === 'editor' && (
          <VideoEditorScreen
            draft={currentEditorDraft}
            onBackToHome={() => setActiveTab('home')}
            onUpdateDraft={handleUpdateDraft}
          />
        )}

        {activeTab === 'auto_lessons' && (
          <AutoLectureMakerScreen
            onOpenInEditor={handleOpenAutoLessonInEditor}
          />
        )}

        {activeTab === 'flutter_code' && (
          <FlutterCodeHub />
        )}
      </main>

      {/* Material 3 Subtle Footer */}
      <footer className="border-t border-[#2B2C30] py-6 px-4 text-center text-xs text-[#8E9192] bg-[#121316]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            تطبيق <span className="text-[#89F8C7] font-semibold">الشيخ العيد</span> لمونتاج وتحرير الفيديو الهادف · معايير Material Design 3 ومكتبة FFmpeg Kit
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={() => setActiveTab('flutter_code')} 
              className="hover:text-[#E3E2E6] transition-colors"
            >
              استعراض كود Flutter & Dart
            </button>
            <span aria-hidden="true">·</span>
            <span>قاعدة بيانات Hive المحلية</span>
          </div>
        </div>
      </footer>

      {/* Offline Mode Indicator Banner */}
      <OfflineIndicator />
    </div>
  );
}
