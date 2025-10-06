export declare const logger: import("winston").Logger;
export declare const logWithContext: (level: string, message: string, context?: Record<string, any>) => void;
export declare const logError: (error: Error | unknown, context?: Record<string, any>) => void;
export declare const logAPICall: (method: string, endpoint: string, duration: number, statusCode?: number, context?: Record<string, any>) => void;
export default logger;
