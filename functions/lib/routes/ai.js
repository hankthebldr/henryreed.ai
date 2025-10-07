"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const genkit_flows_1 = require("../ai/genkit-flows");
exports.aiRouter = (0, express_1.Router)();
exports.aiRouter.post('/pov-analysis', async (req, res) => {
    try {
        const data = await (0, genkit_flows_1.runPovAnalysis)(req.body);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, error: (error === null || error === void 0 ? void 0 : error.message) || 'Invalid input' });
    }
});
exports.aiRouter.post('/trr-recommendations', async (req, res) => {
    try {
        const data = await (0, genkit_flows_1.runTrrRecommendations)(req.body);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, error: (error === null || error === void 0 ? void 0 : error.message) || 'Invalid input' });
    }
});
exports.aiRouter.post('/detection-generation', async (req, res) => {
    try {
        const data = await (0, genkit_flows_1.runDetectionGeneration)(req.body);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, error: (error === null || error === void 0 ? void 0 : error.message) || 'Invalid input' });
    }
});
//# sourceMappingURL=ai.js.map