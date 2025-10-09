/**
 * Firebase Storage File Upload Hook
 * Provides easy file upload functionality with progress tracking
 */

'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask, deleteObject } from 'firebase/storage';
import { storage } from '../src/lib/firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    name: string;
    size: number;
    type: string;
    path: string;
  };
}

export interface UseFileUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);

  const { maxSizeMB = 50, allowedTypes = [], onSuccess, onError } = options;

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.startsWith(type))) {
      return {
        valid: false,
        error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }, [maxSizeMB, allowedTypes]);

  /**
   * Upload a file to Firebase Storage
   */
  const upload = useCallback(async (
    file: File,
    path: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    setProgress(null);
    setDownloadURL(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      const errorMsg = validation.error || 'File validation failed';
      setError(errorMsg);
      setUploading(false);
      onError?.(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      setUploadTask(task);

      return new Promise<UploadResult>((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot) => {
            const progressData = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            setProgress(progressData);
          },
          (error) => {
            const errorMsg = error.message || 'Upload failed';
            setError(errorMsg);
            setUploading(false);
            onError?.(errorMsg);
            reject({ success: false, error: errorMsg });
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setDownloadURL(url);
            setUploading(false);
            onSuccess?.(url);

            const result: UploadResult = {
              success: true,
              url,
              metadata: {
                name: file.name,
                size: file.size,
                type: file.type,
                path
              }
            };
            resolve(result);
          }
        );
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      setUploading(false);
      onError?.(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [validateFile, onSuccess, onError]);

  /**
   * Upload multiple files
   */
  const uploadMultiple = useCallback(async (
    files: File[],
    getPath: (file: File, index: number) => string
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = getPath(file, i);
      const result = await upload(file, path);
      results.push(result);
    }

    return results;
  }, [upload]);

  /**
   * Cancel ongoing upload
   */
  const cancel = useCallback(() => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploading(false);
      setError('Upload cancelled');
    }
  }, [uploadTask]);

  /**
   * Delete uploaded file
   */
  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }, []);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(null);
    setError(null);
    setDownloadURL(null);
    setUploadTask(null);
  }, []);

  return {
    upload,
    uploadMultiple,
    cancel,
    deleteFile,
    reset,
    uploading,
    progress,
    error,
    downloadURL
  };
}

/**
 * Hook for image uploads with resize capability
 */
export function useImageUpload(options: UseFileUploadOptions & { maxWidth?: number } = {}) {
  const { maxWidth = 1200, ...uploadOptions } = options;
  const fileUpload = useFileUpload({
    ...uploadOptions,
    allowedTypes: ['image/']
  });

  /**
   * Resize image before upload
   */
  const resizeImage = useCallback(async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to resize image'));
          },
          file.type,
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, [maxWidth]);

  /**
   * Upload with automatic resize
   */
  const uploadResized = useCallback(async (file: File, path: string): Promise<UploadResult> => {
    try {
      const resizedBlob = await resizeImage(file);
      const resizedFile = new File([resizedBlob], file.name, { type: file.type });
      return fileUpload.upload(resizedFile, path);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resize image'
      };
    }
  }, [resizeImage, fileUpload]);

  return {
    ...fileUpload,
    uploadResized,
    resizeImage
  };
}

export default useFileUpload;
