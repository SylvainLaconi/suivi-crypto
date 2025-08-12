'use client';

import { useChat } from '@ai-sdk/react';
import { UIMessagePart } from 'ai'; // si le type est exporté, sinon adapte
import { useState } from 'react';

type Crypto = {
  id: string;
  name: string;
  symbol: string;
};

export default function Chat() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap mb-4">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;

              case 'tool-addCrypto': {
                const output = part.output as { crypto: Crypto } | undefined;
                if (!output) return null;
                return (
                  <div key={`${message.id}-${i}`}>
                    Crypto {output.crypto.symbol} ajoutée avec succès
                  </div>
                );
              }

              case 'tool-getAllCryptos': {
                const output = part.output as { cryptos: Crypto[] } | undefined;
                if (!output || !output.cryptos.length) {
                  return (
                    <div key={`${message.id}-${i}`}>
                      Aucune crypto trouvée.
                    </div>
                  );
                }

                return (
                  <ul key={`${message.id}-${i}`} className="list-disc list-inside">
                    {output.cryptos.map(crypto => (
                      <li key={crypto.id}>
                        {crypto.name} ({crypto.symbol})
                      </li>
                    ))}
                  </ul>
                );
              }

              default:
                return null;
            }
          })}
        </div>
      ))}

      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
