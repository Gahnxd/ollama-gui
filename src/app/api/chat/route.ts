import { Ollama } from 'ollama';
import { NextRequest } from 'next/server';



export async function POST(req: NextRequest) {
  try {
    const { model, messages } = await req.json();

    if (!model || !messages) {
      return new Response('Missing model or messages', { status: 400 });
    }

    const ollama = new Ollama({ host: 'http://localhost:11434' });

    const stream = await ollama.chat({
      model: model,
      messages: messages,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const jsonChunk = JSON.stringify(chunk);
          controller.enqueue(new TextEncoder().encode(jsonChunk + '\n'));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
