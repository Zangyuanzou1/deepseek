import { createDeepSeek } from '@ai-sdk/deepseek';
import { convertToCoreMessages, streamText } from 'ai';
import type { Message } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const deepseek=createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL:process.env.BASE_URL
})
export async function POST(req: Request) {
  const { messages, model }: { messages: Message[], model?: string } = await req.json();

  const selectedModel = model === 'deepseek-r1' ? 'deepseek-r1' : 'deepseek-v3';

  const result = streamText({
    model: deepseek(selectedModel),
    system: 'You are a helpful assistant.',
    messages: convertToCoreMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}