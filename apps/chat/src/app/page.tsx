import React from 'react';
import { ChatShell } from '../components/ChatShell';

export default function HomePage() {
  return (
    <main style={{ padding: '1rem' }}>
      <h1>Taskly Chat Prototype</h1>
      <ChatShell />
    </main>
  );
}
