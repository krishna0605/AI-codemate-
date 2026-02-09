/**
 * Security Utilities for AI Codemate
 * Provides rate limiting, request logging, and security helpers
 */

// ============================================
// RATE LIMITING (In-Memory Sliding Window)
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (per IP)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window

/**
 * Check if a request should be rate limited
 * @param identifier - Usually the client IP address
 * @returns Object with success status and reset time
 */
export function checkRateLimit(identifier: string): {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    cleanupExpiredEntries();
  }

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      success: true,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limited
    return {
      success: false,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}

// ============================================
// SECURITY LOGGING
// ============================================

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

interface SecurityLogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  ip?: string;
  path?: string;
  userId?: string;
  details?: Record<string, unknown>;
}

/**
 * Log a security-relevant event
 */
export function securityLog(
  level: LogLevel,
  event: string,
  context?: {
    ip?: string;
    path?: string;
    userId?: string;
    details?: Record<string, unknown>;
  }
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  };

  // In production, this would send to a logging service
  // For now, structured console logging
  const logMessage = JSON.stringify(entry);

  switch (level) {
    case 'ERROR':
    case 'SECURITY':
      console.error(`[SECURITY] ${logMessage}`);
      break;
    case 'WARN':
      console.warn(`[SECURITY] ${logMessage}`);
      break;
    default:
      console.log(`[SECURITY] ${logMessage}`);
  }
}

// ============================================
// CORS CONFIGURATION
// ============================================

/**
 * Get allowed origins for CORS
 */
export function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return [appUrl, 'http://localhost:3000', 'http://localhost:3001'].filter(Boolean);
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  return allowed.some(
    (allowedOrigin) => origin === allowedOrigin || origin.endsWith('.vercel.app')
  );
}

// ============================================
// SECURITY HEADERS
// ============================================

/**
 * Get security headers to add to responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize a string to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate that a URL is safe to redirect to
 */
export function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const allowed = getAllowedOrigins();
    return allowed.some((origin) => parsed.origin === origin);
  } catch {
    return false;
  }
}
