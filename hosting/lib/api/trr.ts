// Client API layer for TRR operations
// Firestore adapters for CRUD operations with real-time capabilities

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseServices } from '../firebase/client';
import { 
  TechnicalRequirementReview,
  TRRFilters,
  TRRStatusEvent,
  CreateTRRFormData,
  TRRTestCase,
  TRRRequirement,
} from '../../types/trr-extended';
import {
  COLLECTION_PATHS,
  TRRAttachment,
  CompletedSignoff,
  BlockchainSignoff,
} from '../firebase/data-model';

// API Response types
export interface TRRListResponse {
  trrs: TechnicalRequirementReview[];
  totalCount: number;
  hasMore: boolean;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

export interface TRRComment {
  id: string;
  trrId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For threaded comments
}

export interface TRRExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeComments?: boolean;
  includeAttachments?: boolean;
  includeHistory?: boolean;
  trrIds?: string[];
  filters?: TRRFilters;
}

export interface TRRImportResult {
  success: number;
  failed: number;
  errors: string[];
  importedIds: string[];
}

// Error handling
export class TRRAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TRRAPIError';
  }
}

// Utility functions
const convertTimestamp = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
};

const docToTRR = (doc: QueryDocumentSnapshot<DocumentData>): TechnicalRequirementReview => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    lastActivityAt: convertTimestamp(data.lastActivityAt),
    statusHistory: data.statusHistory?.map((event: any) => ({
      ...event,
      timestamp: convertTimestamp(event.timestamp),
    })) || [],
    timeline: {
      ...data.timeline,
      startDate: data.timeline?.startDate ? convertTimestamp(data.timeline.startDate) : undefined,
      dueDate: data.timeline?.dueDate ? convertTimestamp(data.timeline.dueDate) : undefined,
    },
  } as TechnicalRequirementReview;
};

const trrToFirestore = (trr: Partial<TechnicalRequirementReview>) => {
  const data: any = { ...trr };
  
  // Convert date strings back to Timestamps for Firestore
  if (data.createdAt) {
    data.createdAt = Timestamp.fromDate(new Date(data.createdAt));
  }
  if (data.updatedAt) {
    data.updatedAt = Timestamp.fromDate(new Date(data.updatedAt));
  }
  if (data.lastActivityAt) {
    data.lastActivityAt = Timestamp.fromDate(new Date(data.lastActivityAt));
  }
  if (data.timeline?.startDate) {
    data.timeline.startDate = Timestamp.fromDate(new Date(data.timeline.startDate));
  }
  if (data.timeline?.dueDate) {
    data.timeline.dueDate = Timestamp.fromDate(new Date(data.timeline.dueDate));
  }
  
  // Convert status history timestamps
  if (data.statusHistory) {
    data.statusHistory = data.statusHistory.map((event: TRRStatusEvent) => ({
      ...event,
      timestamp: Timestamp.fromDate(new Date(event.timestamp)),
    }));
  }
  
  return data;
};

// ============================================================================
// Core TRR CRUD Operations
// ============================================================================

export const createTRR = async (
  formData: CreateTRRFormData,
  organizationId: string,
  userId: string
): Promise<TechnicalRequirementReview> => {
  try {
    const { firestore } = getFirebaseServices();
    const now = new Date().toISOString();
    
    const trrData: Partial<TechnicalRequirementReview> = {
      ...formData,
      organizationId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      statusHistory: [
        {
          status: 'draft',
          timestamp: now,
          authorUserId: userId,
          note: 'TRR created',
        }
      ],
      dorStatus: {
        isReady: false,
        unmetCriteria: [],
        score: 0,
      },
      sdwStatus: {
        stage: 'requirements',
        approvals: [],
      },
      watchers: [userId],
      attachments: [],
      dependencies: [],
      blockedBy: [],
      tags: formData.tags || [],
    };
    
    const docRef = await addDoc(
      collection(firestore, COLLECTION_PATHS.trrs),
      trrToFirestore(trrData)
    );
    
    const createdDoc = await getDoc(docRef);
    if (!createdDoc.exists()) {
      throw new TRRAPIError('Failed to create TRR', 'creation-failed');
    }
    
    return docToTRR(createdDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error creating TRR:', error);
    throw new TRRAPIError(
      'Failed to create TRR',
      'creation-failed',
      error
    );
  }
};

export const updateTRR = async (
  trrId: string,
  updates: Partial<TechnicalRequirementReview>,
  userId: string
): Promise<TechnicalRequirementReview> => {
  try {
    const { firestore } = getFirebaseServices();
    const trrRef = doc(firestore, COLLECTION_PATHS.trrs, trrId);
    
    // Get current TRR to check for status changes
    const currentDoc = await getDoc(trrRef);
    if (!currentDoc.exists()) {
      throw new TRRAPIError('TRR not found', 'not-found');
    }
    
    const currentTRR = docToTRR(currentDoc as QueryDocumentSnapshot<DocumentData>);
    const now = new Date().toISOString();
    
    // Prepare update data
    const updateData: any = {
      ...updates,
      updatedAt: now,
      lastActivityAt: now,
    };
    
    // Add status history entry if status changed
    if (updates.status && updates.status !== currentTRR.status) {
      const statusEvent: TRRStatusEvent = {
        status: updates.status,
        timestamp: now,
        authorUserId: userId,
        note: `Status changed from ${currentTRR.status} to ${updates.status}`,
      };
      
      updateData.statusHistory = [
        ...(currentTRR.statusHistory || []),
        statusEvent,
      ];
    }
    
    await updateDoc(trrRef, trrToFirestore(updateData));
    
    // Fetch and return updated document
    const updatedDoc = await getDoc(trrRef);
    return docToTRR(updatedDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error updating TRR:', error);
    throw new TRRAPIError(
      'Failed to update TRR',
      'update-failed',
      error
    );
  }
};

export const getTRR = async (trrId: string): Promise<TechnicalRequirementReview | null> => {
  try {
    const { firestore } = getFirebaseServices();
    const trrRef = doc(firestore, COLLECTION_PATHS.trrs, trrId);
    const trrDoc = await getDoc(trrRef);
    
    if (!trrDoc.exists()) {
      return null;
    }
    
    return docToTRR(trrDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error getting TRR:', error);
    throw new TRRAPIError('Failed to get TRR', 'fetch-failed', error);
  }
};

export const deleteTRR = async (trrId: string): Promise<void> => {
  try {
    const { firestore } = getFirebaseServices();
    const trrRef = doc(firestore, COLLECTION_PATHS.trrs, trrId);
    await deleteDoc(trrRef);
  } catch (error) {
    console.error('Error deleting TRR:', error);
    throw new TRRAPIError('Failed to delete TRR', 'delete-failed', error);
  }
};

export const listTRRs = async (
  organizationId: string,
  filters: TRRFilters = {},
  pageSize: number = 50,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<TRRListResponse> => {
  try {
    const { firestore } = getFirebaseServices();
    let trrQuery = query(
      collection(firestore, COLLECTION_PATHS.trrs),
      where('organizationId', '==', organizationId)
    );
    
    // Apply filters
    if (filters.status?.length) {
      trrQuery = query(trrQuery, where('status', 'in', filters.status));
    }
    if (filters.priority?.length) {
      trrQuery = query(trrQuery, where('priority', 'in', filters.priority));
    }
    if (filters.category?.length) {
      trrQuery = query(trrQuery, where('category', 'in', filters.category));
    }
    if (filters.assignedTo) {
      trrQuery = query(trrQuery, where('assignedTo', '==', filters.assignedTo));
    }
    if (filters.projectId) {
      trrQuery = query(trrQuery, where('projectId', '==', filters.projectId));
    }
    if (filters.portfolioId) {
      trrQuery = query(trrQuery, where('portfolioId', '==', filters.portfolioId));
    }
    
    // Add ordering and pagination
    trrQuery = query(
      trrQuery,
      orderBy(filters.sortBy || 'createdAt', filters.sortOrder || 'desc'),
      limit(pageSize + 1) // Get one extra to check if there are more
    );
    
    if (lastDoc) {
      trrQuery = query(trrQuery, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(trrQuery);
    const docs = querySnapshot.docs;
    
    const hasMore = docs.length > pageSize;
    const trrDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const trrs = trrDocs.map(docToTRR);
    
    // Get total count (approximate for performance)
    // Note: In production, you might want to maintain a counter or use a more efficient approach
    const totalCount = trrs.length; // Simplified for now
    
    return {
      trrs,
      totalCount,
      hasMore,
      lastDoc: hasMore ? trrDocs[trrDocs.length - 1] : undefined,
    };
  } catch (error) {
    console.error('Error listing TRRs:', error);
    throw new TRRAPIError('Failed to list TRRs', 'list-failed', error);
  }
};

// ============================================================================
// Real-time subscriptions
// ============================================================================

export const subscribeTRRs = (
  organizationId: string,
  filters: TRRFilters,
  callback: (trrs: TechnicalRequirementReview[]) => void
): (() => void) => {
  try {
    const { firestore } = getFirebaseServices();
    let trrQuery = query(
      collection(firestore, COLLECTION_PATHS.trrs),
      where('organizationId', '==', organizationId)
    );
    
    // Apply filters (similar to listTRRs)
    if (filters.status?.length) {
      trrQuery = query(trrQuery, where('status', 'in', filters.status));
    }
    if (filters.projectId) {
      trrQuery = query(trrQuery, where('projectId', '==', filters.projectId));
    }
    
    trrQuery = query(trrQuery, orderBy('updatedAt', 'desc'), limit(100));
    
    return onSnapshot(trrQuery, (snapshot) => {
      const trrs = snapshot.docs.map(docToTRR);
      callback(trrs);
    });
  } catch (error) {
    console.error('Error subscribing to TRRs:', error);
    throw new TRRAPIError('Failed to subscribe to TRRs', 'subscription-failed', error);
  }
};

export const subscribeTRR = (
  trrId: string,
  callback: (trr: TechnicalRequirementReview | null) => void
): (() => void) => {
  try {
    const { firestore } = getFirebaseServices();
    const trrRef = doc(firestore, COLLECTION_PATHS.trrs, trrId);
    
    return onSnapshot(trrRef, (doc) => {
      if (doc.exists()) {
        const trr = docToTRR(doc as QueryDocumentSnapshot<DocumentData>);
        callback(trr);
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error subscribing to TRR:', error);
    throw new TRRAPIError('Failed to subscribe to TRR', 'subscription-failed', error);
  }
};

// ============================================================================
// Comments and Collaboration
// ============================================================================

export const addTRRComment = async (
  trrId: string,
  content: string,
  authorId: string,
  authorName: string,
  mentions: string[] = [],
  parentId?: string
): Promise<TRRComment> => {
  try {
    const { firestore } = getFirebaseServices();
    const now = new Date().toISOString();
    
    const commentData = {
      trrId,
      authorId,
      authorName,
      content,
      mentions,
      parentId,
      createdAt: Timestamp.fromDate(new Date(now)),
      updatedAt: Timestamp.fromDate(new Date(now)),
    };
    
    const docRef = await addDoc(
      collection(firestore, COLLECTION_PATHS.trrComments(trrId)),
      commentData
    );
    
    // Update TRR's lastActivityAt
    await updateDoc(doc(firestore, COLLECTION_PATHS.trrs, trrId), {
      lastActivityAt: Timestamp.fromDate(new Date(now)),
    });
    
    return {
      id: docRef.id,
      ...commentData,
      createdAt: now,
      updatedAt: now,
    } as TRRComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new TRRAPIError('Failed to add comment', 'comment-failed', error);
  }
};

export const getTRRComments = async (trrId: string): Promise<TRRComment[]> => {
  try {
    const { firestore } = getFirebaseServices();
    const commentsQuery = query(
      collection(firestore, COLLECTION_PATHS.trrComments(trrId)),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(commentsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt),
    } as TRRComment));
  } catch (error) {
    console.error('Error getting comments:', error);
    throw new TRRAPIError('Failed to get comments', 'fetch-failed', error);
  }
};

// ============================================================================
// Requirements and Test Cases Management
// ============================================================================

export const addTRRRequirement = async (
  trrId: string,
  requirement: Omit<TRRRequirement, 'id'>
): Promise<TRRRequirement> => {
  try {
    const { firestore } = getFirebaseServices();
    const now = new Date().toISOString();
    
    const requirementData = {
      ...requirement,
      createdAt: Timestamp.fromDate(new Date(now)),
      updatedAt: Timestamp.fromDate(new Date(now)),
    };
    
    const docRef = await addDoc(
      collection(firestore, COLLECTION_PATHS.trrRequirements(trrId)),
      requirementData
    );
    
    return {
      id: docRef.id,
      ...requirement,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error adding requirement:', error);
    throw new TRRAPIError('Failed to add requirement', 'add-failed', error);
  }
};

export const getTRRRequirements = async (trrId: string): Promise<TRRRequirement[]> => {
  try {
    const { firestore } = getFirebaseServices();
    const requirementsQuery = query(
      collection(firestore, COLLECTION_PATHS.trrRequirements(trrId)),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(requirementsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt),
    } as TRRRequirement));
  } catch (error) {
    console.error('Error getting requirements:', error);
    throw new TRRAPIError('Failed to get requirements', 'fetch-failed', error);
  }
};

// ============================================================================
// Import/Export via Cloud Functions
// ============================================================================

export const exportTRRs = async (
  organizationId: string,
  options: TRRExportOptions
): Promise<Blob> => {
  try {
    const { callTRRExportFunction } = await import('../firebase/client');
    
    const result = await callTRRExportFunction({
      organizationId,
      ...options,
    });
    
    // Convert base64 data to Blob
    const binaryString = atob(result.data.fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new Blob([bytes], {
      type: result.data.mimeType || 'application/octet-stream',
    });
  } catch (error) {
    console.error('Error exporting TRRs:', error);
    throw new TRRAPIError('Failed to export TRRs', 'export-failed', error);
  }
};

// ============================================================================
// Blockchain Signoff Integration
// ============================================================================

export const createTRRSignoff = async (
  trrId: string,
  organizationId: string,
  signoffRole: string,
  comments?: string
): Promise<BlockchainSignoff> => {
  try {
    const { callTRRSignoffFunction } = await import('../firebase/client');
    
    const result = await callTRRSignoffFunction({
      trrId,
      organizationId,
      signoffRole,
      comments,
    });
    
    return result.data;
  } catch (error) {
    console.error('Error creating signoff:', error);
    throw new TRRAPIError('Failed to create signoff', 'signoff-failed', error);
  }
};

// ============================================================================
// Bulk Operations
// ============================================================================

export const bulkUpdateTRRs = async (
  trrIds: string[],
  updates: Partial<TechnicalRequirementReview>,
  userId: string
): Promise<void> => {
  try {
    const { firestore } = getFirebaseServices();
    const batch = writeBatch(firestore);
    const now = Timestamp.fromDate(new Date());
    
    trrIds.forEach(trrId => {
      const trrRef = doc(firestore, COLLECTION_PATHS.trrs, trrId);
      batch.update(trrRef, {
        ...updates,
        updatedAt: now,
        lastActivityAt: now,
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error bulk updating TRRs:', error);
    throw new TRRAPIError('Failed to bulk update TRRs', 'bulk-update-failed', error);
  }
};

export default {
  createTRR,
  updateTRR,
  getTRR,
  deleteTRR,
  listTRRs,
  subscribeTRRs,
  subscribeTRR,
  addTRRComment,
  getTRRComments,
  addTRRRequirement,
  getTRRRequirements,
  exportTRRs,
  createTRRSignoff,
  bulkUpdateTRRs,
  TRRAPIError,
};