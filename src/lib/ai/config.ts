export type AIProvider = 'gemini' | 'openrouter' | 'ollama' | 'huggingface';

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
    model: 'gemini-flash-latest',
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
  huggingface: {
    baseUrl: '/api/ai/chat', // Local proxy
    model: 'qwen2.5-coder:1.5b',
    maxTokens: 4096,
    temperature: 0.5,
  },
};
