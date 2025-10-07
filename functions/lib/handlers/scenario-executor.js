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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioExecutionEngine = exports.cleanupOldExecutions = exports.monitorExecutionStatusChanges = exports.processScenarioExecution = void 0;
// Background scenario execution engine
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const logger_1 = require("../utils/logger");
// ============================================================================
// SCENARIO EXECUTION ENGINE CLASS
// ============================================================================
class ScenarioExecutionEngine {
    constructor() {
        // Ensure Firebase is initialized
        if (!admin.apps.length) {
            admin.initializeApp();
        }
        this.db = admin.firestore();
    }
    // Main execution orchestration
    async executeScenario(executionId) {
        var _a;
        logger_1.logger.info('Starting scenario execution', { executionId });
        try {
            // Get execution record
            const executionRef = this.db.collection('scenarioExecutions').doc(executionId);
            const executionDoc = await executionRef.get();
            if (!executionDoc.exists) {
                throw new Error(`Execution not found: ${executionId}`);
            }
            const execution = executionDoc.data();
            if (!execution) {
                throw new Error(`Execution data is null: ${executionId}`);
            }
            // Get blueprint
            const blueprintDoc = await this.db.collection('scenarioBlueprints').doc(execution.blueprintId).get();
            if (!blueprintDoc.exists) {
                throw new Error(`Blueprint not found: ${execution.blueprintId}`);
            }
            const blueprint = blueprintDoc.data();
            // Update status to running
            await executionRef.update({
                status: 'running',
                currentStage: (_a = blueprint.stages[0]) === null || _a === void 0 ? void 0 : _a.id,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
            this.logExecution(executionId, 'info', 'scenario-engine', 'Scenario execution started');
            // Execute based on execution model
            switch (blueprint.executionModel) {
                case 'linear':
                    await this.executeLinear(executionId, blueprint, execution);
                    break;
                case 'parallel':
                    await this.executeParallel(executionId, blueprint, execution);
                    break;
                case 'conditional':
                    await this.executeConditional(executionId, blueprint, execution);
                    break;
                case 'adaptive':
                    await this.executeAdaptive(executionId, blueprint, execution);
                    break;
                default:
                    throw new Error(`Unsupported execution model: ${blueprint.executionModel}`);
            }
            // Mark as completed
            await executionRef.update({
                status: 'completed',
                endTime: admin.firestore.FieldValue.serverTimestamp(),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Run cleanup procedures
            await this.runCleanupProcedures(executionId, blueprint, 'post-scenario');
            this.logExecution(executionId, 'info', 'scenario-engine', 'Scenario execution completed successfully');
        }
        catch (error) {
            logger_1.logger.error('Scenario execution failed', error, { executionId });
            // Update status to failed
            const executionRef = this.db.collection('scenarioExecutions').doc(executionId);
            await executionRef.update({
                status: 'failed',
                endTime: admin.firestore.FieldValue.serverTimestamp(),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
            this.logExecution(executionId, 'error', 'scenario-engine', `Execution failed: ${error}`);
            // Emergency cleanup
            try {
                const blueprintDoc = await this.db.collection('scenarioBlueprints').doc('default').get();
                if (blueprintDoc.exists) {
                    const blueprint = blueprintDoc.data();
                    await this.runCleanupProcedures(executionId, blueprint, 'on-failure');
                }
            }
            catch (cleanupError) {
                logger_1.logger.error('Emergency cleanup failed', cleanupError, { executionId });
            }
        }
    }
    // Linear execution - stages run in sequence
    async executeLinear(executionId, blueprint, execution) {
        var _a, _b;
        for (const stage of blueprint.stages) {
            const executionRef = this.db.collection('scenarioExecutions').doc(executionId);
            // Check if execution was paused or cancelled
            const currentExecution = await executionRef.get();
            const status = (_a = currentExecution.data()) === null || _a === void 0 ? void 0 : _a.status;
            if (status === 'paused') {
                this.logExecution(executionId, 'info', 'scenario-engine', 'Execution paused, waiting for resume');
                return; // Exit gracefully, will be resumed later
            }
            if (status === 'cancelled') {
                this.logExecution(executionId, 'info', 'scenario-engine', 'Execution cancelled');
                return; // Exit gracefully
            }
            // Update current stage
            await executionRef.update({
                currentStage: stage.id,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Execute stage
            const stageResult = await this.executeStage(executionId, stage, execution);
            // Add stage result to execution
            await executionRef.update({
                stageResults: admin.firestore.FieldValue.arrayUnion(stageResult),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Check if stage failed and shouldn't continue
            if (stageResult.status === 'failed' && stage.failureHandling.onError === 'abort') {
                throw new Error(`Stage ${stage.name} failed and is configured to abort execution`);
            }
            // Run post-stage cleanup
            await this.runCleanupProcedures(executionId, blueprint, 'post-stage');
            // Apply adaptive rules if enabled
            if ((_b = execution.options) === null || _b === void 0 ? void 0 : _b.adaptiveBehavior) {
                await this.applyAdaptiveRules(executionId, blueprint, stage, stageResult);
            }
        }
    }
    // Execute a single stage
    async executeStage(executionId, stage, execution) {
        var _a;
        const stageResult = {
            stageId: stage.id,
            status: 'running',
            startTime: new Date(),
            output: {},
            errors: [],
            detections: [],
            artifacts: []
        };
        this.logExecution(executionId, 'info', `stage-${stage.id}`, `Starting stage: ${stage.name}`);
        try {
            // Check prerequisites
            if (!await this.checkPrerequisites(executionId, stage.prerequisites, execution)) {
                throw new Error('Prerequisites not met');
            }
            // Execute threat vectors
            for (const threatVector of stage.threatVectors) {
                await this.executeThreatVector(executionId, stageResult, threatVector);
            }
            // Run detection queries with simulated delay
            for (const detectionPoint of stage.detectionPoints) {
                const detection = await this.executeDetection(executionId, detectionPoint, stageResult);
                stageResult.detections.push(detection);
                // Check if we should pause on detection
                if (detection.findings > 0 && ((_a = execution.options) === null || _a === void 0 ? void 0 : _a.pauseOnDetection)) {
                    const executionRef = this.db.collection('scenarioExecutions').doc(executionId);
                    await executionRef.update({
                        status: 'paused',
                        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    // Create alert
                    await this.createAlert(executionId, {
                        severity: 'high',
                        title: 'Detection Found - Execution Paused',
                        description: `Detection point ${detectionPoint.name} found ${detection.findings} findings`,
                        source: detectionPoint.id,
                        actionRequired: true,
                        timestamp: new Date(),
                    });
                    stageResult.status = 'completed';
                    stageResult.endTime = new Date();
                    return stageResult;
                }
            }
            // Simulate stage execution time
            const executionTime = Math.random() * (stage.duration.max - stage.duration.min) + stage.duration.min;
            await this.delay(executionTime * 1000); // Convert to milliseconds
            stageResult.status = 'completed';
            stageResult.endTime = new Date();
            this.logExecution(executionId, 'info', `stage-${stage.id}`, `Stage completed successfully`);
        }
        catch (error) {
            stageResult.status = 'failed';
            stageResult.endTime = new Date();
            stageResult.errors.push(error instanceof Error ? error.message : String(error));
            this.logExecution(executionId, 'error', `stage-${stage.id}`, `Stage failed: ${error}`);
            // Handle failure based on strategy
            await this.handleStageFailure(executionId, stage, stageResult, error);
        }
        return stageResult;
    }
    // Execute threat vector (simulated)
    async executeThreatVector(executionId, stageResult, threatVector) {
        this.logExecution(executionId, 'info', `threat-vector-${threatVector.id}`, `Executing threat vector: ${threatVector.name}`);
        // Simulate threat vector execution
        await this.delay(2000 + Math.random() * 3000); // 2-5 seconds
        // Create artifacts based on threat vector
        const artifact = {
            id: `${threatVector.id}-${Date.now()}`,
            type: 'process',
            name: `${threatVector.name} simulation`,
            metadata: {
                mitreTechniques: threatVector.mitreTechniques,
                severity: threatVector.severity,
                indicators: threatVector.indicators,
            },
            persistence: 'temporary',
            cleanup: true,
        };
        stageResult.artifacts.push(artifact);
        this.logExecution(executionId, 'debug', `threat-vector-${threatVector.id}`, `Threat vector executed, artifact created: ${artifact.id}`);
    }
    // Execute detection (simulated)
    async executeDetection(executionId, detectionPoint, stageResult) {
        this.logExecution(executionId, 'info', `detection-${detectionPoint.id}`, `Running detection: ${detectionPoint.name}`);
        // Simulate detection query execution
        await this.delay(1000 + Math.random() * 2000); // 1-3 seconds
        // Simulate detection results based on expected findings and confidence
        const randomFactor = Math.random();
        const baseFindings = detectionPoint.expectedFindings;
        const confidenceAdjustment = detectionPoint.confidence;
        let findings = 0;
        if (randomFactor < confidenceAdjustment) {
            // Detection should trigger based on confidence
            findings = Math.floor(baseFindings * (0.5 + Math.random() * 0.5)); // 50-100% of expected
        }
        else {
            // Random chance of false positives/negatives
            findings = Math.floor(Math.random() * (baseFindings * 0.3)); // 0-30% of expected
        }
        const detection = {
            detectionPointId: detectionPoint.id,
            timestamp: new Date(),
            findings,
            details: {
                query: detectionPoint.query,
                dataSource: detectionPoint.dataSource,
                queryLanguage: detectionPoint.queryLanguage,
            },
            confidence: detectionPoint.confidence,
            falsePositive: findings === 0 && randomFactor < 0.1, // 10% chance of false positive flag
        };
        this.logExecution(executionId, 'info', `detection-${detectionPoint.id}`, `Detection completed: ${findings} findings`);
        return detection;
    }
    // Apply adaptive rules
    async applyAdaptiveRules(executionId, blueprint, stage, stageResult) {
        for (const rule of blueprint.adaptiveRules) {
            try {
                // Evaluate rule condition (simplified evaluation)
                const conditionMet = this.evaluateCondition(rule.condition, { stage, stageResult });
                if (conditionMet) {
                    this.logExecution(executionId, 'info', 'adaptive-engine', `Applying adaptive rule: ${rule.id}`);
                    const adaptation = {
                        timestamp: new Date(),
                        ruleId: rule.id,
                        condition: rule.condition,
                        action: rule.action,
                        parameters: rule.parameters,
                        result: 'success',
                    };
                    // Apply the adaptive action
                    await this.executeAdaptiveAction(executionId, rule, adaptation);
                    // Log the adaptation
                    const executionRef = this.db.collection('scenarioExecutions').doc(executionId);
                    await executionRef.update({
                        adaptations: admin.firestore.FieldValue.arrayUnion(adaptation),
                        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }
            catch (error) {
                this.logExecution(executionId, 'warning', 'adaptive-engine', `Failed to apply adaptive rule ${rule.id}: ${error}`);
            }
        }
    }
    // Execute adaptive action
    async executeAdaptiveAction(executionId, rule, adaptation) {
        var _a;
        const executionRef = this.db.collection('scenarioExecutions').doc(executionId);
        switch (rule.action) {
            case 'pause-execution':
                await executionRef.update({
                    status: 'paused',
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                });
                if (rule.parameters.notifyOperators) {
                    await this.createAlert(executionId, {
                        severity: 'high',
                        title: 'Adaptive Rule Triggered - Execution Paused',
                        description: `Rule ${rule.id} triggered pause due to: ${rule.condition}`,
                        source: 'adaptive-engine',
                        actionRequired: true,
                        timestamp: new Date(),
                    });
                }
                break;
            case 'escalate-privileges':
                // Simulate privilege escalation
                await this.delay(2000);
                adaptation.result = 'privilege-escalated';
                break;
            case 'modify-parameters':
                // Update execution variables
                const currentExecution = await executionRef.get();
                const currentVariables = ((_a = currentExecution.data()) === null || _a === void 0 ? void 0 : _a.variables) || {};
                await executionRef.update({
                    variables: { ...currentVariables, ...rule.parameters },
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                });
                break;
            default:
                this.logExecution(executionId, 'warning', 'adaptive-engine', `Unknown adaptive action: ${rule.action}`);
        }
    }
    // Utility functions
    async checkPrerequisites(executionId, prerequisites, execution) {
        var _a, _b;
        // Simplified prerequisite checking
        for (const prerequisite of prerequisites) {
            if (prerequisite.includes('environment') && !((_a = execution.variables) === null || _a === void 0 ? void 0 : _a.environmentReady)) {
                return false;
            }
            if (prerequisite.includes('network') && !((_b = execution.variables) === null || _b === void 0 ? void 0 : _b.networkAccess)) {
                return false;
            }
        }
        return true;
    }
    evaluateCondition(condition, context) {
        // Simplified condition evaluation
        // In production, use a safe expression evaluator
        try {
            if (condition.includes('detection.findings > 0')) {
                return context.stageResult.detections.some((d) => d.findings > 0);
            }
            if (condition.includes('stageResult.errors.length > 0')) {
                return context.stageResult.errors.length > 0;
            }
            if (condition.includes('stage.duration.estimated > 30')) {
                return context.stage.duration.estimated > 30;
            }
            return false;
        }
        catch (error) {
            logger_1.logger.warn('Failed to evaluate condition', { condition, error });
            return false;
        }
    }
    async handleStageFailure(executionId, stage, stageResult, error) {
        const strategy = stage.failureHandling;
        switch (strategy.onError) {
            case 'retry':
                if (stageResult.retryCount < strategy.retryLimit) {
                    this.logExecution(executionId, 'info', `stage-${stage.id}`, `Retrying stage (attempt ${stageResult.retryCount + 1})`);
                    // In a real implementation, you'd reschedule the stage
                }
                break;
            case 'manual-intervention':
                await this.createAlert(executionId, {
                    severity: 'critical',
                    title: 'Manual Intervention Required',
                    description: `Stage ${stage.name} failed and requires manual intervention: ${error}`,
                    source: stage.id,
                    actionRequired: true,
                    timestamp: new Date(),
                });
                break;
            case 'skip':
                this.logExecution(executionId, 'warning', `stage-${stage.id}`, 'Skipping failed stage as configured');
                stageResult.status = 'skipped';
                break;
        }
    }
    async runCleanupProcedures(executionId, blueprint, stage) {
        const procedures = blueprint.cleanupProcedures.filter(p => p.stage === stage);
        for (const procedure of procedures) {
            try {
                this.logExecution(executionId, 'info', 'cleanup', `Running cleanup procedure: ${procedure.name}`);
                // Simulate cleanup commands
                for (const command of procedure.commands) {
                    await this.delay(500); // Simulate command execution
                    this.logExecution(executionId, 'debug', 'cleanup', `Executed cleanup command: ${command}`);
                }
                // Simulate verification
                for (const verification of procedure.verification) {
                    await this.delay(200); // Simulate verification
                    this.logExecution(executionId, 'debug', 'cleanup', `Verified cleanup: ${verification}`);
                }
            }
            catch (error) {
                this.logExecution(executionId, 'error', 'cleanup', `Cleanup procedure failed: ${procedure.name} - ${error}`);
            }
        }
    }
    async createAlert(executionId, alert) {
        const alertWithId = {
            ...alert,
            id: `${executionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            resolved: false,
        };
        const executionRef = this.db.collection('scenarioExecutions').doc(executionId);
        await executionRef.update({
            alerts: admin.firestore.FieldValue.arrayUnion(alertWithId),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    async logExecution(executionId, level, source, message, metadata = {}) {
        const logEntry = {
            timestamp: new Date(),
            level: level,
            source,
            message,
            metadata,
        };
        const executionRef = this.db.collection('scenarioExecutions').doc(executionId);
        await executionRef.update({
            logs: admin.firestore.FieldValue.arrayUnion(logEntry),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger_1.logger.info(`[${executionId}] ${message}`, { source, level, ...metadata });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Stub implementations for other execution models
    async executeParallel(executionId, blueprint, execution) {
        this.logExecution(executionId, 'info', 'scenario-engine', 'Parallel execution not yet implemented, falling back to linear');
        await this.executeLinear(executionId, blueprint, execution);
    }
    async executeConditional(executionId, blueprint, execution) {
        this.logExecution(executionId, 'info', 'scenario-engine', 'Conditional execution not yet implemented, falling back to linear');
        await this.executeLinear(executionId, blueprint, execution);
    }
    async executeAdaptive(executionId, blueprint, execution) {
        this.logExecution(executionId, 'info', 'scenario-engine', 'Running adaptive execution with enhanced rule processing');
        // Enhanced linear execution with more aggressive adaptive rule application
        execution.options = { ...execution.options, adaptiveBehavior: true };
        await this.executeLinear(executionId, blueprint, execution);
    }
}
exports.ScenarioExecutionEngine = ScenarioExecutionEngine;
// ============================================================================
// CLOUD FUNCTIONS
// ============================================================================
const engine = new ScenarioExecutionEngine();
// Pub/Sub triggered background execution
exports.processScenarioExecution = functions
    .region('us-central1')
    .runWith({
    memory: '2GB',
    timeoutSeconds: 540, // 9 minutes
})
    .pubsub
    .topic('scenario-execution')
    .onPublish(async (message) => {
    try {
        const data = message.json;
        const executionId = data.executionId;
        if (!executionId) {
            logger_1.logger.error('No execution ID provided in pub/sub message');
            return;
        }
        await engine.executeScenario(executionId);
    }
    catch (error) {
        logger_1.logger.error('Failed to process scenario execution', error);
        throw error; // Re-throw to trigger retry logic
    }
});
// Firestore trigger to monitor execution status changes
exports.monitorExecutionStatusChanges = functions
    .region('us-central1')
    .firestore
    .document('scenarioExecutions/{executionId}')
    .onUpdate(async (change, context) => {
    try {
        const executionId = context.params.executionId;
        const before = change.before.data();
        const after = change.after.data();
        if (before.status !== after.status) {
            logger_1.logger.info('Execution status changed', {
                executionId,
                previousStatus: before.status,
                newStatus: after.status,
            });
            // Handle resumed executions
            if (before.status === 'paused' && after.status === 'running') {
                // Trigger background execution to continue
                const { PubSub } = require('@google-cloud/pubsub');
                const pubsub = new PubSub();
                await pubsub.topic('scenario-execution').publishJSON({
                    executionId,
                    action: 'resume',
                });
                logger_1.logger.info('Triggered background execution resume', { executionId });
            }
            // Send notifications for critical status changes
            if (['failed', 'completed', 'cancelled'].includes(after.status)) {
                // Log final activity
                await admin.firestore().collection('activityLogs').add({
                    organizationId: after.organizationId,
                    userId: after.userId,
                    action: `scenario_execution_${after.status}`,
                    entityType: 'scenario_execution',
                    entityId: executionId,
                    details: {
                        previousStatus: before.status,
                        finalStatus: after.status,
                        duration: after.endTime ? after.endTime.toMillis() - before.startTime.toMillis() : null,
                    },
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to process execution status change', error, {
            executionId: context.params.executionId,
        });
    }
});
// Scheduled function to cleanup old executions and logs
exports.cleanupOldExecutions = functions
    .region('us-central1')
    .runWith({
    memory: '1GB',
    timeoutSeconds: 300,
})
    .pubsub
    .schedule('0 2 * * *') // Daily at 2 AM
    .timeZone('UTC')
    .onRun(async (context) => {
    try {
        const db = admin.firestore();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
        // Clean up old completed/failed executions
        const oldExecutions = await db
            .collection('scenarioExecutions')
            .where('endTime', '<', cutoffDate)
            .where('status', 'in', ['completed', 'failed', 'cancelled'])
            .limit(100)
            .get();
        const batch = db.batch();
        let deleteCount = 0;
        oldExecutions.forEach((doc) => {
            batch.delete(doc.ref);
            deleteCount++;
        });
        if (deleteCount > 0) {
            await batch.commit();
            logger_1.logger.info('Cleaned up old scenario executions', { deleteCount });
        }
        // Clean up old AI predictions
        const oldPredictions = await db
            .collection('aiPredictions')
            .where('expiresAt', '<', new Date())
            .limit(100)
            .get();
        if (!oldPredictions.empty) {
            const predictionBatch = db.batch();
            oldPredictions.forEach((doc) => {
                predictionBatch.delete(doc.ref);
            });
            await predictionBatch.commit();
            logger_1.logger.info('Cleaned up expired AI predictions', { count: oldPredictions.size });
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to cleanup old executions', error);
    }
});
//# sourceMappingURL=scenario-executor.js.map