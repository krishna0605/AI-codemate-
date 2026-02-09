'use server';

import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

export async function generateContent(
  prompt: string,
  modelName: string,
  generationConfig?: GenerationConfig
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });
    return result.response.text();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to generate content');
  }
}
