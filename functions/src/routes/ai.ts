import { Router } from 'express';
import { runPovAnalysis, runTrrRecommendations, runDetectionGeneration } from '../ai/genkit-flows';

export const aiRouter = Router();

aiRouter.post('/pov-analysis', async (req, res) => {
  try {
    const data = await runPovAnalysis(req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error?.message || 'Invalid input' });
  }
});

aiRouter.post('/trr-recommendations', async (req, res) => {
  try {
    const data = await runTrrRecommendations(req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error?.message || 'Invalid input' });
  }
});

aiRouter.post('/detection-generation', async (req, res) => {
  try {
    const data = await runDetectionGeneration(req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error?.message || 'Invalid input' });
  }
});