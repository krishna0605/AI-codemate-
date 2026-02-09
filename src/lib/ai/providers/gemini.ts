import { AIConfig } from '../config';
import { generateContent } from '@/app/actions/gemini';

export async function callGemini(prompt: string, config: AIConfig): Promise<string> {
  // We prioritize the model from config, but fallback to 'gemini-1.5-flash' if needed
  const modelName = config.model || 'gemini-1.5-flash';

  try {
    const text = await generateContent(prompt, modelName, {
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
    });

    if (!text) {
      return '';
    }
    return text;
  } catch (error: any) {
    if (error.message.includes('GEMINI_API_KEY is not set')) {
      throw new Error(
        'Gemini API key is missing. Please ensure GEMINI_API_KEY is set in your .env file.'
      );
    }
    throw new Error(`Gemini Error: ${error.message}`);
  }
}
