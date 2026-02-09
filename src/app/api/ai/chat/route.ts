import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge Runtime for streaming

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // 1. Construct the System Prompt
    const systemPrompt = `
You are **AI Codemate**, an elite Senior Software Engineer and Architect.
Your mission is to help the user build, debug, and optimize their **Next.js + Supabase** application.

### 🧠 Core Directives
1.  **Code First**: You provide **complete, working, and idiomatic code** immediately. Avoid vague suggestions.
2.  **Context Aware**: You have access to the user's file structure and active file. Use this to ensure your code fits perfectly (imports, variable names, patterns).
3.  **Modern Stack**: Focus on **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Avoid legacy React class components.
4.  **Security Minded**: Always implement RLS, proper validation, and never leak secrets.

### 📝 Response Style
-   **Formatting**: Use Markdown. Code blocks must include the language (e.g., \`\`\`typescript).
-   **Brevity**: Be concise. Don't explain standard React concepts unless the user is a beginner. Focus on the *why* of complex decisions.
-   **Updates**: When editing code, show enough context so the user knows where to paste it.

### 📂 Current Context
${context || 'No specific file context provided.'}
    `.trim();

    // 2. Prepare request to Hugging Face
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    if (!aiServiceUrl) {
      return NextResponse.json({ error: 'AI Service URL not configured' }, { status: 500 });
    }

    // 3. Forward to Ollama (running in HF Space)
    const response = await fetch(`${aiServiceUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${lastMessage.content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Service Error:', errorText);
      return NextResponse.json(
        { error: `AI Service Error: ${response.statusText}` },
        { status: response.status }
      );
    }

    // 4. Stream response back to client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
