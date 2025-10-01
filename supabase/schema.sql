-- App state table: one JSON blob per user
create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.app_state enable row level security;

-- Policy: users can view their own state
create policy if not exists "app_state select own" on public.app_state
  for select using (auth.uid() = user_id);

-- Policy: users can insert their own state
create policy if not exists "app_state insert own" on public.app_state
  for insert with check (auth.uid() = user_id);

-- Policy: users can update their own state
create policy if not exists "app_state update own" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===============================
-- Normalized relational schema
-- ===============================

-- Helpers
-- gen_random_uuid() is used in RPCs; ensure pgcrypto is enabled
create extension if not exists pgcrypto;

-- Profiles (optional user preferences, can mirror app preferences JSON)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy if not exists "profiles select own" on public.profiles for select using (auth.uid() = user_id);
create policy if not exists "profiles upsert own" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Categories
create table if not exists public.user_categories (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_categories enable row level security;
create index if not exists user_categories_user_id_idx on public.user_categories(user_id);
create policy if not exists "user_categories select own" on public.user_categories for select using (auth.uid() = user_id);
create policy if not exists "user_categories modify own" on public.user_categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Projects
create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category_id text references public.user_categories(id) on delete set null,
  instructions text,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_category_id_idx on public.projects(category_id);
create policy if not exists "projects select own" on public.projects for select using (auth.uid() = user_id);
create policy if not exists "projects modify own" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Checklists (task lists)
create table if not exists public.checklists (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_id text references public.user_categories(id) on delete set null,
  project_id text references public.projects(id) on delete set null,
  due_date date,
  due_time time,
  priority int,
  recurrence jsonb, -- matches RecurrenceRule
  reminder jsonb,   -- matches Reminder
  source_note_id uuid,
  generated_checklist_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.checklists enable row level security;
create index if not exists checklists_user_id_idx on public.checklists(user_id);
create index if not exists checklists_project_id_idx on public.checklists(project_id);
create policy if not exists "checklists select own" on public.checklists for select using (auth.uid() = user_id);
create policy if not exists "checklists modify own" on public.checklists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Checklist tasks
create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_id text not null references public.checklists(id) on delete cascade,
  text text not null,
  completed_at date, -- YYYY-MM-DD or null
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_checklist_id_idx on public.tasks(checklist_id);
create policy if not exists "tasks select own" on public.tasks for select using (auth.uid() = user_id);
create policy if not exists "tasks modify own" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Checklist completion history (for recurring single-task lists or all-subtasks-complete days)
create table if not exists public.checklist_completions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_id text not null references public.checklists(id) on delete cascade,
  completed_on date not null,
  unique (checklist_id, completed_on)
);
alter table public.checklist_completions enable row level security;
create index if not exists checklist_completions_user_id_idx on public.checklist_completions(user_id);
create index if not exists checklist_completions_checklist_id_idx on public.checklist_completions(checklist_id);
create policy if not exists "checklist_completions own" on public.checklist_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habits
create type if not exists habit_type as enum ('daily_check_off', 'checklist');
create table if not exists public.habits (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type habit_type not null,
  category_id text references public.user_categories(id) on delete set null,
  project_id text references public.projects(id) on delete set null,
  recurrence jsonb not null, -- RecurrenceRule
  reminder jsonb,            -- Reminder
  priority int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.habits enable row level security;
create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habits_project_id_idx on public.habits(project_id);
create policy if not exists "habits select own" on public.habits for select using (auth.uid() = user_id);
create policy if not exists "habits modify own" on public.habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habit checklist items (for type=checklist)
create table if not exists public.habit_tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id text not null references public.habits(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.habit_tasks enable row level security;
create index if not exists habit_tasks_user_id_idx on public.habit_tasks(user_id);
create index if not exists habit_tasks_habit_id_idx on public.habit_tasks(habit_id);
create policy if not exists "habit_tasks own" on public.habit_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habit daily completions
create table if not exists public.habit_completions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id text not null references public.habits(id) on delete cascade,
  completed_on date not null,
  unique (habit_id, completed_on)
);
alter table public.habit_completions enable row level security;
create index if not exists habit_completions_user_id_idx on public.habit_completions(user_id);
create index if not exists habit_completions_habit_id_idx on public.habit_completions(habit_id);
create policy if not exists "habit_completions own" on public.habit_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habit subtask per-day checkmarks
create table if not exists public.habit_task_checkmarks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_task_id text not null references public.habit_tasks(id) on delete cascade,
  checked_on date not null,
  unique (habit_task_id, checked_on)
);
alter table public.habit_task_checkmarks enable row level security;
create index if not exists habit_task_checkmarks_user_id_idx on public.habit_task_checkmarks(user_id);
create index if not exists habit_task_checkmarks_task_id_idx on public.habit_task_checkmarks(habit_task_id);
create policy if not exists "habit_task_checkmarks own" on public.habit_task_checkmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Events
create table if not exists public.events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  location text,
  attendees text[],
  start_date date not null,
  start_time time,
  end_date date,
  end_time time,
  is_all_day boolean not null default false,
  reminders text[] not null default '{}',
  category_id text references public.user_categories(id) on delete set null,
  project_id text references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_project_id_idx on public.events(project_id);
create policy if not exists "events select own" on public.events for select using (auth.uid() = user_id);
create policy if not exists "events modify own" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notes
create table if not exists public.notes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  content text not null,
  project_id text references public.projects(id) on delete set null,
  category_id text references public.user_categories(id) on delete set null,
  last_modified timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_project_id_idx on public.notes(project_id);
create policy if not exists "notes select own" on public.notes for select using (auth.uid() = user_id);
create policy if not exists "notes modify own" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Project files (for prototype only; consider using Supabase Storage in production)
create table if not exists public.project_files (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  mime_type text not null,
  size int not null,
  data text not null, -- base64 encoded; not ideal for large files
  project_id text references public.projects(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.project_files enable row level security;
create index if not exists project_files_user_id_idx on public.project_files(user_id);
create index if not exists project_files_project_id_idx on public.project_files(project_id);
create policy if not exists "project_files select own" on public.project_files for select using (auth.uid() = user_id);
create policy if not exists "project_files modify own" on public.project_files for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Stories (lightweight backlog/kanban)
create type if not exists story_status as enum ('backlog', 'in_progress', 'review', 'done');
create table if not exists public.stories (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  project_id text references public.projects(id) on delete set null,
  category_id text references public.user_categories(id) on delete set null,
  status story_status not null default 'backlog',
  acceptance_criteria jsonb not null default '[]'::jsonb,
  estimate_points int,
  estimate_time text,
  linked_task_ids text[] not null default '{}',
  assignee_user_id uuid,
  assignee_name text,
  requester_user_id uuid,
  requester_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.stories enable row level security;
create index if not exists stories_user_id_idx on public.stories(user_id);
create index if not exists stories_project_id_idx on public.stories(project_id);
create policy if not exists "stories select own" on public.stories for select using (auth.uid() = user_id);
create policy if not exists "stories modify own" on public.stories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Simple updated_at trigger for tables with that column
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if to_regclass('public.projects') is not null then
    create trigger projects_updated_at before update on public.projects for each row execute procedure public.set_updated_at();
  end if;
  if to_regclass('public.checklists') is not null then
    create trigger checklists_updated_at before update on public.checklists for each row execute procedure public.set_updated_at();
  end if;
  if to_regclass('public.tasks') is not null then
    create trigger tasks_updated_at before update on public.tasks for each row execute procedure public.set_updated_at();
  end if;
  if to_regclass('public.habits') is not null then
    create trigger habits_updated_at before update on public.habits for each row execute procedure public.set_updated_at();
  end if;
  if to_regclass('public.habit_tasks') is not null then
    create trigger habit_tasks_updated_at before update on public.habit_tasks for each row execute procedure public.set_updated_at();
  end if;
  if to_regclass('public.events') is not null then
    create trigger events_updated_at before update on public.events for each row execute procedure public.set_updated_at();
  end if;
  if to_regclass('public.stories') is not null then
    create trigger stories_updated_at before update on public.stories for each row execute procedure public.set_updated_at();
  end if;
  if to_regclass('public.user_categories') is not null then
    create trigger user_categories_updated_at before update on public.user_categories for each row execute procedure public.set_updated_at();
  end if;
  if to_regclass('public.profiles') is not null then
    create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
  end if;
end$$;

-- ===============================
-- Conversations & Messages
-- ===============================

-- ===============================
-- Requests Intake
-- ===============================

-- Priority enum for requests (optional; can use text too)
create type if not exists request_priority as enum ('low','medium','high','critical');
-- Request status enum supports both legacy and expanded labels
create type if not exists request_status as enum (
  'new','triage','in_progress','blocked','done','cancelled',
  'open','in_review','closed'
);
-- Add any missing enum values idempotently (for projects created with the earlier, smaller set)
do $$
begin
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'request_status' and e.enumlabel = 'open') then
    alter type request_status add value if not exists 'open';
  end if;
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'request_status' and e.enumlabel = 'in_review') then
    alter type request_status add value if not exists 'in_review';
  end if;
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'request_status' and e.enumlabel = 'closed') then
    alter type request_status add value if not exists 'closed';
  end if;
end $$;

create table if not exists public.requests (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  requester text not null, -- name/team
  problem text not null,
  outcome text not null,
  value_proposition text not null,
  affected_users text not null,
  priority request_priority not null default 'medium',
  desired_start_date date,
  desired_end_date date,
  details text,
  attachments jsonb not null default '[]'::jsonb, -- [{name, url, type, size?}]
  status request_status not null default 'new',
  linked_task_ids text[] not null default '{}', -- related checklist ids
  requested_expertise text[] not null default '{}', -- new multi-select expertise
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.requests enable row level security;
create index if not exists requests_user_id_idx on public.requests(user_id);
create index if not exists requests_priority_idx on public.requests(priority);
create index if not exists requests_status_idx on public.requests(status);
create index if not exists requests_created_at_idx on public.requests(created_at);
create index if not exists requests_requested_expertise_gin on public.requests using gin (requested_expertise);

create policy if not exists "requests select own" on public.requests for select using (auth.uid() = user_id);
create policy if not exists "requests modify own" on public.requests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
begin
  if to_regclass('public.requests') is not null then
    create trigger requests_updated_at before update on public.requests for each row execute procedure public.set_updated_at();
  end if;
end$$;

-- Remap legacy request statuses to the new set (no-op on fresh databases)
do $$
begin
  if to_regclass('public.requests') is not null then
    -- new -> open
    update public.requests set status = 'open' where status in ('new');
    -- triage/blocked -> in_review
    update public.requests set status = 'in_review' where status in ('triage','blocked');
    -- done/cancelled -> closed
    update public.requests set status = 'closed' where status in ('done','cancelled');
  end if;
end$$;

-- Request updates (activity log / remarks)
create table if not exists public.request_updates (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null references public.requests(id) on delete cascade,
  author text,
  comment text,
  action text,
  created_at timestamptz not null default now()
);
alter table public.request_updates enable row level security;
create index if not exists request_updates_user_id_idx on public.request_updates(user_id);
create index if not exists request_updates_request_id_idx on public.request_updates(request_id);
create index if not exists request_updates_created_at_idx on public.request_updates(created_at);
create policy if not exists "request_updates select own" on public.request_updates for select using (auth.uid() = user_id);
create policy if not exists "request_updates modify own" on public.request_updates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.conversations (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  project_id text references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists conversations_project_id_idx on public.conversations(project_id);
create policy if not exists "conversations select own" on public.conversations for select using (auth.uid() = user_id);
create policy if not exists "conversations modify own" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.messages (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id text not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('user','model')),
  text text not null,
  suggestions jsonb,
  suggestion_list_name text,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create index if not exists messages_user_id_idx on public.messages(user_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create policy if not exists "messages select own" on public.messages for select using (auth.uid() = user_id);
create policy if not exists "messages modify own" on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
begin
  if to_regclass('public.conversations') is not null then
    create trigger conversations_updated_at before update on public.conversations for each row execute procedure public.set_updated_at();
  end if;
end$$;

-- ===============================
-- Performance indexes for Today/Agenda
-- ===============================
create index if not exists checklists_due_date_idx on public.checklists(due_date);
create index if not exists tasks_completed_at_idx on public.tasks(completed_at);
create index if not exists checklist_completions_date_idx on public.checklist_completions(completed_on);
create index if not exists habit_completions_date_idx on public.habit_completions(completed_on);
create index if not exists events_start_date_idx on public.events(start_date);

-- ===============================
-- RPCs / Transactions
-- ===============================
-- Atomically upsert a checklist + tasks + completion dates
create or replace function public.upsert_checklist_bundle(
  p_checklist jsonb,
  p_tasks jsonb,
  p_completion_dates text[]
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id text := coalesce((p_checklist->>'id'), gen_random_uuid()::text);
begin
  if v_user is null then
    raise exception 'Unauthenticated';
  end if;

  -- Upsert checklist
  insert into public.checklists as c (
    id, user_id, name, category_id, project_id, due_date, due_time, priority, recurrence, reminder, source_note_id, generated_checklist_id
  ) values (
    v_id,
    v_user,
    p_checklist->>'name',
    nullif(p_checklist->>'categoryId',''),
    nullif(p_checklist->>'projectId',''),
    nullif(p_checklist->>'dueDate','')::date,
    nullif(p_checklist->>'dueTime','')::time,
    (p_checklist->>'priority')::int,
    p_checklist->'recurrence',
    p_checklist->'reminder',
    nullif(p_checklist->>'sourceNoteId','')::uuid,
    nullif(p_checklist->>'generatedChecklistId','')::uuid
  )
  on conflict (id) do update set
    name = excluded.name,
    category_id = excluded.category_id,
    project_id = excluded.project_id,
    due_date = excluded.due_date,
    due_time = excluded.due_time,
    priority = excluded.priority,
    recurrence = excluded.recurrence,
    reminder = excluded.reminder,
    source_note_id = excluded.source_note_id,
    generated_checklist_id = excluded.generated_checklist_id,
    updated_at = now()
  where c.user_id = v_user;

  -- Tasks: replace by checklist
  delete from public.tasks where user_id = v_user and checklist_id = v_id;
  insert into public.tasks (id, user_id, checklist_id, text, completed_at)
  select coalesce(t->>'id', gen_random_uuid()::text), v_user, v_id, t->>'text', nullif(t->>'completedAt','')::date
  from jsonb_array_elements(p_tasks) t;

  -- Completion history: replace by checklist
  delete from public.checklist_completions where user_id = v_user and checklist_id = v_id;
  insert into public.checklist_completions (id, user_id, checklist_id, completed_on)
  select (v_id||'-'||d), v_user, v_id, d::date from unnest(coalesce(p_completion_dates, ARRAY[]::text[])) as d;

  return v_id;
end;
$$;
