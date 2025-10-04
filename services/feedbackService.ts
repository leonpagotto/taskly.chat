import { getSupabase } from './supabaseClient';
import { FeedbackSubmission, FeedbackMetadata } from '../types';

const getEnv = (key: string): string | undefined => {
  const env = (import.meta as any).env || {};
  return env[key];
};

const FEEDBACK_ENDPOINT = getEnv('VITE_FEEDBACK_WEBHOOK_URL');
const FEEDBACK_FUNCTION = getEnv('VITE_FEEDBACK_FUNCTION') || 'send-feedback';
const APP_VERSION = getEnv('VITE_APP_VERSION') || (getEnv('npm_package_version') as string) || '0.0.0';

const buildMetadata = (base?: FeedbackMetadata): FeedbackMetadata => {
  const merged: FeedbackMetadata = {
    submittedAt: new Date().toISOString(),
    locale: typeof navigator !== 'undefined' ? navigator.language : undefined,
    timezone: Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    platform: typeof navigator !== 'undefined' ? navigator.platform : undefined,
    appVersion: APP_VERSION,
    ...base,
  };
  return merged;
};

export const feedbackService = {
  async submitFeedback(payload: FeedbackSubmission): Promise<void> {
    const body: FeedbackSubmission = {
      ...payload,
      metadata: buildMetadata(payload.metadata),
    };

    if (FEEDBACK_ENDPOINT) {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Failed to submit feedback');
      }
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.functions.invoke(FEEDBACK_FUNCTION, { body });
      if (error) throw new Error(error.message || 'Unable to submit feedback');
      return;
    }

    throw new Error('Feedback service is not configured. Set VITE_FEEDBACK_WEBHOOK_URL or enable Supabase edge function.');
  },
};
