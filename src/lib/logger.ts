import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';

const config = {
  level: logLevel,
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'authorization',
      'cookie',
    ],
    remove: true,
  },
};

export const logger = pino(config);

// Helper to create a child logger with context
export const createLogger = (name: string, context?: Record<string, unknown>) => {
  return logger.child({ module: name, ...context });
};
