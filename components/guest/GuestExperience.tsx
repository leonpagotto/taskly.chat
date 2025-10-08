import React, { useEffect, useMemo, useState } from 'react';
import { AddIcon, CloseIcon } from '../icons';
import { Message, Sender, UserPreferences } from '../../types';
import { parseAIResponse } from '../../services/geminiService';
import { guestSessionService, GuestChat, GuestTask } from '../../services/guestSessionService';

const MAX_GUEST_TASKS = 5;

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}-${Date.now()}`;
};

const guestPreferences: UserPreferences = {
  personality: 'smart',
  nickname: 'Guest',
  occupation: '',
  personalNotes: '',
  useMemory: false,
  useHistory: true,
  allowWebSearch: false,
  theme: 'dark',
  colorTheme: 'blue',
  language: 'en',
  size: 'md',
  pulseWidgets: [],
  aiSnapshotVerbosity: 'concise',
  defaultView: 'dashboard',
  bottomNavItems: [],
};

type ActivePane = 'chat' | 'tasks';

type GuestExperienceProps = {
  onSignIn: () => void;
  onSignUp: () => void;
};

type ComposerState = {
  message: string;
  isSending: boolean;
};

type SignUpPromptState = {
  open: boolean;
  reason: 'tasks-limit' | 'conversion';
};

const createInitialChat = (): GuestChat => ({
  id: `guest-chat-${createId()}`,
  title: 'New Chat',
  messages: [
    {
  id: `msg-${createId()}`,
      sender: Sender.Model,
      text: 'Hi there! I\'m Taskly. Ask me anything or tell me what you need help with.',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const useGuestSession = () => {
  const [state, setState] = useState(() => {
    const stored = guestSessionService.load();
    if (!stored.chats.length) {
      const firstChat = createInitialChat();
      return {
        chats: [firstChat],
        activeChatId: firstChat.id,
        tasks: [],
      };
    }
    return stored;
  });

  useEffect(() => {
    guestSessionService.save(state);
  }, [state]);

  return [state, setState] as const;
};

const GuestExperience: React.FC<GuestExperienceProps> = ({ onSignIn, onSignUp }) => {
  const [session, setSession] = useGuestSession();
  const [activePane, setActivePane] = useState<ActivePane>('chat');
  const [composer, setComposer] = useState<ComposerState>({ message: '', isSending: false });
  const [promptState, setPromptState] = useState<SignUpPromptState>({ open: false, reason: 'tasks-limit' });

  const activeChat = useMemo(() => session.chats.find((chat) => chat.id === session.activeChatId) ?? session.chats[0], [session]);

  useEffect(() => {
    if (!session.activeChatId && session.chats.length) {
      setSession((prev) => ({ ...prev, activeChatId: prev.chats[0].id }));
    }
  }, [session.activeChatId, session.chats.length, setSession]);

  const updateChat = (chatId: string, updater: (chat: GuestChat) => GuestChat) => {
    setSession((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) => (chat.id === chatId ? updater(chat) : chat)),
    }));
  };

  const handleNewChat = () => {
    const chat = createInitialChat();
    setSession((prev) => ({
      ...prev,
      chats: [chat, ...prev.chats],
      activeChatId: chat.id,
    }));
    setActivePane('chat');
  };

  const handleSelectChat = (chatId: string) => {
    setSession((prev) => ({ ...prev, activeChatId: chatId }));
    setActivePane('chat');
  };

  const handleSendMessage = async () => {
    if (!activeChat || !composer.message.trim() || composer.isSending) return;
    const userMessage: Message = {
      id: `msg-${createId()}`,
      sender: Sender.User,
      text: composer.message.trim(),
    };

    setComposer({ message: '', isSending: true });
    updateChat(activeChat.id, (chat) => {
      const updatedMessages = [...chat.messages, userMessage];
      const title = chat.title === 'New Chat' ? userMessage.text.slice(0, 30) || 'New Chat' : chat.title;
      return {
        ...chat,
        title,
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
      };
    });

    try {
      const response = await parseAIResponse(
        [...(activeChat?.messages || []), userMessage],
        userMessage.text,
        'dashboard',
        guestPreferences,
        undefined,
        undefined,
        undefined
      );

      const modelMessage: Message = {
        id: `msg-${createId()}`,
        sender: Sender.Model,
        text: response.text,
        suggestions:
          response.action?.type === 'SUGGEST_TASKS'
            ? (response.action.payload?.items || []).map((item: any) => ({
                text: item?.text ?? '',
                dueDate: item?.dueDate,
                isApproved: false,
              }))
            : undefined,
      };

      updateChat(activeChat.id, (chat) => ({
        ...chat,
        messages: [...chat.messages, modelMessage],
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      const fallback: Message = {
        id: `msg-${createId()}`,
        sender: Sender.Model,
        text: error instanceof Error ? error.message : 'I\'m sorry, something went wrong. Please try again.',
      };
      updateChat(activeChat.id, (chat) => ({
        ...chat,
        messages: [...chat.messages, fallback],
        updatedAt: new Date().toISOString(),
      }));
    } finally {
      setComposer({ message: '', isSending: false });
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddTask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (session.tasks.length >= MAX_GUEST_TASKS) {
      setPromptState({ open: true, reason: 'tasks-limit' });
      setActivePane('tasks');
      return;
    }
    const task: GuestTask = {
      id: `guest-task-${createId()}`,
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setSession((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const handleToggleTask = (taskId: string) => {
    setSession((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setSession((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  };

  const handleQuickTaskFromChat = (text: string) => {
    handleAddTask(text);
    setActivePane('tasks');
  };

  const renderChatMessages = () => (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      {activeChat?.messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === Sender.User ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-2xl rounded-3xl px-5 py-4 shadow-md transition-colors ${
              message.sender === Sender.User
                ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white'
                : 'bg-gray-800 text-gray-100'
            }`}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-gray-200">
                <p className="font-semibold uppercase tracking-wide text-gray-300">Suggested tasks</p>
                <ul className="mt-2 space-y-2">
                  {message.suggestions.map((item, index) => (
                    <li key={`${message.id}-suggestion-${index}`} className="rounded-lg bg-black/40 px-3 py-2 text-left text-[11px] leading-snug text-gray-200/90">
                      {item.text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const firstItem = message.suggestions?.[0]?.text;
                    if (firstItem) handleQuickTaskFromChat(firstItem);
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Save first task
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      <div className="h-20" />
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-[#0b0d17] text-white">
      <aside className="hidden w-[280px] flex-col border-r border-white/5 bg-black/40 p-4 md:flex">
        <button
          onClick={handleNewChat}
          className="mb-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New chat
        </button>
        <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">Recent chats</p>
            <ul className="space-y-1">
              {session.chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    onClick={() => handleSelectChat(chat.id)}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                      chat.id === activeChat?.id
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{chat.title || 'Untitled chat'}</span>
                      <span className="text-[11px] text-gray-500">{new Date(chat.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="mt-6 space-y-3 text-xs text-gray-400">
          <button
            onClick={() => setActivePane('tasks')}
            className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition ${
              activePane === 'tasks' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-base">checklist</span>
              Tasks ({session.tasks.length}/{MAX_GUEST_TASKS})
            </span>
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
          <a
            href="/about"
            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <span className="material-symbols-outlined text-base">info</span>
            About Taskly
          </a>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-3">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setActivePane((prev) => (prev === 'chat' ? 'tasks' : 'chat'))}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white"
            >
              <span className="material-symbols-outlined text-base">menu</span>
              {activePane === 'chat' ? 'Show tasks' : 'Back to chat'}
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-400">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
              <span className="material-symbols-outlined text-base text-green-400">bolt</span>
              Guest mode active
            </span>
            <span className="text-gray-500">•</span>
            <span>Try Taskly without creating an account</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPromptState({ open: true, reason: 'conversion' })}
              className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10 sm:flex"
            >
              <span className="material-symbols-outlined text-base">spark</span>
              Save your progress
            </button>
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] px-4 py-2 text-sm font-semibold text-white shadow-lg"
            >
              Login / Sign Up
            </button>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col">
          {activePane === 'chat' ? (
            <>
              {renderChatMessages()}
              <div className="border-t border-white/5 bg-black/50 px-4 py-4">
                <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg">
                  <textarea
                    value={composer.message}
                    onChange={(event) => setComposer({ ...composer, message: event.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Taskly anything..."
                    rows={3}
                    className="w-full resize-none rounded-2xl bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <p>Press ⌘ + Enter to send</p>
                    <button
                      onClick={handleSendMessage}
                      disabled={composer.isSending || !composer.message.trim()}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      {composer.isSending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <section className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
              <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Guest tasks</h2>
                  <p className="text-sm text-gray-400">Create up to five tasks to try Taskly. Sign up to keep them forever.</p>
                </div>
                <button
                  onClick={() => setPromptState({ open: true, reason: 'conversion' })}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-base">cloud_upload</span>
                  Sign up to save tasks
                </button>
              </header>

              <TaskComposer
                tasks={session.tasks}
                onAddTask={handleAddTask}
                disabled={session.tasks.length >= MAX_GUEST_TASKS}
              />

              <ul className="space-y-3">
                {session.tasks.map((task) => (
                  <li key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs transition ${
                          task.completed
                            ? 'border-green-400 bg-green-500/20 text-green-200'
                            : 'border-white/20 text-gray-300 hover:border-white/40'
                        }`}
                        aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                      >
                        {task.completed ? <span className="material-symbols-outlined text-lg">check</span> : ''}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{task.text}</p>
                        <p className="mt-1 text-[11px] text-gray-500">Created {new Date(task.createdAt).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="inline-flex items-center rounded-full bg-white/5 p-2 text-xs text-gray-400 hover:bg-white/10 hover:text-red-300"
                        aria-label="Delete task"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </li>
                ))}

                {session.tasks.length === 0 && (
                  <li className="rounded-3xl border border-dashed border-white/10 bg-transparent p-8 text-center text-sm text-gray-500">
                    No tasks yet. Ask Taskly to plan your day or click “New task” to get started.
                  </li>
                )}
              </ul>
            </section>
          )}
        </main>
      </div>

      {promptState.open && (
        <SignUpPrompt
          reason={promptState.reason}
          onClose={() => setPromptState((prev) => ({ ...prev, open: false }))}
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          currentTaskCount={session.tasks.length}
        />
      )}
    </div>
  );
};

export default GuestExperience;

type TaskComposerProps = {
  tasks: GuestTask[];
  onAddTask: (text: string) => void;
  disabled?: boolean;
};

const TaskComposer: React.FC<TaskComposerProps> = ({ onAddTask, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    onAddTask(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-gray-400">Quick task</span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="e.g., Plan sprint retro deck"
          disabled={disabled}
          className="rounded-2xl bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-500"
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <p>{disabled ? 'Limit reached — sign up to unlock unlimited tasks.' : 'Add up to five tasks in guest mode.'}</p>
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
        >
          <AddIcon />
          {disabled ? 'Sign up to add more' : 'Add task'}
        </button>
      </div>
    </form>
  );
};

type SignUpPromptProps = {
  onClose: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  currentTaskCount: number;
  reason: SignUpPromptState['reason'];
};

const SignUpPrompt: React.FC<SignUpPromptProps> = ({ onClose, onSignIn, onSignUp, currentTaskCount, reason }) => {
  const title = reason === 'tasks-limit' ? 'Create a free account to add more tasks' : 'Save your progress';
  const description =
    reason === 'tasks-limit'
      ? `Guest mode lets you try up to ${MAX_GUEST_TASKS} tasks. Sign up to unlock unlimited tasks, habits, and projects.`
      : 'Turn this trial workspace into your personal Taskly hub. Your chats and tasks will move with you.';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6 shadow-2xl">
        <header className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-purple-200">
            <span className="material-symbols-outlined text-base text-purple-300">star</span>
            Taskly Pro preview
          </span>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </header>

        <section className="mt-6 space-y-3 rounded-2xl bg-black/40 p-4 text-sm text-gray-300">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-lg text-green-300">check_circle</span>
            <span>Keep all {currentTaskCount} guest tasks</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-lg text-green-300">check_circle</span>
            <span>Unlimited chats and AI history</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-lg text-green-300">check_circle</span>
            <span>Access projects, Kanban, requests, and more</span>
          </div>
        </section>

        <footer className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onSignIn}
            className="flex-1 rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] px-4 py-3 text-sm font-semibold text-white shadow-lg"
          >
            Login / Sign up free
          </button>
          <button
            onClick={onSignUp}
            className="flex-1 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10"
          >
            Upgrade to Pro
          </button>
        </footer>

        <button
          onClick={onClose}
          className="mt-4 flex w-full items-center justify-center gap-2 text-xs text-gray-500 transition hover:text-gray-300"
        >
          <CloseIcon className="text-base" />
          Keep exploring in guest mode
        </button>
      </div>
    </div>
  );
};
