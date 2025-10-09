import { doc, onSnapshot } from 'firebase/firestore';

import { CloudFunctionsAPI } from './cloud-functions-api';
import { getFirebaseServices } from './firebase/client';

export interface BlueprintFileData {
  storagePath: string;
  checksumSha256?: string;
  bytes?: number;
  downloadUrl?: string;
  brandTheme?: string;
}

export interface BlueprintAnalytics {
  recommendationCoverage: number;
  riskScore: number;
  automationConfidence: number;
  recommendationCategories: string[];
  scenarioCount: number;
  notesCount: number;
  transcriptTokens: number;
  deliveryLatencyMs?: number | null;
  bigQueryJobId?: string | null;
  lastExportedAt?: string | null;
}

export interface BadassBlueprintRecord {
  id: string;
  engagementId: string;
  customerName: string;
  generatedBy: string;
  generatedAt?: Date;
  status: string;
  pdf?: BlueprintFileData | null;
  artifactBundle?: BlueprintFileData | null;
  analytics?: BlueprintAnalytics;
  contextSnapshot?: Record<string, any>;
  emphasis?: { wins?: string[]; risks?: string[]; roadmap?: string[] };
  payload?: {
    sections?: number;
    executiveTheme?: string;
  } | null;
  error?: { message: string; details?: any } | null;
}

export interface BlueprintGenerationOptions {
  engagementId: string;
  executiveTone?: string;
  emphasis?: { wins?: string[]; risks?: string[]; roadmap?: string[] };
}

export interface BlueprintGenerationResponse {
  blueprintId: string;
  status: string;
  payloadPath: string;
}

const apiSingleton = new CloudFunctionsAPI();

const toDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (value?.toDate) return value.toDate();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : new Date(parsed);
};

const buildRecord = (snapshot: any): BadassBlueprintRecord => {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    engagementId: data.engagementId,
    customerName: data.customerName,
    generatedBy: data.generatedBy,
    generatedAt: toDate(data.generatedAt),
    status: data.status,
    pdf: data.pdf || null,
    artifactBundle: data.artifactBundle || null,
    analytics: data.analytics,
    contextSnapshot: data.contextSnapshot,
    emphasis: data.emphasis,
    payload: data.payload,
    error: data.error || null,
  };
};

export const requestBlueprintGeneration = async (
  options: BlueprintGenerationOptions
): Promise<BlueprintGenerationResponse> => {
  const response = await apiSingleton.generateBadassBlueprint(options);
  if (!response.success || !response.blueprintId) {
    throw new Error(response.message || 'Failed to queue blueprint generation');
  }
  return {
    blueprintId: response.blueprintId,
    status: response.status || 'processing',
    payloadPath: response.payloadPath || '',
  };
};

export const subscribeToBlueprint = (
  blueprintId: string,
  callback: (record: BadassBlueprintRecord | null) => void
): (() => void) => {
  const { firestore } = getFirebaseServices();
  const ref = doc(firestore, 'badassBlueprints', blueprintId);
  return onSnapshot(
    ref,
    snapshot => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      callback(buildRecord(snapshot));
    },
    error => {
      console.error('Blueprint subscription error', error);
      callback(null);
    }
  );
};
