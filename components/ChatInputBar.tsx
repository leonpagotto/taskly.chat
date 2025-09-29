import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, MicIcon, CloseIcon, AttachFileIcon } from './icons';
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

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, isLoading, currentView, activeProjectId, t, language, isMobileOverlay = false, initialMode = null, onClose }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isSpeechSupported = !!SpeechRecognitionAPI;

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
        } else if (initialMode === 'voice') {
            handleMicClick();
        }
    }
  }, [isMobileOverlay, initialMode]);

  const handleSend = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = window.innerHeight * 0.4;
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
      }
    }
  }, [input]);

  const getPlaceholder = () => {
    if (isListening) return "Listening...";
    if (isMobileOverlay) return "Ask or type command...";
    if (activeProjectId) return "Start a new chat in this project...";
    switch (currentView) {
      case 'dashboard': return "Ask anything, or create a task...";
      case 'lists': return "e.g., Add 'Buy milk' to Groceries";
      case 'habits': return "e.g., Create a habit for daily reading";
      default: return "Ask me anything...";
    }
  };
  
  return (
    <>
      <div className={isMobileOverlay 
        ? "fixed bottom-0 left-0 right-0 z-50 p-2 bg-gray-100 dark:bg-gray-800 animate-slide-in-up" 
        : "p-4 bg-gray-100 dark:bg-gray-800 flex-shrink-0"
      }>
        <div style={{ minHeight: '52px' }} className="bg-gray-200 dark:bg-gray-700 rounded-[26px] flex items-center py-1 px-2">
          {isMobileOverlay && (
            <button onClick={onClose} className="w-10 h-10 rounded-[var(--radius-button)] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center mr-1">
              <CloseIcon className="text-2xl" />
            </button>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="chat-input-textarea flex-1 bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none px-2 py-2 max-h-[40vh] overflow-y-auto mr-1 placeholder:truncate"
            rows={1}
            disabled={isLoading}
          />
          <button className="w-10 h-10 rounded-[var(--radius-button)] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
              <AttachFileIcon className="text-2xl" />
          </button>
          {isSpeechSupported && (
            <button 
              onClick={handleMicClick} 
              className={`w-10 h-10 rounded-[var(--radius-button)] transition-colors flex items-center justify-center ${isListening ? 'text-red-500 bg-red-500/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              <MicIcon className="text-2xl" />
            </button>
          )}
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading} 
            className="w-10 h-10 flex-shrink-0 text-white bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 rounded-[var(--radius-button)] disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:shadow-lg ml-1"
          >
            <SendIcon className="text-2xl" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatInputBar;