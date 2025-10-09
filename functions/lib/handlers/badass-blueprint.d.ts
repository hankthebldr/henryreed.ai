import { z } from 'zod';
import { BlueprintDocument } from './badass-blueprint-types';
declare const blueprintRequestSchema: z.ZodObject<{
    engagementId: z.ZodString;
    executiveTone: z.ZodOptional<z.ZodString>;
    emphasis: z.ZodOptional<z.ZodObject<{
        wins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        risks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        roadmap: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        risks?: string[] | undefined;
        roadmap?: string[] | undefined;
        wins?: string[] | undefined;
    }, {
        risks?: string[] | undefined;
        roadmap?: string[] | undefined;
        wins?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    engagementId: string;
    emphasis?: {
        risks?: string[] | undefined;
        roadmap?: string[] | undefined;
        wins?: string[] | undefined;
    } | undefined;
    executiveTone?: string | undefined;
}, {
    engagementId: string;
    emphasis?: {
        risks?: string[] | undefined;
        roadmap?: string[] | undefined;
        wins?: string[] | undefined;
    } | undefined;
    executiveTone?: string | undefined;
}>;
export type BlueprintRequest = z.infer<typeof blueprintRequestSchema>;
interface BlueprintGenerationContext {
    authUid: string;
    authToken?: Record<string, any>;
}
interface BlueprintGenerationResult {
    blueprintId: string;
    status: BlueprintDocument['status'];
    payloadPath: string;
}
export declare const generateBlueprintInternal: (data: unknown, context: BlueprintGenerationContext) => Promise<BlueprintGenerationResult>;
export declare const generateBadassBlueprintCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<BlueprintGenerationResult>, unknown>;
export declare const generateBlueprintViaHttp: (data: unknown, userId: string | null) => Promise<BlueprintGenerationResult>;
export declare const renderBadassBlueprintPdf: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    blueprintId: string;
}>>;
export declare const bundleBlueprintArtifacts: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").DocumentSnapshot> | undefined, {
    blueprintId: string;
}>>;
export declare const exportBlueprintAnalytics: import("firebase-functions/core").CloudFunction<import("firebase-functions/core").CloudEvent<import("firebase-functions/v2/pubsub").MessagePublishedData<any>>>;
export {};
