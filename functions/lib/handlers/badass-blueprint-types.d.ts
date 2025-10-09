export interface BadassBlueprintEmphasis {
    wins?: string[];
    risks?: string[];
    roadmap?: string[];
}
export interface BlueprintFileMetadata {
    storagePath: string;
    checksumSha256?: string;
    bytes?: number;
    downloadUrl?: string;
    brandTheme?: string;
}
export interface BlueprintAnalyticsSnapshot {
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
export interface BlueprintDocument extends Record<string, any> {
    engagementId: string;
    customerName: string;
    generatedBy: string;
    generatedAt?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
    status: 'processing' | 'rendered' | 'bundled' | 'export_pending' | 'succeeded' | 'failed';
    error?: {
        message: string;
        details?: any;
    } | null;
    contextSnapshot: Record<string, any>;
    pdf?: BlueprintFileMetadata | null;
    artifactBundle?: BlueprintFileMetadata | null;
    extensionRun?: {
        extensionId: string;
        version: string;
        prompts: string[];
        completionTokens?: number;
        latencyMs?: number;
    };
    analytics: BlueprintAnalyticsSnapshot;
    payload: {
        storagePath: string;
        checksumSha256: string;
        bytes: number;
        sections: number;
        executiveTheme: string;
    };
    emphasis?: BadassBlueprintEmphasis;
}
