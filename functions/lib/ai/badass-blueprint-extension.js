"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBadassBlueprintPayload = void 0;
const buildExecutiveSummary = (context, metrics, theme) => {
    const emphasisWins = context.emphasis?.wins || [];
    const focusAreas = emphasisWins.length
        ? emphasisWins
        : ['Prove rapid time-to-value', 'Showcase automation leverage', 'Align roadmap to risk reduction'];
    const visualBlocks = [
        {
            type: 'progress',
            label: 'Automation Confidence',
            data: { value: Math.round(metrics.automationConfidence * 100), suffix: '%', trend: 'up' }
        },
        {
            type: 'progress',
            label: 'Recommendation Coverage',
            data: { value: Math.round(metrics.recommendationCoverage * 100), suffix: '%', trend: 'up' }
        },
        {
            type: 'stat',
            label: 'Time to Value',
            data: { value: `${context.metrics.timeToValueDays} days`, supporting: 'Target &lt; 45 days' }
        }
    ];
    return {
        title: 'Executive Summary',
        summary: `The ${context.customerName} engagement validated the ${theme} blueprint with ${metrics.scenarioCount} executed scenarios, delivering a ${Math.round(metrics.recommendationCoverage * 100)}% coverage across the recommended capabilities.`,
        details: [
            `• Business Outcome: ${context.summary}`,
            `• Automation Confidence landed at ${Math.round(metrics.automationConfidence * 100)}% with ${context.metrics.quantifiedValue} quantified business value.`,
            `• Risk posture shifted to ${Math.round(metrics.riskScore * 100)}% residual exposure by the end of the POV.`
        ],
        supportingArtifacts: context.scenarios.slice(0, 3).map(s => `Scenario ${s.id}: ${s.name}`),
        recommendedActions: focusAreas.map(area => `Amplify ${area.toLowerCase()}`),
        visualBlocks
    };
};
const buildTimelineSection = (context) => {
    const details = context.timeline.map(entry => `${entry.timestamp}: ${entry.description}`);
    return {
        title: 'Engagement Timeline',
        summary: `Key milestones from kickoff through transformation checkpoints for ${context.customerName}.`,
        details,
        supportingArtifacts: context.timeline.map(entry => entry.label),
        recommendedActions: ['Maintain cadence via TRR governance', 'Capture lessons learned in POV workspace'],
        visualBlocks: [
            {
                type: 'callout',
                label: 'Next Milestone',
                data: { value: context.timeline[context.timeline.length - 1]?.label || 'Executive Review' }
            }
        ]
    };
};
const buildScenarioSection = (context) => {
    const details = context.scenarios.map(scenario => `${scenario.name} → ${scenario.status}. Impact: ${scenario.impact}. Highlights: ${scenario.highlights.join(', ')}`);
    return {
        title: 'Scenario Outcomes',
        summary: `${context.scenarios.length} POV scenarios executed covering ${context.metrics.coveragePercentage}% of the agreed capability footprint.`,
        details,
        supportingArtifacts: context.scenarios.map(s => `Runbook:${s.id}`),
        recommendedActions: ['Promote validated playbooks into production', 'Schedule follow-on scenario expansion'],
        visualBlocks: [
            {
                type: 'heatmap',
                label: 'Scenario Confidence',
                data: context.scenarios.map(s => ({
                    id: s.id,
                    name: s.name,
                    value: Math.round(s.metrics.automationScore * 100)
                }))
            }
        ]
    };
};
const buildRecommendationSection = (context, metrics) => {
    const risks = context.emphasis?.risks?.length ? context.emphasis.risks : ['SOC process maturity', 'Telemetry normalization'];
    const roadmap = context.emphasis?.roadmap?.length
        ? context.emphasis.roadmap
        : ['Automate containment for top 3 use cases', 'Operationalize KPI scorecards', 'Launch quarterly TRR reviews'];
    return {
        title: 'Recommendations & Roadmap',
        summary: `Prioritized actions to sustain momentum while mitigating residual risk (risk score ${Math.round(metrics.riskScore * 100)}%).`,
        details: [
            `Risks to watch: ${risks.join(', ')}`,
            `Automation focus: ${Math.round(metrics.automationConfidence * 100)}% coverage achieved`,
            `Roadmap milestones: ${roadmap.join(' → ')}`
        ],
        supportingArtifacts: roadmap.map((item, idx) => `Roadmap-${idx + 1}`),
        recommendedActions: roadmap,
        visualBlocks: [
            {
                type: 'progress',
                label: 'Roadmap Completion',
                data: { value: Math.min(90, Math.round(metrics.recommendationCoverage * 100)), suffix: '%' }
            }
        ]
    };
};
const buildNextStepsSection = (context) => {
    const details = context.notes.slice(0, 5).map(note => `${note.createdAt} – ${note.author}: ${note.note}`);
    const actions = [
        'Host executive readout and align on investment path',
        'Publish blueprint assets to Cortex DC workspace',
        'Kickoff follow-on TRR validation campaign'
    ];
    return {
        title: 'Next Steps & Enablement',
        summary: 'Actions required from executive, technical, and operations stakeholders over the next 30 days.',
        details,
        supportingArtifacts: actions.map((_, idx) => `Enablement-${idx + 1}`),
        recommendedActions: actions,
        visualBlocks: [
            {
                type: 'stat',
                label: 'Engagement Notes Captured',
                data: { value: context.notes.length }
            }
        ]
    };
};
const buildAppendixSection = (context) => {
    const transcripts = context.transcripts?.reduce((total, transcript) => total + transcript.tokens, 0) || 0;
    const supporting = [`Transcripts processed: ${transcripts} tokens`, `Notes archived: ${context.notes.length}`];
    return {
        title: 'Appendices & Evidence',
        summary: 'Reference materials bundled for governance and future reuse.',
        details: supporting,
        supportingArtifacts: ['Payload JSON', 'Prompt transcript', 'Evidence bundle'],
        recommendedActions: ['Store in regulated storage per retention policy', 'Share with engagement QA reviewer'],
        visualBlocks: [
            {
                type: 'stat',
                label: 'Artifacts Bundled',
                data: { value: supporting.length + context.scenarios.length }
            }
        ]
    };
};
const generateBadassBlueprintPayload = async (context, emphasis, executiveTone) => {
    const scenarioCount = context.scenarios.length;
    const notesCount = context.notes.length;
    const transcriptTokens = context.transcripts?.reduce((sum, transcript) => sum + transcript.tokens, 0) || 0;
    const coverageBase = context.metrics.coveragePercentage / 100 + (emphasis?.wins?.length || 0) * 0.03;
    const recommendationCoverage = Math.min(1, Math.max(0, Number(coverageBase.toFixed(2))));
    const metrics = {
        recommendationCoverage,
        riskScore: context.metrics.riskScore,
        automationConfidence: context.metrics.automationConfidence,
        scenarioCount,
        notesCount,
        transcriptTokens
    };
    const theme = executiveTone || 'Transformation Acceleration';
    const sections = [
        buildExecutiveSummary({ ...context, emphasis }, metrics, theme),
        buildTimelineSection(context),
        buildScenarioSection(context),
        buildRecommendationSection({ ...context, emphasis }, metrics),
        buildNextStepsSection(context),
        buildAppendixSection(context)
    ];
    const recommendationCategories = Array.from(new Set(context.scenarios.flatMap(scenario => scenario.highlights
        .map(highlight => highlight.split(':')[0]?.trim())
        .filter(Boolean))));
    const prompts = [
        'System: Generate an executive-ready transformation blueprint aligning context, timeline, recommendations, and next steps.',
        `User Emphasis: ${JSON.stringify(emphasis || {})}`,
        `Context Summary: ${context.summary}`
    ];
    return {
        executiveTheme: theme,
        narrativeSummary: `Synthesized ${scenarioCount} scenarios, ${notesCount} curated notes, and automation metrics for ${context.customerName} to deliver an executive-ready readout.`,
        sections,
        recommendationCategories,
        metrics,
        prompts
    };
};
exports.generateBadassBlueprintPayload = generateBadassBlueprintPayload;
//# sourceMappingURL=badass-blueprint-extension.js.map