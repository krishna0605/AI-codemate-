import { AIConfig } from '../config';

export async function callOllama(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt: prompt,
      stream: false,
      options: {
        num_predict: config.maxTokens,
        temperature: config.temperature,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Ollama API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  return data.response;
}
