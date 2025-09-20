'use client';
import React, { useState } from 'react';
import { mergeInstructionLayers, extractTaskDrafts } from '@taskly/ai';
import { ChatMessage, InstructionLayer } from '@taskly/core';

interface ChatEntry { id: string; role: 'user' | 'assistant'; content: string; tasks?: any[]; parse?: any; }

const initialLayers: InstructionLayer[] = [
  { id: 'global', content: 'You are Taskly Chat, an AI assistant that helps convert user intentions into structured tasks while maintaining context and memory.' },
  { id: 'context:session', content: 'Session context is lightweight in this prototype.' }
];

export const ChatShell: React.FC = () => {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const merged = mergeInstructionLayers(initialLayers);

  async function handleSend() {
    if (!input.trim()) return;
    const id = crypto.randomUUID();
    const text = input;
    setInput('');
    setLoading(true);
  setError(null);
  const chatMsg: ChatMessage = { id, role: 'user', content: text, createdAt: new Date().toISOString() };
    const extraction = extractTaskDrafts(chatMsg);
    let parse: any = undefined;
    try {
      const res = await fetch('/api/nlp/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (res.ok) {
        parse = await res.json();
      } else {
        parse = { error: true };
      }
    } catch (e) {
      parse = { error: true };
    }
    const userEntry: ChatEntry = { id, role: 'user', content: text, tasks: extraction.drafts, parse };
    setMessages(prev => [...prev, userEntry]);
    // Call Gemini backend for assistant reply.
    try {
      const assistantRes = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [chatMsg], systemPrompt: merged.systemPrompt }) });
      if (assistantRes.ok) {
        const data = await assistantRes.json();
        setMessages(prev => [...prev, { id: data.id, role: 'assistant', content: data.content }]);
      } else {
        setError('Error generating response');
        setMessages(prev => [...prev, { id: 'assistant-' + Date.now(), role: 'assistant', content: '(error generating response)' }]);
      }
    } catch {
      setError('Network error');
      setMessages(prev => [...prev, { id: 'assistant-' + Date.now(), role: 'assistant', content: '(network error)' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 860, margin: '0 auto' }}>
      <section style={{ background: '#222', padding: 12, borderRadius: 8 }}>
        <strong>System Prompt Layers</strong>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{merged.systemPrompt}</pre>
      </section>
      <div style={{ flex: 1, minHeight: 300, background: '#1b1b1b', padding: 12, borderRadius: 8 }}>
        {messages.map(m => (
          <div key={m.id} style={{ marginBottom: 20 }}>
            <div><strong>{m.role}:</strong> {m.content}</div>
            {m.tasks && m.tasks.length > 0 && (
              <div style={{ marginTop: 4, padding: 6, background: '#333', borderRadius: 4 }}>
                <em>Draft Tasks:</em>
                <ul style={{ margin: '4px 0 0 16px' }}>
                  {m.tasks.map((t, i) => (<li key={i}>{t.title} ({Math.round(t.confidence * 100)}%)</li>))}
                </ul>
              </div>
            )}
            {m.parse && !m.parse.error && (
              <div style={{ marginTop: 6, padding: 6, background: '#262626', borderRadius: 4 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Intent: {m.parse.intent} | Confidence: {Math.round(m.parse.confidence * 100)}%</div>
                {m.parse.proposedTask && (
                  <div style={{ marginTop: 4 }}>
                    <strong>Proposed Task:</strong> {m.parse.proposedTask.title} (Due: {m.parse.proposedTask.due_date || '—'}, Priority: {m.parse.proposedTask.priority})
                  </div>
                )}
                {m.parse.missing && m.parse.missing.length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 12 }}>
                    Missing: {m.parse.missing.join(', ')}
                  </div>
                )}
              </div>
            )}
            {m.parse && m.parse.error && (
              <div style={{ marginTop: 6, padding: 6, background: '#402020', borderRadius: 4, fontSize: 12 }}>Parser error.</div>
            )}
          </div>
        ))}
  {loading && <div style={{ fontSize: 12, opacity: 0.7 }}>Processing...</div>}
  {error && !loading && <div style={{ fontSize: 12, color: '#ff7575' }}>{error}</div>}
      </div>
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. Create high priority task to update onboarding docs tomorrow" style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #444', background:'#111', color:'#eee' }} />
        <button type="submit" style={{ padding: '8px 16px' }} disabled={loading || !input.trim()}>{loading ? '...' : 'Send'}</button>
      </form>
    </div>
  );
};
