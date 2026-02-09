'use client';

import React, { useState, useEffect } from 'react';
import { useAIService } from '@/contexts/AIContext';
import { AIProvider, PROVIDER_CONFIGS } from '@/lib/ai/config';
import { Button } from '@/components/ui/button';

export function AISettings() {
  const { config, updateConfig } = useAIService();
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    updateConfig(localConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const providers: AIProvider[] = ['gemini', 'openrouter', 'ollama'];

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-card text-card-foreground">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">AI Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure which AI provider to use for code assistance.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={localConfig.provider}
            onChange={(e) => {
              const newProvider = e.target.value as AIProvider;
              setLocalConfig({
                ...localConfig,
                provider: newProvider,
                model: PROVIDER_CONFIGS[newProvider].model || '',
                // We might want to clear or keep apiKey depending on UX preference
              });
            }}
          >
            {providers.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <input
            type="password"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={localConfig.apiKey || ''}
            onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
            placeholder={
              localConfig.provider === 'ollama' ? 'Optional for Ollama' : 'Enter API Key'
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={localConfig.model}
            onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
          />
        </div>

        {localConfig.provider !== 'gemini' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Base URL</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={localConfig.baseUrl || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
              placeholder={
                localConfig.provider === 'ollama'
                  ? 'http://localhost:11434'
                  : 'https://api.example.com'
              }
            />
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaved}>
          {isSaved ? 'Saved!' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
