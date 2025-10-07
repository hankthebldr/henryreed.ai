"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDetectionQueries = exports.controlScenarioExecution = exports.executeScenario = exports.generateThreatActorScenario = void 0;
// Comprehensive scenario orchestration handlers
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const openai_1 = __importDefault(require("openai"));
const logger_1 = require("../utils/logger");
// ============================================================================
// SCHEMAS AND TYPES
// ============================================================================
const ThreatActorProfileRequest = zod_1.z.object({
    actorName: zod_1.z.string(),
    targetEnvironment: zod_1.z.object({
        cloudProvider: zod_1.z.enum(['aws', 'gcp', 'azure', 'multi-cloud']).optional(),
        infrastructure: zod_1.z.object({
            vms: zod_1.z.number().optional(),
            containers: zod_1.z.number().optional(),
            networks: zod_1.z.number().optional(),
            storage: zod_1.z.string().optional(),
        }),
        applications: zod_1.z.array(zod_1.z.string()),
        dataTypes: zod_1.z.array(zod_1.z.string()),
        users: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            permissions: zod_1.z.array(zod_1.z.string()),
        })),
    }),
    options: zod_1.z.object({
        complexity: zod_1.z.enum(['low', 'medium', 'high']).default('medium'),
        duration: zod_1.z.number().default(120),
        includeDefensiveActions: zod_1.z.boolean().default(true),
    }),
    context: zod_1.z.object({
        organizationId: zod_1.z.string(),
        userId: zod_1.z.string(),
    }),
});
const ScenarioExecutionRequest = zod_1.z.object({
    blueprintId: zod_1.z.string(),
    options: zod_1.z.object({
        variables: zod_1.z.record(zod_1.z.any()).optional(),
        dryRun: zod_1.z.boolean().default(false),
        pauseOnDetection: zod_1.z.boolean().default(false),
        adaptiveBehavior: zod_1.z.boolean().default(true),
    }),
    context: zod_1.z.object({
        organizationId: zod_1.z.string(),
        userId: zod_1.z.string(),
    }),
});
const ScenarioControlRequest = zod_1.z.object({
    executionId: zod_1.z.string(),
    action: zod_1.z.enum(['pause', 'resume', 'cancel', 'restart']),
    context: zod_1.z.object({
        organizationId: zod_1.z.string(),
        userId: zod_1.z.string(),
    }),
});
const DetectionQueryRequest = zod_1.z.object({
    threatVectors: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        mitreTechniques: zod_1.z.array(zod_1.z.string()),
        category: zod_1.z.string(),
    })),
    queryLanguage: zod_1.z.enum(['kql', 'spl', 'sql', 'lucene', 'sigma']),
    dataSource: zod_1.z.string(),
    context: zod_1.z.object({
        organizationId: zod_1.z.string(),
        userId: zod_1.z.string(),
    }),
});
// ============================================================================
// AI CLIENT INITIALIZATION
// ============================================================================
let openai = null;
const initializeOpenAI = () => {
    if (!openai) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new https_1.HttpsError('failed-precondition', 'OpenAI API key not configured');
        }
        openai = new openai_1.default({ apiKey });
    }
    return openai;
};
// ============================================================================
// THREAT INTELLIGENCE DATA
// ============================================================================
const THREAT_ACTORS = {
    'APT29': {
        aliases: ['Cozy Bear', 'The Dukes', 'UNC2452'],
        techniques: ['T1566.001', 'T1059.001', 'T1055', 'T1070.004', 'T1562.001'],
        tactics: ['initial-access', 'execution', 'persistence', 'privilege-escalation', 'defense-evasion'],
        complexity: 'high',
        sophistication: 'advanced',
        targets: ['government', 'healthcare', 'technology'],
        campaigns: ['SolarWinds', 'COVID-19 Research'],
    },
    'Lazarus Group': {
        aliases: ['HIDDEN COBRA', 'APT38', 'Guardians of Peace'],
        techniques: ['T1566.002', 'T1059.003', 'T1083', 'T1057', 'T1105'],
        tactics: ['initial-access', 'execution', 'discovery', 'collection', 'exfiltration'],
        complexity: 'high',
        sophistication: 'advanced',
        targets: ['financial', 'cryptocurrency', 'entertainment'],
        campaigns: ['WannaCry', 'Sony Pictures', 'SWIFT Banking'],
    },
    'FIN7': {
        aliases: ['Carbanak Group', 'Navigator Group'],
        techniques: ['T1566.001', 'T1059.005', 'T1112', 'T1027', 'T1055'],
        tactics: ['initial-access', 'execution', 'persistence', 'defense-evasion', 'collection'],
        complexity: 'medium',
        sophistication: 'intermediate',
        targets: ['retail', 'restaurant', 'hospitality'],
        campaigns: ['Carbanak', 'FIN7'],
    },
    'Carbanak': {
        aliases: ['FIN7', 'Navigator Group'],
        techniques: ['T1566.001', 'T1059.003', 'T1083', 'T1005', 'T1041'],
        tactics: ['initial-access', 'execution', 'discovery', 'collection', 'exfiltration'],
        complexity: 'high',
        sophistication: 'advanced',
        targets: ['banking', 'financial-services', 'payment-processors'],
        campaigns: ['Carbanak', 'Cobalt'],
    },
    'APT1': {
        aliases: ['Comment Crew', 'PLA Unit 61398'],
        techniques: ['T1566.001', 'T1059.003', 'T1083', 'T1005', 'T1041'],
        tactics: ['initial-access', 'execution', 'discovery', 'collection', 'exfiltration'],
        complexity: 'medium',
        sophistication: 'intermediate',
        targets: ['technology', 'manufacturing', 'energy'],
        campaigns: ['Operation Aurora', 'GhostNet'],
    },
    'Equation Group': {
        aliases: ['EQGRP', 'Tailored Access Operations'],
        techniques: ['T1566.002', 'T1055', 'T1027', 'T1070', 'T1014'],
        tactics: ['initial-access', 'execution', 'persistence', 'defense-evasion', 'collection'],
        complexity: 'high',
        sophistication: 'advanced',
        targets: ['government', 'telecommunications', 'technology'],
        campaigns: ['Stuxnet', 'Flame', 'Equation'],
    },
};
// ============================================================================
// AI PROMPTS
// ============================================================================
const SCENARIO_PROMPTS = {
    threatActorProfile: `You are an expert threat intelligence analyst. Generate a comprehensive attack scenario based on the threat actor profile and target environment.

Threat Actor: {actorName}
Actor Profile: {actorProfile}
Target Environment: {targetEnvironment}
Complexity: {complexity}
Duration: {duration} minutes

Generate a multi-stage attack scenario that includes:
1. Initial access methods specific to this threat actor
2. Post-exploitation activities and lateral movement
3. Data collection and exfiltration techniques
4. Persistence mechanisms
5. Defense evasion tactics
6. Detection points and indicators
7. Cleanup and anti-forensics

Return JSON format:
{
  "scenarioBlueprint": {
    "name": "Threat Actor Campaign Simulation",
    "description": "Detailed scenario description",
    "estimatedDuration": 120,
    "difficulty": "advanced",
    "stages": [
      {
        "id": "stage-1",
        "name": "Initial Access",
        "description": "Stage description",
        "threatVectors": [
          {
            "id": "vector-1",
            "name": "Spear Phishing",
            "mitreTechniques": ["T1566.001"],
            "severity": "high",
            "indicators": [
              {
                "type": "email",
                "value": "malicious@domain.com",
                "confidence": 0.9
              }
            ]
          }
        ],
        "detectionPoints": [
          {
            "id": "detection-1",
            "name": "Email Security Gateway",
            "dataSource": "email_logs",
            "query": "EmailEvents | where SenderEmailAddress contains 'suspicious-domain'",
            "queryLanguage": "kql",
            "expectedFindings": 1,
            "confidence": 0.8
          }
        ],
        "duration": {
          "min": 10,
          "max": 30,
          "estimated": 20
        }
      }
    ],
    "mitreMapping": ["T1566.001", "T1059.001"],
    "adaptiveRules": [
      {
        "id": "rule-1",
        "condition": "detection.findings > 0",
        "action": "escalate-privileges",
        "parameters": {"method": "token-impersonation"}
      }
    ]
  },
  "confidence": 0.85,
  "rationale": "Scenario based on known TTPs and target environment analysis"
}`,
    detectionQuery: `You are an expert security analyst specializing in detection engineering. Generate optimized detection queries based on MITRE ATT&CK techniques and threat vectors.

Threat Vectors: {threatVectors}
Query Language: {queryLanguage}
Data Source: {dataSource}

Generate detection queries that:
1. Are optimized for the specified query language and data source
2. Include proper time windows and filters
3. Minimize false positives while maintaining detection coverage
4. Include confidence scoring and expected findings
5. Consider data source limitations and capabilities

Return JSON format:
{
  "detectionQueries": [
    {
      "id": "query-1",
      "name": "Detection Query Name",
      "query": "Optimized query string",
      "description": "What this query detects",
      "mitreTechniques": ["T1566.001"],
      "expectedFindings": 5,
      "confidence": 0.8,
      "severity": "medium",
      "tags": ["email", "phishing", "initial-access"]
    }
  ],
  "confidence": 0.85,
  "rationale": "Query optimization methodology and considerations"
}`,
    adaptiveRules: `You are an expert in adaptive security orchestration. Generate intelligent adaptive rules for scenario execution based on the scenario blueprint and execution context.

Scenario Blueprint: {blueprint}
Execution Context: {context}

Generate adaptive rules that:
1. Respond to detection findings and execution results
2. Modify scenario behavior based on environmental conditions
3. Escalate or de-escalate based on success/failure patterns
4. Optimize timing and resource usage
5. Handle error conditions gracefully

Return JSON format:
{
  "adaptiveRules": [
    {
      "id": "adaptive-rule-1",
      "name": "Detection Response Rule",
      "condition": "stageResult.detections.length > expectedFindings",
      "action": "pause-execution",
      "parameters": {
        "duration": 300,
        "alertLevel": "high",
        "notifyOperators": true
      },
      "priority": 1
    }
  ],
  "confidence": 0.80,
  "rationale": "Adaptive rule generation methodology"
}`,
};
// ============================================================================
// HANDLER FUNCTIONS
// ============================================================================
const generateThreatActorScenario = async (data, context) => {
    var _a, _b, _c, _d, _e, _f;
    const request = ThreatActorProfileRequest.parse(data);
    const userId = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId || userId !== request.context.userId) {
        throw new https_1.HttpsError('permission-denied', 'User ID mismatch');
    }
    logger_1.logger.info('Generating threat actor scenario', {
        userId,
        actorName: request.actorName,
        organizationId: request.context.organizationId,
    });
    try {
        const client = initializeOpenAI();
        const actorProfile = THREAT_ACTORS[request.actorName];
        if (!actorProfile) {
            throw new https_1.HttpsError('not-found', `Threat actor profile not found: ${request.actorName}`);
        }
        // Format prompt with all context
        const prompt = SCENARIO_PROMPTS.threatActorProfile
            .replace('{actorName}', request.actorName)
            .replace('{actorProfile}', JSON.stringify(actorProfile, null, 2))
            .replace('{targetEnvironment}', JSON.stringify(request.targetEnvironment, null, 2))
            .replace('{complexity}', request.options.complexity)
            .replace('{duration}', request.options.duration.toString());
        // Call OpenAI API
        const completion = await client.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert threat intelligence analyst and scenario designer who always returns valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        });
        const aiResponse = (_c = (_b = completion.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (!aiResponse) {
            throw new https_1.HttpsError('internal', 'No response from AI service');
        }
        const parsedResponse = JSON.parse(aiResponse);
        // Store scenario blueprint in Firestore
        const db = admin.firestore();
        const blueprintId = `${request.context.organizationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const scenarioBlueprint = {
            ...parsedResponse.scenarioBlueprint,
            id: blueprintId,
            threatActor: request.actorName,
            targetEnvironment: request.targetEnvironment,
            organizationId: request.context.organizationId,
            createdBy: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastModified: admin.firestore.FieldValue.serverTimestamp(),
            aiGenerated: true,
            aiConfidence: parsedResponse.confidence,
        };
        await db.collection('scenarioBlueprints').doc(blueprintId).set(scenarioBlueprint);
        // Log activity
        await db.collection('activityLogs').add({
            organizationId: request.context.organizationId,
            userId,
            action: 'scenario_generated',
            entityType: 'scenario_blueprint',
            entityId: blueprintId,
            details: {
                threatActor: request.actorName,
                complexity: request.options.complexity,
                aiConfidence: parsedResponse.confidence,
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger_1.logger.info('Threat actor scenario generated successfully', {
            userId,
            blueprintId,
            actorName: request.actorName,
            confidence: parsedResponse.confidence,
        });
        return {
            blueprintId,
            scenarioBlueprint,
            confidence: parsedResponse.confidence,
            rationale: parsedResponse.rationale,
            tokens: {
                prompt: ((_d = completion.usage) === null || _d === void 0 ? void 0 : _d.prompt_tokens) || 0,
                completion: ((_e = completion.usage) === null || _e === void 0 ? void 0 : _e.completion_tokens) || 0,
                total: ((_f = completion.usage) === null || _f === void 0 ? void 0 : _f.total_tokens) || 0,
            },
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to generate threat actor scenario', error, {
            userId,
            actorName: request.actorName,
        });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Scenario generation failed');
    }
};
exports.generateThreatActorScenario = generateThreatActorScenario;
const executeScenario = async (data, context) => {
    var _a;
    const request = ScenarioExecutionRequest.parse(data);
    const userId = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId || userId !== request.context.userId) {
        throw new https_1.HttpsError('permission-denied', 'User ID mismatch');
    }
    logger_1.logger.info('Starting scenario execution', {
        userId,
        blueprintId: request.blueprintId,
        organizationId: request.context.organizationId,
    });
    try {
        const db = admin.firestore();
        // Get scenario blueprint
        const blueprintDoc = await db.collection('scenarioBlueprints').doc(request.blueprintId).get();
        if (!blueprintDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Scenario blueprint not found');
        }
        const blueprint = blueprintDoc.data();
        // Verify organization access
        if ((blueprint === null || blueprint === void 0 ? void 0 : blueprint.organizationId) !== request.context.organizationId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to scenario blueprint');
        }
        // Create execution record
        const executionId = `${request.context.organizationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const execution = {
            id: executionId,
            blueprintId: request.blueprintId,
            organizationId: request.context.organizationId,
            userId,
            status: 'pending',
            startTime: admin.firestore.FieldValue.serverTimestamp(),
            options: request.options,
            variables: {
                ...blueprint === null || blueprint === void 0 ? void 0 : blueprint.globalVariables,
                ...request.options.variables,
            },
            stageResults: [],
            logs: [],
            alerts: [],
            adaptations: [],
            metrics: (blueprint === null || blueprint === void 0 ? void 0 : blueprint.successMetrics) || [],
            cleanupStatus: 'pending',
        };
        await db.collection('scenarioExecutions').doc(executionId).set(execution);
        // Log activity
        await db.collection('activityLogs').add({
            organizationId: request.context.organizationId,
            userId,
            action: 'scenario_execution_started',
            entityType: 'scenario_execution',
            entityId: executionId,
            details: {
                blueprintId: request.blueprintId,
                options: request.options,
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Start background execution (this would trigger a separate Cloud Function or pub/sub)
        if (!request.options.dryRun) {
            // const pubsub = admin.firestore(); // commented out: unused variable caused TS6133
            // In a real implementation, you'd publish to a pub/sub topic for background processing
            // For now, we'll update the status to initializing
            await db.collection('scenarioExecutions').doc(executionId).update({
                status: 'initializing',
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        logger_1.logger.info('Scenario execution started', {
            userId,
            executionId,
            blueprintId: request.blueprintId,
            dryRun: request.options.dryRun,
        });
        return {
            executionId,
            status: request.options.dryRun ? 'dry-run-completed' : 'initializing',
            blueprint: {
                id: blueprint === null || blueprint === void 0 ? void 0 : blueprint.id,
                name: blueprint === null || blueprint === void 0 ? void 0 : blueprint.name,
                description: blueprint === null || blueprint === void 0 ? void 0 : blueprint.description,
                estimatedDuration: blueprint === null || blueprint === void 0 ? void 0 : blueprint.estimatedDuration,
            },
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to start scenario execution', error, {
            userId,
            blueprintId: request.blueprintId,
        });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Scenario execution failed to start');
    }
};
exports.executeScenario = executeScenario;
const controlScenarioExecution = async (data, context) => {
    var _a;
    const request = ScenarioControlRequest.parse(data);
    const userId = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId || userId !== request.context.userId) {
        throw new https_1.HttpsError('permission-denied', 'User ID mismatch');
    }
    logger_1.logger.info('Controlling scenario execution', {
        userId,
        executionId: request.executionId,
        action: request.action,
    });
    try {
        const db = admin.firestore();
        const executionRef = db.collection('scenarioExecutions').doc(request.executionId);
        const executionDoc = await executionRef.get();
        if (!executionDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Scenario execution not found');
        }
        const execution = executionDoc.data();
        // Verify organization access
        if ((execution === null || execution === void 0 ? void 0 : execution.organizationId) !== request.context.organizationId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied to scenario execution');
        }
        const currentStatus = execution === null || execution === void 0 ? void 0 : execution.status;
        let newStatus;
        let updateData = {
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        };
        // Determine new status based on action and current status
        switch (request.action) {
            case 'pause':
                if (currentStatus !== 'running') {
                    throw new https_1.HttpsError('failed-precondition', 'Can only pause running executions');
                }
                newStatus = 'paused';
                break;
            case 'resume':
                if (currentStatus !== 'paused') {
                    throw new https_1.HttpsError('failed-precondition', 'Can only resume paused executions');
                }
                newStatus = 'running';
                break;
            case 'cancel':
                if (!['running', 'paused', 'initializing'].includes(currentStatus)) {
                    throw new https_1.HttpsError('failed-precondition', 'Cannot cancel completed or failed executions');
                }
                newStatus = 'cancelled';
                updateData.endTime = admin.firestore.FieldValue.serverTimestamp();
                break;
            case 'restart':
                if (currentStatus === 'running') {
                    throw new https_1.HttpsError('failed-precondition', 'Cannot restart running execution');
                }
                newStatus = 'pending';
                updateData.startTime = admin.firestore.FieldValue.serverTimestamp();
                updateData.endTime = admin.firestore.FieldValue.delete();
                updateData.stageResults = [];
                updateData.logs = [];
                updateData.alerts = [];
                updateData.adaptations = [];
                break;
            default:
                throw new https_1.HttpsError('invalid-argument', 'Invalid control action');
        }
        updateData.status = newStatus;
        // Add control log entry
        const logEntry = {
            timestamp: new Date(),
            level: 'info',
            source: 'scenario-control',
            message: `Execution ${request.action}d by user`,
            metadata: { userId, action: request.action },
        };
        updateData.logs = admin.firestore.FieldValue.arrayUnion(logEntry);
        // Update execution
        await executionRef.update(updateData);
        // Log activity
        await db.collection('activityLogs').add({
            organizationId: request.context.organizationId,
            userId,
            action: `scenario_execution_${request.action}`,
            entityType: 'scenario_execution',
            entityId: request.executionId,
            details: {
                previousStatus: currentStatus,
                newStatus,
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger_1.logger.info('Scenario execution control completed', {
            userId,
            executionId: request.executionId,
            action: request.action,
            previousStatus: currentStatus,
            newStatus,
        });
        return {
            executionId: request.executionId,
            action: request.action,
            previousStatus: currentStatus,
            newStatus,
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to control scenario execution', error, {
            userId,
            executionId: request.executionId,
            action: request.action,
        });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Scenario execution control failed');
    }
};
exports.controlScenarioExecution = controlScenarioExecution;
const generateDetectionQueries = async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const request = DetectionQueryRequest.parse(data);
    const userId = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId || userId !== request.context.userId) {
        throw new https_1.HttpsError('permission-denied', 'User ID mismatch');
    }
    logger_1.logger.info('Generating detection queries', {
        userId,
        queryLanguage: request.queryLanguage,
        dataSource: request.dataSource,
        threatVectorCount: request.threatVectors.length,
    });
    try {
        const client = initializeOpenAI();
        // Format prompt
        const prompt = SCENARIO_PROMPTS.detectionQuery
            .replace('{threatVectors}', JSON.stringify(request.threatVectors, null, 2))
            .replace('{queryLanguage}', request.queryLanguage)
            .replace('{dataSource}', request.dataSource);
        // Call OpenAI API
        const completion = await client.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert security detection engineer who always returns valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.5,
            max_tokens: 3000,
            response_format: { type: 'json_object' }
        });
        const aiResponse = (_c = (_b = completion.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (!aiResponse) {
            throw new https_1.HttpsError('internal', 'No response from AI service');
        }
        const parsedResponse = JSON.parse(aiResponse);
        // Log activity
        const db = admin.firestore();
        await db.collection('activityLogs').add({
            organizationId: request.context.organizationId,
            userId,
            action: 'detection_queries_generated',
            entityType: 'detection_query',
            entityId: `${request.queryLanguage}_${Date.now()}`,
            details: {
                queryLanguage: request.queryLanguage,
                dataSource: request.dataSource,
                queryCount: ((_d = parsedResponse.detectionQueries) === null || _d === void 0 ? void 0 : _d.length) || 0,
                confidence: parsedResponse.confidence,
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger_1.logger.info('Detection queries generated successfully', {
            userId,
            queryCount: ((_e = parsedResponse.detectionQueries) === null || _e === void 0 ? void 0 : _e.length) || 0,
            confidence: parsedResponse.confidence,
        });
        return {
            ...parsedResponse,
            tokens: {
                prompt: ((_f = completion.usage) === null || _f === void 0 ? void 0 : _f.prompt_tokens) || 0,
                completion: ((_g = completion.usage) === null || _g === void 0 ? void 0 : _g.completion_tokens) || 0,
                total: ((_h = completion.usage) === null || _h === void 0 ? void 0 : _h.total_tokens) || 0,
            },
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to generate detection queries', error, {
            userId,
            queryLanguage: request.queryLanguage,
        });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Detection query generation failed');
    }
};
exports.generateDetectionQueries = generateDetectionQueries;
//# sourceMappingURL=scenario-orchestration.js.map