import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge Runtime for streaming

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // 1. Construct the System Prompt
    // 1. Construct the System Prompt
    const systemPrompt = `
You are **AI Codemate**, an elite Senior Software Engineer and Architect.
Your mission is to act as a **human-like technical partner** for the user.

### 🧠 Core Directives
1.  **Extreme Accuracy**: Do not hallucinate. If you don't know something based on the file context, say "I don't see that file in the context provided."
2.  **Detailed & Natural**: When asked "Tell me about this project", use the provided "Project Description" and file structure to give a comprehensive, fluent English summary.
3.  **Formatting Rules**:
    -   **Code Generation**: Use Markdown code blocks ONLY for code snippets.
    -   **Explanation**: Use **pure, natural language**. Avoid excessive lists, bullet points, or bold text if the user requests a "normal language" answer.
    -   **No Artifacts**: Do not include internal thinking tags or weird characters (e.g., <|end_header_id|>).

### 🔍 Project Analysis Instructions
-   If context contains "Project Description" (README), use it as the ground truth.
-   If asked to "analyze the repository", look at the "Repository Structure" list to infer the tech stack (e.g., 'tsconfig.json' -> TypeScript, 'tailwind.config.js' -> Tailwind).

### 📂 Current Project Context
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
