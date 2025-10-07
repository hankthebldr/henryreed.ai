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
export declare const processScenarioExecution: import("firebase-functions/core").CloudFunction<import("firebase-functions/core").CloudEvent<import("firebase-functions/v2/pubsub").MessagePublishedData<any>>>;
export declare const monitorExecutionStatusChanges: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").QueryDocumentSnapshot> | undefined, {
    executionId: string;
}>>;
export declare const cleanupOldExecutions: import("firebase-functions/v2/scheduler").ScheduleFunction;
export { ScenarioExecutionEngine };
