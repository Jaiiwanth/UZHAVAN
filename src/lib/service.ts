'use client';

import {
  Profile,
  CropBatch,
  ChainStage,
  Transaction,
  BatchNote,
  CreateBatchInput,
  MediaAsset,
  UploadMediaInput,
  UploadMediaResult,
} from '@/types';

// User and entity types for application layer
export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  preferredLanguage?: 'en' | 'ta';
  role: 'farmer' | 'trader' | 'fpo_admin' | 'inspector';
};

export type DbProfile = Profile;
export type DbCropBatch = CropBatch;
export type DbChainStage = ChainStage;
export type DbBatchNote = BatchNote;

// Client cache key for instant hydration
const LOCAL_AUTH_KEY = 'uzhavar_current_user';

function getStorage(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

function setStorage(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }
}

function removeStorage(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

class PostgresClientService {
  // ==========================================
  // AUTHENTICATION (POSTGRESQL SERVER-SIDE)
  // ==========================================

  async getCurrentUser(): Promise<UserProfile | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setStorage(LOCAL_AUTH_KEY, JSON.stringify(data.user));
            return data.user;
          } else {
            removeStorage(LOCAL_AUTH_KEY);
            return null;
          }
        }
      } catch {
        // Fall back to cached session if network glitch
      }
    }

    const stored = getStorage(LOCAL_AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  async signInWithEmail(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!email || !email.includes('@') || password.length < 6) {
      return { user: null, error: 'Please enter a valid email and minimum 6-character password.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setStorage(LOCAL_AUTH_KEY, JSON.stringify(data.user));
        return { user: data.user, error: null };
      }

      return { user: null, error: data.error || 'Invalid email or password.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during login.';
      return { user: null, error: msg };
    }
  }

  async signUpWithEmail(email: string, password: string, fullName: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!email || !email.includes('@') || password.length < 6) {
      return { user: null, error: 'Please enter a valid email and minimum 6-character password.' };
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setStorage(LOCAL_AUTH_KEY, JSON.stringify(data.user));
        return { user: data.user, error: null };
      }

      return { user: null, error: data.error || 'Registration failed.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during registration.';
      return { user: null, error: msg };
    }
  }

  async signOut(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    removeStorage(LOCAL_AUTH_KEY);
  }

  // ==========================================
  // CROP BATCHES (POSTGRESQL - REAL DATA ONLY)
  // ==========================================

  async getBatchesForCurrentUser(): Promise<CropBatch[]> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return [];

    try {
      const res = await fetch('/api/batches', {
        headers: {
          'x-user-id': currentUser.id,
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.batches)) {
          return data.batches;
        }
      }
    } catch (err) {
      console.error('Failed to fetch batches from server:', err);
    }

    return [];
  }

  async getBatchById(idOrBatchId: string): Promise<CropBatch | null> {
    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(idOrBatchId)}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batch) return data.batch;
      }
    } catch (err) {
      console.error('Failed to fetch batch from server:', err);
    }

    return null;
  }

  async createBatch(input: CreateBatchInput): Promise<{ batch: CropBatch | null; error: string | null }> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      return { batch: null, error: 'User must be authenticated to create a crop batch.' };
    }

    if (!input.cropName || input.cropName.trim().length === 0) {
      return { batch: null, error: 'Crop or produce name is required.' };
    }

    if (!input.quantityKg || isNaN(input.quantityKg) || input.quantityKg <= 0) {
      return { batch: null, error: 'Please enter a valid positive quantity in kilograms.' };
    }

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify(input),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.batch) {
        return { batch: data.batch, error: null };
      }

      return { batch: null, error: data.error || 'Failed to create batch in database.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error creating batch.';
      return { batch: null, error: msg };
    }
  }

  // ==========================================
  // CHAIN STAGES (POSTGRESQL PROVENANCE)
  // ==========================================

  async getChainStages(batchId: string): Promise<ChainStage[]> {
    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(batchId)}/stages`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.stages)) {
          return data.stages;
        }
      }
    } catch (err) {
      console.error('Failed to fetch chain stages:', err);
    }

    // Do NOT fabricate stages. If not recorded in DB, return empty array!
    return [];
  }

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  async getTransactions(batchId: string): Promise<Transaction[]> {
    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(batchId)}/transactions`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.transactions)) {
          return data.transactions;
        }
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }

    // Do NOT fabricate transactions. If none exist, return empty array!
    return [];
  }

  // ==========================================
  // BATCH NOTES (FIELD NOTES & TACIT KNOWLEDGE)
  // ==========================================

  async getBatchNotes(batchId: string): Promise<BatchNote[]> {
    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(batchId)}/notes`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notes)) {
          return data.notes;
        }
      }
    } catch (err) {
      console.error('Failed to fetch batch notes:', err);
    }

    return [];
  }

  async addBatchNote(batchId: string, note: string, noteType: BatchNote['note_type'] = 'field'): Promise<boolean> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || !note.trim()) return false;

    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(batchId)}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ note: note.trim(), noteType }),
        credentials: 'include',
      });
      if (res.ok) return true;
    } catch (err) {
      console.error('Failed to save batch note:', err);
    }

    return false;
  }

  // ==========================================
  // MEDIA ASSETS (CLIENT-SIDE ATTACHMENTS)
  // ==========================================

  async uploadMedia(input: UploadMediaInput): Promise<UploadMediaResult> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      return { asset: null, signedUrl: null, error: 'You must be signed in to upload files.' };
    }

    const { file, batchId, assetType, description } = input;
    const url = typeof URL !== 'undefined' ? URL.createObjectURL(file) : '';
    const nowIso = new Date().toISOString();

    const asset: MediaAsset = {
      id: `asset_${Date.now()}`,
      user_id: currentUser.id,
      batch_id: batchId || null,
      asset_type: assetType,
      bucket_name: assetType === 'crop_image' ? 'crop-images' : 'batch-documents',
      storage_path: `local/${currentUser.id}/${file.name}`,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      description: description || null,
      is_public: false,
      created_at: nowIso,
      signed_url: url,
    };

    return { asset, signedUrl: url, error: null };
  }

  async getMediaAssets(): Promise<MediaAsset[]> {
    return [];
  }

  async getMediaAssetsByBatch(_batchId: string): Promise<MediaAsset[]> {
    return [];
  }

  async getSignedUrl(_assetId: string): Promise<string | null> {
    return null;
  }

  async deleteMediaAsset(_assetId: string): Promise<{ error: string | null }> {
    return { error: null };
  }
}

export const localService = new PostgresClientService();
