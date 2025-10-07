import { z } from 'genkit';
export declare const POVInputSchema: z.ZodObject<{
    name: z.ZodString;
    customer: z.ZodString;
    industry: z.ZodOptional<z.ZodString>;
    useCase: z.ZodString;
    timeline: z.ZodString;
    challenges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    budget: z.ZodOptional<z.ZodString>;
    stakeholders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    customer: string;
    useCase: string;
    timeline: string;
    industry?: string | undefined;
    challenges?: string[] | undefined;
    requirements?: string[] | undefined;
    budget?: string | undefined;
    stakeholders?: string[] | undefined;
}, {
    name: string;
    customer: string;
    useCase: string;
    timeline: string;
    industry?: string | undefined;
    challenges?: string[] | undefined;
    requirements?: string[] | undefined;
    budget?: string | undefined;
    stakeholders?: string[] | undefined;
}>;
export declare const TRRInputSchema: z.ZodObject<{
    title: z.ZodString;
    category: z.ZodString;
    description: z.ZodString;
    technicalRequirements: z.ZodArray<z.ZodString, "many">;
    businessRequirements: z.ZodArray<z.ZodString, "many">;
    constraints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    timeline: z.ZodString;
    stakeholders: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    category: string;
    timeline: string;
    stakeholders: string[];
    technicalRequirements: string[];
    businessRequirements: string[];
    constraints?: string[] | undefined;
}, {
    title: string;
    description: string;
    category: string;
    timeline: string;
    stakeholders: string[];
    technicalRequirements: string[];
    businessRequirements: string[];
    constraints?: string[] | undefined;
}>;
export declare const DetectionInputSchema: z.ZodObject<{
    scenarioType: z.ZodString;
    platform: z.ZodEnum<["xsiam", "cortex-xdr", "panorama", "generic"]>;
    techniques: z.ZodArray<z.ZodString, "many">;
    description: z.ZodString;
    environment: z.ZodString;
    priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
}, "strip", z.ZodTypeAny, {
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    environment: string;
    scenarioType: string;
    platform: "xsiam" | "cortex-xdr" | "panorama" | "generic";
    techniques: string[];
}, {
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    environment: string;
    scenarioType: string;
    platform: "xsiam" | "cortex-xdr" | "panorama" | "generic";
    techniques: string[];
}>;
export declare const povAnalysisFlow: import("genkit").Action<z.ZodObject<{
    name: z.ZodString;
    customer: z.ZodString;
    industry: z.ZodOptional<z.ZodString>;
    useCase: z.ZodString;
    timeline: z.ZodString;
    challenges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    budget: z.ZodOptional<z.ZodString>;
    stakeholders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    customer: string;
    useCase: string;
    timeline: string;
    industry?: string | undefined;
    challenges?: string[] | undefined;
    requirements?: string[] | undefined;
    budget?: string | undefined;
    stakeholders?: string[] | undefined;
}, {
    name: string;
    customer: string;
    useCase: string;
    timeline: string;
    industry?: string | undefined;
    challenges?: string[] | undefined;
    requirements?: string[] | undefined;
    budget?: string | undefined;
    stakeholders?: string[] | undefined;
}>, z.ZodAny, z.ZodString>;
export declare const trrRecommendationsFlow: import("genkit").Action<z.ZodObject<{
    title: z.ZodString;
    category: z.ZodString;
    description: z.ZodString;
    technicalRequirements: z.ZodArray<z.ZodString, "many">;
    businessRequirements: z.ZodArray<z.ZodString, "many">;
    constraints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    timeline: z.ZodString;
    stakeholders: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    category: string;
    timeline: string;
    stakeholders: string[];
    technicalRequirements: string[];
    businessRequirements: string[];
    constraints?: string[] | undefined;
}, {
    title: string;
    description: string;
    category: string;
    timeline: string;
    stakeholders: string[];
    technicalRequirements: string[];
    businessRequirements: string[];
    constraints?: string[] | undefined;
}>, z.ZodAny, z.ZodString>;
export declare const detectionGenerationFlow: import("genkit").Action<z.ZodObject<{
    scenarioType: z.ZodString;
    platform: z.ZodEnum<["xsiam", "cortex-xdr", "panorama", "generic"]>;
    techniques: z.ZodArray<z.ZodString, "many">;
    description: z.ZodString;
    environment: z.ZodString;
    priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
}, "strip", z.ZodTypeAny, {
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    environment: string;
    scenarioType: string;
    platform: "xsiam" | "cortex-xdr" | "panorama" | "generic";
    techniques: string[];
}, {
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    environment: string;
    scenarioType: string;
    platform: "xsiam" | "cortex-xdr" | "panorama" | "generic";
    techniques: string[];
}>, z.ZodAny, z.ZodString>;
export declare function runPovAnalysis(input: unknown): Promise<import("@genkit-ai/core").ActionResult<any>>;
export declare function runTrrRecommendations(input: unknown): Promise<import("@genkit-ai/core").ActionResult<any>>;
export declare function runDetectionGeneration(input: unknown): Promise<import("@genkit-ai/core").ActionResult<any>>;
