"use client";
import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';

interface ToastItem { id: string; message: string; type?: 'success' | 'error' | 'info'; ttl: number }

interface ToastContextValue {
  push: (message: string, opts?: { type?: ToastItem['type']; ttl?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, any>>({});

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback((message: string, opts?: { type?: ToastItem['type']; ttl?: number }) => {
    const id = crypto.randomUUID();
    const toast: ToastItem = { id, message, type: opts?.type || 'info', ttl: opts?.ttl || 3200 };
    setToasts(prev => [...prev, toast]);
    timers.current[id] = setTimeout(() => remove(id), toast.ttl);
  }, [remove]);

  useEffect(() => () => { // cleanup on unmount
    Object.values(timers.current).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map(t => {
          const color = t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-700';
          return (
            <div key={t.id} className={`${color} text-white text-sm px-3 py-2 rounded shadow flex items-start gap-2 min-w-[200px]`}>              
              <div className="flex-1">{t.message}</div>
              <button onClick={() => remove(t.id)} className="text-white/70 hover:text-white text-xs">×</button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
