'use client';
import React, { useState } from 'react';
import { useConversationHistory, ConversationMessage } from '../app/hooks/useConversationHistory';
import { useEffect, useRef, useState as useReactState } from 'react';
import { extractTaskDrafts } from '@taskly/ai'; // will be removed after full hook integration of historical messages
import { useMergedInstructions } from './useMergedInstructions';
import { useTaskDraftExtraction } from './useTaskDraftExtraction';
import { ChatMessage, InstructionLayer } from '@taskly/core';

interface ChatEntry { id: string; role: 'user' | 'assistant'; content: string; tasks?: any[]; parse?: any; intent?: string; drafts?: any[]; }

const initialLayers: InstructionLayer[] = [];

export const ChatShell: React.FC = () => {
  const [startDate, setStartDate] = useReactState<string | null>(null);
  const [endDate, setEndDate] = useReactState<string | null>(null);
  const history = useConversationHistory(30, { start: startDate, end: endDate });
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          history.loadMore();
        }
      });
    }, { root: el.parentElement, rootMargin: '200px 0px 0px 0px', threshold: 0 });
    obs.observe(el);
    return () => { obs.disconnect(); };
  }, [history]);
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [accepted, setAccepted] = useState<any[]>([]);
  function acceptDraft(d: any) {
    setAccepted(prev => prev.find(p=>p.title===d.title) ? prev : [...prev, { ...d, acceptedAt: Date.now() }]);
  }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const merged = useMergedInstructions(initialLayers);

  const [pendingDraftSource, setPendingDraftSource] = useState<string | undefined>(undefined);
  const extractionHook = useTaskDraftExtraction(pendingDraftSource);

  async function handleSend() {
    if (!input.trim()) return;
    const id = crypto.randomUUID();
    const text = input;
  setInput('');
  setPendingDraftSource(text);
  setLoading(true);
  setError(null);
  const chatMsg: ChatMessage = { id, role: 'user', content: text, createdAt: new Date().toISOString() };
    // Use hook result (memoized) based on pendingDraftSource
    const extraction = extractionHook.drafts && pendingDraftSource === text
      ? { drafts: extractionHook.drafts }
      : extractTaskDrafts(chatMsg);
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
      const assistantRes = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...messages, chatMsg], systemPrompt: merged.systemPrompt }) });
      if (assistantRes.ok) {
        const data = await assistantRes.json();
        setMessages(prev => [...prev, { id: data.id, role: 'assistant', content: data.content, intent: data.intent, drafts: data.drafts }]);
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
        <div style={{ marginTop: 8 }}>
          <strong>Adapted Segments:</strong>
          <ul style={{ margin: '4px 0 0 16px', fontSize: 11 }}>
            {merged.adaptedSegments.map((s: { role: string; content: string }, i: number) => (
              <li key={i}>{s.role}: {s.content.slice(0,80)}{s.content.length>80?'…':''}</li>
            ))}
          </ul>
        </div>
      </section>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ flex: 1, maxHeight: 480, overflowY:'auto', background:'#161616', padding:10, borderRadius:8, border:'1px solid #2a2a2a' }}>
          <div style={{ position:'sticky', top:0, background:'#161616', paddingBottom:6 }}>
            <strong style={{ fontSize:13 }}>Conversation History</strong>
            <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
              <input type="date" value={startDate ?? ''} onChange={e=>setStartDate(e.target.value||null)} style={{ background:'#111', color:'#eee', border:'1px solid #333', borderRadius:4, padding:'2px 4px', fontSize:11 }} />
              <input type="date" value={endDate ?? ''} onChange={e=>setEndDate(e.target.value||null)} style={{ background:'#111', color:'#eee', border:'1px solid #333', borderRadius:4, padding:'2px 4px', fontSize:11 }} />
              {(startDate||endDate) && <button onClick={()=>{setStartDate(null); setEndDate(null);}} style={{ fontSize:11, padding:'2px 6px', background:'#272727', border:'1px solid #444', borderRadius:4 }}>Clear</button>}
            </div>
          </div>
          {history.messages.length === 0 && !history.loading && !history.error && (
            <div style={{ fontSize:12, opacity:0.6, padding:'12px 4px' }}>No messages in this range.</div>
          )}
          {history.messages.length === 0 && history.loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {Array.from({ length: 5 }).map((_,i)=>(<div key={i} style={{ height:14, background:'#222', borderRadius:4, animation:'pulse 1.5s infinite', opacity:0.5 }} />))}
            </div>
          )}
          {groupMessagesByDay(history.messages).map(g => (
            <div key={g.day} style={{ marginBottom:12 }}>
              <div style={{ position:'sticky', top:0, background:'#161616', fontSize:10, opacity:0.55, textTransform:'uppercase', letterSpacing:1, padding:'2px 0' }}>{g.day}</div>
              {g.items.map(m => (
                <div key={m.id} style={{ marginBottom:8, fontSize:12 }}>
                  <span style={{ opacity:0.5 }}>{timeOf(m.createdAt)}</span>
                  <span style={{ marginLeft:6, fontWeight:600 }}>{m.role}</span>: {m.content}
                </div>
              ))}
            </div>
          ))}
          {history.loading && <div style={{ fontSize:11, opacity:0.7 }}>Loading…</div>}
          {history.error && <div style={{ fontSize:11, color:'#ff6b6b' }}>Err: {history.error}</div>}
          <div ref={loadMoreRef} style={{ height:1 }} />
          {history.hasMore && !history.loading && history.messages.length > 0 && (
            <div style={{ textAlign:'center', padding:'4px 0', fontSize:10, opacity:0.5 }}>Scroll to load more…</div>
          )}
        </div>
        <div style={{ flex: 2, minHeight: 300, background: '#1b1b1b', padding: 12, borderRadius: 8 }}>
        {messages.map(m => (
          <div key={m.id} style={{ marginBottom: 20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <strong>{m.role}:</strong>
              <div style={{ whiteSpace:'pre-wrap' }}>{m.content}</div>
              {m.intent && <span style={{ fontSize:10, background:'#333', padding:'2px 4px', borderRadius:4 }}>intent:{m.intent}</span>}
            </div>
            {m.tasks && m.tasks.length > 0 && (
              <div style={{ marginTop: 4, padding: 6, background: '#333', borderRadius: 4 }}>
                <em>Draft Tasks:</em>
                <ul style={{ margin: '4px 0 0 16px' }}>
                  {m.tasks.map((t, i) => (<li key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span>{t.title} ({Math.round(t.confidence * 100)}%)</span>
                    <button style={{ fontSize:10, padding:'2px 6px', background:'#1b4d2b', border:'1px solid #2f7d47', borderRadius:3, cursor:'pointer' }} onClick={()=>acceptDraft(t)}>accept</button>
                  </li>))}
                </ul>
              </div>
            )}
            {m.drafts && m.drafts.length > 0 && (
              <div style={{ marginTop:4, padding:6, background:'#2d2d2d', borderRadius:4 }}>
                <div style={{ fontSize:12, opacity:0.8 }}>Heuristic Drafts:</div>
                <ul style={{ margin:'4px 0 0 16px' }}>
                  {m.drafts.map((d,i)=>(<li key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <span>{d.title} ({Math.round((d.confidence||0)*100)}%)</span>
                    <button style={{ fontSize:10, padding:'2px 6px', background:'#1b2b4d', border:'1px solid #314d7d', borderRadius:3, cursor:'pointer' }} onClick={()=>acceptDraft(d)}>accept</button>
                  </li>))}
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
      </div>
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. Create high priority task to update onboarding docs tomorrow" style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #444', background:'#111', color:'#eee' }} />
        <button type="submit" style={{ padding: '8px 16px' }} disabled={loading || !input.trim()}>{loading ? '...' : 'Send'}</button>
      </form>
      {accepted.length > 0 && (
        <div style={{ marginTop:12, padding:10, background:'#202e1f', border:'1px solid #335533', borderRadius:6 }}>
          <div style={{ fontSize:12, fontWeight:600 }}>Accepted Drafts ({accepted.length})</div>
          <ul style={{ margin:'6px 0 0 16px', fontSize:12 }}>
            {accepted.map((a,i)=>(<li key={i}>{a.title}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
};

function groupMessagesByDay(messages: ConversationMessage[]): { day: string; items: ConversationMessage[] }[] {
  const groups: Record<string, ConversationMessage[]> = {};
  for (const m of messages) {
    const d = new Date(m.createdAt);
    const key = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return Object.entries(groups).map(([day, items]) => ({ day, items }));
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
