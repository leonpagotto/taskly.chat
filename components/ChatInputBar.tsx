import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendIcon, PaperclipIcon, MicIcon, CloseIcon, AttachFileIcon } from './icons';
import { parseRequestFromPrompt, isAIAvailable } from '../services/geminiService';
import { AppView, AppLanguage } from '../types';

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
  onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
  onend: (this: SpeechRecognition, ev: Event) => any;
}
declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition };
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }
}

const SpeechRecognitionAPI = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

interface ChatInputBarProps {
  onSendMessage: (messageText: string) => void;
  isLoading: boolean;
  currentView: AppView;
  activeProjectId: string | null;
  t: (key: string) => string;
  language: AppLanguage;
  isMobileOverlay?: boolean;
  initialMode?: 'text' | 'voice' | null;
  onClose?: () => void;
  mode?: 'chat' | 'request';
  onCreateRequestFromInput?: (text: string) => Promise<void> | void;
}

const getLangCodeForSpeech = (lang: AppLanguage): string => {
    switch(lang) {
        case 'pt': return 'pt-BR';
        case 'nl': return 'nl-NL';
        case 'en': return 'en-US';
        case 'auto':
        default:
            // Use browser's language if auto, fallback to en-US
            return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    }
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, isLoading, currentView, activeProjectId, t, language, isMobileOverlay = false, initialMode = null, onClose, mode = 'chat', onCreateRequestFromInput }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  
  const isSpeechSupported = !!SpeechRecognitionAPI;
  const isRequestMode = mode === 'request';
  const effectiveLoading = isRequestMode ? requestLoading : isLoading;
  const iconButtonBase = "w-10 h-10 rounded-[var(--radius-button)] flex items-center justify-center outline-none focus:outline-none focus-visible:outline-none transition-all hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  const handleMicClick = () => {
    if (!isSpeechSupported) return;
    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
    } else {
      setInput(''); // Clear input on new recording
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  useEffect(() => {
    if (!isSpeechSupported || !SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLangCodeForSpeech(language);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setInput(transcript);

      // FIX: Use window.setTimeout to ensure the return type is a number, resolving the TypeScript error.
      silenceTimerRef.current = window.setTimeout(() => {
        recognitionRef.current?.stop();
      }, 3000); // 3 seconds of silence
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // The 'no-speech' error is a common case when the user doesn't speak.
      // We can handle it gracefully without logging it as a critical error.
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSpeechSupported, language]);
  
  useEffect(() => {
    if (isMobileOverlay) {
        if (initialMode === 'text') {
            setTimeout(() => textareaRef.current?.focus(), 150);
        } else if (initialMode === 'voice' && !isRequestMode) {
            handleMicClick();
        }
    }
  }, [isMobileOverlay, initialMode, isRequestMode]);

  const createRequestDraft = useCallback(async (draftText: string) => {
    const text = draftText.trim();
    if (!text || requestLoading) return;
    setRequestLoading(true);
    try {
      if (onCreateRequestFromInput) {
        await onCreateRequestFromInput(text);
      } else {
        if (!isAIAvailable()) {
          window.dispatchEvent(new CustomEvent('taskly.toast', { detail: 'AI not configured. Using a simple fallback to seed your request.' }));
        }
        const draft = await parseRequestFromPrompt(text);
        window.dispatchEvent(new CustomEvent('taskly.newRequest', { detail: draft }));
      }
      setInput('');
    } catch (e) {
      console.warn('Failed to parse request draft', e);
    } finally {
      setRequestLoading(false);
    }
  }, [onCreateRequestFromInput, requestLoading]);

  // Listen for global quick prompts to prefill or auto-send
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ text?: string; send?: boolean }>;
      const text = ce.detail?.text || '';
      const send = !!ce.detail?.send;
      if (!text) return;

      // Stop listening if currently recording
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setInput(text);
      // Focus the input so the user can edit when not auto-sending
      if (!send) {
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
      if (send) {
        if (isRequestMode) {
          createRequestDraft(text);
        } else if (!isLoading) {
          onSendMessage(text.trim());
          setInput('');
        }
      }
    };
    window.addEventListener('taskly.quickPrompt', handler as EventListener);
    return () => window.removeEventListener('taskly.quickPrompt', handler as EventListener);
  }, [isListening, isLoading, onSendMessage, isRequestMode, createRequestDraft]);

  const handleSend = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const text = input.trim();
    if (!text) return;
    if (isRequestMode) {
      createRequestDraft(text);
      return;
    }
    // Slash command to create a Request from the message: /request ... or /new-request ...
    if (text.toLowerCase().startsWith('/request ') || text.toLowerCase().startsWith('/new-request ')) {
      const payload = text.replace(/^\/(new-)?request\s+/i, '');
      if (payload) {
        // Fire and forget; not awaiting here for responsiveness
        if (!isAIAvailable()) {
          window.dispatchEvent(new CustomEvent('taskly.toast', { detail: 'AI not configured. Using a simple fallback to seed your request.' }));
        }
        parseRequestFromPrompt(payload)
          .then(draft => {
            window.dispatchEvent(new CustomEvent('taskly.newRequest', { detail: draft }));
          })
          .catch(err => console.warn('Failed to parse request draft', err));
        setInput('');
        return;
      }
    }
    onSendMessage(text);
    setInput('');
  };

  const handleCreateRequestFromInput = async () => {
    createRequestDraft(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isRequestMode) {
        createRequestDraft(input);
        return;
      }
      handleSend();
    }
  };
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const minHeight = 56; // ensure a full line displays before scrolling appears
    textarea.style.minHeight = `${minHeight}px`;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = window.innerHeight * 0.4;
    const nextHeight = Math.max(scrollHeight, minHeight);
    textarea.style.height = `${Math.min(nextHeight, maxHeight)}px`;
    textarea.style.overflowY = nextHeight >= maxHeight ? 'auto' : 'hidden';
  }, [input]);

  const getPlaceholder = () => {
  if (isListening) return "Listening...";
  if (isRequestMode) return "Paste a request in one message…";
    if (isMobileOverlay) return "Ask or type command...";
    if (activeProjectId) return "Start a new chat in this project...";
    switch (currentView) {
      case 'dashboard': return "Ask anything, or create a task...";
      case 'lists': return "e.g., Add 'Buy milk' to Groceries";
      case 'habits': return "e.g., Create a habit for daily reading";
      default: return "Ask me anything...";
    }
  };
  const wrapperClasses = isMobileOverlay
    ? "fixed bottom-0 left-0 right-0 z-50 p-3 resend-glass-panel shadow-xl backdrop-blur-xl animate-slide-in-up"
    : "p-4 resend-glass-panel shadow-xl flex-shrink-0 backdrop-blur-md";
  
  return (
    <>
      <div className={wrapperClasses} data-elevated={true}>
        <div className="mx-auto w-full max-w-[52rem]">
        <div style={{ minHeight: '52px' }} className="resend-glass-panel flex items-center py-1 px-2 rounded-[14px] shadow-lg" data-elevated={true}>
          {isMobileOverlay && (
            <button onClick={onClose} className={`${iconButtonBase} resend-secondary mr-1`}>
              <CloseIcon className="text-2xl" />
            </button>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="chat-input-textarea flex-1 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none resize-none px-2 py-2 max-h-[40vh] mr-1 placeholder:truncate overflow-y-hidden min-h-[56px]"
            rows={1}
            disabled={effectiveLoading}
          />
          {!isRequestMode && (
            <>
              <button className={`${iconButtonBase} resend-secondary`}>
                <AttachFileIcon className="text-2xl" />
              </button>
              {isSpeechSupported && (
                <button 
                  onClick={handleMicClick} 
                  className={isListening 
                    ? `${iconButtonBase} transition-colors text-red-400 bg-red-600/20`
                    : `${iconButtonBase} resend-secondary transition-colors`}
                >
                  <MicIcon className="text-2xl" />
                </button>
              )}
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading} 
                className="w-10 h-10 flex-shrink-0 text-white bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] rounded-[var(--radius-button)] disabled:bg-gray-500/40 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:shadow-lg hover:-translate-y-[1px] ml-1 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <SendIcon className="text-2xl" />
              </button>
            </>
          )}
          {isRequestMode && (
            <button
              onClick={handleCreateRequestFromInput}
              disabled={!input.trim() || requestLoading}
              className="ml-2 flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-[1px] transition-all"
            >
              {requestLoading ? 'Drafting…' : 'AI Draft'}
            </button>
          )}
          {/* Quick command button removed per request */}
        </div>
        </div>
      </div>
    </>
  );
};

export default ChatInputBar;