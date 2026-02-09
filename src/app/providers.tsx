'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { RepositoryProvider } from '@/hooks/useRepository';
import { ToastProvider } from '@/components/ui/toast-provider';
import { AIProvider } from '@/contexts/AIContext';
import { AICommandsProvider } from '@/hooks/useAICommands';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RepositoryProvider>
        <AIProvider>
          <AICommandsProvider>
            {children}
            <ToastProvider />
          </AICommandsProvider>
        </AIProvider>
      </RepositoryProvider>
    </AuthProvider>
  );
}
