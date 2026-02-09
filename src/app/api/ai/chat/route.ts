import { NextResponse } from 'next/server';

// Use Node.js runtime for longer timeout support (Edge has 30s limit)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // Optimized system prompt (~200 tokens vs ~800)
    const systemPrompt = `You are AI Codemate, an expert coding assistant.
- Be concise and accurate
- Use the provided file context only
- For "What is this project?": Give a functional summary (what it does, not tech stack)
- For technical questions: Explain architecture, tech stack, and implementation
- Use Markdown for code blocks only

Context:
${context || 'No specific file context provided.'}`.trim();

    const aiServiceUrl = process.env.AI_SERVICE_URL;
    if (!aiServiceUrl) {
      return NextResponse.json({ error: 'AI Service URL not configured' }, { status: 500 });
    }

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout (before Vercel's 60s)

    try {
      // Use correct Qwen2.5 ChatML format (NOT Llama format)
      const response = await fetch(`${aiServiceUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5-coder:1.5b',
          prompt: `<|im_start|>system
${systemPrompt}<|im_end|}
<|im_start|>user
${lastMessage.content}<|im_end|>
<|im_start|>assistant
`,
          stream: true,
          options: {
            num_predict: 512, // Limit response length for faster generation
            temperature: 0.7,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Service Error:', errorText);
        return NextResponse.json(
          { error: `AI Service Error: ${response.statusText}` },
          { status: response.status }
        );
      }

      // Stream response back to client
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          {
            error:
              'Request timed out. The AI model is taking too long to respond. Please try a shorter question.',
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
