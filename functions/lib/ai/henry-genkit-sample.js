"use strict";
// Integrated from henryreedai/src/genkit-sample.ts
// Genkit sample callable function (menuSuggestion)
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuSuggestion = void 0;
const genkit_1 = require("genkit");
const vertexai_1 = require("@genkit-ai/vertexai");
const https_1 = require("firebase-functions/https");
const params_1 = require("firebase-functions/params");
const firebase_1 = require("@genkit-ai/firebase");
// Enable Firebase telemetry for observability
(0, firebase_1.enableFirebaseTelemetry)();
const apiKey = (0, params_1.defineSecret)("GOOGLE_GENAI_API_KEY");
const ai = (0, genkit_1.genkit)({
    plugins: [
        (0, vertexai_1.vertexAI)({ location: "us-central1" }),
    ],
});
const menuSuggestionFlow = ai.defineFlow({
    name: "menuSuggestionFlow",
    inputSchema: genkit_1.z.string().describe("A restaurant theme").default("seafood"),
    outputSchema: genkit_1.z.string(),
    streamSchema: genkit_1.z.string(),
}, async (subject, { sendChunk }) => {
    const prompt = `Suggest an item for the menu of a ${subject} themed restaurant`;
    const { response, stream } = ai.generateStream({
        model: vertexai_1.gemini20Flash,
        prompt,
        config: { temperature: 1 },
    });
    for await (const chunk of stream) {
        sendChunk(chunk.text);
    }
    return (await response).text;
});
exports.menuSuggestion = (0, https_1.onCallGenkit)({
    // enforceAppCheck: true, // optional: enable AppCheck if desired
    secrets: [apiKey],
}, menuSuggestionFlow);
//# sourceMappingURL=henry-genkit-sample.js.map