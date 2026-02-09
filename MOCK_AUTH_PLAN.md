# Mock Auth Implementation Plan

## Goal

Bypass Supabase authentication to allow the app to run locally without valid credentials.

## Changes

1.  **`.env`**: Add `NEXT_PUBLIC_MOCK_AUTH="true"`.
2.  **`src/middleware.ts`**: Skip auth checks if `NEXT_PUBLIC_MOCK_AUTH` is true.
3.  **`src/hooks/useAuth.tsx`**: Return mock user and bypass Supabase calls if `NEXT_PUBLIC_MOCK_AUTH` is true.
