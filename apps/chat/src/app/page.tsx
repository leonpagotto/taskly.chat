import React from 'react';
import dynamic from 'next/dynamic';
import { useMergedInstructions } from '../components/useMergedInstructions';

const LobeChatMount = dynamic(() => import('../components/LobeChatMount'), { ssr: false });

function ChatArea() {
  const merged = useMergedInstructions();
  return <LobeChatMount mergedSystemPrompt={merged.systemPrompt} />;
}

export default function HomePage() {
  return (
    <main style={{ padding: '1rem' }}>
      <h1>Taskly Chat Prototype</h1>
  <ChatArea />
    </main>
  );
}
