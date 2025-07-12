import { Ollama } from 'ollama';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Function to read file content
async function readFileContent(filePath: string): Promise<string> {
  try {
    // Check if the file exists
    const fullPath = path.join(process.cwd(), filePath.toString().charAt(0) === '/' ? filePath.slice(1) : filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return '';
    }
    
    // Read file as text
    const content = fs.readFileSync(fullPath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { model, messages, documents = [] } = await req.json();

    if (!model || !messages) {
      return new Response('Missing model or messages', { status: 400 });
    }

    const ollama = new Ollama({ host: 'http://localhost:11434' });

    // Process documents if any
    let documentContents = '';
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        const content = await readFileContent(doc.path);
        if (content) {
          documentContents += `Uploaded content:\n name:${path.basename(doc.path)}\n type:${doc.type}\n size:${doc.size}\n content:\n${content}\n`;
        }
      }
    }

    // If there are documents, append their content to the last user message
    const processedMessages = [...messages];
    if (documentContents && processedMessages.length > 0) {
      const lastMessageIndex = processedMessages.length - 1;
      const lastMessage = processedMessages[lastMessageIndex];
      
      if (lastMessage.role === 'user') {
        // Append document content to the user's message
        processedMessages[lastMessageIndex] = {
          ...lastMessage,
          content: `${lastMessage.content}\n\n${documentContents}`
        };
      }
    }

    const stream = await ollama.chat({
      model: model,
      messages: processedMessages,
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

    // Delete uploaded documents
    documents.forEach((doc: { path: string }) => {
      const filePath = path.join(process.cwd(), doc.path);
      fs.unlinkSync(filePath);
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
