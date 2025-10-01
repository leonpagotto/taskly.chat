import { getSupabase } from './supabaseClient';
import { Project, Conversation, Checklist, Habit, Note, ProjectFile, Event, Story, UserCategory, UserPreferences, Request } from '../types';
import { relationalDb } from './relationalDatabaseService';

export type FullState = {
  projects: Project[];
  conversations: Conversation[]; // not persisted yet in relational schema
  checklists: Checklist[];
  habits: Habit[];
  events: Event[];
  stories: Story[];
  requests: Request[];
  userCategories: UserCategory[];
  notes: Note[];
  projectFiles: ProjectFile[];
  preferences?: UserPreferences;
};

export const migrateToRelational = async (state: FullState): Promise<{ ok: boolean; message?: string }> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: 'Supabase not configured' };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, message: 'Not signed in' };

  try {
    // Preferences
    if (state.preferences) {
      await relationalDb.savePreferences(state.preferences);
    }
    // Upsert categories first
    for (const c of state.userCategories) {
      await relationalDb.upsertCategory({ id: c.id, name: c.name, icon: c.icon, color: c.color });
    }
    // Projects
    for (const p of state.projects) {
      await relationalDb.upsertProject({ id: p.id, name: p.name, description: p.description, categoryId: p.categoryId, instructions: p.instructions, icon: p.icon, color: p.color });
    }
    // Checklists (with tasks + completion history)
    for (const cl of state.checklists) {
      await relationalDb.upsertChecklist(cl);
    }
    // Habits
    for (const h of state.habits) {
      await relationalDb.upsertHabit({ ...h, completionHistory: h.completionHistory });
    }
    // Events
    for (const e of state.events) {
      await relationalDb.upsertEvent(e);
    }
    // Notes
    for (const n of state.notes) {
      await relationalDb.upsertNote({ id: n.id, name: n.name, content: n.content, projectId: n.projectId, categoryId: n.categoryId });
    }
    // Files
    for (const f of state.projectFiles) {
      await relationalDb.upsertFile(f);
    }
    // Stories
    for (const s of state.stories) {
      await relationalDb.upsertStory({ id: s.id, title: s.title, description: s.description, projectId: s.projectId, categoryId: s.categoryId, status: s.status, acceptanceCriteria: s.acceptanceCriteria, estimatePoints: s.estimatePoints, estimateTime: s.estimateTime, linkedTaskIds: s.linkedTaskIds, assigneeUserId: s.assigneeUserId, assigneeName: s.assigneeName, requesterUserId: s.requesterUserId, requesterName: s.requesterName });
    }

    // Requests
    for (const r of state.requests || []) {
      await relationalDb.upsertRequest({ id: r.id, product: r.product, requester: r.requester, problem: r.problem, outcome: r.outcome, valueProposition: r.valueProposition, affectedUsers: r.affectedUsers, priority: r.priority, desiredStartDate: r.desiredStartDate, desiredEndDate: r.desiredEndDate, details: r.details, attachments: r.attachments, status: r.status, linkedTaskIds: r.linkedTaskIds, requestedExpertise: r.requestedExpertise });
      // Note: if a local request updates log exists in future, add migration here using relationalDb.addRequestUpdate
    }

    // Conversations & messages
    for (const c of state.conversations) {
      await relationalDb.upsertConversation({ id: c.id, name: c.name, projectId: c.projectId });
      for (const m of c.messages) {
        await relationalDb.addMessage(c.id, m);
      }
    }

    return { ok: true };
  } catch (e: any) {
    console.error('Migration failed', e);
    return { ok: false, message: e?.message || 'Unknown error' };
  }
};
