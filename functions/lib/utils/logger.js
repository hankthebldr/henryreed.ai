"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAPICall = exports.logError = exports.logWithContext = exports.logger = void 0;
// Structured logging utility for Cloud Functions
const winston_1 = require("winston");
const isDevelopment = process.env.NODE_ENV === 'development';
exports.logger = (0, winston_1.createLogger)({
    level: isDevelopment ? 'debug' : 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.json(), ...(isDevelopment
        ? [winston_1.format.colorize(), winston_1.format.simple()]
        : [winston_1.format.printf(info => {
                // Google Cloud Logging compatible format
                return JSON.stringify({
                    timestamp: info.timestamp,
                    severity: info.level.toUpperCase(),
                    message: info.message,
                    ...(info.meta || {}),
                    ...(info.stack ? { stack: info.stack } : {})
                });
            })])),
    transports: [
        new winston_1.transports.Console()
    ],
    defaultMeta: {
        service: 'trr-functions'
    }
});
// Helper methods for structured logging
const logWithContext = (level, message, context = {}) => {
    exports.logger.log(level, message, context);
};
exports.logWithContext = logWithContext;
const logError = (error, context = {}) => {
    exports.logger.error(error instanceof Error ? error.message : String(error), {
        ...context,
        ...(error instanceof Error && {
            stack: error.stack,
            name: error.name
        })
    });
};
exports.logError = logError;
const logAPICall = (method, endpoint, duration, statusCode, context = {}) => {
    exports.logger.info(`${method} ${endpoint}`, {
        method,
        endpoint,
        duration,
        statusCode,
        ...context
    });
};
exports.logAPICall = logAPICall;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map