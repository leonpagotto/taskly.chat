import { getSupabase } from './supabaseClient';
import { ProjectInvite, ProjectRole } from '../types';

const getEnv = (key: string): string | undefined => {
  const env = (import.meta as any).env || {};
  return env[key];
};

const PROJECT_INVITE_ENDPOINT = getEnv('VITE_PROJECT_INVITE_WEBHOOK_URL');
const PROJECT_INVITE_FUNCTION = getEnv('VITE_PROJECT_INVITE_FUNCTION') || 'project-share-invite';

export type SendProjectInvitePayload = {
  projectId: string;
  projectName: string;
  inviteeEmail: string;
  role: ProjectRole;
  invitedById: string;
  invitedByEmail?: string | null;
  invitedByName?: string | null;
  message?: string;
  token: string;
};

export type UpdateInviteStatusPayload = {
  inviteId: string;
  projectId: string;
  projectName: string;
  status: ProjectInvite['status'];
  inviteeEmail: string;
};

const postJson = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to contact invite endpoint');
  }
};

export const projectSharingService = {
  async sendInvite(payload: SendProjectInvitePayload): Promise<void> {
    const body = {
      ...payload,
      createdAt: new Date().toISOString(),
    };

    if (PROJECT_INVITE_ENDPOINT) {
      await postJson(PROJECT_INVITE_ENDPOINT, body);
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.functions.invoke(PROJECT_INVITE_FUNCTION, { body });
      if (error) throw new Error(error.message || 'Failed to deliver project invite');
      return;
    }

    throw new Error('Project invite service is not configured. Set VITE_PROJECT_INVITE_WEBHOOK_URL or enable Supabase edge function.');
  },

  async notifyInviteStatus(payload: UpdateInviteStatusPayload): Promise<void> {
    const body = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    if (PROJECT_INVITE_ENDPOINT) {
      await postJson(PROJECT_INVITE_ENDPOINT, body);
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.functions.invoke(`${PROJECT_INVITE_FUNCTION}-status`, { body });
      if (error) throw new Error(error.message || 'Failed to update invite status');
      return;
    }

    throw new Error('Project invite status endpoint not configured.');
  },
};
