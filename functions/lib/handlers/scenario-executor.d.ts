import * as functions from 'firebase-functions';
declare class ScenarioExecutionEngine {
    private db;
    constructor();
    executeScenario(executionId: string): Promise<void>;
    private executeLinear;
    private executeStage;
    private executeThreatVector;
    private executeDetection;
    private applyAdaptiveRules;
    private executeAdaptiveAction;
    private checkPrerequisites;
    private evaluateCondition;
    private handleStageFailure;
    private runCleanupProcedures;
    private createAlert;
    private logExecution;
    private delay;
    private executeParallel;
    private executeConditional;
    private executeAdaptive;
}
export declare const processScenarioExecution: functions.CloudFunction<functions.pubsub.Message>;
export declare const monitorExecutionStatusChanges: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const cleanupOldExecutions: functions.CloudFunction<unknown>;
export { ScenarioExecutionEngine };
