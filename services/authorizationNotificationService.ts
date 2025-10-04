import { getSupabase } from './supabaseClient';
import { AuthSession } from './authService';

export type VerificationSyncOptions = {
  verificationEmailSentAt?: string | null;
};

export const authorizationNotificationService = {
  isEnabled(): boolean {
    return !!getSupabase();
  },
  async syncProfileWithAuth(session: AuthSession, options: VerificationSyncOptions = {}): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const payload: Record<string, any> = {
      user_id: session.userId,
      email_verified: session.emailConfirmed,
      last_sign_in_at: session.lastSignInAt || new Date().toISOString(),
    };
    if (session.emailConfirmed) {
      payload.email_verified_at = new Date().toISOString();
    }
    if (options.verificationEmailSentAt) {
      payload.last_verification_email_sent = options.verificationEmailSentAt;
    }
    await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' });
  },
};
