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
    preset: string = 'spiritual_drone',
    volume: number = 0.8,
    customUrl?: string,
    startTime: number = 0,
    ambientPreset: string = 'spiritual_drone',
    ambientVolume: number = 0.35
  ) {
    this.initContext();
    this.currentVolume = volume;

    // If user provided a custom audio URL (uploaded MP3 / live recorded audio file)
    if (customUrl) {
      this.playCustomAudio(customUrl, volume, startTime, ambientPreset, ambientVolume);
      return;
    }

    // Stop custom audio if switching to preset
    this.stopCustomAudio();
    if (preset !== 'none' && preset !== 'silence') {
      this.playSynthesizedPreset(preset, volume);
    } else {
      this.stopOscillators();
    }
  }

  private playCustomAudio(
    url: string,
    volume: number,
    startTime: number = 0,
    ambientPreset: string = 'spiritual_drone',
    ambientVolume: number = 0.35
  ) {
    // If an ambient sound effect is selected alongside custom audio, start its subtle harmonic accompaniment
    if (ambientPreset && ambientPreset !== 'none' && ambientPreset !== 'silence' && ambientVolume > 0) {
      this.playSynthesizedPreset(ambientPreset, ambientVolume);
    } else {
      this.stopOscillators();
    }

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

    // Setup error fallback
    audio.onerror = (e) => {
      console.warn('Custom audio element error on url:', url, e, '- falling back to synth');
      if (this.isPlaying) {
        this.playSynthesizedPreset(ambientPreset || 'spiritual_drone', volume);
      }
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

  private playSynthesizedPreset(preset: string, volume: number) {
    this.stopOscillators();
    if (!this.ctx || !this.replacedGain) return;

    this.isPlaying = true;
    this.replacedGain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);

    // Peaceful synthesized spiritual soundscape (pure Web Audio chords / drone)
    // Scale: Peaceful D minor / Bayati spiritual aura (D3, A3, F3, E3, D4)
    const baseFreqs =
      preset === 'gentle_reverb'
        ? [110.0, 164.81, 220.0, 329.63] // Deep mosque hall acoustic resonance
        : preset === 'water_courtyard'
        ? [130.81, 196.0, 261.63, 392.0] // Courtyard fountain tranquil harmonics
        : preset === 'voice_clarity'
        ? [174.61, 261.63, 349.23, 440.0] // Warm human speech enhancer frequencies
        : preset === 'adhan_harmony'
        ? [146.83, 220.0, 261.63, 293.66]
        : preset === 'choral_peace'
        ? [130.81, 196.0, 261.63, 329.63]
        : [146.83, 220.0, 174.61, 293.66]; // Bayati serenity drone

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.replacedGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Soft sine wave for meditative/spiritual warmth
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Gentle subtle vibrato/breathing effect
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.12 / baseFreqs.length, this.ctx.currentTime + 1.2);

      osc.connect(oscGain);
      oscGain.connect(this.replacedGain);
      osc.start();

      this.activeOscillators.push(osc, lfo);
    });
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
