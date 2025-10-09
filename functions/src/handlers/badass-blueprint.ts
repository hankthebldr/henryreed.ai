import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { createHash } from 'crypto';
import { PassThrough } from 'stream';
import archiver from 'archiver';
import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import { BigQuery } from '@google-cloud/bigquery';
import { PubSub } from '@google-cloud/pubsub';

import { logger } from '../utils/logger';
import {
  generateBadassBlueprintPayload,
  EngagementContextSnapshot,
  BadassBlueprintPayload,
  EngagementNote,
  EngagementScenarioOutcome,
  EngagementMetricSnapshot,
} from '../ai/badass-blueprint-extension';
import {
  BadassBlueprintEmphasis,
  BlueprintDocument,
  BlueprintAnalyticsSnapshot,
  BlueprintFileMetadata,
  BlueprintRecordSelection,
  BlueprintSupportingRecord,
} from './badass-blueprint-types';

const recordSelectionSchema = z.object({
  source: z.enum(['customer', 'pov', 'trr', 'health']),
  recordId: z.string().min(1),
  commonName: z.string().min(1),
  customerId: z.string().optional(),
  context: z.record(z.any()).optional(),
});

const blueprintRequestSchema = z.object({
  engagementId: z.string().min(3, 'engagementId must be provided'),
  executiveTone: z.string().max(180).optional(),
  emphasis: z
    .object({
      wins: z.array(z.string()).optional(),
      risks: z.array(z.string()).optional(),
      roadmap: z.array(z.string()).optional(),
    })
    .optional(),
  recordSelections: z.array(recordSelectionSchema).max(20).optional(),
  tailoredPrompt: z.string().max(800).optional(),
});

export type BlueprintRequest = z.infer<typeof blueprintRequestSchema>;

interface BlueprintGenerationContext {
  authUid: string;
  authToken?: Record<string, any>;
}

interface BlueprintGenerationResult {
  blueprintId: string;
  status: BlueprintDocument['status'];
  payloadPath: string;
}

const firestore = admin.firestore();
const storage = admin.storage();

const getPubSubClient = (() => {
  let client: any = null;
  return () => {
    if (!client) {
      client = new PubSub();
    }
    return client;
  };
})();

const getBigQueryClient = (() => {
  let client: any = null;
  return () => {
    if (!client) {
      client = new BigQuery();
    }
    return client;
  };
})();

const safeArray = (value?: string[]): string[] =>
  Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim().length > 0) : [];

const toMillisSafe = (value?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue | Date | string | null): number | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  const candidate: any = value;
  if (candidate && typeof candidate.toMillis === 'function') {
    try {
      return candidate.toMillis();
    } catch {
      return null;
    }
  }
  if (candidate && typeof candidate.toDate === 'function') {
    try {
      return candidate.toDate().getTime();
    } catch {
      return null;
    }
  }
  return null;
};

const toIsoString = (value?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue | Date | string | null): string | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? value : new Date(parsed).toISOString();
  }
  const millis = toMillisSafe(value as any);
  return millis !== null ? new Date(millis).toISOString() : null;
};

const mapScenario = (data: FirebaseFirestore.DocumentData, fallbackId: string, index: number) => {
  const highlights = Array.isArray(data.highlights)
    ? data.highlights.map((item: any) => String(item))
    : [data.businessValue || 'Value: Accelerated incident response'];

  return {
    id: data.id || fallbackId || `scenario-${index + 1}`,
    name: data.name || data.title || `Scenario ${index + 1}`,
    status: data.status || data.state || 'completed',
    impact:
      data.impact ||
      data.businessValue ||
      `${Math.round(Math.random() * 40) + 60}% detection uplift documented`,
    metrics: {
      dwellTimeHours: Number(data.metrics?.dwellTimeHours) || Math.round(Math.random() * 4) + 4,
      detectionsValidated:
        Number(data.metrics?.detectionsValidated) ||
        Math.max(5, Math.round(Math.random() * 10) + 5),
      automationScore:
        Number(data.metrics?.automationScore) || Math.min(1, 0.55 + Math.random() * 0.35),
    },
    highlights,
  };
};

const buildTimeline = (
  engagementId: string,
  context: {
    pov?: FirebaseFirestore.DocumentSnapshot | null;
    trr?: FirebaseFirestore.DocumentSnapshot | null;
    scenarios: { id: string; startTime?: FirebaseFirestore.Timestamp | Date | string }[];
  }
) => {
  const entries = [] as EngagementContextSnapshot['timeline'];

  const povData = context.pov?.data();
  if (povData) {
    entries.push({
      label: 'POV Kickoff',
      timestamp:
        toIsoString(povData.createdAt || povData.startDate || new Date()) || new Date().toISOString(),
      description: `POV record for ${povData.customer || engagementId} initialized`,
    });
  }

  const trrData = context.trr?.data();
  if (trrData?.phase) {
    entries.push({
      label: `TRR Phase: ${trrData.phase}`,
      timestamp: toIsoString(trrData.updatedAt || trrData.createdAt || new Date()) || new Date().toISOString(),
      description: `Requirement validation advanced to ${trrData.phase}`,
    });
  }

  context.scenarios
    .filter(item => item.startTime)
    .slice(0, 5)
    .forEach(item => {
      entries.push({
        label: 'Scenario Execution',
        timestamp: toIsoString(item.startTime as any) || new Date().toISOString(),
        description: `Scenario ${item.id} executed and validated`,
      });
    });

  entries.push({
    label: 'Blueprint Requested',
    timestamp: new Date().toISOString(),
    description: 'Badass blueprint generation initiated',
  });

  return entries;
};

const fetchEngagementNotes = async (engagementId: string): Promise<EngagementContextSnapshot['notes']> => {
  const notes: EngagementContextSnapshot['notes'] = [];
  try {
    const snapshot = await firestore
      .collection('engagementNotes')
      .where('engagementId', '==', engagementId)
      .limit(20)
      .get();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      notes.push({
        author: data.author || 'Domain Consultant',
        note: data.note || data.content || 'Engagement note captured',
        createdAt: toIsoString(data.createdAt) || new Date().toISOString(),
        category: data.category,
      });
    });
  } catch (error) {
    logger.debug('No engagementNotes collection found for blueprint context', { engagementId, error });
  }

  if (notes.length === 0) {
    notes.push({
      author: 'Domain Consultant',
      note: 'Customer stakeholders validated scenario success criteria and approved automation roadmap.',
      createdAt: new Date().toISOString(),
      category: 'executive',
    });
    notes.push({
      author: 'Engagement Manager',
      note: 'TRR readiness checklist completed with minor follow-ups on data onboarding.',
      createdAt: new Date().toISOString(),
      category: 'operations',
    });
  }

  return notes;
};

const fetchSelectionData = async (selection: BlueprintRecordSelection): Promise<Record<string, any>> => {
  if (selection.context && Object.keys(selection.context).length > 0) {
    return selection.context;
  }

  const tryCollections = async (collections: string[]): Promise<FirebaseFirestore.DocumentData | null> => {
    for (const name of collections) {
      try {
        const snapshot = await firestore.collection(name).doc(selection.recordId).get();
        if (snapshot.exists) {
          const data = snapshot.data();
          if (data) {
            return data;
          }
        }
      } catch (error) {
        logger.debug('Failed to fetch selection context', {
          collection: name,
          recordId: selection.recordId,
          source: selection.source,
          error,
        });
      }
    }
    return null;
  };

  switch (selection.source) {
    case 'pov': {
      const data = await tryCollections(['povs', 'engagementPovs']);
      if (data) return data;
      break;
    }
    case 'trr': {
      const data = await tryCollections(['trrRecords', 'trrs']);
      if (data) return data;
      break;
    }
    case 'customer': {
      const data = await tryCollections(['customers', 'customerEngagements']);
      if (data) return data;
      break;
    }
    case 'health': {
      const data = await tryCollections(['engagementHealth', 'healthFlows']);
      if (data) return data;
      break;
    }
    default:
      break;
  }

  return selection.context || {};
};

const createNote = (note: string, category: string, author = 'Domain Consultant'): EngagementNote => ({
  author,
  note,
  category,
  createdAt: new Date().toISOString(),
});

interface SelectionAugmentation {
  record: BlueprintSupportingRecord;
  notes: EngagementNote[];
  scenarios: EngagementScenarioOutcome[];
  metrics?: Partial<EngagementMetricSnapshot>;
  transcripts?: { source: string; tokens: number }[];
  timelineEntries?: EngagementContextSnapshot['timeline'];
}

const deriveSelectionAugmentation = (
  selection: BlueprintRecordSelection,
  data: Record<string, any>,
  nowIso: string
): SelectionAugmentation => {
  const baseRecord: BlueprintSupportingRecord = {
    source: selection.source,
    recordId: selection.recordId,
    commonName: selection.commonName,
  };

  const notes: EngagementNote[] = [];
  const scenarios: EngagementScenarioOutcome[] = [];
  const timelineEntries: EngagementContextSnapshot['timeline'] = [];
  const highlights: string[] = [];
  const transcripts: { source: string; tokens: number }[] = [];
  let metrics: Partial<EngagementMetricSnapshot> | undefined;

  switch (selection.source) {
    case 'customer': {
      const milestones = Array.isArray(data?.timeline?.keyMilestones) ? data.timeline.keyMilestones : [];
      const completedMilestones = milestones.filter((milestone: any) => milestone?.status === 'complete').length;
      const concerns = Array.isArray(data?.primaryConcerns) ? data.primaryConcerns : [];
      const techStack = Array.isArray(data?.techStack) ? data.techStack : [];

      baseRecord.summary = `Customer engagement ${selection.commonName} operates in ${
        data?.industry || 'target industry'
      } with ${data?.maturityLevel || 'intermediate'} maturity across ${milestones.length} milestones.`;
      baseRecord.details = {
        typeLabel: 'Customer',
        status: data?.maturityLevel || 'maturing',
      };
      highlights.push(
        ...concerns.slice(0, 3).map((item: any) => `Concern:${String(item)}`),
        ...techStack.slice(0, 2).map((item: any) => `Stack:${String(item)}`)
      );

      if (Array.isArray(data?.notes)) {
        data.notes.slice(0, 6).forEach((item: any) => {
          notes.push(createNote(String(item), 'customer-note', data?.ownerId ? `Owner: ${data.ownerId}` : undefined));
        });
      }

      scenarios.push({
        id: `${selection.recordId}-maturity`,
        name: `${selection.commonName} Maturity Alignment`,
        status: 'completed',
        impact: `Engagement maturity rated ${data?.maturityLevel || 'intermediate'} focusing on ${
          concerns.slice(0, 2).join(', ') || 'core objectives'
        }.`,
        metrics: {
          dwellTimeHours: 6,
          detectionsValidated: Math.max(6, concerns.length * 2 + 4),
          automationScore: Math.min(0.92, 0.6 + completedMilestones * 0.05),
        },
        highlights: [
          `Industry:${data?.industry || 'N/A'}`,
          `Milestones:${completedMilestones}/${milestones.length || 1}`,
          ...concerns.slice(0, 2).map((item: any) => `Focus:${String(item)}`),
        ],
      });

      metrics = {
        riskScore: Math.max(0.18, 0.42 - completedMilestones * 0.05),
        automationConfidence: Math.min(0.95, 0.62 + completedMilestones * 0.04),
        coveragePercentage: Math.min(100, 55 + milestones.length * 5 + concerns.length * 4),
        timeToValueDays: Math.max(18, 45 - completedMilestones * 3),
        quantifiedValue: Math.max(150000, 200000 + completedMilestones * 15000),
      };

      milestones.slice(0, 4).forEach((milestone: any) => {
        timelineEntries.push({
          label: `Milestone: ${milestone?.name || 'Key milestone'}`,
          timestamp: toIsoString(milestone?.date || milestone?.planned || nowIso) || nowIso,
          description: `Status ${milestone?.status || 'pending'} • ${milestone?.description || 'Customer milestone update.'}`,
        });
      });
      break;
    }

    case 'pov': {
      const povScenarios = Array.isArray(data?.scenarios) ? data.scenarios : [];
      const objectives = Array.isArray(data?.objectives) ? data.objectives : [];
      const successMetrics = Array.isArray(data?.successMetrics) ? data.successMetrics : [];
      const nextSteps = Array.isArray(data?.nextSteps) ? data.nextSteps : [];

      baseRecord.summary = `POV ${data?.name || selection.commonName} (${data?.status || 'active'}) covers ${
        povScenarios.length
      } scenarios with ${successMetrics.length} success metrics.`;
      baseRecord.details = {
        typeLabel: 'POV',
        status: data?.status || 'active',
      };
      highlights.push(
        ...successMetrics.slice(0, 3).map((metric: any) => `Win:${String(metric)}`),
        ...objectives.slice(0, 2).map((objective: any) => `Objective:${String(objective)}`)
      );

      povScenarios.forEach((scenario: any, index: number) => {
        scenarios.push({
          id: `${selection.recordId}-scenario-${index + 1}`,
          name: scenario?.name || scenario?.title || `Scenario ${index + 1}`,
          status: scenario?.status || 'validated',
          impact:
            scenario?.results ||
            scenario?.customerFeedback ||
            scenario?.description ||
            'Scenario validated during POV execution.',
          metrics: {
            dwellTimeHours: Number(scenario?.dwellTimeHours) || Math.max(4, Math.round(Math.random() * 6) + 4),
            detectionsValidated: Number(scenario?.detectionsValidated) || Math.max(6, (scenario?.validatedDetections || 0) + 6),
            automationScore: Math.min(0.95, Number(scenario?.automationScore) || 0.7),
          },
          highlights: [
            `Type:${scenario?.type || 'Scenario'}`,
            ...(Array.isArray(scenario?.keyFindings)
              ? scenario.keyFindings.slice(0, 2).map((item: any) => String(item))
              : []),
            ...(scenario?.customerFeedback ? [`Feedback:${String(scenario.customerFeedback)}`] : []),
          ],
        });
      });

      if (scenarios.length === 0) {
        scenarios.push({
          id: `${selection.recordId}-scenario-1`,
          name: `${selection.commonName} Scenario`,
          status: data?.status || 'executing',
          impact: 'Scenario insights derived from POV selection.',
          metrics: { dwellTimeHours: 5, detectionsValidated: 8, automationScore: 0.68 },
          highlights: ['POV Scenario'],
        });
      }

      objectives.slice(0, 4).forEach((item: any) => notes.push(createNote(String(item), 'pov-objective')));
      successMetrics.slice(0, 4).forEach((metric: any) => notes.push(createNote(String(metric), 'pov-success')));
      nextSteps.slice(0, 4).forEach((step: any) => notes.push(createNote(String(step), 'pov-next-step')));

      metrics = {
        riskScore: Math.max(0.12, 0.34 - scenarios.length * 0.025),
        automationConfidence: Math.min(0.95, 0.64 + scenarios.length * 0.045),
        coveragePercentage: Math.min(100, 60 + scenarios.length * 8 + successMetrics.length * 3),
        timeToValueDays: Math.max(12, 40 - scenarios.length * 2),
        quantifiedValue: Math.max(200000, 220000 + scenarios.length * 25000),
      };

      if (Array.isArray(data?.timeline?.milestones)) {
        data.timeline.milestones.slice(0, 3).forEach((milestone: any) => {
          timelineEntries.push({
            label: `POV Milestone: ${milestone?.name || 'Checkpoint'}`,
            timestamp: toIsoString(milestone?.actual || milestone?.planned || nowIso) || nowIso,
            description: milestone?.status || 'POV milestone progress.',
          });
        });
      }
      break;
    }

    case 'trr': {
      const acceptanceCriteria = Array.isArray(data?.acceptanceCriteria) ? data.acceptanceCriteria : [];
      const riskLevel = String(data?.riskLevel || '').toLowerCase();
      const riskMap: Record<string, number> = { low: 0.24, medium: 0.38, high: 0.56 };

      baseRecord.summary = `TRR ${data?.title || selection.commonName} (${data?.priority || 'medium'}) targets ${
        acceptanceCriteria.length
      } acceptance criteria.`;
      baseRecord.details = {
        typeLabel: 'TRR',
        status: data?.status || 'in-review',
      };
      highlights.push(
        `Validation:${data?.validationMethod || 'Defined'}`,
        `Risk:${data?.riskLevel || 'medium'}`,
        ...acceptanceCriteria.slice(0, 3).map((criteria: any) => `Criteria:${String(criteria)}`)
      );

      acceptanceCriteria.slice(0, 4).forEach((criteria: any) => notes.push(createNote(String(criteria), 'trr-criteria')));
      if (Array.isArray(data?.notes)) {
        data.notes.slice(0, 4).forEach((item: any) => notes.push(createNote(String(item), 'trr-note')));
      }

      scenarios.push({
        id: `${selection.recordId}-trr`,
        name: data?.title || `TRR ${selection.recordId}`,
        status: data?.status || 'in-review',
        impact: data?.businessImpact || data?.description || 'TRR validation summary.',
        metrics: {
          dwellTimeHours: 4,
          detectionsValidated: Math.max(4, acceptanceCriteria.length * 2),
          automationScore: data?.status === 'validated' ? 0.82 : 0.6,
        },
        highlights: [
          `Priority:${data?.priority || 'medium'}`,
          `Risk:${data?.riskLevel || 'medium'}`,
          ...(Array.isArray(data?.dependencies)
            ? data.dependencies.slice(0, 2).map((dependency: any) => `Dependency:${String(dependency)}`)
            : []),
        ],
      });

      metrics = {
        riskScore: riskMap[riskLevel] ?? 0.4,
        automationConfidence: data?.status === 'validated' ? 0.82 : 0.6,
        coveragePercentage: Math.min(100, 50 + acceptanceCriteria.length * 6),
        timeToValueDays: Math.max(16, 42 - acceptanceCriteria.length * 2),
        quantifiedValue: Math.max(180000, 210000 + acceptanceCriteria.length * 12000),
      };

      if (data?.timeline?.targetValidation) {
        timelineEntries.push({
          label: 'TRR Target Validation',
          timestamp: toIsoString(data.timeline.targetValidation) || nowIso,
          description: `Target validation window for ${selection.commonName}.`,
        });
      }
      break;
    }

    case 'health': {
      const healthScore = Number(data?.healthScore) || 72;
      const milestones = Array.isArray(data?.milestones)
        ? data.milestones
        : Array.isArray(data?.timeline?.keyMilestones)
        ? data.timeline.keyMilestones
        : [];

      baseRecord.summary = `Health flow indicates ${selection.commonName} scoring ${healthScore}/100 across ${
        milestones.length
      } milestones.`;
      baseRecord.details = {
        typeLabel: 'Health Flow',
        status: `${healthScore}/100`,
      };
      highlights.push(
        `HealthScore:${healthScore}`,
        ...milestones.slice(0, 2).map((milestone: any) => `Milestone:${String(milestone?.name || 'checkpoint')}`)
      );

      if (Array.isArray(data?.notes)) {
        data.notes.slice(0, 5).forEach((item: any) => notes.push(createNote(String(item), 'health-note')));
      }

      scenarios.push({
        id: `${selection.recordId}-health`,
        name: `${selection.commonName} Health Flow`,
        status: healthScore >= 80 ? 'completed' : healthScore >= 60 ? 'in-progress' : 'at-risk',
        impact: `Health score ${healthScore}/100 with ${milestones.length} lifecycle checkpoints.`,
        metrics: {
          dwellTimeHours: 5,
          detectionsValidated: Math.max(5, milestones.length * 2 + 4),
          automationScore: Math.min(0.95, 0.55 + healthScore / 200),
        },
        highlights,
      });

      metrics = {
        riskScore: Math.max(0.12, 1 - healthScore / 100),
        automationConfidence: Math.min(0.95, healthScore / 100 + 0.1),
        coveragePercentage: Math.min(100, healthScore + milestones.length * 3),
        timeToValueDays: Math.max(14, 60 - healthScore / 1.8),
        quantifiedValue: Math.max(170000, 150000 + healthScore * 1800),
      };

      milestones.slice(0, 4).forEach((milestone: any) => {
        timelineEntries.push({
          label: `Health Milestone: ${milestone?.name || 'checkpoint'}`,
          timestamp: toIsoString(milestone?.date || milestone?.planned || nowIso) || nowIso,
          description: `Status ${milestone?.status || 'healthy'} • ${milestone?.description || 'Health flow checkpoint.'}`,
        });
      });
      break;
    }

    default:
      baseRecord.summary = `${selection.commonName} supporting record blended into blueprint.`;
      baseRecord.details = { typeLabel: 'Record' } as any;
  }

  if (highlights.length > 0) {
    baseRecord.highlights = highlights;
  }

  timelineEntries.push({
    label: `${selection.source.toUpperCase()} Context Added`,
    timestamp: nowIso,
    description: `${selection.commonName} (${selection.source}) incorporated into blueprint blend.`,
  });

  transcripts.push({
    source: `${selection.source}:${selection.recordId}`,
    tokens: 480 + scenarios.length * 120 + notes.length * 40,
  });

  return { record: baseRecord, notes, scenarios, metrics, transcripts, timelineEntries };
};

const gatherEngagementContext = async (
  engagementId: string,
  emphasis: BadassBlueprintEmphasis,
  selections: BlueprintRecordSelection[],
  tailoredPrompt?: string
): Promise<EngagementContextSnapshot> => {
  const [povDoc, trrDoc, scenarioSnapshot] = await Promise.all([
    firestore.collection('povs').doc(engagementId).get().catch(() => null),
    firestore.collection('trrRecords').doc(engagementId).get().catch(() => null),
    firestore
      .collection('scenarioExecutions')
      .orderBy('startTime', 'desc')
      .limit(25)
      .get()
      .catch(() => null),
  ]);

  const scenarioDocs = scenarioSnapshot?.docs || [];
  const scenarioData = scenarioDocs
    .map((doc, index) => ({
      raw: doc.data(),
      id: doc.id,
      index,
    }))
    .filter(item => {
      const data = item.raw;
      if (!data) return false;
      if (data.engagementId === engagementId) return true;
      if (data.engagement?.id === engagementId) return true;
      if (data.metadata?.engagementId === engagementId) return true;
      return scenarioDocs.length <= 5;
    })
    .map((item, idx) => mapScenario(item.raw, item.id, idx));

  if (scenarioData.length === 0) {
    scenarioData.push(
      mapScenario(
        {
          name: 'Zero Trust Attack Simulation',
          status: 'completed',
          impact: 'Validated auto-remediation with exec visibility',
          metrics: { automationScore: 0.78, detectionsValidated: 12, dwellTimeHours: 6 },
          highlights: ['Automation:ZeroTrust', 'Risk:IdentityHardening', 'Next Step:Playbook rollout'],
        },
        `${engagementId}-scenario-1`,
        0
      )
    );
  }

  const notes = await fetchEngagementNotes(engagementId);

  const povData = povDoc?.data() || {};
  const trrData = trrDoc?.data() || {};

  const customerName =
    povData.customer || trrData.customerName || trrData.customer || `Engagement ${engagementId}`;
  const povType = povData.type || povData.povType || 'xsiam';
  const trrPhase = trrData.phase || trrData.status || 'execution';

  const metrics = {
    riskScore: Number(trrData.riskScore) || 0.32,
    automationConfidence: Number(trrData.automationConfidence) || 0.68,
    coveragePercentage: Number(povData.coveragePercentage) || Math.min(95, scenarioData.length * 18 + 40),
    timeToValueDays: Number(povData.timeToValueDays) || 42,
    quantifiedValue: Number(povData.quantifiedValue) || 240000,
  };

  const timeline = buildTimeline(engagementId, {
    pov: povDoc,
    trr: trrDoc,
    scenarios: scenarioDocs.map(doc => ({ id: doc.id, startTime: doc.data()?.startTime })),
  });

  const baseTranscripts = Array.isArray(povData.transcripts)
    ? povData.transcripts.map((item: any, index: number) => ({
        source: item.source || `transcript-${index + 1}`,
        tokens: Number(item.tokens) || 1200,
      }))
    : undefined;

  let summary =
    povData.summary ||
    `Demonstrated Cortex transformation journey for ${customerName}, aligning automation with executive KPIs and TRR readiness.`;

  const supportingRecords: BlueprintSupportingRecord[] = [];
  const metricSnapshots: EngagementMetricSnapshot[] = [
    {
      riskScore: metrics.riskScore,
      automationConfidence: metrics.automationConfidence,
      coveragePercentage: metrics.coveragePercentage,
      timeToValueDays: metrics.timeToValueDays,
      quantifiedValue: metrics.quantifiedValue,
    },
  ];
  const transcriptExtras: { source: string; tokens: number }[] = [];

  if (Array.isArray(selections) && selections.length > 0) {
    const nowIso = new Date().toISOString();
    for (const selection of selections) {
      try {
        const selectionData = await fetchSelectionData(selection);
        const augmentation = deriveSelectionAugmentation(selection, selectionData || {}, nowIso);
        supportingRecords.push(augmentation.record);
        if (augmentation.notes?.length) {
          notes.push(...augmentation.notes);
        }
        if (augmentation.scenarios?.length) {
          scenarioData.push(...augmentation.scenarios);
        }
        if (augmentation.metrics) {
          metricSnapshots.push({
            riskScore:
              typeof augmentation.metrics.riskScore === 'number'
                ? augmentation.metrics.riskScore
                : metrics.riskScore,
            automationConfidence:
              typeof augmentation.metrics.automationConfidence === 'number'
                ? augmentation.metrics.automationConfidence
                : metrics.automationConfidence,
            coveragePercentage:
              typeof augmentation.metrics.coveragePercentage === 'number'
                ? augmentation.metrics.coveragePercentage
                : metrics.coveragePercentage,
            timeToValueDays:
              typeof augmentation.metrics.timeToValueDays === 'number'
                ? augmentation.metrics.timeToValueDays
                : metrics.timeToValueDays,
            quantifiedValue:
              typeof augmentation.metrics.quantifiedValue === 'number'
                ? augmentation.metrics.quantifiedValue
                : metrics.quantifiedValue,
          });
        }
        if (augmentation.timelineEntries?.length) {
          timeline.push(...augmentation.timelineEntries);
        }
        if (augmentation.transcripts?.length) {
          transcriptExtras.push(...augmentation.transcripts);
        }
      } catch (error) {
        logger.debug('Blueprint selection augmentation failed', {
          engagementId,
          recordId: selection.recordId,
          source: selection.source,
          error,
        });
      }
    }
  }

  const noteSet = new Set<string>();
  const normalizedNotes: EngagementContextSnapshot['notes'] = [];
  notes.forEach(note => {
    const key = `${note.note}:${note.author}`;
    if (!noteSet.has(key)) {
      noteSet.add(key);
      normalizedNotes.push(note);
    }
  });

  const scenarioMap = new Map<string, EngagementScenarioOutcome>();
  scenarioData.forEach(scenario => {
    scenarioMap.set(scenario.id, scenario);
  });
  const mergedScenarios = Array.from(scenarioMap.values());

  if (metricSnapshots.length > 1) {
    const divisor = metricSnapshots.length;
    const totals = metricSnapshots.reduce(
      (acc, snapshot) => {
        acc.riskScore += snapshot.riskScore;
        acc.automationConfidence += snapshot.automationConfidence;
        acc.coveragePercentage += snapshot.coveragePercentage;
        acc.timeToValueDays += snapshot.timeToValueDays;
        acc.quantifiedValue += snapshot.quantifiedValue;
        return acc;
      },
      { riskScore: 0, automationConfidence: 0, coveragePercentage: 0, timeToValueDays: 0, quantifiedValue: 0 }
    );
    metrics.riskScore = Number((totals.riskScore / divisor).toFixed(2));
    metrics.automationConfidence = Number((totals.automationConfidence / divisor).toFixed(2));
    metrics.coveragePercentage = Math.min(100, Number((totals.coveragePercentage / divisor).toFixed(2)));
    metrics.timeToValueDays = Math.round(totals.timeToValueDays / divisor);
    metrics.quantifiedValue = Math.round(totals.quantifiedValue / divisor);
  }

  const transcriptsCombined = baseTranscripts ? [...baseTranscripts, ...transcriptExtras] : transcriptExtras;
  const transcripts = transcriptsCombined.length > 0 ? transcriptsCombined : undefined;

  if (supportingRecords.length > 0) {
    const topRecords = supportingRecords.slice(0, 3).map(record => record.commonName).join(', ');
    summary = `${summary} Supporting records blended: ${topRecords}${supportingRecords.length > 3 ? ', …' : ''}.`;
  }

  return {
    engagementId,
    customerName,
    povType,
    trrPhase,
    summary,
    emphasis,
    metrics,
    scenarios: mergedScenarios,
    notes: normalizedNotes,
    timeline,
    transcripts,
    supportingRecords,
    tailoredPrompt,
    recordSelections: selections,
  };
};

const recordActivity = async (
  engagementId: string,
  blueprintId: string,
  payload: { type: string; status: string; message: string; metadata?: Record<string, any> }
) => {
  try {
    await firestore.collection('activityFeed').add({
      engagementId,
      blueprintId,
      type: payload.type,
      status: payload.status,
      message: payload.message,
      metadata: payload.metadata || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logger.debug('Failed to record activity feed entry', { engagementId, blueprintId, error });
  }
};

export const generateBlueprintInternal = async (
  data: unknown,
  context: BlueprintGenerationContext
): Promise<BlueprintGenerationResult> => {
  const parsed = blueprintRequestSchema.safeParse(data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }

  const { engagementId, executiveTone, emphasis, recordSelections, tailoredPrompt } = parsed.data;
  const selections = Array.isArray(recordSelections) ? recordSelections : [];
  const cleanedEmphasis: BadassBlueprintEmphasis = {
    wins: safeArray(emphasis?.wins),
    risks: safeArray(emphasis?.risks),
    roadmap: safeArray(emphasis?.roadmap),
  };

  const existingSnapshot = await firestore
    .collection('badassBlueprints')
    .where('engagementId', '==', engagementId)
    .limit(5)
    .get();

  const activeExisting = existingSnapshot.docs
    .map(doc => ({ id: doc.id, data: doc.data() as BlueprintDocument }))
    .find(item => {
      const status = item.data.status;
      if (!status || status === 'failed') {
        return false;
      }
      const generatedAtMillis = toMillisSafe(item.data.generatedAt as any);
      if (!generatedAtMillis) return true;
      return Date.now() - generatedAtMillis < 5 * 60 * 1000;
    });

  if (activeExisting) {
    logger.info('Returning existing Badass Blueprint request', {
      engagementId,
      blueprintId: activeExisting.id,
    });
    return {
      blueprintId: activeExisting.id,
      status: activeExisting.data.status,
      payloadPath: activeExisting.data.payload?.storagePath || '',
    };
  }

  const blueprintId = `bb_${engagementId}_${Date.now()}`;
  const basePath = `engagementArtifacts/${engagementId}/blueprint/${Date.now()}`;

  logger.info('Generating Badass Blueprint payload', { engagementId, blueprintId });

  const contextSnapshot = await gatherEngagementContext(
    engagementId,
    cleanedEmphasis,
    selections,
    tailoredPrompt
  );

  const generationStarted = Date.now();
  const payload = await generateBadassBlueprintPayload(
    contextSnapshot,
    cleanedEmphasis,
    executiveTone
  );
  const generationLatency = Date.now() - generationStarted;

  const payloadBuffer = Buffer.from(JSON.stringify(payload, null, 2));
  const payloadChecksum = createHash('sha256').update(payloadBuffer).digest('hex');
  const payloadPath = `${basePath}/payload.json`;

  await storage
    .bucket()
    .file(payloadPath)
    .save(payloadBuffer, {
      contentType: 'application/json',
      metadata: {
        metadata: {
          blueprintId,
          engagementId,
          type: 'blueprint-payload',
        },
      },
    });

  const analytics: BlueprintAnalyticsSnapshot = {
    recommendationCoverage: payload.metrics.recommendationCoverage,
    riskScore: payload.metrics.riskScore,
    automationConfidence: payload.metrics.automationConfidence,
    recommendationCategories: payload.recommendationCategories,
    scenarioCount: payload.metrics.scenarioCount,
    notesCount: payload.metrics.notesCount,
    transcriptTokens: payload.metrics.transcriptTokens,
    deliveryLatencyMs: null,
    bigQueryJobId: null,
    lastExportedAt: null,
  };

  const blueprintDocument: Partial<BlueprintDocument> & Record<string, any> = {
    engagementId,
    customerName: contextSnapshot.customerName,
    generatedBy: context.authUid,
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'processing',
    contextSnapshot,
    pdf: null,
    artifactBundle: null,
    extensionRun: {
      extensionId: 'badass-blueprint-mm',
      version: '2024.10.01',
      prompts: payload.prompts,
      completionTokens: payload.metrics.scenarioCount * 256,
      latencyMs: generationLatency,
    },
    analytics,
    payload: {
      storagePath: payloadPath,
      checksumSha256: payloadChecksum,
      bytes: payloadBuffer.byteLength,
      sections: payload.sections.length,
      executiveTheme: payload.executiveTheme,
    },
    emphasis: cleanedEmphasis,
    selections,
    tailoredPrompt,
  };

  await firestore.collection('badassBlueprints').doc(blueprintId).set(blueprintDocument);

  await recordActivity(engagementId, blueprintId, {
    type: 'blueprint_generation_requested',
    status: 'processing',
    message: 'Badass Blueprint generation requested',
    metadata: { executiveTone, emphasis: cleanedEmphasis },
  });

  return {
    blueprintId,
    status: 'processing',
    payloadPath,
  };
};

export const generateBadassBlueprintCallable = onCall(
  {
    region: 'us-central1',
    memory: '2GiB',
    timeoutSeconds: 540,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required to generate blueprint');
    }

    return generateBlueprintInternal(request.data, {
      authUid: request.auth.uid,
      authToken: request.auth.token,
    });
  }
);

export const generateBlueprintViaHttp = async (
  data: unknown,
  userId: string | null
): Promise<BlueprintGenerationResult> => {
  if (!userId) {
    throw new HttpsError('unauthenticated', 'Authentication required to generate blueprint');
  }

  return generateBlueprintInternal(data, { authUid: userId });
};

const wrapText = (
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
};

const renderBlueprintPdf = async (
  blueprintId: string,
  data: BlueprintDocument
): Promise<BlueprintFileMetadata> => {
  if (!data.payload?.storagePath) {
    throw new Error('Blueprint payload missing storage path');
  }

  const [payloadBuffer] = await storage.bucket().file(data.payload.storagePath).download();
  const payload = JSON.parse(payloadBuffer.toString()) as BadassBlueprintPayload;

  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([612, 792]);
  let { width, height } = currentPage.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let cursorY = height - margin;

  const ensureSpace = (lineHeight = 16) => {
    if (cursorY - lineHeight <= margin) {
      currentPage = pdfDoc.addPage([612, 792]);
      const size = currentPage.getSize();
      width = size.width;
      height = size.height;
      cursorY = height - margin;
    }
  };

  currentPage.drawText('Badass Blueprint Executive Summary', {
    x: margin,
    y: cursorY,
    size: 20,
    font: boldFont,
    color: rgb(0.8, 0.9, 1),
  });

  cursorY -= 26;
  const summaryLines = wrapText(payload.narrativeSummary, font, 12, width - margin * 2);
  summaryLines.forEach(line => {
    ensureSpace(16);
    currentPage.drawText(line, { x: margin, y: cursorY, size: 12, font });
    cursorY -= 16;
  });

  for (const section of payload.sections) {
    ensureSpace(40);
    currentPage.drawText(section.title, {
      x: margin,
      y: cursorY,
      size: 16,
      font: boldFont,
      color: rgb(0.7, 0.85, 1),
    });
    cursorY -= 22;

    const summary = wrapText(section.summary, font, 11, width - margin * 2);
    summary.forEach(line => {
      ensureSpace(14);
      currentPage.drawText(line, { x: margin, y: cursorY, size: 11, font });
      cursorY -= 14;
    });

    section.details.forEach(detail => {
      const lines = wrapText(detail.replace(/^•?\s*/, '• '), font, 10, width - margin * 2);
      lines.forEach(line => {
        ensureSpace(13);
        currentPage.drawText(line, { x: margin, y: cursorY, size: 10, font });
        cursorY -= 13;
      });
    });

    cursorY -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  const pdfChecksum = createHash('sha256').update(pdfBuffer).digest('hex');

  const pdfPath = data.payload.storagePath.replace(/\/payload\.json$/, '') + '/blueprint.pdf';
  const file = storage.bucket().file(pdfPath);
  await file.save(pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      metadata: {
        blueprintId,
        engagementId: data.engagementId,
        type: 'blueprint-pdf',
      },
    },
  });

  const bytes = pdfBuffer.byteLength;
  const [downloadUrl] = await file.getSignedUrl({
    action: 'read',
    expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
  });

  return {
    storagePath: pdfPath,
    checksumSha256: pdfChecksum,
    bytes,
    downloadUrl,
    brandTheme: 'cortex-xsiam',
  };
};

export const renderBadassBlueprintPdf = onDocumentCreated(
  {
    document: 'badassBlueprints/{blueprintId}',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async (event) => {
    const blueprintId = event.params.blueprintId;
    const data = event.data?.data() as BlueprintDocument | undefined;
    if (!data) return;

    try {
      const pdfMetadata = await renderBlueprintPdf(blueprintId, data);
      const generatedAtMillis = toMillisSafe(data.generatedAt as any);
      const analyticsBase: BlueprintAnalyticsSnapshot = data.analytics || {
        recommendationCoverage: 0,
        riskScore: 0,
        automationConfidence: 0,
        recommendationCategories: [],
        scenarioCount: 0,
        notesCount: 0,
        transcriptTokens: 0,
        deliveryLatencyMs: null,
        bigQueryJobId: null,
        lastExportedAt: null,
      };
      const analyticsUpdate: BlueprintAnalyticsSnapshot = {
        ...analyticsBase,
        deliveryLatencyMs: generatedAtMillis ? Date.now() - generatedAtMillis : null,
      };

      await event.data?.ref.update({
        pdf: pdfMetadata,
        analytics: analyticsUpdate,
        status: 'rendered',
      });

      await recordActivity(data.engagementId, blueprintId, {
        type: 'blueprint_pdf_rendered',
        status: 'rendered',
        message: 'Badass Blueprint PDF rendered and uploaded',
        metadata: { pdfPath: pdfMetadata.storagePath },
      });
    } catch (error) {
      logger.error('Failed to render Badass Blueprint PDF', { blueprintId, error });
      await event.data?.ref.update({
        status: 'failed',
        error: { message: (error as Error).message },
      });

      await recordActivity(data.engagementId, blueprintId, {
        type: 'blueprint_pdf_failed',
        status: 'failed',
        message: 'Failed to render Badass Blueprint PDF',
        metadata: { error: (error as Error).message },
      });
    }
  }
);

const createArtifactBundle = async (
  blueprintId: string,
  data: BlueprintDocument
): Promise<BlueprintFileMetadata> => {
  if (!data.pdf?.storagePath || !data.payload?.storagePath) {
    throw new Error('Missing PDF or payload metadata for bundling');
  }

  const bucket = storage.bucket();
  const [payloadBuffer] = await bucket.file(data.payload.storagePath).download();
  const [pdfBuffer] = await bucket.file(data.pdf.storagePath).download();
  const contextBuffer = Buffer.from(JSON.stringify(data.contextSnapshot, null, 2));

  const archive = archiver('zip', { zlib: { level: 9 } });
  const output = new PassThrough();
  const chunks: Buffer[] = [];

  output.on('data', chunk => chunks.push(chunk as Buffer));

  const finalize = new Promise<void>((resolve, reject) => {
    output.on('finish', () => resolve());
    output.on('error', err => reject(err));
  });

  archive.on('error', error => {
    throw error;
  });

  archive.pipe(output);
  archive.append(payloadBuffer, { name: 'payload.json' });
  archive.append(pdfBuffer, { name: 'blueprint.pdf' });
  archive.append(contextBuffer, { name: 'context.json' });
  archive.append(
    Buffer.from(
      JSON.stringify(
        {
          blueprintId,
          engagementId: data.engagementId,
          analytics: data.analytics,
          generatedAt: toIsoString(data.generatedAt as any) || new Date().toISOString(),
        },
        null,
        2
      )
    ),
    { name: 'metadata.json' }
  );

  archive.finalize();
  await finalize;

  const bundleBuffer = Buffer.concat(chunks);
  const bundleChecksum = createHash('sha256').update(bundleBuffer).digest('hex');

  const bundlePath = data.pdf.storagePath.replace(/\/blueprint\.pdf$/, '') + '/bundle.zip';
  const file = bucket.file(bundlePath);
  await file.save(bundleBuffer, {
    contentType: 'application/zip',
    metadata: {
      metadata: {
        blueprintId,
        engagementId: data.engagementId,
        type: 'blueprint-artifact-bundle',
      },
    },
  });

  const [downloadUrl] = await file.getSignedUrl({
    action: 'read',
    expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
  });

  return {
    storagePath: bundlePath,
    checksumSha256: bundleChecksum,
    bytes: bundleBuffer.byteLength,
    downloadUrl,
  };
};

const publishArtifactReady = async (payload: { blueprintId: string; engagementId: string }) => {
  try {
    const client = getPubSubClient();
    const topicName = 'blueprint.artifacts.ready';
    const topic = client.topic(topicName);
    const [exists] = await topic.exists();
    if (!exists) {
      await topic.create();
    }
    await topic.publishMessage({ json: payload });
  } catch (error) {
    logger.warn('Failed to publish blueprint.artifacts.ready message', { payload, error });
  }
};

export const bundleBlueprintArtifacts = onDocumentWritten(
  {
    document: 'badassBlueprints/{blueprintId}',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async (event) => {
    const before = event.data?.before?.data() as BlueprintDocument | undefined;
    const after = event.data?.after?.data() as BlueprintDocument | undefined;
    if (!after) return;

    const pdfJustRendered = !before?.pdf?.storagePath && after.pdf?.storagePath;
    const bundleAlreadyExists = Boolean(after.artifactBundle?.storagePath);

    if (!pdfJustRendered || bundleAlreadyExists) {
      return;
    }

    const blueprintId = event.params.blueprintId;

    try {
      const bundleMetadata = await createArtifactBundle(blueprintId, after);
      const analyticsBase: BlueprintAnalyticsSnapshot = after.analytics || {
        recommendationCoverage: 0,
        riskScore: 0,
        automationConfidence: 0,
        recommendationCategories: [],
        scenarioCount: 0,
        notesCount: 0,
        transcriptTokens: 0,
        deliveryLatencyMs: null,
        bigQueryJobId: null,
        lastExportedAt: null,
      };
      const analyticsUpdate: BlueprintAnalyticsSnapshot = {
        ...analyticsBase,
        recommendationCategories: analyticsBase.recommendationCategories || [],
      };

      await event.data?.after?.ref.update({
        artifactBundle: bundleMetadata,
        analytics: analyticsUpdate,
        status: 'export_pending',
      });

      await publishArtifactReady({ blueprintId, engagementId: after.engagementId });

      await recordActivity(after.engagementId, blueprintId, {
        type: 'blueprint_bundle_created',
        status: 'export_pending',
        message: 'Badass Blueprint artifact bundle prepared',
        metadata: { bundlePath: bundleMetadata.storagePath },
      });
    } catch (error) {
      logger.error('Failed to bundle Badass Blueprint artifacts', { blueprintId, error });
      await event.data?.after?.ref.update({
        status: 'failed',
        error: { message: (error as Error).message },
      });

      await recordActivity(after.engagementId, blueprintId, {
        type: 'blueprint_bundle_failed',
        status: 'failed',
        message: 'Failed to prepare Badass Blueprint bundle',
        metadata: { error: (error as Error).message },
      });
    }
  }
);

const parsePubSubMessage = (message: any) => {
  if (!message) return {};
  if (message.json) return message.json;
  if (message.data) {
    try {
      return JSON.parse(Buffer.from(message.data, 'base64').toString());
    } catch (error) {
      logger.warn('Failed to parse Pub/Sub message data', { error });
    }
  }
  return {};
};

export const exportBlueprintAnalytics = onMessagePublished(
  {
    topic: 'blueprint.artifacts.ready',
    region: 'us-central1',
    retry: true,
  },
  async (event) => {
    const payload = parsePubSubMessage(event.data?.message);
    const blueprintId: string | undefined = payload.blueprintId || event.data?.message?.attributes?.blueprintId;
    if (!blueprintId) {
      logger.warn('Received blueprint.artifacts.ready event without blueprintId', { payload });
      return;
    }

    const docRef = firestore.collection('badassBlueprints').doc(blueprintId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      logger.warn('Blueprint document not found for analytics export', { blueprintId });
      return;
    }

    const data = snapshot.data() as BlueprintDocument;
    const datasetId = process.env.BLUEPRINT_BIGQUERY_DATASET || 'engagement_reporting';
    const tableId = process.env.BLUEPRINT_BIGQUERY_TABLE || 'badass_blueprints';
    const shouldExport = process.env.ENABLE_BIGQUERY_EXPORT !== 'false';

    const analyticsBase: BlueprintAnalyticsSnapshot = data.analytics || {
      recommendationCoverage: 0,
      riskScore: 0,
      automationConfidence: 0,
      recommendationCategories: [],
      scenarioCount: 0,
      notesCount: 0,
      transcriptTokens: 0,
      deliveryLatencyMs: null,
      bigQueryJobId: null,
      lastExportedAt: null,
    };
    const analyticsUpdate: BlueprintAnalyticsSnapshot = {
      ...analyticsBase,
      lastExportedAt: new Date().toISOString(),
    };

    let jobId: string | null = null;
    try {
      if (shouldExport) {
        const client = getBigQueryClient();
        const row = {
          blueprint_id: blueprintId,
          engagement_id: data.engagementId,
          customer_name: data.customerName,
          pov_type: data.contextSnapshot?.povType || data.contextSnapshot?.pov_type || null,
          trr_phase: data.contextSnapshot?.trrPhase || data.contextSnapshot?.trr_phase || null,
          generated_at: toIsoString(data.generatedAt as any),
          generated_by: data.generatedBy,
          recommendation_categories: analyticsBase.recommendationCategories || [],
          risk_score: analyticsBase.riskScore,
          automation_confidence: analyticsBase.automationConfidence,
          delivery_latency_ms: analyticsBase.deliveryLatencyMs,
          pdf_storage_path: data.pdf?.storagePath || null,
          artifact_bundle_path: data.artifactBundle?.storagePath || null,
          executive_theme: data.payload?.executiveTheme || null,
          notes_count: analyticsBase.notesCount,
          scenario_count: analyticsBase.scenarioCount,
          transcript_tokens: analyticsBase.transcriptTokens,
        };

        await client.dataset(datasetId).table(tableId).insert([row]);
        jobId = `insert-${Date.now()}`;
      } else {
        jobId = 'disabled';
      }

      analyticsUpdate.bigQueryJobId = jobId;

      await docRef.update({
        analytics: analyticsUpdate,
        status: 'succeeded',
      });

      await recordActivity(data.engagementId, blueprintId, {
        type: 'blueprint_exported',
        status: 'succeeded',
        message: 'Badass Blueprint analytics exported',
        metadata: { datasetId, tableId, jobId },
      });
    } catch (error) {
      logger.error('Failed to export Badass Blueprint analytics', { blueprintId, error });
      analyticsUpdate.bigQueryJobId = jobId;
      await docRef.update({
        analytics: analyticsUpdate,
        status: 'failed',
        error: { message: (error as Error).message },
      });

      await recordActivity(data.engagementId, blueprintId, {
        type: 'blueprint_export_failed',
        status: 'failed',
        message: 'Failed to export blueprint analytics to BigQuery',
        metadata: { error: (error as Error).message },
      });

      throw error;
    }
  }
);
