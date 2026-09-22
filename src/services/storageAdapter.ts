import {
  UserProfile,
  ResumeVersion,
  ImportExportPackage,
  ImportExportPackageSchema,
} from '../types/resume';

export interface IStorageAdapter {
  init(): Promise<void>;
  getProfiles(): Promise<UserProfile[]>;
  saveProfile(profile: UserProfile): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;
  getVersions(profileId?: string): Promise<ResumeVersion[]>;
  getVersion(versionId: string): Promise<ResumeVersion | null>;
  saveVersion(version: ResumeVersion): Promise<void>;
  deleteVersion(versionId: string): Promise<void>;
  getActiveSelection(): Promise<{ profileId: string; versionId: string } | null>;
  setActiveSelection(profileId: string, versionId: string): Promise<void>;
  exportAll(): Promise<ImportExportPackage>;
  importAll(pkg: ImportExportPackage, mode: 'merge' | 'overwrite'): Promise<void>;
  clearAll(): Promise<void>;
}

const DB_NAME = 'sen_resume_carbon_db';
const DB_VERSION = 1;

class IndexedDBStorageAdapter implements IStorageAdapter {
  private db: IDBDatabase | null = null;
  private isFallback = false;

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported, falling back to LocalStorage');
      this.isFallback = true;
      return;
    }

    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('profiles')) {
            db.createObjectStore('profiles', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('versions')) {
            const versionStore = db.createObjectStore('versions', { keyPath: 'id' });
            versionStore.createIndex('profileId', 'profileId', { unique: false });
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('IndexedDB initialization failed, falling back to localStorage:', err);
      this.isFallback = true;
    }
  }

  // Fallback storage helpers
  private getLocal<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`sen_resume_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setLocal(key: string, value: unknown): void {
    try {
      localStorage.setItem(`sen_resume_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }

  async getProfiles(): Promise<UserProfile[]> {
    if (this.isFallback || !this.db) {
      return this.getLocal<UserProfile[]>('profiles', []);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    if (this.isFallback || !this.db) {
      const profiles = this.getLocal<UserProfile[]>('profiles', []);
      const index = profiles.findIndex((p) => p.id === profile.id);
      if (index >= 0) profiles[index] = profile;
      else profiles.push(profile);
      this.setLocal('profiles', profiles);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      const req = store.put(profile);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteProfile(profileId: string): Promise<void> {
    // Delete profile and associated versions
    if (this.isFallback || !this.db) {
      const profiles = this.getLocal<UserProfile[]>('profiles', []).filter((p) => p.id !== profileId);
      this.setLocal('profiles', profiles);
      const versions = this.getLocal<ResumeVersion[]>('versions', []).filter((v) => v.profileId !== profileId);
      this.setLocal('versions', versions);
      return;
    }

    return new Promise(async (resolve, reject) => {
      try {
        const tx = this.db!.transaction(['profiles', 'versions'], 'readwrite');
        tx.objectStore('profiles').delete(profileId);

        // Delete all versions for this profile
        const versionStore = tx.objectStore('versions');
        const index = versionStore.index('profileId');
        const req = index.getAllKeys(profileId);
        req.onsuccess = () => {
          for (const key of req.result) {
            versionStore.delete(key);
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getVersions(profileId?: string): Promise<ResumeVersion[]> {
    if (this.isFallback || !this.db) {
      const versions = this.getLocal<ResumeVersion[]>('versions', []);
      return profileId ? versions.filter((v) => v.profileId === profileId) : versions;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('versions', 'readonly');
      const store = tx.objectStore('versions');
      if (profileId) {
        const index = store.index('profileId');
        const req = index.getAll(profileId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } else {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      }
    });
  }

  async getVersion(versionId: string): Promise<ResumeVersion | null> {
    if (this.isFallback || !this.db) {
      const versions = this.getLocal<ResumeVersion[]>('versions', []);
      return versions.find((v) => v.id === versionId) || null;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('versions', 'readonly');
      const store = tx.objectStore('versions');
      const req = store.get(versionId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveVersion(version: ResumeVersion): Promise<void> {
    if (this.isFallback || !this.db) {
      const versions = this.getLocal<ResumeVersion[]>('versions', []);
      const index = versions.findIndex((v) => v.id === version.id);
      if (index >= 0) versions[index] = version;
      else versions.push(version);
      this.setLocal('versions', versions);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('versions', 'readwrite');
      const store = tx.objectStore('versions');
      const req = store.put(version);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteVersion(versionId: string): Promise<void> {
    if (this.isFallback || !this.db) {
      const versions = this.getLocal<ResumeVersion[]>('versions', []).filter((v) => v.id !== versionId);
      this.setLocal('versions', versions);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('versions', 'readwrite');
      const store = tx.objectStore('versions');
      const req = store.delete(versionId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getActiveSelection(): Promise<{ profileId: string; versionId: string } | null> {
    if (this.isFallback || !this.db) {
      return this.getLocal('active_selection', null);
    }

    return new Promise((resolve) => {
      const tx = this.db!.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('active_selection');
      req.onsuccess = () => {
        resolve(req.result ? req.result.value : null);
      };
      req.onerror = () => resolve(null);
    });
  }

  async setActiveSelection(profileId: string, versionId: string): Promise<void> {
    if (this.isFallback || !this.db) {
      this.setLocal('active_selection', { profileId, versionId });
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key: 'active_selection', value: { profileId, versionId } });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async exportAll(): Promise<ImportExportPackage> {
    const profiles = await this.getProfiles();
    const versions = await this.getVersions();

    const pkg: ImportExportPackage = {
      schemaVersion: '1.0.0',
      appName: 'Sen Resume',
      exportDate: new Date().toISOString(),
      metadata: {
        totalProfiles: profiles.length,
        totalVersions: versions.length,
        clientPlatform: navigator.userAgent || 'Web',
      },
      profiles,
      versions,
    };

    return pkg;
  }

  async importAll(pkg: ImportExportPackage, mode: 'merge' | 'overwrite'): Promise<void> {
    // Validate with Zod before modifying store
    const validated = ImportExportPackageSchema.parse(pkg);

    if (mode === 'overwrite') {
      await this.clearAll();
    }

    for (const profile of validated.profiles) {
      await this.saveProfile(profile);
    }

    for (const version of validated.versions) {
      await this.saveVersion(version);
    }

    if (validated.profiles.length > 0) {
      const firstProf = validated.profiles[0];
      await this.setActiveSelection(firstProf.id, firstProf.defaultVersionId);
    }
  }

  async clearAll(): Promise<void> {
    if (this.isFallback || !this.db) {
      localStorage.removeItem('sen_resume_profiles');
      localStorage.removeItem('sen_resume_versions');
      localStorage.removeItem('sen_resume_active_selection');
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['profiles', 'versions', 'settings'], 'readwrite');
      tx.objectStore('profiles').clear();
      tx.objectStore('versions').clear();
      tx.objectStore('settings').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

// Singleton adapter instance
export const storageAdapter: IStorageAdapter = new IndexedDBStorageAdapter();
