import { Request, Response } from 'express';
import { z } from 'zod';
import { ok, err, withRequestMeta } from '../../common/response';

// In lieu of Firestore, we simulate minimal behavior. TODO: persist to Firestore.
const deployments = new Map<string, any>();

const Provider = z.enum(['aws', 'gcp', 'azure', 'k8s', 'local']);

export const ListReq = z.object({
  scenarioType: z.string().optional()
});

export const GenerateReq = z.object({
  scenarioType: z.string(),
  provider: Provider.default('gcp'),
  region: z.string().default('us-central1'),
  options: z.object({
    complexity: z.enum(['low', 'medium', 'high']).default('medium'),
    duration: z.number().default(120),
    includeDefensiveActions: z.boolean().default(true)
  }).default({}),
  context: z.object({ organizationId: z.string(), userId: z.string() }).optional()
});

export const DeployReq = z.object({
  blueprintId: z.string().optional(),
  scenarioType: z.string().optional(),
  provider: Provider.default('gcp'),
  region: z.string().default('us-central1'),
  options: z.record(z.any()).optional()
});

export const StatusParams = z.object({ id: z.string() });

export const ValidateReq = z.object({ deploymentId: z.string() });

export const ExportReq = z.object({ deploymentId: z.string(), format: z.enum(['json','csv','pdf']).default('json') });

export const DestroyReq = z.object({ deploymentId: z.string() });

// POST /api/v1/scenario/list
export async function listTemplates(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const input = ListReq.parse(req.body || {});
    // TODO: Load templates from shared package (packages/shared/scenario-templates)
    const templates = [
      { id: 'cp-misconfigured-s3', type: 'cloud-posture', name: 'Misconfigured Cloud Storage', provider: 'gcp', difficulty: 'beginner' },
      { id: 'cv-vulnerable-base-image', type: 'container-vuln', name: 'Vulnerable Base Images', provider: 'gcp', difficulty: 'intermediate' }
    ].filter(t => !input.scenarioType || t.type === input.scenarioType);
    return res.json(ok(meta, { templates }));
  } catch (e: any) {
    return res.status(400).json(err(meta, 'invalid-argument', e.message));
  }
}

// POST /api/v1/scenario/generate
export async function generateScenario(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const input = GenerateReq.parse(req.body || {});
    const blueprintId = `bp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const blueprint = {
      id: blueprintId,
      name: `${input.scenarioType} blueprint`,
      scenarioType: input.scenarioType,
      provider: input.provider,
      region: input.region,
      createdAt: new Date().toISOString(),
      stages: [
        { id: 'stage-1', name: 'Initial Access', description: 'Simulated access vectors', threatVectors: [], detectionPoints: [] },
        { id: 'stage-2', name: 'Post-Exploitation', description: 'Simulated actions', threatVectors: [], detectionPoints: [] }
      ]
    };
    return res.json(ok(meta, { blueprint }));
  } catch (e: any) {
    return res.status(400).json(err(meta, 'invalid-argument', e.message));
  }
}

// POST /api/v1/scenario/deploy
export async function deployScenario(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const input = DeployReq.parse(req.body || {});
    const deploymentId = `deploy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();
    const record = {
      id: deploymentId,
      status: 'deploying',
      provider: input.provider,
      region: input.region,
      startTime: now.toISOString(),
      scenarioType: input.scenarioType || 'custom',
      estimatedCompletion: new Date(now.getTime() + 15 * 60 * 1000).toISOString()
    };
    deployments.set(deploymentId, record);
    return res.json(ok(meta, { deploymentId, estimatedCompletion: record.estimatedCompletion }));
  } catch (e: any) {
    return res.status(400).json(err(meta, 'invalid-argument', e.message));
  }
}

// GET /api/v1/scenario/status/:id
export async function getScenarioStatus(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const params = StatusParams.parse(req.params || {});
    const existing = deployments.get(params.id);
    if (!existing) {
      // Fall back to completed for idempotency in early scaffolding
      return res.json(ok(meta, { deployment: { id: params.id, status: 'complete', startTime: new Date(Date.now()-10*60*1000).toISOString(), endTime: new Date().toISOString() } }));
    }
    // Simulate progress: mark complete if > 1 min old
    const start = new Date(existing.startTime).getTime();
    const isComplete = Date.now() - start > 60 * 1000;
    const deployment = { ...existing, status: isComplete ? 'complete' : existing.status, endTime: isComplete ? new Date().toISOString() : undefined };
    return res.json(ok(meta, { deployment }));
  } catch (e: any) {
    return res.status(400).json(err(meta, 'invalid-argument', e.message));
  }
}

// POST /api/v1/scenario/validate
export async function validateScenario(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const input = ValidateReq.parse(req.body || {});
    const results = {
      deploymentId: input.deploymentId,
      validationPassed: true,
      detectionAlerts: [],
      performanceMetrics: { time_ms: 5000 }
    };
    return res.json(ok(meta, { results }));
  } catch (e: any) {
    return res.status(400).json(err(meta, 'invalid-argument', e.message));
  }
}

// POST /api/v1/scenario/export
export async function exportScenarioData(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const input = ExportReq.parse(req.body || {});
    const downloadUrl = `https://storage.googleapis.com/fake-bucket/scenario/${input.deploymentId}.${input.format}`;
    return res.json(ok(meta, { downloadUrl }));
  } catch (e: any) {
    return res.status(400).json(err(meta, 'invalid-argument', e.message));
  }
}

// POST /api/v1/scenario/destroy
export async function destroyScenario(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const input = DestroyReq.parse(req.body || {});
    deployments.delete(input.deploymentId);
    return res.json(ok(meta, { success: true }));
  } catch (e: any) {
    return res.status(400).json(err(meta, 'invalid-argument', e.message));
  }
}
