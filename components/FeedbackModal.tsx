import React, { useEffect, useMemo, useRef, useState } from 'react';
import ModalOverlay from './ModalOverlay';
import { CloseIcon, SendIcon } from './icons';
import { FeedbackType } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  defaultEmail?: string;
  defaultType?: FeedbackType;
  onClose: () => void;
  onSubmit: (payload: { email?: string; type: FeedbackType; message: string }) => Promise<void>;
}

const feedbackTypeOptions: { value: FeedbackType; label: string; description: string }[] = [
  { value: 'bug', label: 'Bug report', description: 'Something is broken or not working the way it should.' },
  { value: 'feature', label: 'Feature request', description: 'Suggest a new capability or improvement.' },
  { value: 'general', label: 'General feedback', description: 'Share praise, ideas, or anything else.' },
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, defaultEmail, defaultType = 'general', onClose, onSubmit }) => {
  const [email, setEmail] = useState(defaultEmail || '');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(defaultType);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [didSucceed, setDidSucceed] = useState(false);
  const wasOpenRef = useRef(false);

  const isEmailValid = useMemo(() => {
    if (!email.trim()) return true;
    return /.+@.+\..+/.test(email.trim());
  }, [email]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setEmail(defaultEmail || '');
      setFeedbackType(defaultType);
      setMessage('');
      setError(null);
      setDidSucceed(false);
      wasOpenRef.current = true;
    }
    if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
    }
  }, [isOpen, defaultEmail, defaultType]);

  if (!isOpen) {
    return null;
  }

  const resetFields = () => {
    setEmail(defaultEmail || '');
    setFeedbackType(defaultType);
    setMessage('');
    setError(null);
    setDidSucceed(false);
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!feedbackType) {
      setError('Please choose a feedback category.');
      return;
    }

    if (!message.trim()) {
      setError('Tell us a bit more so we can help.');
      return;
    }

    if (!isEmailValid) {
      setError('That email address looks incorrect.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        email: email.trim() || undefined,
        type: feedbackType,
        message: message.trim(),
      });
      setDidSucceed(true);
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to send feedback right now. Please try again later.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeOption = feedbackTypeOptions.find((option) => option.value === feedbackType);

  return (
    <ModalOverlay onClick={handleClose} className="z-[90] flex items-center justify-center p-4">
      <div
        onClick={(event) => event.stopPropagation()}
        className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Share your feedback</h2>
            <p className="text-xs text-gray-400 mt-1">Help us improve Taskly.chat — we read every note.</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white rounded-full p-2 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="feedback-email" className="text-sm font-medium text-gray-300">
              Email <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={`w-full bg-gray-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)] ${
                !isEmailValid ? 'ring-2 ring-red-500' : ''
              }`}
              autoComplete="email"
            />
            <p className="text-xs text-gray-500">We only use this if we need more detail about your report.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              What kind of feedback is this? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {feedbackTypeOptions.map((option) => {
                const isActive = feedbackType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFeedbackType(option.value)}
                    className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                      isActive
                        ? 'border-[var(--color-primary-500)] bg-white/10 text-white'
                        : 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800/80'
                    }`}
                  >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback-message" className="text-sm font-medium text-gray-300">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback-message"
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={2000}
              placeholder={
                activeOption ? `Add more detail about your ${activeOption.label.toLowerCase()}.` : "Tell us what’s on your mind."
              }
              className="w-full bg-gray-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>We’ll include your device and browser details automatically.</span>
              <span>{message.trim().length} / 2000</span>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-200">{error}</div>
          )}

          {didSucceed && !error && (
            <div className="px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-sm text-emerald-200">
              Thank you! We received your feedback.
            </div>
          )}

          <footer className="pt-6 border-t border-gray-800 mt-6 flex items-center justify-between">
            <p className="text-xs text-gray-500 max-w-xs">
              We’ll never share your message outside Taskly, and we only use your email if we need more detail.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium text-gray-300 border border-gray-700 hover:border-gray-600 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 rounded-[var(--radius-button)] text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? 'Sending…' : (
                  <>
                    <SendIcon className="text-base" /> Submit feedback
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </ModalOverlay>
  );
};

export default FeedbackModal;
