import pino from 'pino';
import { getOrDefault } from './server-utils';

const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = getOrDefault('LOG_LEVEL') || (isDevelopment ? 'debug' : 'info');

const baseConfig = {
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label }),
    log: (object: Record<string, unknown>) => {
      if (object.error && typeof object.error === 'object') {
        const error = object.error as Error;
        object.error = {
          message: error.message,
          stack: error.stack,
          name: error.name,
          ...(error as unknown as Record<string, unknown>)
        };
      }
      return object;
    }
  }
};

const loggerConfig = isDevelopment ? {
  ...baseConfig,
  level: 'debug',
  browser: {
    asObject: true
  }
} : baseConfig;

export const logger = pino(loggerConfig);

export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};

export const apiLogger = createChildLogger({ component: 'api' });
export const serviceLogger = createChildLogger({ component: 'service' });
export const dbLogger = createChildLogger({ component: 'database' });
export const authLogger = createChildLogger({ component: 'auth' });
export const fileLogger = createChildLogger({ component: 'file' });
export const systemLogger = createChildLogger({ component: 'system' });