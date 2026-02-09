'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIService } from '@/lib/ai/aiService';
import { PROVIDER_CONFIGS, AIConfig, AIProvider as ProviderType } from '@/lib/ai/config';

interface AIContextType {
  service: AIService;
  config: AIConfig;
  updateConfig: (newConfig: Partial<AIConfig>) => void;
}

const DEFAULT_CONFIG: AIConfig = {
  provider: 'gemini',
  ...PROVIDER_CONFIGS.gemini,
} as AIConfig;

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [service] = useState(() => new AIService(DEFAULT_CONFIG));

  useEffect(() => {
    // Load config from localStorage if available
    const savedConfig = localStorage.getItem('ai-config-v4');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);

        // Merge saved config with default to ensure we have keys if they are missing in saved
        // Use DEFAULT_CONFIG instead of config state to avoid dependency loop
        let mergedConfig = { ...DEFAULT_CONFIG, ...parsed };

        // Force update if the stored model is invalid or old
        if (
          mergedConfig.provider === 'gemini' &&
          (mergedConfig.model === 'gemini-1.5-flash' ||
            mergedConfig.model === 'gemini-1.5-flash-001' ||
            mergedConfig.model === 'gemini-pro' ||
            mergedConfig.model === 'gemini-flash-latest')
        ) {
          console.log('Migrating to valid model:', 'gemini-2.0-flash');
          mergedConfig.model = 'gemini-2.0-flash';
        }

        // If the saved provider doesn't have an API key, try to get it from defaults
        if (!mergedConfig.apiKey) {
          const defaultKey = PROVIDER_CONFIGS[mergedConfig.provider as ProviderType]?.apiKey;
          if (defaultKey) {
            mergedConfig.apiKey = defaultKey;
          }
        }

        setConfig(mergedConfig);
        service.updateConfig(mergedConfig);
      } catch (e) {
        console.error('Failed to parse saved AI config', e);
      }
    }
  }, [service]);

  const updateConfig = (newConfig: Partial<AIConfig>) => {
    const updated = { ...config, ...newConfig } as AIConfig;
    setConfig(updated);
    service.updateConfig(updated);
    localStorage.setItem('ai-config-v4', JSON.stringify(updated));
  };

  return (
    <AIContext.Provider value={{ service, config, updateConfig }}>{children}</AIContext.Provider>
  );
}

export function useAIService() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIService must be used within an AIProvider');
  }
  return context;
}
