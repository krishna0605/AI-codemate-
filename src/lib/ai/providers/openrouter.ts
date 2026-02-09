import { AIConfig } from '../config';

export async function callOpenRouter(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://aicodemate.com',
      'X-Title': 'AI Codemate',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
