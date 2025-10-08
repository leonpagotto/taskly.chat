import { Message } from '../types';

export type GuestTask = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

export type GuestChat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export type GuestSessionState = {
  chats: GuestChat[];
  activeChatId: string | null;
  tasks: GuestTask[];
};

const STORAGE_KEY = 'taskly.guest.session.v1';

const defaultState: GuestSessionState = {
  chats: [],
  activeChatId: null,
  tasks: [],
};

export const guestSessionService = {
  load(): GuestSessionState {
    if (typeof window === 'undefined') return { ...defaultState };
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw) as GuestSessionState;
      if (!parsed.chats || !Array.isArray(parsed.chats)) return { ...defaultState };
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) return { ...defaultState };
      return {
        chats: parsed.chats,
        activeChatId: parsed.activeChatId ?? parsed.chats[0]?.id ?? null,
        tasks: parsed.tasks,
      };
    } catch {
      return { ...defaultState };
    }
  },
  save(state: GuestSessionState) {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore session storage failures
    }
  },
  clear() {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
