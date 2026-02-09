export type AIProvider = 'gemini' | 'openrouter' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const PROVIDER_CONFIGS: Record<AIProvider, Partial<AIConfig>> = {
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    model: 'gemini-1.5-flash',
    maxTokens: 8192,
    temperature: 0.3,
  },
  openrouter: {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'deepseek/deepseek-coder',
    maxTokens: 4096,
    temperature: 0.2,
  },
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'codellama:7b-code',
    maxTokens: 2048,
    temperature: 0.1,
  },
};
