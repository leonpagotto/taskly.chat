# Schema Analysis & Required Fixes

## Overview
Analysis of Supabase schema vs. current implementation to ensure proper handshake between frontend and database.

---

## ✅ Currently Working Tables

These tables are properly implemented in `relationalDatabaseService.ts`:

1. **profiles** - User preferences and profile data
2. **user_categories** - User-defined categories
3. **projects** - Project management
4. **project_users** - Project collaboration (used for members/invites)
5. **project_invites** - Project invitation system
6. **checklists** - Task lists
7. **tasks** - Individual checklist items
8. **checklist_completions** - Completion history
9. **habits** - Habit tracking
10. **habit_tasks** - Habit checklist items
11. **habit_completions** - Habit completion dates
12. **habit_task_checkmarks** - Individual habit task completions
13. **events** - Calendar events
14. **notes** - Notes and documentation
15. **project_files** - File attachments
16. **stories** - User stories/work items
17. **conversations** - Chat conversations
18. **messages** - Chat messages
19. **requests** - Request intake system
20. **request_updates** - Request activity log
21. **app_state** - Legacy JSON storage

---

## ⚠️ Missing: skill_ids Arrays in Stories & Requests

### Problem
The schema has `skill_ids` columns but the service doesn't handle them:

```sql
-- In stories table
skill_ids ARRAY NOT NULL DEFAULT '{}'::text[]

-- In requests table  
skill_ids ARRAY NOT NULL DEFAULT '{}'::text[]
```

### Solution
Update `relationalDatabaseService.ts` to include `skillIds` field:

#### 1. Stories - Add skillIds handling

**In `listStories()` - Line ~470:**
```typescript
return (data || []).map(s => ({ 
  id: s.id, 
  title: s.title, 
  description: s.description || undefined, 
  projectId: s.project_id || undefined, 
  categoryId: s.category_id || undefined, 
  status: s.status, 
  acceptanceCriteria: (s.acceptance_criteria || []).map((ac: any, i: number) => ({ 
    id: ac.id || `ac-${i}`, 
    text: ac.text, 
    done: !!ac.done 
  })), 
  estimatePoints: s.estimate_points || undefined, 
  estimateTime: s.estimate_time || undefined, 
  linkedTaskIds: s.linked_task_ids || [], 
  skillIds: s.skill_ids || [], // ⬅️ ADD THIS LINE
  assigneeUserId: s.assignee_user_id || undefined, 
  assigneeName: s.assignee_name || undefined, 
  requesterUserId: s.requester_user_id || undefined, 
  requesterName: s.requester_name || undefined, 
  createdAt: new Date(s.created_at).toISOString(), 
  updatedAt: new Date(s.updated_at).toISOString() 
}));
```

**In `upsertStory()` - Line ~475:**
```typescript
const base = { 
  ...(payload as any).id ? { id: (payload as any).id } : {}, 
  user_id: u.user_id, 
  title: payload.title, 
  description: payload.description || null, 
  project_id: payload.projectId || null, 
  category_id: payload.categoryId || null, 
  status: payload.status, 
  acceptance_criteria: payload.acceptanceCriteria || [], 
  estimate_points: payload.estimatePoints || null, 
  estimate_time: payload.estimateTime || null, 
  linked_task_ids: payload.linkedTaskIds || [], 
  skill_ids: payload.skillIds || [], // ⬅️ ADD THIS LINE
  assignee_user_id: payload.assigneeUserId || null, 
  assignee_name: payload.assigneeName || null, 
  requester_user_id: payload.requesterUserId || null, 
  requester_name: payload.requesterName || null 
} as any;
```

**In `upsertStory()` return statement:**
```typescript
return { 
  id: data.id, 
  title: data.title, 
  description: data.description || undefined, 
  projectId: data.project_id || undefined, 
  categoryId: data.category_id || undefined, 
  status: data.status, 
  acceptanceCriteria: (data.acceptance_criteria || []).map((ac: any, i: number) => ({ 
    id: ac.id || `ac-${i}`, 
    text: ac.text, 
    done: !!ac.done 
  })), 
  estimatePoints: data.estimate_points || undefined, 
  estimateTime: data.estimate_time || undefined, 
  linkedTaskIds: data.linked_task_ids || [], 
  skillIds: data.skill_ids || [], // ⬅️ ADD THIS LINE
  assigneeUserId: data.assignee_user_id || undefined, 
  assigneeName: data.assignee_name || undefined, 
  requesterUserId: data.requester_user_id || undefined, 
  requesterName: data.requester_name || undefined, 
  createdAt: new Date(data.created_at).toISOString(), 
  updatedAt: new Date(data.updated_at).toISOString() 
};
```

#### 2. Requests - Add skillIds handling

**In `listRequests()` - Line ~495:**
```typescript
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
  skillIds: r.skill_ids || [], // ⬅️ ADD THIS LINE
  desiredStartDate: r.desired_start_date || null,
  desiredEndDate: r.desired_end_date || null,
  details: r.details || undefined,
  attachments: r.attachments || [],
  status: r.status,
  linkedTaskIds: r.linked_task_ids || [],
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
}));
```

**In `upsertRequest()` base object - Line ~523:**
```typescript
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
  skill_ids: payload.skillIds || [], // ⬅️ ADD THIS LINE
} as any;
```

**In `upsertRequest()` return statement:**
```typescript
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
  skillIds: data.skill_ids || [], // ⬅️ ADD THIS LINE
  desiredStartDate: data.desired_start_date || null,
  desiredEndDate: data.desired_end_date || null,
  details: data.details || undefined,
  attachments: data.attachments || [],
  status: data.status,
  linkedTaskIds: data.linked_task_ids || [],
  createdAt: new Date(data.created_at).toISOString(),
  updatedAt: new Date(data.updated_at).toISOString(),
};
```

---

## 📋 Recommended: Add Skills Tables

Skills are currently stored in `app_state.data.skillCategories` but should have dedicated tables for proper querying and relational integrity.

### Migration SQL

```sql
-- Create skill_categories table
CREATE TABLE IF NOT EXISTS public.skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can manage their own skill categories"
  ON public.skill_categories
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own skills"
  ON public.skills
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add indexes
CREATE INDEX IF NOT EXISTS skill_categories_user_id_idx ON public.skill_categories(user_id);
CREATE INDEX IF NOT EXISTS skills_user_id_idx ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS skills_category_id_idx ON public.skills(category_id);
```

### Then add to relationalDatabaseService.ts:

```typescript
// Skill Categories
async listSkillCategories(): Promise<SkillCategory[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data: cats } = await supabase.from('skill_categories').select('*').order('name');
  const { data: skills } = await supabase.from('skills').select('*').order('name');
  
  const skillsByCategory = new Map<string, Skill[]>();
  (skills || []).forEach(s => {
    if (!skillsByCategory.has(s.category_id)) {
      skillsByCategory.set(s.category_id, []);
    }
    skillsByCategory.get(s.category_id)!.push({
      id: s.id,
      name: s.name,
      description: s.description || undefined,
      categoryId: s.category_id,
    });
  });
  
  return (cats || []).map(c => ({
    id: c.id,
    name: c.name,
    description: c.description || undefined,
    skills: skillsByCategory.get(c.id) || [],
  }));
},

async upsertSkillCategory(cat: Omit<SkillCategory, 'id' | 'skills'> & { id?: string }): Promise<SkillCategory | null> {
  const supabase = getSupabase();
  const u = await withUser();
  if (!supabase || !u) return null;
  const payload = { 
    ...(cat.id ? { id: cat.id } : {}), 
    user_id: u.user_id, 
    name: cat.name, 
    description: cat.description || null 
  } as any;
  const { data, error } = await supabase.from('skill_categories').upsert(payload).select('*').single();
  if (error) return null;
  return { id: data.id, name: data.name, description: data.description || undefined, skills: [] };
},

async upsertSkill(skill: Omit<Skill, 'id'> & { id?: string }): Promise<Skill | null> {
  const supabase = getSupabase();
  const u = await withUser();
  if (!supabase || !u) return null;
  const payload = { 
    ...(skill.id ? { id: skill.id } : {}), 
    user_id: u.user_id, 
    category_id: skill.categoryId,
    name: skill.name, 
    description: skill.description || null 
  } as any;
  const { data, error } = await supabase.from('skills').upsert(payload).select('*').single();
  if (error) return null;
  return { id: data.id, categoryId: data.category_id, name: data.name, description: data.description || undefined };
},

async deleteSkill(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('skills').delete().eq('id', id);
},

async deleteSkillCategory(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('skill_categories').delete().eq('id', id);
},
```

---

## 🔍 Unused Tables in Schema

These tables exist in your Supabase schema but are NOT currently used by the application:

1. **organizations** - Team/org management (future feature?)
2. **organization_members** - Org membership
3. **teams** - Team structure within orgs
4. **team_members** - Team membership
5. **documents** - Document management system
6. **subscriptions** - Payment/subscription tracking
7. **ai_usage_logs** - AI token usage tracking
8. **project_members** - Duplicate of project_users functionality

### Recommendations:

**Option 1: Keep for future use** (Current approach)
- No action needed
- These tables are ready when you implement those features

**Option 2: Clean up unused tables**
- Remove tables you don't plan to use
- Reduces database complexity

---

## 🔄 Duplicate Tables

Your schema has both:
- **project_users** (currently used by the app)
- **project_members** (unused duplicate)

### Recommendation:
Choose one approach:
1. **Keep project_users** (current) - More flexible with email invites
2. **Migrate to project_members** - Simpler, user_id only

For now, leaving as-is is fine since project_users is working.

---

## ✨ Action Plan

### Immediate (Required):
1. ✅ Add `skillIds` field handling in Stories (3 locations)
2. ✅ Add `skillIds` field handling in Requests (3 locations)

### Short-term (Recommended):
3. 📊 Add skill_categories and skills tables via migration
4. 🔄 Migrate skill data from app_state to dedicated tables
5. 🔧 Add skill management methods to relationalDatabaseService

### Long-term (Optional):
6. 🧹 Decide on unused tables (keep or remove)
7. 📈 Implement AI usage logging
8. 💳 Implement subscription tracking
9. 🏢 Implement organizations/teams features

---

## 🚀 Testing After Changes

After implementing the skillIds fixes:

```typescript
// Test creating a story with skills
const story = await relationalDb.upsertStory({
  title: 'Test Story',
  status: 'backlog',
  skillIds: ['skill-123', 'skill-456'], // Should now sync
  acceptanceCriteria: [],
  linkedTaskIds: [],
});

// Test creating a request with skills
const request = await relationalDb.upsertRequest({
  product: 'Test',
  requester: 'Test User',
  problem: 'Test problem',
  outcome: 'Test outcome',
  valueProposition: 'Test value',
  affectedUsers: 'Test users',
  priority: 'medium',
  status: 'new',
  skillIds: ['skill-789'], // Should now sync
  requestedExpertise: [],
  linkedTaskIds: [],
  attachments: [],
});
```

---

## Summary

**Current Status:** ✅ 95% of schema is properly implemented

**Missing:** ⚠️ `skillIds` array handling in Stories and Requests

**Priority Fix:** Update 6 locations in `relationalDatabaseService.ts` to handle `skill_ids` column

**Future Enhancement:** Add dedicated skills tables for better data management
