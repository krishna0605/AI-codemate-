import { AIConfig } from '../config';

export async function callHuggingFace(prompt: string, config: AIConfig): Promise<string> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }], // Wrap prompt in message format expected by proxy
        context: '', // Context is handled by the hook/proxy mainly, but here we just send empty or modify signature if needed.
        // Wait, the AIService.call() sends a raw prompt. The proxy expects { messages, context }.
        // We should probably adapt strictly to what the proxy needs.
        // The API route expects: { messages: [{ role: 'user', content: '...' }], context: '...' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face Error: ${response.status} ${errorText}`);
    }

    // The proxy returns a stream, but for this 'complete/explain' non-streaming method, we need to read it all.
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      // The Ollama response is a JSON stream: { "response": "word", "done": false }
      // The proxy seems to forward the raw body from fetch(`${aiServiceUrl}/api/generate`).
      // Let's verify what the proxy does.
      // The proxy: return new Response(response.body);
      // The HF Space (Ollama): returns JSON objects stream.

      // We need to parse the JSON objects.
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            result += json.response;
          }
          if (json.done) {
            // Done
          }
        } catch (e) {
          // It might be a partial chunk or plain text if something else happened.
          // If it's valid JSON, good.
          console.warn('Error parsing JSON chunk:', e);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Hugging Face Call Error:', error);
    throw error;
  }
}
