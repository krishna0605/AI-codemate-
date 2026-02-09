import { AIConfig } from '../config';

export async function callGemini(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) {
    return '';
  }
  return data.candidates[0].content.parts[0].text;
}
