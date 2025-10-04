import { getSupabase } from './supabaseClient';
import { Project, UserCategory, Checklist, Task, Habit, Note, ProjectFile, Event, Story, Conversation, Message, UserPreferences, Sender, Request, RequestUpdate, ProjectMember, ProjectInvite, ProjectRole, ProjectAccessStatus, ProjectInviteStatus } from '../types';

// This service provides minimal CRUD wrappers for the new normalized schema.
// It assumes RLS is enabled and auth user is set; we always set user_id on insert.

const withUser = async (): Promise<{ user_id: string } | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { user_id: data.user.id };
};

export const relationalDb = {
  isEnabled(): boolean { return !!getSupabase(); },

  // Preferences (profiles.preferences)
  async getPreferences(): Promise<UserPreferences | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.from('profiles').select('preferences').single();
    return (data?.preferences as any) || null;
  },
  async savePreferences(prefs: UserPreferences): Promise<void> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return;
    await supabase.from('profiles').upsert({ user_id: u.user_id, preferences: prefs });
  },

  // Categories
  async listCategories(): Promise<UserCategory[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('user_categories').select('*').order('created_at', { ascending: false });
    return (data || []).map(row => ({ id: row.id, name: row.name, icon: row.icon, color: row.color }));
  },
  async upsertCategory(cat: Omit<UserCategory, 'id'> & { id?: string }): Promise<UserCategory | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
  const payload = { ...(cat.id ? { id: cat.id } : {}), user_id: u.user_id, name: cat.name, icon: cat.icon, color: cat.color } as any;
    const { data, error } = await supabase.from('user_categories').upsert(payload).select('*').single();
    if (error) return null;
    return { id: data.id, name: data.name, icon: data.icon, color: data.color };
  },
  async deleteCategory(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('user_categories').delete().eq('id', id);
  },

  // Projects
  async listProjects(): Promise<Project[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    return (data || []).map(row => ({ id: row.id, name: row.name, description: row.description || '', categoryId: row.category_id || undefined, instructions: row.instructions || undefined, icon: row.icon || undefined, color: row.color || undefined }));
  },
  async upsertProject(p: Omit<Project, 'id'> & { id?: string }): Promise<Project | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
    const payload = { id: p.id, user_id: u.user_id, name: p.name, description: p.description, category_id: p.categoryId, instructions: p.instructions, icon: p.icon, color: p.color } as any;
  const { data, error } = await supabase.from('projects').upsert({ ...(p.id ? { id: p.id } : {}), user_id: u.user_id, name: p.name, description: p.description, category_id: p.categoryId, instructions: p.instructions, icon: p.icon, color: p.color } as any).select('*').single();
    if (error) return null;
    return { id: data.id, name: data.name, description: data.description || '', categoryId: data.category_id || undefined, instructions: data.instructions || undefined, icon: data.icon || undefined, color: data.color || undefined };
  },
  async deleteProject(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('projects').delete().eq('id', id);
  },

  // Project collaborators & invites
  async listProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('project_users')
      .select('*')
      .eq('project_id', projectId)
      .order('invited_at', { ascending: true });
    if (error) return [];
    return (data || []).map(row => {
      const status = (row.status as ProjectAccessStatus) || 'pending';
      const role = (row.role as ProjectRole) || 'collaborator';
      return {
        id: row.user_id || row.email,
        email: row.email || undefined,
        name: row.display_name || row.name || undefined,
        role,
        status,
        invitedAt: row.invited_at || row.created_at || new Date().toISOString(),
        acceptedAt: row.accepted_at || undefined,
        invitedBy: row.invited_by || undefined,
      } as ProjectMember;
    });
  },

  async upsertProjectMember(projectId: string, member: ProjectMember & { userId?: string }): Promise<ProjectMember | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
    const payload = {
      project_id: projectId,
      user_id: member.id || member.email,
      email: member.email || null,
      display_name: member.name || null,
      role: member.role,
      status: member.status,
      invited_at: member.invitedAt,
      accepted_at: member.acceptedAt || null,
      invited_by: member.invitedBy || u.user_id,
      updated_by: u.user_id,
    } as any;
    const { data, error } = await supabase
      .from('project_users')
      .upsert(payload, { onConflict: 'project_id,user_id' })
      .select('*')
      .single();
    if (error || !data) return null;
    return {
      id: data.user_id || data.email,
      email: data.email || undefined,
      name: data.display_name || undefined,
      role: (data.role as ProjectRole) || member.role,
      status: (data.status as ProjectAccessStatus) || member.status,
      invitedAt: data.invited_at || member.invitedAt,
      acceptedAt: data.accepted_at || undefined,
      invitedBy: data.invited_by || member.invitedBy,
    };
  },

  async deleteProjectMember(projectId: string, memberId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('project_users').delete().match({ project_id: projectId, user_id: memberId });
  },

  async listProjectInvites(projectId: string): Promise<ProjectInvite[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('project_invites')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      projectId: row.project_id,
      email: row.email,
      role: (row.role as ProjectRole) || 'collaborator',
      invitedBy: row.invited_by,
      status: (row.status as ProjectInviteStatus) || 'pending',
      token: row.token,
      createdAt: row.created_at,
      respondedAt: row.responded_at || undefined,
      message: row.message || undefined,
    } as ProjectInvite));
  },

  async createProjectInvite(invite: Omit<ProjectInvite, 'id' | 'status'> & { status?: ProjectInviteStatus }): Promise<ProjectInvite | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
    const payload = {
      project_id: invite.projectId,
      email: invite.email,
      role: invite.role,
      invited_by: invite.invitedBy,
      status: invite.status || 'pending',
      token: invite.token,
      message: invite.message || null,
      created_at: invite.createdAt,
    } as any;
    const { data, error } = await supabase.from('project_invites').insert(payload).select('*').single();
    if (error || !data) return null;
    return {
      id: data.id,
      projectId: data.project_id,
      email: data.email,
      role: (data.role as ProjectRole) || invite.role,
      invitedBy: data.invited_by,
      status: (data.status as ProjectInviteStatus) || 'pending',
      token: data.token,
      createdAt: data.created_at,
      respondedAt: data.responded_at || undefined,
      message: data.message || undefined,
    };
  },

  async updateProjectInviteStatus(inviteId: string, status: ProjectInviteStatus, respondedAt?: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('project_invites').update({ status, responded_at: respondedAt || new Date().toISOString() }).eq('id', inviteId);
  },

  // Checklists
  async listChecklists(): Promise<Checklist[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data: lists } = await supabase.from('checklists').select('*').order('created_at', { ascending: false });
    const { data: tasks } = await supabase.from('tasks').select('*');
    const { data: completions } = await supabase.from('checklist_completions').select('*');
    const byList = new Map<string, any[]>();
    (tasks || []).forEach(t => {
      const arr = byList.get(t.checklist_id) || [];
      arr.push(t);
      byList.set(t.checklist_id, arr);
    });
    const byListComp = new Map<string, string[]>();
    (completions || []).forEach(c => {
      const arr = byListComp.get(c.checklist_id) || [];
      arr.push(c.completed_on);
      byListComp.set(c.checklist_id, arr);
    });
    return (lists || []).map(l => ({
      id: l.id,
      name: l.name,
      categoryId: l.category_id || undefined,
      projectId: l.project_id || undefined,
      dueDate: l.due_date || undefined,
      dueTime: l.due_time || undefined,
      priority: l.priority || undefined,
      recurrence: l.recurrence || undefined,
      reminder: l.reminder || undefined,
      sourceNoteId: l.source_note_id || undefined,
      generatedChecklistId: l.generated_checklist_id || undefined,
      tasks: (byList.get(l.id) || []).map(t => ({ id: t.id, text: t.text, completedAt: t.completed_at || null })),
      completionHistory: byListComp.get(l.id) || [],
    }));
  },
  async upsertChecklist(payload: Omit<Checklist, 'id'> & { id?: string }): Promise<Checklist | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
    const { id, tasks = [], completionHistory = [], ...rest } = payload as any;
    // Try RPC for atomic upsert; fallback to manual if RPC not available
    const rpcChecklist = {
      id: id || null,
      name: rest.name,
      categoryId: rest.categoryId || null,
      projectId: rest.projectId || null,
      dueDate: rest.dueDate || null,
      dueTime: rest.dueTime || null,
      priority: rest.priority || null,
      recurrence: rest.recurrence || null,
      reminder: rest.reminder || null,
      sourceNoteId: rest.sourceNoteId || null,
      generatedChecklistId: rest.generatedChecklistId || null,
    } as any;
    const { data: rpcData, error: rpcErr } = await supabase.rpc('upsert_checklist_bundle', {
      p_checklist: rpcChecklist,
      p_tasks: tasks,
      p_completion_dates: completionHistory,
    });
    if (!rpcErr && rpcData) {
      return this.getChecklist(rpcData as unknown as string);
    }
    // Fallback manual approach
    const base = {
      ...(id ? { id } : {}),
      user_id: u.user_id,
      name: rest.name,
      category_id: rest.categoryId || null,
      project_id: rest.projectId || null,
      due_date: rest.dueDate || null,
      due_time: rest.dueTime || null,
      priority: rest.priority || null,
      recurrence: rest.recurrence || null,
      reminder: rest.reminder || null,
      source_note_id: rest.sourceNoteId || null,
      generated_checklist_id: rest.generatedChecklistId || null,
    } as any;
    const { data: listRow } = await supabase.from('checklists').upsert(base).select('*').single();
    const listId = listRow!.id as string;
    await supabase.from('tasks').delete().eq('checklist_id', listId);
    if (tasks.length) {
      const taskRows = tasks.map((t: Task) => ({ ...(t.id ? { id: t.id } : {}), user_id: u.user_id, checklist_id: listId, text: t.text, completed_at: t.completedAt || null }));
      await supabase.from('tasks').upsert(taskRows);
    }
    await supabase.from('checklist_completions').delete().eq('checklist_id', listId);
    if (completionHistory.length) {
      const compRows = completionHistory.map((d: string) => ({ id: `${listId}-${d}`, user_id: u.user_id, checklist_id: listId, completed_on: d }));
      await supabase.from('checklist_completions').upsert(compRows);
    }
    return this.getChecklist(listId);
  },
  async getChecklist(id: string): Promise<Checklist | null> {
    const all = await this.listChecklists();
    return all.find(c => c.id === id) || null;
  },
  async deleteChecklist(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('checklists').delete().eq('id', id);
  },

  // Habits (basic read/replace style for now)
  async listHabits(): Promise<Habit[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data: habits } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
    const { data: habitTasks } = await supabase.from('habit_tasks').select('*');
    const { data: habitComps } = await supabase.from('habit_completions').select('*');
    const { data: checkmarks } = await supabase.from('habit_task_checkmarks').select('*');
    const byHabit = new Map<string, any[]>();
    (habitTasks || []).forEach(t => {
      const arr = byHabit.get(t.habit_id) || [];
      arr.push(t);
      byHabit.set(t.habit_id, arr);
    });
    const byHabitComp = new Map<string, string[]>();
    (habitComps || []).forEach(c => {
      const arr = byHabitComp.get(c.habit_id) || [];
      arr.push(c.completed_on);
      byHabitComp.set(c.habit_id, arr);
    });
    // For checkmarks we only compute completion visually per-date elsewhere; not stored on Habit type directly.
    return (habits || []).map(h => ({
      id: h.id,
      name: h.name,
      type: h.type,
      categoryId: h.category_id || undefined,
      projectId: h.project_id || undefined,
      recurrence: h.recurrence,
      reminder: h.reminder || undefined,
      priority: h.priority || undefined,
      tasks: (byHabit.get(h.id) || []).map(t => ({ id: t.id, text: t.text, completedAt: null })),
      completionHistory: byHabitComp.get(h.id) || [],
    }));
  },
  async upsertHabit(payload: Omit<Habit, 'id' | 'completionHistory'> & { id?: string, completionHistory?: string[] }): Promise<Habit | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
  const { id, tasks = [], completionHistory = [], ...rest } = payload as any;
    const base = {
  ...(id ? { id } : {}),
      user_id: u.user_id,
      name: rest.name,
      type: rest.type,
      category_id: rest.categoryId || null,
      project_id: rest.projectId || null,
      recurrence: rest.recurrence,
      reminder: rest.reminder || null,
      priority: rest.priority || null,
    } as any;
    const { data: habitRow, error } = await supabase.from('habits').upsert(base).select('*').single();
    if (error) return null;
    const habitId = habitRow.id as string;
    // Replace habit tasks
  await supabase.from('habit_tasks').delete().eq('habit_id', habitId);
    if (tasks.length) {
  const rows = tasks.map((t: Task) => ({ ...(t.id ? { id: t.id } : {}), user_id: u.user_id, habit_id: habitId, text: t.text }));
      await supabase.from('habit_tasks').upsert(rows);
    }
    // Replace completions
    await supabase.from('habit_completions').delete().eq('habit_id', habitId);
    if (completionHistory.length) {
  const rows = completionHistory.map((d: string) => ({ id: `${habitId}-${d}`, user_id: u.user_id, habit_id: habitId, completed_on: d }));
      await supabase.from('habit_completions').upsert(rows);
    }
    return this.getHabit(habitId);
  },
  async getHabit(id: string): Promise<Habit | null> {
    const all = await this.listHabits();
    return all.find(h => h.id === id) || null;
  },
  async deleteHabit(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('habits').delete().eq('id', id);
  },

  // Events
  async listEvents(): Promise<Event[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('events').select('*').order('start_date', { ascending: false });
    return (data || []).map(e => ({ id: e.id, title: e.title, description: e.description || undefined, location: e.location || undefined, attendees: e.attendees || undefined, startDate: e.start_date, startTime: e.start_time || null, endDate: e.end_date || null, endTime: e.end_time || null, isAllDay: e.is_all_day, reminders: e.reminders || [], categoryId: e.category_id || undefined, projectId: e.project_id || undefined }));
  },
  async upsertEvent(payload: Omit<Event, 'id'> & { id?: string }): Promise<Event | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
    const base = {
      ...(payload as any).id ? { id: (payload as any).id } : {},
      user_id: u.user_id,
      title: payload.title,
      description: payload.description || null,
      location: payload.location || null,
      attendees: payload.attendees || null,
      start_date: payload.startDate,
      start_time: payload.startTime || null,
      end_date: payload.endDate || null,
      end_time: payload.endTime || null,
      is_all_day: payload.isAllDay,
      reminders: payload.reminders || [],
      category_id: payload.categoryId || null,
      project_id: payload.projectId || null,
    } as any;
    const { data, error } = await supabase.from('events').upsert(base).select('*').single();
    if (error) return null;
    return { id: data.id, title: data.title, description: data.description || undefined, location: data.location || undefined, attendees: data.attendees || undefined, startDate: data.start_date, startTime: data.start_time || null, endDate: data.end_date || null, endTime: data.end_time || null, isAllDay: data.is_all_day, reminders: data.reminders || [], categoryId: data.category_id || undefined, projectId: data.project_id || undefined };
  },
  async deleteEvent(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('events').delete().eq('id', id);
  },

  // Notes
  async listNotes(): Promise<Note[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('notes').select('*').order('last_modified', { ascending: false });
    return (data || []).map(n => ({ id: n.id, name: n.name, content: n.content, projectId: n.project_id || undefined, categoryId: n.category_id || undefined, lastModified: new Date(n.last_modified).toISOString() }));
  },
  async upsertNote(payload: Omit<Note, 'id' | 'lastModified'> & { id?: string }): Promise<Note | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
  const base = { ...(payload as any).id ? { id: (payload as any).id } : {}, user_id: u.user_id, name: payload.name, content: payload.content, project_id: payload.projectId || null, category_id: payload.categoryId || null } as any;
    const { data, error } = await supabase.from('notes').upsert(base).select('*').single();
    if (error) return null;
    return { id: data.id, name: data.name, content: data.content, projectId: data.project_id || undefined, categoryId: data.category_id || undefined, lastModified: new Date(data.last_modified).toISOString() };
  },
  async deleteNote(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('notes').delete().eq('id', id);
  },

  // Files (prototype only)
  async listFiles(): Promise<ProjectFile[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('project_files').select('*').order('created_at', { ascending: false });
    return (data || []).map(f => ({ id: f.id, name: f.name, mimeType: f.mime_type, size: f.size, data: f.data, projectId: f.project_id }));
  },
  async upsertFile(payload: Omit<ProjectFile, 'id'> & { id?: string }): Promise<ProjectFile | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
  const base = { ...(payload as any).id ? { id: (payload as any).id } : {}, user_id: u.user_id, name: payload.name, mime_type: payload.mimeType, size: payload.size, data: payload.data, project_id: payload.projectId } as any;
    const { data, error } = await supabase.from('project_files').upsert(base).select('*').single();
    if (error) return null;
    return { id: data.id, name: data.name, mimeType: data.mime_type, size: data.size, data: data.data, projectId: data.project_id };
  },
  async deleteFile(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('project_files').delete().eq('id', id);
  },

  // Stories (basic)
  async listStories(): Promise<Story[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    return (data || []).map(s => ({ id: s.id, title: s.title, description: s.description || undefined, projectId: s.project_id || undefined, categoryId: s.category_id || undefined, status: s.status, acceptanceCriteria: (s.acceptance_criteria || []).map((ac: any, i: number) => ({ id: ac.id || `ac-${i}`, text: ac.text, done: !!ac.done })), estimatePoints: s.estimate_points || undefined, estimateTime: s.estimate_time || undefined, linkedTaskIds: s.linked_task_ids || [], assigneeUserId: s.assignee_user_id || undefined, assigneeName: s.assignee_name || undefined, requesterUserId: s.requester_user_id || undefined, requesterName: s.requester_name || undefined, createdAt: new Date(s.created_at).toISOString(), updatedAt: new Date(s.updated_at).toISOString() }));
  },
  async upsertStory(payload: Omit<Story, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Story | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
  const base = { ...(payload as any).id ? { id: (payload as any).id } : {}, user_id: u.user_id, title: payload.title, description: payload.description || null, project_id: payload.projectId || null, category_id: payload.categoryId || null, status: payload.status, acceptance_criteria: payload.acceptanceCriteria || [], estimate_points: payload.estimatePoints || null, estimate_time: payload.estimateTime || null, linked_task_ids: payload.linkedTaskIds || [], assignee_user_id: payload.assigneeUserId || null, assignee_name: payload.assigneeName || null, requester_user_id: payload.requesterUserId || null, requester_name: payload.requesterName || null } as any;
    const { data, error } = await supabase.from('stories').upsert(base).select('*').single();
    if (error) return null;
    return { id: data.id, title: data.title, description: data.description || undefined, projectId: data.project_id || undefined, categoryId: data.category_id || undefined, status: data.status, acceptanceCriteria: (data.acceptance_criteria || []).map((ac: any, i: number) => ({ id: ac.id || `ac-${i}`, text: ac.text, done: !!ac.done })), estimatePoints: data.estimate_points || undefined, estimateTime: data.estimate_time || undefined, linkedTaskIds: data.linked_task_ids || [], assigneeUserId: data.assignee_user_id || undefined, assigneeName: data.assignee_name || undefined, requesterUserId: data.requester_user_id || undefined, requesterName: data.requester_name || undefined, createdAt: new Date(data.created_at).toISOString(), updatedAt: new Date(data.updated_at).toISOString() };
  },
  async deleteStory(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('stories').delete().eq('id', id);
  },

  // Requests (intake)
  async listRequests(): Promise<Request[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    return (data || []).map(r => ({
      id: r.id,
      product: r.product,
      requester: r.requester,
      problem: r.problem,
      outcome: r.outcome,
      valueProposition: r.value_proposition,
      affectedUsers: r.affected_users,
      priority: r.priority,
      requestedExpertise: r.requested_expertise || [],
      desiredStartDate: r.desired_start_date || null,
      desiredEndDate: r.desired_end_date || null,
      details: r.details || undefined,
      attachments: r.attachments || [],
      status: r.status,
      linkedTaskIds: r.linked_task_ids || [],
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  },
  async upsertRequest(payload: Omit<Request, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Request | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
    const base = {
      ...(payload as any).id ? { id: (payload as any).id } : {},
      user_id: u.user_id,
      product: payload.product,
      requester: payload.requester,
      problem: payload.problem,
      outcome: payload.outcome,
      value_proposition: payload.valueProposition,
      affected_users: payload.affectedUsers,
      priority: payload.priority,
      desired_start_date: payload.desiredStartDate || null,
      desired_end_date: payload.desiredEndDate || null,
      details: payload.details || null,
      attachments: payload.attachments || [],
      status: payload.status,
      linked_task_ids: payload.linkedTaskIds || [],
      requested_expertise: payload.requestedExpertise || [],
    } as any;
    const { data, error } = await supabase.from('requests').upsert(base).select('*').single();
    if (error) return null;
    return {
      id: data.id,
      product: data.product,
      requester: data.requester,
      problem: data.problem,
      outcome: data.outcome,
      valueProposition: data.value_proposition,
      affectedUsers: data.affected_users,
      priority: data.priority,
      requestedExpertise: data.requested_expertise || [],
      desiredStartDate: data.desired_start_date || null,
      desiredEndDate: data.desired_end_date || null,
      details: data.details || undefined,
      attachments: data.attachments || [],
      status: data.status,
      linkedTaskIds: data.linked_task_ids || [],
      createdAt: new Date(data.created_at).toISOString(),
      updatedAt: new Date(data.updated_at).toISOString(),
    };
  },
  async deleteRequest(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('requests').delete().eq('id', id);
  },

  // Request Updates (activity log)
  async listRequestUpdates(requestId: string): Promise<RequestUpdate[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('request_updates').select('*').eq('request_id', requestId).order('created_at', { ascending: true });
    return (data || []).map((u: any) => ({ id: u.id, requestId: u.request_id, author: u.author || '', comment: u.comment || undefined, action: u.action || undefined, createdAt: new Date(u.created_at).toISOString() }));
  },
  async addRequestUpdate(update: Omit<RequestUpdate, 'id' | 'createdAt'> & { id?: string }): Promise<RequestUpdate | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
    const base = { ...(update as any).id ? { id: (update as any).id } : {}, user_id: u.user_id, request_id: update.requestId, author: update.author || null, comment: update.comment || null, action: update.action || null } as any;
    const { data, error } = await supabase.from('request_updates').upsert(base).select('*').single();
    if (error) return null;
    return { id: data.id, requestId: data.request_id, author: data.author || '', comment: data.comment || undefined, action: data.action || undefined, createdAt: new Date(data.created_at).toISOString() };
  },

  // Conversations & Messages
  async listConversations(): Promise<Conversation[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data: convs } = await supabase.from('conversations').select('*').order('updated_at', { ascending: false });
    const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    const byConv = new Map<string, any[]>();
    (msgs || []).forEach(m => {
      const arr = byConv.get(m.conversation_id) || [];
      arr.push(m);
      byConv.set(m.conversation_id, arr);
    });
    return (convs || []).map(c => ({
      id: c.id,
      name: c.name,
      projectId: c.project_id || undefined,
      messages: (byConv.get(c.id) || []).map(m => ({ id: m.id, sender: (m.sender as Sender), text: m.text, suggestions: m.suggestions || undefined, suggestionListName: m.suggestion_list_name || undefined })),
    }));
  },
  async upsertConversation(payload: Omit<Conversation, 'messages'>): Promise<Conversation | null> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return null;
    const base = { ...(payload.id ? { id: payload.id } : {}), user_id: u.user_id, name: payload.name, project_id: payload.projectId || null } as any;
    const { data } = await supabase.from('conversations').upsert(base).select('*').single();
    return { id: data!.id, name: data!.name, projectId: data!.project_id || undefined, messages: [] };
  },
  async deleteConversation(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('conversations').delete().eq('id', id);
  },
  async addMessage(conversationId: string, message: Message): Promise<void> {
    const supabase = getSupabase();
    const u = await withUser();
    if (!supabase || !u) return;
    const base = { id: message.id, user_id: u.user_id, conversation_id: conversationId, sender: message.sender, text: message.text, suggestions: message.suggestions || null, suggestion_list_name: message.suggestionListName || null } as any;
    await supabase.from('messages').insert(base);
    // touch conversation updated_at
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
  },
};