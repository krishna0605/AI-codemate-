# API Design Standards

## Overview

This document outlines the standards for API development in the AI CodeMate project. All new API routes must adhere to these guidelines to ensure consistency, security, and type safety.

## 1. Request Validation

We use **Zod** for runtime validation of request bodies and query parameters.

### Implementation

Wrap your route handlers with `withValidation` from `@/lib/api-handler`:

```typescript
import { withValidation } from '@/lib/api-handler';
import { mySchema } from '@/lib/validations/my-schema';

export const POST = withValidation(async (req, params, body) => {
  // body is fully typed here!
  return NextResponse.json({ success: true });
}, mySchema);
```

## 2. Error Handling

Errors are normalized using the `AppError` class and `handleApiError` utility.

### Error Response Format

```json
{
  "error": {
    "message": "Validation Error",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": ["Error message"]
    }
  }
}
```

## 3. Authentication

- Use `supabase.auth.getUser()` for server-side auth checks.
- Protect private routes by checking for `user` existence.

## 4. versioning

- Current API version: `v1` (Implicit)
- Future versions should be namespaced (e.g., `/api/v2/...`).
