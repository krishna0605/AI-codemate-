import { describe, it, expect, vi } from 'vitest';
import { AppError, formatErrorResponse, handleApiError } from './error';

describe('AppError', () => {
  it('should create an instance with correct properties', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR', { foo: 'bar' });
    expect(error).toBeInstanceOf(Error);
    expect(error instanceof AppError).toBe(true);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.details).toEqual({ foo: 'bar' });
  });

  it('should have default values', () => {
    const error = new AppError('Default error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.details).toBeUndefined();
  });
});

describe('formatErrorResponse', () => {
  it('should format AppError correctly', () => {
    const error = new AppError('Custom error', 404, 'NOT_FOUND');
    const response = formatErrorResponse(error);
    expect(response).toEqual({
      error: {
        message: 'Custom error',
        code: 'NOT_FOUND',
        details: undefined,
      },
    });
  });

  it('should format standard Error correctly', () => {
    const error = new Error('Standard error');
    const response = formatErrorResponse(error);
    expect(response).toEqual({
      error: {
        message: 'Standard error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  });

  it('should format unknown error correctly', () => {
    const response = formatErrorResponse('Unknown string');
    expect(response).toEqual({
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      },
    });
  });
});

describe('handleApiError', () => {
  it('should return Response with correct status and body for AppError', () => {
    const error = new AppError('API error', 401, 'UNAUTHORIZED');
    const response = handleApiError(error);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(401);

    // Check headers
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should return 500 for standard Error', () => {
    const error = new Error('System error');
    const response = handleApiError(error);
    expect(response.status).toBe(500);
  });
});
