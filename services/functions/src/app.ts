import * as functions from 'firebase-functions';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from './common/rateLimit';
import { withRequestMeta } from './common/response';
import { exportToBigQuery, health as bqHealth } from './modules/bq/handlers';
import {
  listTemplates as scenarioList,
  generateScenario as scenarioGenerate,
  deployScenario as scenarioDeploy,
  getScenarioStatus as scenarioStatus,
  validateScenario as scenarioValidate,
  exportScenarioData as scenarioExport,
  destroyScenario as scenarioDestroy,
} from './modules/scenario/handlers';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(cors({ origin: true }));
app.use(rateLimit());

// BigQuery routes
app.get('/api/v1/bq/health', bqHealth);
app.post('/api/v1/bq/export', exportToBigQuery);

// Scenario routes
app.post('/api/v1/scenario/list', scenarioList);
app.post('/api/v1/scenario/generate', scenarioGenerate);
app.post('/api/v1/scenario/deploy', scenarioDeploy);
app.get('/api/v1/scenario/status/:id', scenarioStatus);
app.post('/api/v1/scenario/validate', scenarioValidate);
app.post('/api/v1/scenario/export', scenarioExport);
app.post('/api/v1/scenario/destroy', scenarioDestroy);

// General health
app.get('/api/v1/health', (req, res) => {
  const meta = withRequestMeta(req);
  res.json({ success: true, data: { status: 'healthy' }, timestamp: meta.timestamp, requestId: meta.requestId });
});

export const api = functions.region('us-central1').https.onRequest(app);
