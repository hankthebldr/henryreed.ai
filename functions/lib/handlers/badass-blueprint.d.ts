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
    recordSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        source: z.ZodEnum<["customer", "pov", "trr", "health"]>;
        recordId: z.ZodString;
        commonName: z.ZodString;
        customerId: z.ZodOptional<z.ZodString>;
        context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        source: "trr" | "customer" | "pov" | "health";
        recordId: string;
        commonName: string;
        context?: Record<string, any> | undefined;
        customerId?: string | undefined;
    }, {
        source: "trr" | "customer" | "pov" | "health";
        recordId: string;
        commonName: string;
        context?: Record<string, any> | undefined;
        customerId?: string | undefined;
    }>, "many">>;
    tailoredPrompt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    engagementId: string;
    emphasis?: {
        risks?: string[] | undefined;
        roadmap?: string[] | undefined;
        wins?: string[] | undefined;
    } | undefined;
    tailoredPrompt?: string | undefined;
    executiveTone?: string | undefined;
    recordSelections?: {
        source: "trr" | "customer" | "pov" | "health";
        recordId: string;
        commonName: string;
        context?: Record<string, any> | undefined;
        customerId?: string | undefined;
    }[] | undefined;
}, {
    engagementId: string;
    emphasis?: {
        risks?: string[] | undefined;
        roadmap?: string[] | undefined;
        wins?: string[] | undefined;
    } | undefined;
    tailoredPrompt?: string | undefined;
    executiveTone?: string | undefined;
    recordSelections?: {
        source: "trr" | "customer" | "pov" | "health";
        recordId: string;
        commonName: string;
        context?: Record<string, any> | undefined;
        customerId?: string | undefined;
    }[] | undefined;
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
