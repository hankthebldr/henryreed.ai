// Structured logging utility for Cloud Functions
import { createLogger, format, transports } from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
    ...(isDevelopment 
      ? [format.colorize(), format.simple()] 
      : [format.printf(info => {
          // Google Cloud Logging compatible format
          return JSON.stringify({
            timestamp: info.timestamp,
            severity: info.level.toUpperCase(),
            message: info.message,
            ...(info.meta || {}),
            ...(info.stack ? { stack: info.stack } : {})
          });
        })]
    )
  ),
  transports: [
    new transports.Console()
  ],
  defaultMeta: {
    service: 'trr-functions'
  }
});

// Helper methods for structured logging
export const logWithContext = (level: string, message: string, context: Record<string, any> = {}) => {
  logger.log(level, message, context);
};

export const logError = (error: Error | unknown, context: Record<string, any> = {}) => {
  logger.error(error instanceof Error ? error.message : String(error), {
    ...context,
    ...(error instanceof Error && { 
      stack: error.stack,
      name: error.name 
    })
  });
};

export const logAPICall = (
  method: string,
  endpoint: string,
  duration: number,
  statusCode?: number,
  context: Record<string, any> = {}
) => {
  logger.info(`${method} ${endpoint}`, {
    method,
    endpoint,
    duration,
    statusCode,
    ...context
  });
};

export default logger;