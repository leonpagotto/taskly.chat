"use client";
import React, { useState } from 'react';

interface LobeChatMountProps {
  mergedSystemPrompt: string;
}

// Temporary placeholder until real Lobe Chat framework is integrated.
// Responsibilities this iteration:
// - Display system prompt summary
// - Provide simple message input & echo list (local only)
// - Future hook point for provider-backed streaming
export const LobeChatMount: React.FC<LobeChatMountProps> = ({ mergedSystemPrompt }) => {
  const [localMessages, setLocalMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const user = { id: crypto.randomUUID(), role: 'user' as const, content: input.trim() };
    setInput('');
    setSending(true);
    setLocalMessages(prev => [...prev, user]);
    // Placeholder assistant echo (will be replaced by real framework interaction)
    setTimeout(() => {
      const assistant = { id: crypto.randomUUID(), role: 'assistant' as const, content: `(placeholder) You said: ${user.content}` };
      setLocalMessages(prev => [...prev, assistant]);
      setSending(false);
    }, 250);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <section style={{ background: '#222', padding: 12, borderRadius: 8 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>System Prompt (Merged)</strong>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: 0 }}>{mergedSystemPrompt}</pre>
        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>Framework: Lobe Chat (stub mode)</div>
      </section>
      <div style={{ flex: 1, minHeight: 240, background: '#1b1b1b', padding: 12, borderRadius: 8 }}>
        {localMessages.length === 0 && (
          <div style={{ fontSize: 12, opacity: 0.6 }}>No messages yet. Start typing below.</div>
        )}
        {localMessages.map(m => (
          <div key={m.id} style={{ marginBottom: 16 }}>
            <div><strong>{m.role}:</strong> {m.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #444', background:'#111', color:'#eee' }}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()} style={{ padding: '8px 16px' }}>{sending ? '...' : 'Send'}</button>
      </form>
    </div>
  );
};

export default LobeChatMount;
