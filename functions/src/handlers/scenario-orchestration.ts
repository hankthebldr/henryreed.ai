// Comprehensive scenario orchestration handlers
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import OpenAI from 'openai';
import { logger } from '../utils/logger';

// ============================================================================
// SCHEMAS AND TYPES
// ============================================================================

const ThreatActorProfileRequest = z.object({
  actorName: z.string(),
  targetEnvironment: z.object({
    cloudProvider: z.enum(['aws', 'gcp', 'azure', 'multi-cloud']).optional(),
    infrastructure: z.object({
      vms: z.number().optional(),
      containers: z.number().optional(),
      networks: z.number().optional(),
      storage: z.string().optional(),
    }),
    applications: z.array(z.string()),
    dataTypes: z.array(z.string()),
    users: z.array(z.object({
      name: z.string(),
      permissions: z.array(z.string()),
    })),
  }),
  options: z.object({
    complexity: z.enum(['low', 'medium', 'high']).default('medium'),
    duration: z.number().default(120),
    includeDefensiveActions: z.boolean().default(true),
  }),
  context: z.object({
    organizationId: z.string(),
    userId: z.string(),
  }),
});

const ScenarioExecutionRequest = z.object({
  blueprintId: z.string(),
  options: z.object({
    variables: z.record(z.any()).optional(),
    dryRun: z.boolean().default(false),
    pauseOnDetection: z.boolean().default(false),
    adaptiveBehavior: z.boolean().default(true),
  }),
  context: z.object({
    organizationId: z.string(),
    userId: z.string(),
  }),
});

const ScenarioControlRequest = z.object({
  executionId: z.string(),
  action: z.enum(['pause', 'resume', 'cancel', 'restart']),
  context: z.object({
    organizationId: z.string(),
    userId: z.string(),
  }),
});

const DetectionQueryRequest = z.object({
  threatVectors: z.array(z.object({
    id: z.string(),
    mitreTechniques: z.array(z.string()),
    category: z.string(),
  })),
  queryLanguage: z.enum(['kql', 'spl', 'sql', 'lucene', 'sigma']),
  dataSource: z.string(),
  context: z.object({
    organizationId: z.string(),
    userId: z.string(),
  }),
});

// ============================================================================
// AI CLIENT INITIALIZATION
// ============================================================================

let openai: OpenAI | null = null;

const initializeOpenAI = () => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'OpenAI API key not configured');
    }
    openai = new OpenAI({ apiKey });
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

export const generateThreatActorScenario = async (
  data: unknown,
  context: functions.https.CallableContext
): Promise<any> => {
  const request = ThreatActorProfileRequest.parse(data);
  const userId = context.auth?.uid;

  if (!userId || userId !== request.context.userId) {
    throw new functions.https.HttpsError('permission-denied', 'User ID mismatch');
  }

  logger.info('Generating threat actor scenario', {
    userId,
    actorName: request.actorName,
    organizationId: request.context.organizationId,
  });

  try {
    const client = initializeOpenAI();
    const actorProfile = THREAT_ACTORS[request.actorName as keyof typeof THREAT_ACTORS];

    if (!actorProfile) {
      throw new functions.https.HttpsError('not-found', `Threat actor profile not found: ${request.actorName}`);
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

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new functions.https.HttpsError('internal', 'No response from AI service');
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

    logger.info('Threat actor scenario generated successfully', {
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
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0,
      },
    };

  } catch (error) {
    logger.error('Failed to generate threat actor scenario', error, {
      userId,
      actorName: request.actorName,
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Scenario generation failed');
  }
};

export const executeScenario = async (
  data: unknown,
  context: functions.https.CallableContext
): Promise<any> => {
  const request = ScenarioExecutionRequest.parse(data);
  const userId = context.auth?.uid;

  if (!userId || userId !== request.context.userId) {
    throw new functions.https.HttpsError('permission-denied', 'User ID mismatch');
  }

  logger.info('Starting scenario execution', {
    userId,
    blueprintId: request.blueprintId,
    organizationId: request.context.organizationId,
  });

  try {
    const db = admin.firestore();
    
    // Get scenario blueprint
    const blueprintDoc = await db.collection('scenarioBlueprints').doc(request.blueprintId).get();
    if (!blueprintDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Scenario blueprint not found');
    }

    const blueprint = blueprintDoc.data();
    
    // Verify organization access
    if (blueprint?.organizationId !== request.context.organizationId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied to scenario blueprint');
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
        ...blueprint?.globalVariables,
        ...request.options.variables,
      },
      stageResults: [],
      logs: [],
      alerts: [],
      adaptations: [],
      metrics: blueprint?.successMetrics || [],
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
      // In a real implementation, you'd publish to a pub/sub topic for background processing
      // For now, we'll update the status to initializing
      await db.collection('scenarioExecutions').doc(executionId).update({
        status: 'initializing',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    logger.info('Scenario execution started', {
      userId,
      executionId,
      blueprintId: request.blueprintId,
      dryRun: request.options.dryRun,
    });

    return {
      executionId,
      status: request.options.dryRun ? 'dry-run-completed' : 'initializing',
      blueprint: {
        id: blueprint?.id,
        name: blueprint?.name,
        description: blueprint?.description,
        estimatedDuration: blueprint?.estimatedDuration,
      },
    };

  } catch (error) {
    logger.error('Failed to start scenario execution', error, {
      userId,
      blueprintId: request.blueprintId,
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Scenario execution failed to start');
  }
};

export const controlScenarioExecution = async (
  data: unknown,
  context: functions.https.CallableContext
): Promise<any> => {
  const request = ScenarioControlRequest.parse(data);
  const userId = context.auth?.uid;

  if (!userId || userId !== request.context.userId) {
    throw new functions.https.HttpsError('permission-denied', 'User ID mismatch');
  }

  logger.info('Controlling scenario execution', {
    userId,
    executionId: request.executionId,
    action: request.action,
  });

  try {
    const db = admin.firestore();
    const executionRef = db.collection('scenarioExecutions').doc(request.executionId);
    const executionDoc = await executionRef.get();

    if (!executionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Scenario execution not found');
    }

    const execution = executionDoc.data();
    
    // Verify organization access
    if (execution?.organizationId !== request.context.organizationId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied to scenario execution');
    }

    const currentStatus = execution?.status;
    let newStatus: string;
    let updateData: any = {
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Determine new status based on action and current status
    switch (request.action) {
      case 'pause':
        if (currentStatus !== 'running') {
          throw new functions.https.HttpsError('failed-precondition', 'Can only pause running executions');
        }
        newStatus = 'paused';
        break;
        
      case 'resume':
        if (currentStatus !== 'paused') {
          throw new functions.https.HttpsError('failed-precondition', 'Can only resume paused executions');
        }
        newStatus = 'running';
        break;
        
      case 'cancel':
        if (!['running', 'paused', 'initializing'].includes(currentStatus)) {
          throw new functions.https.HttpsError('failed-precondition', 'Cannot cancel completed or failed executions');
        }
        newStatus = 'cancelled';
        updateData.endTime = admin.firestore.FieldValue.serverTimestamp();
        break;
        
      case 'restart':
        if (currentStatus === 'running') {
          throw new functions.https.HttpsError('failed-precondition', 'Cannot restart running execution');
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
        throw new functions.https.HttpsError('invalid-argument', 'Invalid control action');
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

    logger.info('Scenario execution control completed', {
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

  } catch (error) {
    logger.error('Failed to control scenario execution', error, {
      userId,
      executionId: request.executionId,
      action: request.action,
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Scenario execution control failed');
  }
};

export const generateDetectionQueries = async (
  data: unknown,
  context: functions.https.CallableContext
): Promise<any> => {
  const request = DetectionQueryRequest.parse(data);
  const userId = context.auth?.uid;

  if (!userId || userId !== request.context.userId) {
    throw new functions.https.HttpsError('permission-denied', 'User ID mismatch');
  }

  logger.info('Generating detection queries', {
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

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new functions.https.HttpsError('internal', 'No response from AI service');
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
        queryCount: parsedResponse.detectionQueries?.length || 0,
        confidence: parsedResponse.confidence,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info('Detection queries generated successfully', {
      userId,
      queryCount: parsedResponse.detectionQueries?.length || 0,
      confidence: parsedResponse.confidence,
    });

    return {
      ...parsedResponse,
      tokens: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0,
      },
    };

  } catch (error) {
    logger.error('Failed to generate detection queries', error, {
      userId,
      queryLanguage: request.queryLanguage,
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Detection query generation failed');
  }
};