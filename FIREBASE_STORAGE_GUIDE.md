# Firebase Storage Integration Guide

## Overview

Your Firebase Storage bucket: `gs://henryreedai.firebasestorage.app`

This guide covers how to use Firebase Storage for file uploads, downloads, and management in the Cortex Domain Consultant platform.

## 1. Current Configuration

### Firebase Storage is already initialized in your project:

**File**: `hosting/src/lib/firebase.ts`
```typescript
import { getStorage } from 'firebase/storage';

export const storage = getStorage(app);
```

**Bucket URL**: `gs://henryreedai.firebasestorage.app`

**Web Access URL**: `https://firebasestorage.googleapis.com/v0/b/henryreedai.firebasestorage.app/o/`

## 2. Basic Usage Examples

### Upload a File

```typescript
import { ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../src/lib/firebase';

// Simple upload
async function uploadFile(file: File, path: string) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  console.log('Uploaded file:', snapshot.metadata);
  return snapshot;
}

// Upload with progress tracking
function uploadWithProgress(file: File, path: string) {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
```

### Download a File

```typescript
import { ref, getDownloadURL, getBytes, getBlob } from 'firebase/storage';

// Get download URL
async function getFileURL(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const url = await getDownloadURL(storageRef);
  return url;
}

// Download as bytes
async function downloadFileBytes(path: string): Promise<ArrayBuffer> {
  const storageRef = ref(storage, path);
  const bytes = await getBytes(storageRef);
  return bytes;
}

// Download as blob
async function downloadFileBlob(path: string): Promise<Blob> {
  const storageRef = ref(storage, path);
  const blob = await getBlob(storageRef);
  return blob;
}
```

### List Files

```typescript
import { ref, listAll, list } from 'firebase/storage';

// List all files in a directory
async function listFiles(path: string) {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);

  result.items.forEach((itemRef) => {
    console.log('File:', itemRef.fullPath);
  });

  result.prefixes.forEach((folderRef) => {
    console.log('Folder:', folderRef.fullPath);
  });

  return result;
}

// Paginated list (max 100 items)
async function listFilesPaginated(path: string, maxResults: number = 100) {
  const storageRef = ref(storage, path);
  const result = await list(storageRef, { maxResults });
  return result;
}
```

### Delete a File

```typescript
import { ref, deleteObject } from 'firebase/storage';

async function deleteFile(path: string) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
  console.log('File deleted:', path);
}
```

## 3. React Hook for File Upload

Create a reusable hook for file uploads:

**File**: `hosting/hooks/useFileUpload.ts`
```typescript
'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { storage } from '../src/lib/firebase';

interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);

  const upload = useCallback(async (file: File, path: string) => {
    setUploading(true);
    setError(null);
    setProgress(null);
    setDownloadURL(null);

    try {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      setUploadTask(task);

      return new Promise<string>((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot) => {
            const progress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            setProgress(progress);
          },
          (error) => {
            setError(error.message);
            setUploading(false);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setDownloadURL(url);
            setUploading(false);
            resolve(url);
          }
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      throw err;
    }
  }, []);

  const cancel = useCallback(() => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploading(false);
      setError('Upload cancelled');
    }
  }, [uploadTask]);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(null);
    setError(null);
    setDownloadURL(null);
    setUploadTask(null);
  }, []);

  return {
    upload,
    cancel,
    reset,
    uploading,
    progress,
    error,
    downloadURL
  };
}
```

### Using the Hook:

```typescript
function FileUploader() {
  const { upload, uploading, progress, error, downloadURL } = useFileUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const path = `uploads/${Date.now()}_${file.name}`;

    try {
      const url = await upload(file, path);
      console.log('File uploaded:', url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={uploading} />

      {uploading && progress && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {progress.progress.toFixed(0)}% ({progress.bytesTransferred} / {progress.totalBytes} bytes)
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}

      {downloadURL && (
        <div className="mt-4">
          <p className="text-green-600">Upload successful!</p>
          <a
            href={downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View File
          </a>
        </div>
      )}
    </div>
  );
}
```

## 4. Storage Structure Recommendations

Organize files in a logical structure:

```
gs://henryreedai.firebasestorage.app/
├── users/
│   └── {userId}/
│       ├── profile/
│       │   └── avatar.jpg
│       └── documents/
│           └── file.pdf
├── knowledge-base/
│   ├── guides/
│   │   └── {docId}/
│   │       ├── content.md
│   │       └── attachments/
│   ├── images/
│   └── videos/
├── povs/
│   └── {povId}/
│       ├── blueprints/
│       ├── reports/
│       └── attachments/
├── trrs/
│   └── {trrId}/
│       └── documents/
└── shared/
    ├── templates/
    └── assets/
```

## 5. Integration with Knowledge Base

Update Knowledge Base Manager to support file attachments:

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

function KnowledgeBaseWithFiles() {
  const { upload, progress, downloadURL } = useFileUpload();

  const handleMarkdownUpload = async (file: File) => {
    // Upload to knowledge-base/guides/{timestamp}/
    const path = `knowledge-base/guides/${Date.now()}/${file.name}`;
    const url = await upload(file, path);

    // Parse markdown and save to Firestore
    const content = await file.text();
    const parsed = parseMarkdown(content);

    // Save with attachment URL
    await saveKnowledgeDocument({
      ...parsed,
      attachments: [{ url, name: file.name, type: file.type }]
    });
  };

  return (
    <div>
      <input
        type="file"
        accept=".md,.markdown"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleMarkdownUpload(file);
        }}
      />
      {/* Progress UI */}
    </div>
  );
}
```

## 6. Security Rules

Set up Firebase Storage security rules to protect your data:

**File**: `storage.rules`
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isValidFileSize(maxSizeMB) {
      return request.resource.size < maxSizeMB * 1024 * 1024;
    }

    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }

    function isValidDocumentType() {
      return request.resource.contentType.matches('(application/pdf|text/.*|application/.*document.*)');
    }

    // User files - only owner can access
    match /users/{userId}/{allPaths=**} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }

    // Knowledge base - authenticated users can read, specific roles can write
    match /knowledge-base/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() &&
                      isValidFileSize(50) &&
                      (isValidImageType() || isValidDocumentType());
    }

    // POVs - role-based access
    match /povs/{povId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isValidFileSize(100);
    }

    // TRRs - role-based access
    match /trrs/{trrId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isValidFileSize(100);
    }

    // Shared assets - read for all authenticated users
    match /shared/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if false; // Only allow writes through admin SDK
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only storage
```

## 7. Common Use Cases

### POV Blueprint Attachments

```typescript
async function attachBlueprintToPOV(povId: string, file: File) {
  const path = `povs/${povId}/blueprints/${file.name}`;
  const url = await upload(file, path);

  // Update POV document in Firestore
  await updateDoc(doc(db, 'povs', povId), {
    blueprintUrl: url,
    blueprintName: file.name
  });

  return url;
}
```

### TRR Document Upload

```typescript
async function uploadTRRDocument(trrId: string, file: File) {
  const path = `trrs/${trrId}/documents/${file.name}`;
  const url = await upload(file, path);

  // Update TRR record
  await updateDoc(doc(db, 'trrs', trrId), {
    documentUrl: url,
    documentName: file.name,
    documentType: file.type
  });

  return url;
}
```

### User Avatar Upload

```typescript
async function uploadUserAvatar(userId: string, file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const path = `users/${userId}/profile/avatar.jpg`;
  const url = await upload(file, path);

  // Update user profile
  await updateDoc(doc(db, 'users', userId), {
    avatarUrl: url
  });

  return url;
}
```

### Knowledge Base Image Attachments

```typescript
async function uploadKnowledgeBaseImage(docId: string, file: File) {
  const path = `knowledge-base/images/${docId}/${file.name}`;
  const url = await upload(file, path);

  // Return URL to embed in markdown
  return {
    url,
    markdown: `![${file.name}](${url})`
  };
}
```

## 8. File Type Validation

```typescript
const FILE_TYPE_VALIDATORS = {
  image: (file: File) => file.type.startsWith('image/'),
  pdf: (file: File) => file.type === 'application/pdf',
  markdown: (file: File) => file.name.endsWith('.md') || file.name.endsWith('.markdown'),
  document: (file: File) => [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ].includes(file.type)
};

const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024,      // 5 MB
  document: 50 * 1024 * 1024,  // 50 MB
  video: 500 * 1024 * 1024     // 500 MB
};

function validateFile(file: File, type: keyof typeof FILE_TYPE_VALIDATORS) {
  if (!FILE_TYPE_VALIDATORS[type](file)) {
    throw new Error(`Invalid file type. Expected ${type}`);
  }

  if (file.size > MAX_FILE_SIZES[type]) {
    throw new Error(`File too large. Max size: ${MAX_FILE_SIZES[type] / 1024 / 1024} MB`);
  }

  return true;
}
```

## 9. Image Optimization

Resize images before upload:

```typescript
async function resizeImage(file: File, maxWidth: number = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
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

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Usage
async function uploadOptimizedImage(file: File, path: string) {
  const resizedBlob = await resizeImage(file);
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, resizedBlob);
  return getDownloadURL(snapshot.ref);
}
```

## 10. Monitoring & Analytics

Track storage usage:

```typescript
import { ref, getMetadata } from 'firebase/storage';

async function getStorageUsage(path: string = '') {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);

  let totalSize = 0;
  let fileCount = 0;

  for (const item of result.items) {
    const metadata = await getMetadata(item);
    totalSize += metadata.size;
    fileCount++;
  }

  return {
    totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    fileCount,
    averageSize: fileCount > 0 ? totalSize / fileCount : 0
  };
}
```

## 11. Error Handling

```typescript
import { StorageError } from 'firebase/storage';

async function safeUpload(file: File, path: string) {
  try {
    const url = await upload(file, path);
    return { success: true, url };
  } catch (error) {
    if (error instanceof StorageError) {
      switch (error.code) {
        case 'storage/unauthorized':
          return { success: false, error: 'Permission denied' };
        case 'storage/canceled':
          return { success: false, error: 'Upload cancelled' };
        case 'storage/quota-exceeded':
          return { success: false, error: 'Storage quota exceeded' };
        case 'storage/retry-limit-exceeded':
          return { success: false, error: 'Upload failed after retries' };
        default:
          return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}
```

## 12. Testing

Test storage operations:

```bash
# Start Firebase emulator
firebase emulators:start --only storage

# Run tests
npm test -- storage.test.ts
```

**Example test**:
```typescript
describe('Firebase Storage', () => {
  it('should upload a file', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const url = await uploadFile(file, 'test/test.txt');
    expect(url).toBeDefined();
  });
});
```

## 13. Best Practices

### ✅ DO:
- Validate file types and sizes before upload
- Use meaningful file paths with user/resource IDs
- Implement proper security rules
- Handle errors gracefully
- Show upload progress to users
- Optimize images before upload
- Clean up unused files
- Use emulator for development

### ❌ DON'T:
- Store sensitive data without encryption
- Allow unlimited file uploads
- Use predictable file paths
- Skip file validation
- Ignore error handling
- Upload large files without chunking
- Keep deleted resource files

## 14. CLI Commands

```bash
# List files in bucket
gsutil ls gs://henryreedai.firebasestorage.app/

# Download file
gsutil cp gs://henryreedai.firebasestorage.app/path/to/file.pdf ./local.pdf

# Upload file
gsutil cp ./local-file.pdf gs://henryreedai.firebasestorage.app/path/to/file.pdf

# Delete file
gsutil rm gs://henryreedai.firebasestorage.app/path/to/file.pdf

# Get bucket info
gsutil ls -L gs://henryreedai.firebasestorage.app/

# Set CORS configuration
gsutil cors set cors.json gs://henryreedai.firebasestorage.app
```

## 15. CORS Configuration

If you need to access storage from external domains:

**File**: `cors.json`
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "x-goog-acl"]
  }
]
```

Apply CORS:
```bash
gsutil cors set cors.json gs://henryreedai.firebasestorage.app
```

## Next Steps

1. Create `hosting/hooks/useFileUpload.ts` with the upload hook
2. Update security rules in `storage.rules`
3. Integrate file upload in Knowledge Base Manager
4. Add file attachments to POV and TRR forms
5. Implement image optimization for uploads
6. Set up monitoring for storage usage
7. Deploy security rules: `firebase deploy --only storage`

---

**Storage Bucket**: `gs://henryreedai.firebasestorage.app`
**Status**: ✅ Ready to use
**Next Action**: Implement file upload hooks and update security rules
