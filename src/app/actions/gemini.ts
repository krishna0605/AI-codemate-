'use server';

import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

export async function generateContent(
  prompt: string,
  modelName: string,
  generationConfig?: GenerationConfig
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY is not set in environment variables' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });
    return { success: true, text: result.response.text() };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return { success: false, error: error.message || 'Failed to generate content' };
  }
}
