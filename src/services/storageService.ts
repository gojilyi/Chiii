/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectDraft } from '../types';
import { 
  ASSET_MINARET_SUNSET, 
  ASSET_QURAN_LIGHT, 
  DEFAULT_AUDIO_LIBRARY, 
  DEFAULT_SPIRITUAL_EFFECTS, 
  DEFAULT_TEXT_OVERLAY,
  DEFAULT_PARTICLE_OVERLAYS
} from '../constants/defaults';
import { 
  ASSET_ANTIQUE_PARCHMENT, 
  DEFAULT_CALLIGRAPHY_STORY 
} from '../constants/calligraphyDefaults';

const STORAGE_KEY = 'sheikh_eid_drafts_v2';
const CURRENT_PROJECT_KEY = 'sheikh_eid_active_project_id';
const IDB_NAME = 'sheikh_eid_studio_db';
const IDB_VERSION = 1;
const STORE_NAME = 'project_drafts';

const resolveStoredAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (url.includes('islamic_minaret_sunset')) return ASSET_MINARET_SUNSET;
  if (url.includes('quran_golden_light')) return ASSET_QURAN_LIGHT;
  if (url.includes('antique_parchment_candle')) return ASSET_ANTIQUE_PARCHMENT;
  return url;
};

// ============================================================================
// IndexedDB Helper (Handles rich media & unlimited project storage without quota issues)
// ============================================================================

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
}

async function saveDraftToIDB(draft: ProjectDraft): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(draft);
  } catch (_) {}
}

async function deleteDraftFromIDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch (_) {}
}

async function loadDraftsFromIDB(): Promise<ProjectDraft[]> {
  try {
    const db = await openDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve((req.result as ProjectDraft[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch (_) {
    return [];
  }
}

// ============================================================================
// Sanitizer to guarantee localStorage stays tiny and NEVER hits QuotaExceededError
// ============================================================================

const sanitizeForLocalStorage = (draft: ProjectDraft): ProjectDraft => {
  const clone: ProjectDraft = JSON.parse(JSON.stringify(draft));
  const MAX_STR_LEN = 15000;

  // Never store huge base64 strings in localStorage (they stay in IndexedDB and RAM cache)
  if (clone.videoSourceUrl && clone.videoSourceUrl.startsWith('data:') && clone.videoSourceUrl.length > MAX_STR_LEN) {
    clone.videoSourceUrl = ASSET_MINARET_SUNSET;
  }
  if (clone.thumbnailUrl && clone.thumbnailUrl.startsWith('data:') && clone.thumbnailUrl.length > MAX_STR_LEN) {
    clone.thumbnailUrl = clone.videoSourceUrl || ASSET_MINARET_SUNSET;
  }
  if (clone.replacedAudio?.audioUrl && clone.replacedAudio.audioUrl.startsWith('data:') && clone.replacedAudio.audioUrl.length > MAX_STR_LEN) {
    clone.replacedAudio = {
      ...clone.replacedAudio,
      audioUrl: '',
    };
  }
  if (clone.mediaClips) {
    clone.mediaClips = clone.mediaClips.map((clip) => {
      if (clip.url && clip.url.startsWith('data:') && clip.url.length > MAX_STR_LEN) {
        return { ...clip, url: '' };
      }
      return clip;
    });
  }
  return clone;
};

// ============================================================================
// StorageService Class
// ============================================================================

export class StorageService {
  // Synchronous in-memory cache to guarantee zero-latency UI reads
  private static _memoryCache: ProjectDraft[] | null = null;
  private static _idbHydrated: boolean = false;

  /**
   * Initializes and hydrates from IndexedDB in the background
   */
  static async initStorage(): Promise<void> {
    if (this._idbHydrated) return;
    try {
      const idbDrafts = await loadDraftsFromIDB();
      if (idbDrafts && idbDrafts.length > 0) {
        if (!this._memoryCache) {
          this._memoryCache = idbDrafts;
        } else {
          // Merge unique projects from IndexedDB into memoryCache
          const currentIds = new Set(this._memoryCache.map((p) => p.id));
          for (const d of idbDrafts) {
            if (!currentIds.has(d.id)) {
              this._memoryCache.push(d);
            }
          }
        }
      }
      this._idbHydrated = true;
    } catch (_) {}
  }

  /**
   * Retrieves all draft projects with multi-tier storage (Memory -> localStorage -> IndexedDB -> Seeds)
   */
  static getProjects(): ProjectDraft[] {
    if (this._memoryCache && this._memoryCache.length > 0) {
      return [...this._memoryCache];
    }

    try {
      const data = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (!data) {
        const seeded = this.seedInitialDrafts();
        this._memoryCache = [...seeded];
        this._safeSaveToLocalStorage(seeded);
        // Also persist seeds to IndexedDB
        seeded.forEach((s) => saveDraftToIDB(s));
        return seeded;
      }

      const parsed: ProjectDraft[] = JSON.parse(data);
      const cleaned = parsed.map((d) => ({
        ...d,
        videoSourceUrl: resolveStoredAssetUrl(d.videoSourceUrl),
        thumbnailUrl: resolveStoredAssetUrl(d.thumbnailUrl),
        particleOverlays: d.particleOverlays || DEFAULT_PARTICLE_OVERLAYS,
      }));

      this._memoryCache = [...cleaned];

      // Trigger background sync with IndexedDB
      this.initStorage();

      return cleaned;
    } catch (err) {
      // In case of corrupt localStorage, fall back to seeds
      const seeded = this.seedInitialDrafts();
      this._memoryCache = [...seeded];
      return seeded;
    }
  }

  static getProjectById(id: string): ProjectDraft | null {
    const list = this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  /**
   * Saves a project draft safely without ever throwing QuotaExceededError
   */
  static saveProject(project: ProjectDraft): void {
    // 1. Update in-memory cache immediately
    const list = this._memoryCache ? [...this._memoryCache] : this.getProjects();
    const existingIdx = list.findIndex((p) => p.id === project.id);
    project.updatedAt = Date.now();

    if (existingIdx >= 0) {
      list[existingIdx] = { ...project };
    } else {
      list.unshift({ ...project });
    }
    this._memoryCache = list;

    // 2. Persist full fidelity project to IndexedDB (asynchronous, no quota limit)
    saveDraftToIDB(project);

    // 3. Save active ID to localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_PROJECT_KEY, project.id);
      }
    } catch (_) {}

    // 4. Safely persist sanitized list to localStorage with quota-exceeded auto-recovery
    this._safeSaveToLocalStorage(list);
  }

  /**
   * Robust localStorage saver that prunes and self-heals when browser quota is constrained
   */
  private static _safeSaveToLocalStorage(projects: ProjectDraft[]): void {
    if (typeof window === 'undefined') return;

    try {
      // Keep only up to 8 recent drafts in localStorage, sanitized of heavy base64
      const sanitized = projects.slice(0, 8).map(sanitizeForLocalStorage);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (quotaError) {
      // QuotaExceededError caught! Self-healing strategy:
      try {
        // Attempt recovery: save only the single most recent project
        if (projects.length > 0) {
          const minimal = [sanitizeForLocalStorage(projects[0])];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
        }
      } catch (_) {
        // If localStorage is completely choked by external keys, clear old key gracefully.
        // Full data is preserved in memory and IndexedDB.
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
      }
    }
  }

  static deleteProject(id: string): void {
    if (this._memoryCache) {
      this._memoryCache = this._memoryCache.filter((p) => p.id !== id);
    }
    const remaining = this.getProjects().filter((p) => p.id !== id);
    this._memoryCache = remaining;

    deleteDraftFromIDB(id);

    try {
      if (typeof window !== 'undefined') {
        this._safeSaveToLocalStorage(remaining);
        if (localStorage.getItem(CURRENT_PROJECT_KEY) === id) {
          localStorage.removeItem(CURRENT_PROJECT_KEY);
        }
      }
    } catch (_) {}
  }

  static duplicateProject(id: string): ProjectDraft | null {
    const original = this.getProjectById(id);
    if (!original) return null;

    const copy: ProjectDraft = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'draft_' + Date.now(),
      title: `${original.title} (نسخة)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.saveProject(copy);
    return copy;
  }

  static getActiveProjectId(): string | null {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(CURRENT_PROJECT_KEY) : null;
    } catch (_) {
      return null;
    }
  }

  static setActiveProjectId(id: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_PROJECT_KEY, id);
      }
    } catch (_) {}
  }

  static seedInitialDrafts(): ProjectDraft[] {
    const now = Date.now();
    return [
      {
        id: 'draft_reels_taaha',
        title: 'ريلز: رَبِّ زِدْنِي عِلْمًا',
        aspectRatio: '9:16',
        createdAt: now - 3600000 * 4,
        updatedAt: now - 3600000 * 2,
        duration: 15,
        videoSourceUrl: ASSET_MINARET_SUNSET,
        videoSourceName: 'مشهد المئذنة الذهبي.mp4',
        muteOriginalAudio: true,
        originalAudioVolume: 0,
        replacedAudio: DEFAULT_AUDIO_LIBRARY[0], // Recitation
        replacedAudioVolume: 0.95,
        replacedAudioStartTime: 0,
        textOverlays: [
          {
            ...DEFAULT_TEXT_OVERLAY,
            id: 'txt-1',
            text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
            fontFamily: 'Amiri',
            fontSize: 30,
            hasAyahBrackets: true,
            positionY: 78,
          }
        ],
        imageOverlays: [],
        effects: DEFAULT_SPIRITUAL_EFFECTS,
        thumbnailUrl: ASSET_MINARET_SUNSET,
      },
      {
        id: 'draft_youtube_lecture',
        title: 'يوتيوب: درس الشيخ العيد - فضائل القرآن',
        aspectRatio: '16:9',
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000,
        duration: 25,
        videoSourceUrl: ASSET_QURAN_LIGHT,
        videoSourceName: 'مصحف المسجد العتيق.mp4',
        muteOriginalAudio: true,
        originalAudioVolume: 0,
        replacedAudio: DEFAULT_AUDIO_LIBRARY[2], // Nasheed
        replacedAudioVolume: 0.8,
        replacedAudioStartTime: 0,
        textOverlays: [
          {
            id: 'txt-2',
            text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
            fontFamily: 'Amiri',
            fontSize: 32,
            color: '#FFDF9E',
            hasAyahBrackets: false,
            alignment: 'center',
            positionX: 50,
            positionY: 82,
            startTime: 0,
            endTime: 25,
            animation: 'glow',
          }
        ],
        imageOverlays: [],
        effects: DEFAULT_SPIRITUAL_EFFECTS.map((e) =>
          e.id === 'warm_dawn' ? { ...e, enabled: true } : e
        ),
        thumbnailUrl: ASSET_QURAN_LIGHT,
      },
      {
        id: 'draft_antique_parchment_calligraphy',
        title: 'مخطوطة الريشة: اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
        aspectRatio: '9:16',
        createdAt: now - 1800000,
        updatedAt: now,
        duration: 12,
        videoSourceUrl: ASSET_ANTIQUE_PARCHMENT,
        videoSourceName: 'مخطوطة_عتيقة_مع_شمعة.jpg',
        muteOriginalAudio: true,
        originalAudioVolume: 0,
        replacedAudio: DEFAULT_AUDIO_LIBRARY[0],
        replacedAudioVolume: 0.95,
        replacedAudioStartTime: 0,
        textOverlays: [],
        imageOverlays: [],
        effects: DEFAULT_SPIRITUAL_EFFECTS,
        calligraphyStory: DEFAULT_CALLIGRAPHY_STORY,
        thumbnailUrl: ASSET_ANTIQUE_PARCHMENT,
      }
    ];
  }
}
