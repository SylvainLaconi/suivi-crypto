import prisma from '@/clients/prisma/prisma';
import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import z from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    tools: {
      addCrypto: tool({
        description: 'Add a crypto to the database',
        inputSchema: z.object({
          name: z.string().describe('The name of the crypto'),
          symbol: z.string().describe('The symbol of the crypto'),
        }),
        execute: async ({ name, symbol }) => {
          const crypto = await prisma.crypto.create({
            data: { name, symbol },
          });
          return {
            crypto,
          };
        },
      }),
      getAllCryptos: tool({
        description: 'Get all cryptos from the database',
        inputSchema: z.object({}),
        execute: async () => {
          const cryptos = await prisma.crypto.findMany();
          return { cryptos };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}