/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AspectRatioType = '9:16' | '16:9' | '1:1';

export interface AspectRatioOption {
  id: AspectRatioType;
  title: string;
  subtitle: string;
  dimensions: string;
  iconName: string;
  widthRatio: number;
  heightRatio: number;
  recommendedFor: string;
}

export interface TimedWord {
  id: string;
  word: string;
  startMs: number;
  endMs: number;
}

export interface CalligraphyStoryConfig {
  enabled: boolean;
  fontStyle: 'Aref Ruqaa' | 'Amiri' | 'Cairo';
  mode: 'word_by_word' | 'ink_drawing' | 'typewriter' | 'karaoke';
  highlightColor: string;
  defaultColor: string;
  fontSize: number;
  parchmentBackgroundUrl: string;
  words: TimedWord[];
  audioSourceTitle: string;
}

export interface TextOverlay {
  id: string;
  text: string;
  fontFamily: 'Amiri' | 'Aref Ruqaa' | 'Cairo' | 'serif' | 'sans-serif';
  fontSize: number; // in pt/px
  color: string;
  backgroundColor?: string;
  hasAyahBrackets?: boolean; // ﴿ ... ﴾
  alignment: 'center' | 'right' | 'left';
  positionY: number; // percentage 0-100
  positionX: number; // percentage 0-100
  startTime: number; // seconds
  endTime: number; // seconds
  animation: 'none' | 'fade' | 'slideUp' | 'glow' | 'typewriter' | 'ruqaa_draw';
}

export type MediaType = 'video' | 'image' | 'audio';

export interface MediaClip {
  id: string;
  type: MediaType;
  name: string;
  url: string;
  duration: number; // original duration in seconds
  startTime: number; // timeline start position in seconds
  endTime: number; // timeline end position in seconds
  trimStart: number; // offset from start in seconds
  trimEnd: number; // offset from end in seconds
  volume?: number; // 0 to 1
  opacity?: number; // 0 to 1 (for images/videos)
  scale?: number; // 0.1 to 3 (for images/videos)
  positionX?: number; // 0 to 100
  positionY?: number; // 0 to 100
  isMuted?: boolean;
}

export type ExportFormatType = 'mp4' | 'webm' | 'mov' | 'gif' | 'mp3';
export type ExportResolutionType = '1080p' | '720p' | '4k';

export interface ImageOverlay {
  id: string;
  url: string;
  name: string;
  opacity: number;
  scale: number;
  positionX: number;
  positionY: number;
  startTime: number;
  endTime: number;
  isFrameBorder?: boolean;
}

export type SpiritualEffectType = 
  | 'spiritual_glow'
  | 'golden_dust'
  | 'warm_dawn'
  | 'arabesque_vignette'
  | 'cinematic_teal_amber'
  | 'subtle_zoom'
  | 'light_leaks'
  | 'audio_spectrum'
  | 'god_rays'
  | 'heavenly_clouds'
  | 'vintage_film_grain'
  | 'pulse_heartbeat'
  | 'focus_reveal'
  | 'islamic_gold_frame';

export interface SpiritualEffect {
  id: SpiritualEffectType;
  name: string;
  description: string;
  intensity: number; // 0 - 100
  enabled: boolean;
  category?: 'lighting' | 'particles' | 'motion' | 'visualizer' | 'vintage';
  tag?: string;
}

export interface MontageChromaOverlay {
  id: string;
  name: string;
  blendMode: 'screen' | 'overlay' | 'lighter';
  opacity: number; // 0 - 1
  enabled: boolean;
  sourceUrl?: string;
  type: 'light_flare' | 'particles' | 'spectrum' | 'clouds' | 'film_burn' | 'youtube_import';
  youtubeLink?: string;
}

export type ParticleType = 
  | 'golden_dust'         // غبار ذهبي طافي
  | 'soft_lights_bokeh'    // أضواء بوكيه هادئة ونورانية
  | 'dawn_god_rays'        // أشعة نورانية فجرية
  | 'emerald_sparkles'     // ذرات زمردية متلألئة
  | 'celestial_stardust'   // وميض سماوي ليلي
  | 'candle_shimmer';      // وهج الشموع الدافئ

export interface ParticleOverlayItem {
  id: ParticleType;
  name: string;
  nameEn: string;
  description: string;
  enabled: boolean;
  intensity: number;      // 0 - 100
  particleCount: number;  // 10 - 150
  speed: 'slow' | 'calm' | 'medium';
  blendMode: 'screen' | 'lighter' | 'overlay';
  colorPalette: 'gold' | 'soft_white' | 'emerald' | 'amber';
  ffmpegFilterCode: string;
}

export interface AudioTrackConfig {
  id: string;
  title: string;
  artist: string;
  category: 'quran' | 'adhan' | 'nasheed' | 'ambient';
  duration: number; // seconds
  audioUrl?: string;
  isCustomUpload?: boolean;
  type?: 'synth' | 'file';
  synthPreset?: string;
}

export interface ProjectDraft {
  id: string;
  title: string;
  aspectRatio: AspectRatioType;
  createdAt: number;
  updatedAt: number;
  duration: number; // seconds (default e.g. 15 or video duration)
  videoSourceUrl: string;
  videoSourceName: string;
  isCustomVideo?: boolean;
  trimStart?: number; // Video trim start in seconds
  trimEnd?: number; // Video trim end in seconds
  mediaClips?: MediaClip[]; // Multiple images, videos, audio clips on the timeline
  
  // Audio configuration (Mute & Replace feature)
  muteOriginalAudio: boolean;
  originalAudioVolume: number; // 0 to 1
  replacedAudio?: AudioTrackConfig | null;
  replacedAudioVolume: number; // 0 to 1
  replacedAudioStartTime: number; // offset
  
  // Overlays & Effects
  textOverlays: TextOverlay[];
  imageOverlays: ImageOverlay[];
  effects: SpiritualEffect[];
  chromaOverlays?: MontageChromaOverlay[];
  particleOverlays?: ParticleOverlayItem[];
  calligraphyStory?: CalligraphyStoryConfig;
  
  thumbnailUrl: string;
}
