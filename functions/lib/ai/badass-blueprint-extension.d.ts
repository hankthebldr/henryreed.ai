import { BadassBlueprintEmphasis, BlueprintRecordSelection, BlueprintSupportingRecord } from '../handlers/badass-blueprint-types';
export interface EngagementTimelineEntry {
    label: string;
    timestamp: string;
    description: string;
}
export interface EngagementScenarioOutcome {
    id: string;
    name: string;
    status: string;
    impact: string;
    metrics: {
        dwellTimeHours: number;
        detectionsValidated: number;
        automationScore: number;
    };
    highlights: string[];
}
export interface EngagementNote {
    author: string;
    note: string;
    createdAt: string;
    category?: string;
}
export interface EngagementMetricSnapshot {
    riskScore: number;
    automationConfidence: number;
    coveragePercentage: number;
    timeToValueDays: number;
    quantifiedValue: number;
}
export interface EngagementContextSnapshot {
    engagementId: string;
    customerName: string;
    povType?: string;
    trrPhase?: string;
    summary: string;
    emphasis?: BadassBlueprintEmphasis;
    metrics: EngagementMetricSnapshot;
    scenarios: EngagementScenarioOutcome[];
    notes: EngagementNote[];
    timeline: EngagementTimelineEntry[];
    transcripts?: {
        source: string;
        tokens: number;
    }[];
    supportingRecords?: BlueprintSupportingRecord[];
    tailoredPrompt?: string;
    recordSelections?: BlueprintRecordSelection[];
}
export interface BlueprintVisualBlock {
    type: 'progress' | 'heatmap' | 'stat' | 'callout';
    label: string;
    data: Record<string, any>;
}
export interface BadassBlueprintSection {
    title: string;
    summary: string;
    details: string[];
    supportingArtifacts: string[];
    recommendedActions: string[];
    visualBlocks: BlueprintVisualBlock[];
}
export interface BadassBlueprintPayload {
    executiveTheme: string;
    narrativeSummary: string;
    sections: BadassBlueprintSection[];
    recommendationCategories: string[];
    metrics: {
        recommendationCoverage: number;
        riskScore: number;
        automationConfidence: number;
        scenarioCount: number;
        notesCount: number;
        transcriptTokens: number;
    };
    prompts: string[];
}
export declare const generateBadassBlueprintPayload: (context: EngagementContextSnapshot, emphasis: BadassBlueprintEmphasis | undefined, executiveTone: string | undefined) => Promise<BadassBlueprintPayload>;
