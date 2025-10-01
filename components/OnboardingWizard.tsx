import React, { useState } from 'react';
import { CloseIcon } from './icons';
import ModalOverlay from './ModalOverlay';
import { AppView, UserPreferences } from '../types';

export type OnboardingWizardProps = {
  isOpen: boolean;
  initial: UserPreferences;
  onClose: () => void;
  onComplete: (prefs: Partial<UserPreferences>) => void;
};

const steps = ['Welcome', 'Profile', 'Preferences', 'Finish'] as const;

type StepKey = typeof steps[number];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, initial, onClose, onComplete }) => {
  const [step, setStep] = useState<StepKey>('Welcome');
  const [nickname, setNickname] = useState(initial.nickname || '');
  const [contactEmail, setContactEmail] = useState(initial.contactEmail || '');
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl || '');
  const [theme, setTheme] = useState(initial.theme);
  const [colorTheme, setColorTheme] = useState(initial.colorTheme);
  const [defaultView, setDefaultView] = useState<AppView>(initial.defaultView || 'dashboard');

  if (!isOpen) return null;

  const go = (dir: -1 | 1) => {
    const idx = steps.indexOf(step);
    const next = Math.min(steps.length - 1, Math.max(0, idx + dir));
    setStep(steps[next]);
  };

  const finish = () => {
    onComplete({ nickname, contactEmail, avatarUrl, theme, colorTheme, defaultView, onboardingCompleted: true });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <div className="absolute inset-0 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        <div className="w-full max-w-2xl bg-gray-800 text-white rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[85vh]">
          <header className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Get started</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-[var(--radius-button)] hover:bg-gray-700 flex items-center justify-center" aria-label="Close"><CloseIcon /></button>
          </header>
          <main className="p-5 overflow-y-auto space-y-4">
            {step === 'Welcome' && (
              <div>
                <h3 className="text-base font-semibold">Welcome to Taskly</h3>
                <p className="text-sm text-gray-300">We’ll set up a few basics so you’re ready to go.</p>
              </div>
            )}
            {step === 'Profile' && (
              <div className="grid gap-3">
                <label className="text-sm">Display name</label>
                <input className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Your name" />
                <label className="text-sm">Contact email</label>
                <input className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="you@example.com" />
                <label className="text-sm">Avatar URL</label>
                <input className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
              </div>
            )}
            {step === 'Preferences' && (
              <div className="grid gap-3">
                <label className="text-sm">Theme</label>
                <select className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm" value={theme} onChange={e => setTheme(e.target.value as any)}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
                <label className="text-sm">Color</label>
                <select className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm" value={colorTheme} onChange={e => setColorTheme(e.target.value as any)}>
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="green">Green</option>
                  <option value="orange">Orange</option>
                </select>
                <label className="text-sm">Default view</label>
                <select className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm" value={defaultView} onChange={e => setDefaultView(e.target.value as AppView)}>
                  <option value="dashboard">Today</option>
                  <option value="lists">Tasks</option>
                  <option value="habits">Habits</option>
                  <option value="calendar">Calendar</option>
                  <option value="notes">Notes</option>
                  <option value="projects">Projects</option>
                </select>
              </div>
            )}
            {step === 'Finish' && (
              <div>
                <h3 className="text-base font-semibold">All set!</h3>
                <p className="text-sm text-gray-300">You can tweak anything later in Settings.</p>
              </div>
            )}
          </main>
          <footer className="p-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-xs text-gray-400">Step {steps.indexOf(step) + 1} of {steps.length}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => go(-1)} disabled={steps.indexOf(step)===0} className="px-3 py-2 rounded-md bg-gray-700 disabled:opacity-50">Back</button>
              {step !== 'Finish' ? (
                <button onClick={() => go(1)} className="px-4 py-2 rounded-md bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600">Next</button>
              ) : (
                <button onClick={finish} className="px-4 py-2 rounded-md bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600">Finish</button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default OnboardingWizard;
