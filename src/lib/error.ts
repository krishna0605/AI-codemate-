export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export type ErrorResponse = {
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
};

/**
 * Log error with structured context (mocking Sentry)
 */
import { logger } from '@/lib/logger';

// ... (AppError class remains same)

/**
 * Log error with structured context (using Pino and Sentry)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();

  const errorDetails =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...context,
        }
      : {
          message: String(error),
          ...context,
        };

  // Log to Pino (structured logging)
  logger.error({ ...errorDetails, timestamp }, 'Application Error');
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    };
  }

  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }

  return {
    error: {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
  };
}

/**
 * Handle API errors and return consistent Response
 */
export function handleApiError(error: unknown): Response {
  logError(error);

  const response = formatErrorResponse(error);
  const status = error instanceof AppError ? error.statusCode : 500;

  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
