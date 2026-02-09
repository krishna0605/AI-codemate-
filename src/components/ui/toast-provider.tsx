'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#15221b',
          border: '1px solid #254632',
          color: '#f8fafc',
        },
        className: 'font-sans',
        duration: 4000,
      }}
      theme="dark"
      richColors
      closeButton
    />
  );
}

// Re-export toast functions for convenience
export { toast } from 'sonner';
