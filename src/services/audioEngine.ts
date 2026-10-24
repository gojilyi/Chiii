/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MediaClip } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private replacedGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private customAudioElement: HTMLAudioElement | null = null;
  private currentCustomUrl: string | null = null;
  private currentVolume: number = 0.8;
  private pendingPlayPromise: Promise<void> | null = null;
  private clipAudioElements: Map<string, HTMLAudioElement> = new Map();

  public initContext() {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.replacedGain = this.ctx.createGain();
          this.replacedGain.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  playReplacedTrack(
    _preset?: string,
    volume: number = 0.8,
    customUrl?: string,
    startTime: number = 0,
    _ambientPreset?: string,
    _ambientVolume?: number
  ) {
    this.initContext();
    this.currentVolume = volume;

    // Only play if a genuine custom audio URL (uploaded MP3 / live recorded audio file) is provided
    if (customUrl) {
      this.playCustomAudio(customUrl, volume, startTime);
      return;
    }

    // Stop and stay silent - absolutely NO synthetic oscillator chords or fake sounds
    this.stopCustomAudio();
    this.stopOscillators();
  }

  private playCustomAudio(
    url: string,
    volume: number,
    startTime: number = 0
  ) {
    this.stopOscillators();

    if (!this.customAudioElement) {
      this.customAudioElement = new Audio();
      this.customAudioElement.preload = 'auto';
    }

    const audio = this.customAudioElement;
    
    // Do NOT set crossOrigin for blob: or data: URLs as it causes browsers to reject them
    if (url.startsWith('http')) {
      audio.crossOrigin = 'anonymous';
    } else {
      audio.removeAttribute('crossorigin');
    }

    audio.volume = Math.max(0, Math.min(1, volume));

    // Handle src update
    if (this.currentCustomUrl !== url || audio.src !== url) {
      this.currentCustomUrl = url;
      audio.src = url;
      audio.load();
    }

    // Handle seeking to current time
    if (startTime >= 0 && Number.isFinite(startTime)) {
      try {
        if (Math.abs(audio.currentTime - startTime) > 0.35) {
          audio.currentTime = startTime;
        }
      } catch {
        // Will set when ready
      }
    }

    this.isPlaying = true;

    // Setup error callback - strictly no synthetic fallback
    audio.onerror = (e) => {
      console.warn('Custom audio element error on url:', url, e);
      this.isPlaying = false;
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      this.pendingPlayPromise = playPromise;
      playPromise
        .then(() => {
          this.pendingPlayPromise = null;
        })
        .catch((err) => {
          this.pendingPlayPromise = null;
          console.warn('Audio play interrupted or prevented by browser:', err);
          // If browser blocked autoplay, unlock upon first click or touch
          if (err.name === 'NotAllowedError') {
            const resumeOnInteraction = () => {
              if (this.isPlaying && this.customAudioElement) {
                this.customAudioElement.play().catch(() => {});
              }
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('touchstart', resumeOnInteraction);
              window.removeEventListener('keydown', resumeOnInteraction);
            };
            window.addEventListener('click', resumeOnInteraction, { once: true });
            window.addEventListener('touchstart', resumeOnInteraction, { once: true });
            window.addEventListener('keydown', resumeOnInteraction, { once: true });
          }
        });
    }
  }

  /**
   * Sync multi-track media audio clips with playback and timeline time
   */
  syncMediaClips(clips: MediaClip[], currentTime: number, isPlaying: boolean) {
    const audioClips = clips.filter((c) => c.type === 'audio');
    const activeClipIds = new Set(audioClips.map((c) => c.id));

    // Cleanup deleted clips
    this.clipAudioElements.forEach((audio, id) => {
      if (!activeClipIds.has(id)) {
        try {
          audio.pause();
          audio.src = '';
        } catch {}
        this.clipAudioElements.delete(id);
      }
    });

    audioClips.forEach((clip) => {
      let audio = this.clipAudioElements.get(clip.id);
      if (!audio) {
        audio = new Audio();
        audio.preload = 'auto';
        if (clip.url.startsWith('http')) {
          audio.crossOrigin = 'anonymous';
        }
        audio.src = clip.url;
        this.clipAudioElements.set(clip.id, audio);
      }

      const isInsideTime = currentTime >= clip.startTime && currentTime <= clip.endTime;
      const shouldPlay = isPlaying && isInsideTime && !clip.isMuted;

      audio.volume = Math.max(0, Math.min(1, (clip.volume ?? 1) * this.currentVolume));

      if (shouldPlay) {
        const expectedCurrentTime = (currentTime - clip.startTime) + (clip.trimStart || 0);
        if (Math.abs(audio.currentTime - expectedCurrentTime) > 0.4) {
          try {
            audio.currentTime = expectedCurrentTime;
          } catch {}
        }
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      } else {
        if (!audio.paused) {
          audio.pause();
        }
      }
    });
  }

  private playSynthesizedPreset(_preset?: string, _volume?: number) {
    // Pure silence - absolutely NO synthetic oscillators or fake chords
    this.stopOscillators();
  }

  seek(timeInSeconds: number) {
    if (this.customAudioElement && Number.isFinite(timeInSeconds)) {
      try {
        this.customAudioElement.currentTime = Math.max(0, timeInSeconds);
      } catch (err) {
        console.warn('Audio seek error:', err);
      }
    }
  }

  setReplacedVolume(volume: number) {
    this.currentVolume = volume;
    if (this.customAudioElement) {
      this.customAudioElement.volume = Math.max(0, Math.min(1, volume));
    }
    if (this.ctx && this.replacedGain) {
      this.replacedGain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    }
  }

  pause() {
    this.isPlaying = false;
    this.stopOscillators();
    if (this.customAudioElement) {
      if (this.pendingPlayPromise) {
        this.pendingPlayPromise
          .then(() => {
            this.customAudioElement?.pause();
          })
          .catch(() => {});
      } else {
        this.customAudioElement.pause();
      }
    }

    // Pause all extra audio clips
    this.clipAudioElements.forEach((audio) => {
      try {
        audio.pause();
      } catch {}
    });
  }

  stop() {
    this.isPlaying = false;
    this.stopOscillators();
    this.stopCustomAudio();

    // Stop and reset all clip audios
    this.clipAudioElements.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
  }

  private stopOscillators() {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeOscillators = [];
  }

  private stopCustomAudio() {
    if (this.customAudioElement) {
      if (this.pendingPlayPromise) {
        this.pendingPlayPromise
          .then(() => {
            if (this.customAudioElement) {
              this.customAudioElement.pause();
              this.customAudioElement.currentTime = 0;
            }
          })
          .catch(() => {});
      } else {
        this.customAudioElement.pause();
        this.customAudioElement.currentTime = 0;
      }
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    return this.customAudioElement ? this.customAudioElement.currentTime : 0;
  }

  getDuration(): number {
    return this.customAudioElement?.duration && Number.isFinite(this.customAudioElement.duration)
      ? this.customAudioElement.duration
      : 0;
  }
}

export const audioEngine = new AudioEngine();

/**
 * Extracts the real duration in seconds of any audio or video file/blob/URL.
 * Uses Web Audio API decodeAudioData for highest accuracy, with HTMLMediaElement fallback.
 * Never caps or restricts the duration.
 */
export async function extractMediaDuration(urlOrBlob: string | Blob): Promise<number> {
  // 1. Try Web Audio decodeAudioData (most accurate and works on mobile)
  try {
    let arrayBuffer: ArrayBuffer;
    if (urlOrBlob instanceof Blob) {
      arrayBuffer = await urlOrBlob.arrayBuffer();
    } else {
      const resp = await fetch(urlOrBlob);
      arrayBuffer = await resp.arrayBuffer();
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      const dur = +(decoded.duration).toFixed(2);
      audioCtx.close().catch(() => {});
      if (dur > 0 && Number.isFinite(dur)) {
        return dur;
      }
    }
  } catch (e) {
    // Might fail for video files or unsupported audio formats, fallback to HTMLMediaElement
  }

  // 2. Fallback to HTMLAudioElement / HTMLVideoElement onloadedmetadata
  return new Promise<number>((resolve) => {
    const isBlob = urlOrBlob instanceof Blob;
    const url = isBlob ? URL.createObjectURL(urlOrBlob) : urlOrBlob;
    const isVideo = typeof urlOrBlob === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(urlOrBlob);

    const elem = document.createElement(isVideo ? 'video' : 'audio');
    elem.preload = 'metadata';
    if (!url.startsWith('blob:') && !url.startsWith('data:') && url.startsWith('http')) {
      elem.crossOrigin = 'anonymous';
    }
    elem.onloadedmetadata = () => {
      const d = elem.duration && Number.isFinite(elem.duration) ? +(elem.duration).toFixed(2) : 0;
      if (isBlob) URL.revokeObjectURL(url);
      resolve(d);
    };
    elem.onerror = () => {
      if (isBlob) URL.revokeObjectURL(url);
      resolve(0);
    };
    elem.src = url;
  });
}
