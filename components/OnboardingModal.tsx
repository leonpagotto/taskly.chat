import React, { useMemo, useState } from 'react';
import ModalOverlay from './ModalOverlay';
import { CloseIcon, HelpOutlineIcon, DragPanIcon, SwipeIcon, MicIcon, CheckCircleIcon, CalendarAddOnIcon, NewTaskIcon, NewHabitIcon, SearchIcon } from './icons';

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TipRow: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700/40 transition-colors">
    <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700/60 text-gray-200 flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-white/95 truncate">{title}</p>
      <p className="text-sm text-gray-300/90 leading-snug">{desc}</p>
    </div>
  </div>
);

const CommandRow: React.FC<{ label: string; example: string }> = ({ label, example }) => (
  <div className="flex items-center justify-between gap-3 p-2 rounded-md bg-gray-800/70 border border-gray-700">
    <span className="text-sm text-gray-300">{label}</span>
    <code className="text-xs bg-gray-900/50 px-2 py-1 rounded text-gray-200 whitespace-nowrap">{example}</code>
  </div>
);

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const commands = useMemo(() => ([
    { label: 'Create a task', example: 'Create a task “Send the report” tomorrow 9am' },
    { label: 'Create a habit', example: 'Add a habit “Drink water” every day' },
    { label: 'New event', example: 'Create an event Friday 2–3pm “Sprint review”' },
    { label: 'Make a list', example: 'Make a packing list: passport; charger; headphones' },
    { label: 'Suggest tasks', example: 'Plan my product launch this month' },
    { label: 'Complete item', example: 'Mark “Buy milk” as done' },
    { label: 'Create note', example: 'Create a note “1:1 agenda” with bullets' },
  ]), []);

  const steps = useMemo(() => ([
    {
      key: 'welcome',
      title: 'Welcome to Taskly.Chat',
      desc: 'Your AI-powered workspace for tasks, projects, notes, and more. Let\'s explore what you can do.',
      bg: 'from-indigo-600 via-purple-600 to-pink-600',
      content: (
        <div className="space-y-3">
          <div className="text-sm text-white/90">Taskly.Chat combines powerful task management with AI assistance to help you stay organized and productive.</div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-xs font-semibold mb-1">📋 Tasks & Habits</div>
              <div className="text-xs text-white/80">Daily routines and to-dos</div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-xs font-semibold mb-1">📅 Calendar & Events</div>
              <div className="text-xs text-white/80">Schedule and track events</div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-xs font-semibold mb-1">📝 Notes & Stories</div>
              <div className="text-xs text-white/80">Capture ideas and documents</div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-xs font-semibold mb-1">🤖 AI Assistant</div>
              <div className="text-xs text-white/80">Smart help and automation</div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'features',
      title: 'Powerful features at your fingertips',
      desc: 'Everything you need to manage your work and personal life in one place.',
      bg: 'from-emerald-600 via-teal-600 to-cyan-600',
      content: (
        <div className="space-y-2">
          <TipRow icon={<CheckCircleIcon className="text-xl" />} title="Tasks & Checklists" desc="Create tasks with priorities, due dates, and recurring schedules." />
          <TipRow icon={<CalendarAddOnIcon className="text-xl" />} title="Calendar View" desc="See all your events and habits in monthly or weekly views." />
          <TipRow icon={<NewHabitIcon className="text-xl" />} title="Habits" desc="Build daily routines with streaks and completion tracking." />
          <TipRow icon={<DragPanIcon className="text-xl" />} title="Projects" desc="Organize work into projects with linked tasks, notes, and files." />
        </div>
      )
    },
    {
      key: 'ai-features',
      title: 'AI-powered assistance',
      desc: 'Chat with AI to create tasks, plan projects, and get things done faster.',
      bg: 'from-fuchsia-600 via-rose-600 to-orange-500',
      content: (
        <div className="space-y-3">
          <div className="grid gap-2">
            {commands.slice(0,5).map((c, i) => (
              <CommandRow key={i} label={c.label} example={c.example} />
            ))}
          </div>
          <p className="text-xs text-white/90">💡 Tip: I understand natural dates like "tomorrow", "next Monday", and time ranges like "2-3pm".</p>
        </div>
      )
    },
    {
      key: 'tips',
      title: 'Quick tips to get started',
      desc: 'A few gestures and shortcuts to help you work faster.',
      bg: 'from-sky-600 via-blue-600 to-violet-600',
      content: (
        <div className="grid sm:grid-cols-2 gap-2">
          <TipRow icon={<DragPanIcon className="text-xl" />} title="Drag to reorder" desc="Hold and drag items to change priority and order." />
          <TipRow icon={<SwipeIcon className="text-xl" />} title="Swipe on mobile" desc="Swipe right to set priority, left to edit or delete." />
          <TipRow icon={<MicIcon className="text-xl" />} title="Voice input" desc="Use your microphone to chat with AI hands-free." />
          <TipRow icon={<SearchIcon className="text-xl" />} title="Universal search" desc="Search across notes, tasks, events, files, and projects." />
        </div>
      )
    },
  ]), [commands]);

  const total = steps.length;
  const clampStep = (n: number) => Math.max(0, Math.min(total - 1, n));
  const goNext = () => setStep(s => clampStep(s + 1));
  const goPrev = () => setStep(s => clampStep(s - 1));

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-2xl bg-gray-800 text-white rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[85vh]" role="dialog" aria-labelledby="onb-title" aria-describedby="onb-desc" aria-modal="true">
          <header className="p-4 sm:p-5 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpOutlineIcon className="text-2xl" />
              <h2 id="onb-title" className="text-lg font-semibold">Getting Started</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-[var(--radius-button)] hover:bg-gray-700 flex items-center justify-center" aria-label="Close">
              <CloseIcon />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-0">
            <section className={`p-5 sm:p-6 bg-gradient-to-br ${steps[step].bg}`}>
              <h3 className="text-base sm:text-lg font-semibold" id="onb-desc">{steps[step].title}</h3>
              <p className="text-sm text-white/90 mt-1 max-w-prose">{steps[step].desc}</p>
              <div className="mt-4">
                {steps[step].content}
              </div>
            </section>

            {/* Secondary content area with commands/actions on last step */}
            {step === total - 1 && (
              <section className="p-5 sm:p-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Handy actions</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-700/60 text-xs"><NewTaskIcon className="text-base" /> New Task</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-700/60 text-xs"><CalendarAddOnIcon className="text-base" /> New Event</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-700/60 text-xs"><NewHabitIcon className="text-base" /> New Habit</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-700/60 text-xs"><MicIcon className="text-base" /> Voice input</span>
                </div>
                <div className="grid gap-2">
                  {commands.map((c, i) => (
                    <CommandRow key={i} label={c.label} example={c.example} />
                  ))}
                </div>
              </section>
            )}
          </main>

          <footer className="p-3 sm:p-4 border-t border-gray-700 bg-gray-900/30 sticky bottom-0">
            <div className="flex items-center justify-between gap-3">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5" aria-label="Progress" role="tablist">
                {steps.map((_, i) => (
                  <button key={i} onClick={() => setStep(i)} aria-pressed={step===i} className={`w-2.5 h-2.5 rounded-full ${step===i ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Go to step ${i+1}`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={goPrev} disabled={step===0} className="px-3 py-2 rounded-[var(--radius-button)] bg-gray-700 disabled:opacity-50 hover:bg-gray-600 text-sm font-semibold">Back</button>
                {step < total - 1 ? (
                  <button onClick={goNext} className="px-4 py-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-sm font-semibold">Next</button>
                ) : (
                  <button onClick={onClose} className="px-4 py-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-sm font-semibold">Start using Taskly</button>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default OnboardingModal;
