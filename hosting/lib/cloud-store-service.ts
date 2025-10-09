'use client';

import { getFirebaseServices } from './firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface CloudStoredMarkdown {
  id: string;
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
  downloadUrl?: string;
  content?: string;
  metadata?: Record<string, any>;
}

class CloudStoreService {
  private readonly STORAGE_KEY = 'contentHub_markdownNotes';

  private get hasWindow(): boolean {
    return typeof window !== 'undefined';
  }

  private readLocalRecords(): Record<string, CloudStoredMarkdown> {
    if (!this.hasWindow) {
      return {};
    }

    try {
      const stored = window.localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return {};
      }
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to read markdown records from local storage:', error);
      return {};
    }
  }

  private writeLocalRecords(records: Record<string, CloudStoredMarkdown>): void {
    if (!this.hasWindow) {
      return;
    }

    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.warn('Failed to persist markdown records to local storage:', error);
    }
  }

  async saveMarkdownNote(
    file: File,
    options: {
      metadata?: Record<string, any>;
      contentText?: string;
    } = {}
  ): Promise<CloudStoredMarkdown> {
    if (!this.hasWindow) {
      throw new Error('Cloud store is only available in the browser runtime.');
    }

    const id = options.metadata?.id || `md-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const uploadedAt = new Date().toISOString();
    const name = options.metadata?.name || file.name || `${id}.md`;

    let path = `content-hub/notes/${id}.md`;
    let downloadUrl: string | undefined;

    try {
      const { storage } = getFirebaseServices();
      if (!storage) {
        throw new Error('Firebase storage service is unavailable');
      }

      const storageRef = ref(storage, path);
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: 'text/markdown',
        customMetadata: {
          ...options.metadata,
          originalName: file.name,
          importedAt: uploadedAt,
        },
      });

      path = uploadResult.ref.fullPath;
      downloadUrl = await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.warn('Markdown upload to cloud storage failed; using local fallback.', error);
      path = `local://${id}`;
    }

    const record: CloudStoredMarkdown = {
      id,
      name,
      path,
      size: file.size,
      uploadedAt,
      downloadUrl,
      content: options.contentText,
      metadata: options.metadata,
    };

    const records = this.readLocalRecords();
    records[id] = record;
    this.writeLocalRecords(records);

    return record;
  }

  getMarkdownRecord(id: string): CloudStoredMarkdown | null {
    const records = this.readLocalRecords();
    return records[id] || null;
  }

  listMarkdownRecords(): CloudStoredMarkdown[] {
    const records = this.readLocalRecords();
    return Object.values(records).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  getCallableMarkdown(id: string): (() => Promise<string>) | null {
    const record = this.getMarkdownRecord(id);
    if (!record) {
      return null;
    }

    return async () => {
      if (record.downloadUrl) {
        const response = await fetch(record.downloadUrl);
        return await response.text();
      }

      if (record.content) {
        return record.content;
      }

      return '';
    };
  }
}

const cloudStoreService = new CloudStoreService();
export default cloudStoreService;
