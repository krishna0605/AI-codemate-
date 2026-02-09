import { AIConfig } from './config';
import { callGemini } from './providers/gemini';
import { callOpenRouter } from './providers/openrouter';
import { callOllama } from './providers/ollama';
import { callHuggingFace } from './providers/huggingface';

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async complete(code: string, position: { line: number; column: number }): Promise<string> {
    // Optimized prompt for code completion
    const lines = code.split('\n');
    const prefix =
      lines.slice(0, position.line).join('\n') + lines[position.line].slice(0, position.column);
    const suffix =
      lines[position.line].slice(position.column) + lines.slice(position.line + 1).join('\n');

    const prompt = `Complete the following code. DO NOT repeat the existing code. output only the missing code part.\n\n[CODE_START]${prefix}[CURSOR]${suffix}[CODE_END]`;
    return this.call(prompt);
  }

  async explain(code: string): Promise<string> {
    const prompt = `Explain the following code in a concise, developer-friendly way:\n\n${code}`;
    return this.call(prompt);
  }

  async document(code: string): Promise<string> {
    const prompt = `Generate JSDoc/TSDoc documentation for the following code:\n\n${code}`;
    return this.call(prompt);
  }

  async detectBugs(code: string): Promise<string> {
    const prompt = `Analyze the following code for bugs, security vulnerabilities, and performance issues:\n\n${code}`;
    return this.call(prompt);
  }

  async refactor(code: string, language: string = 'typescript'): Promise<string> {
    const prompt = `Analyze the following ${language} code and suggest refactoring improvements. Focus on:
1. Code readability
2. DRY violations
3. Function length (suggest splitting if > 30 lines)
4. Complex conditionals
5. Naming improvements

Be concise and actionable.

\`\`\`${language}
${code.slice(0, 4000)}
\`\`\``;
    return this.call(prompt);
  }

  private cache = new Map<string, { response: string; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async chat(
    messages: { role: 'user' | 'model'; parts: string }[],
    userPrompt: string,
    systemContext?: string
  ): Promise<string> {
    // ... (chat implementation remains same, but we can cache based on last message or full history hash)
    // For simplicity, we won't cache chat for now as it's conversational and context-dependent.
    // But we WILL cache other methods below.

    // Take last 4 messages for context + current prompt
    const recentHistory = messages
      .slice(-4)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.parts}`)
      .join('\n\n');

    let prompt = `You are an expert AI coding assistant.`;

    if (systemContext) {
      prompt += `\n\nCONTEXT:\n${systemContext}`;
    }

    prompt += `\n\nPrevious conversation:\n${recentHistory}\n\nUser: ${userPrompt}\n\nAssistant:`;

    return this.call(prompt);
  }

  private async call(prompt: string): Promise<string> {
    const key = `${this.config.provider}:${this.config.model}:${prompt}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.response;
    }

    try {
      let response = '';
      switch (this.config.provider) {
        case 'gemini':
          response = await callGemini(prompt, this.config);
          break;
        case 'openrouter':
          response = await callOpenRouter(prompt, this.config);
          break;
        case 'ollama':
          response = await callOllama(prompt, this.config);
          break;
        case 'huggingface':
          response = await callHuggingFace(prompt, this.config);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      this.cache.set(key, { response, timestamp: Date.now() });
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  updateConfig(newConfig: AIConfig) {
    this.config = newConfig;
  }
}
