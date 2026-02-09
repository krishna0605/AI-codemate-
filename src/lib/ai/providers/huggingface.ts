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

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Process any remaining buffer content
        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer);
            if (json.response) result += json.response;
          } catch (e) {
            console.warn('Final buffer parse error:', e);
          }
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      // Keep the last line in the buffer as it might be incomplete
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          const json = JSON.parse(line);
          if (json.response) {
            result += json.response;
          }
        } catch (e) {
          console.warn('Error parsing JSON chunk:', e);
          // If it fails, it might be that the split wasn't perfect, but usually ollama sends line-delimited JSON.
          // If a chunk splits a line, 'buffer' handles it.
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Hugging Face Call Error:', error);
    throw error;
  }
}
