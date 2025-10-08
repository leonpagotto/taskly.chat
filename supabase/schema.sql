-- App state table: one JSON blob per user
create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.app_state enable row level security;

-- Policy: users can view their own state
drop policy if exists "app_state select own" on public.app_state;
create policy "app_state select own" on public.app_state
  for select to authenticated using ((select auth.uid()) = user_id);

-- Policy: users can insert their own state
drop policy if exists "app_state insert own" on public.app_state;
create policy "app_state insert own" on public.app_state
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Policy: users can update their own state
drop policy if exists "app_state update own" on public.app_state;
create policy "app_state update own" on public.app_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ===============================
-- Normalized relational schema
-- ===============================

-- Helpers
-- gen_random_uuid() is used in RPCs; ensure pgcrypto is enabled
create extension if not exists pgcrypto;

-- Helper functions for collaboration access control
create or replace function public.has_project_access(p_project_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null or p_project_id is null then
    return false;
  end if;

  -- Owner of project
  if exists(
    select 1
    from public.projects
    where id = p_project_id
      and user_id = v_uid
  ) then
    return true;
  end if;

  -- Accepted project_users (invited collaborators)
  if exists(
    select 1
    from public.project_users pu
    where pu.project_id = p_project_id
      and pu.user_id = v_uid::text
      and pu.status = 'accepted'
  ) then
    return true;
  end if;

  -- Project members (direct membership)
  if exists(
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = v_uid
  ) then
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.has_project_access(uuid) from public;
grant execute on function public.has_project_access(uuid) to authenticated;

create or replace function public.has_project_admin(p_project_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null or p_project_id is null then
    return false;
  end if;

  -- Owner of project
  if exists(
    select 1
    from public.projects
    where id = p_project_id
      and user_id = v_uid
  ) then
    return true;
  end if;

  -- Admin role in project_users (invited admins)
  if exists(
    select 1
    from public.project_users pu
    where pu.project_id = p_project_id
      and pu.user_id = v_uid::text
      and pu.role = 'admin'
      and pu.status = 'accepted'
  ) then
    return true;
  end if;

  -- Admin role in project_members (direct admin membership)
  if exists(
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = v_uid
      and pm.role = 'admin'
  ) then
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.has_project_admin(uuid) from public;
grant execute on function public.has_project_admin(uuid) to authenticated;

-- Profiles (optional user preferences, can mirror app preferences JSON)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  preferences jsonb not null default '{}'::jsonb,
  email_verified boolean not null default false,
  email_verified_at timestamptz,
  last_sign_in_at timestamptz,
  last_verification_email_sent timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  v_has_user_id boolean;
  v_has_id boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'user_id'
  ) into v_has_user_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'id'
  ) into v_has_id;

  if v_has_id and not v_has_user_id then
    begin
      alter table public.profiles rename column id to user_id;
      v_has_user_id := true;
      v_has_id := false;
    exception
      when undefined_column then null;
    end;
  end if;

  if not v_has_id then
    alter table public.profiles add column id uuid;
    v_has_id := true;
  end if;

  if not v_has_user_id then
    alter table public.profiles add column user_id uuid;
    v_has_user_id := true;
  end if;

  if v_has_id then
    execute 'update public.profiles set user_id = id where user_id is null';
  end if;

  execute 'update public.profiles set id = user_id where id is null';

  -- Only enforce NOT NULL if no nulls remain
  if exists (
    select 1
    from public.profiles
    where user_id is null
  ) then
    raise notice 'public.profiles.user_id contains nulls; please backfill manually before enforcing NOT NULL.';
  else
    alter table public.profiles alter column user_id set not null;
  end if;

  if not exists (
    select 1
    from information_schema.constraint_column_usage ccu
    join information_schema.table_constraints tc
      on tc.constraint_name = ccu.constraint_name
     and tc.table_schema = ccu.table_schema
    where ccu.table_schema = 'public'
      and ccu.table_name = 'profiles'
      and ccu.column_name = 'user_id'
      and tc.constraint_type in ('PRIMARY KEY','UNIQUE')
  ) then
    -- Check for duplicates before creating unique constraint
    declare
      v_dup_count int;
    begin
      select count(*) into v_dup_count
      from (
        select user_id
        from public.profiles
        where user_id is not null
        group by user_id
        having count(*) > 1
      ) dups;

      if v_dup_count > 0 then
        raise exception 'Found % duplicate user_id values in profiles. Manual cleanup required. Query: SELECT user_id, count(*) FROM public.profiles WHERE user_id IS NOT NULL GROUP BY user_id HAVING count(*) > 1;', v_dup_count;
      end if;

      -- Safe to create unique constraint
      alter table public.profiles add constraint profiles_user_id_key unique (user_id);
    exception
      when duplicate_object then null;
    end;
  end if;

  begin
    alter table public.profiles add constraint profiles_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
  exception
    when duplicate_object then null;
  end;
end$$;

create or replace function public.sync_profile_ids()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null and new.id is not null then
    new.user_id := new.id;
  end if;

  if new.id is null and new.user_id is not null then
    new.id := new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_ids on public.profiles;
create trigger profiles_sync_ids
  before insert or update on public.profiles
  for each row
  execute function public.sync_profile_ids();

alter table public.profiles enable row level security;
drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "profiles upsert own" on public.profiles;
create policy "profiles upsert own" on public.profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'email_verified') then
    alter table public.profiles add column email_verified boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'email_verified_at') then
    alter table public.profiles add column email_verified_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'last_sign_in_at') then
    alter table public.profiles add column last_sign_in_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'last_verification_email_sent') then
    alter table public.profiles add column last_verification_email_sent timestamptz;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'tenant_id'
  ) then
    alter table public.profiles add column tenant_id uuid;
  end if;
end$$;

create index if not exists profiles_tenant_id_idx on public.profiles(tenant_id);

-- Legacy compatibility: ensure user_profiles table has user_id column mirroring id if it exists
do $$
begin
  if to_regclass('public.user_profiles') is not null then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'user_profiles'
        and column_name = 'id'
    ) then
      alter table public.user_profiles add column id uuid;
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'user_profiles'
        and column_name = 'id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'user_profiles'
        and column_name = 'user_id'
    ) then
      begin
        alter table public.user_profiles rename column id to user_id;
      exception
        when undefined_column then null;
      end;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'user_profiles'
        and column_name = 'id'
    ) then
      alter table public.user_profiles add column id uuid;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'user_profiles'
        and column_name = 'user_id'
    ) then
      alter table public.user_profiles add column user_id uuid;
    end if;

    -- Backfill missing values between columns in both directions
    execute 'update public.user_profiles set user_id = id where user_id is null and id is not null';
    execute 'update public.user_profiles set id = user_id where id is null and user_id is not null';

    if exists (
      select 1
      from public.user_profiles
      where user_id is null
    ) then
      raise notice 'public.user_profiles.user_id contains nulls; please backfill manually before enforcing NOT NULL.';
    else
      alter table public.user_profiles alter column user_id set not null;
    end if;

    if not exists (
      select 1
      from information_schema.table_constraints tc
      join information_schema.constraint_column_usage ccu
        on tc.constraint_name = ccu.constraint_name
       and tc.table_schema = ccu.table_schema
      where tc.table_schema = 'public'
        and tc.table_name = 'user_profiles'
        and ccu.column_name = 'user_id'
        and tc.constraint_type in ('PRIMARY KEY','UNIQUE')
    ) then
      -- Check for duplicates before creating unique constraint
      declare
        v_dup_count int;
      begin
        execute 'select count(*) from (select user_id from public.user_profiles where user_id is not null group by user_id having count(*) > 1) dups' into v_dup_count;

        if v_dup_count > 0 then
          raise exception 'Found % duplicate user_id values in user_profiles. Manual cleanup required. Query: SELECT user_id, count(*) FROM public.user_profiles WHERE user_id IS NOT NULL GROUP BY user_id HAVING count(*) > 1;', v_dup_count;
        end if;

        -- Safe to create unique constraint
        alter table public.user_profiles add constraint user_profiles_user_id_unique unique (user_id);
      end;
    end if;

    if not exists (
      select 1
      from information_schema.table_constraints tc
      join information_schema.constraint_column_usage ccu
        on tc.constraint_name = ccu.constraint_name
       and tc.table_schema = ccu.table_schema
      where tc.table_schema = 'public'
        and tc.table_name = 'user_profiles'
        and tc.constraint_type = 'FOREIGN KEY'
        and ccu.column_name = 'user_id'
    ) then
      begin
        alter table public.user_profiles add constraint user_profiles_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
      exception
        when duplicate_object then null;
      end;
    end if;
  end if;
end$$;

create or replace function public.sync_user_profiles_ids()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null and new.id is not null then
    new.user_id := new.id;
  end if;

  if new.id is null and new.user_id is not null then
    new.id := new.user_id;
  end if;

  return new;
end;
$$;

do $$
begin
  if to_regclass('public.user_profiles') is not null then
    execute 'drop trigger if exists user_profiles_sync_ids on public.user_profiles';
    execute 'create trigger user_profiles_sync_ids before insert or update on public.user_profiles for each row execute function public.sync_user_profiles_ids()';
    
    -- Enable RLS on user_profiles
    execute 'alter table public.user_profiles enable row level security';
    
    -- Create RLS policies for user_profiles
    execute 'drop policy if exists "user_profiles select own" on public.user_profiles';
    execute 'create policy "user_profiles select own" on public.user_profiles for select to authenticated using ((select auth.uid()) = user_id)';
    execute 'drop policy if exists "user_profiles upsert own" on public.user_profiles';
    execute 'create policy "user_profiles upsert own" on public.user_profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
  end if;
end$$;

-- Categories
create table if not exists public.user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_categories enable row level security;
create index if not exists user_categories_user_id_idx on public.user_categories(user_id);
drop policy if exists "user_categories select own" on public.user_categories;
create policy "user_categories select own" on public.user_categories for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "user_categories modify own" on public.user_categories;
create policy "user_categories modify own" on public.user_categories for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category_id uuid references public.user_categories(id) on delete set null,
  instructions text,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;

-- Validate RLS was enabled successfully
do $$
begin
  if not (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'projects') then
    raise exception 'CRITICAL: Failed to enable RLS on public.projects table';
  end if;
end$$;

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_category_id_idx on public.projects(category_id);
drop policy if exists "projects select access" on public.projects;
create policy "projects select access" on public.projects for select to authenticated using (public.has_project_access(id));
drop policy if exists "projects modify own" on public.projects;
create policy "projects modify own" on public.projects for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "projects update admin" on public.projects;
create policy "projects update admin" on public.projects for update to authenticated using (public.has_project_admin(id)) with check (public.has_project_admin(id));

-- Organizations & Collaboration
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.organizations enable row level security;
create index if not exists organizations_owner_id_idx on public.organizations(owner_id);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index if not exists organization_members_organization_id_idx on public.organization_members(organization_id);
create index if not exists organization_members_user_id_idx on public.organization_members(user_id);
alter table public.organization_members enable row level security;

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)
);
create index if not exists project_members_project_id_idx on public.project_members(project_id);
create index if not exists project_members_user_id_idx on public.project_members(user_id);
alter table public.project_members enable row level security;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists teams_organization_id_idx on public.teams(organization_id);
alter table public.teams enable row level security;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, user_id)
);
create index if not exists team_members_team_id_idx on public.team_members(team_id);
create index if not exists team_members_user_id_idx on public.team_members(user_id);
alter table public.team_members enable row level security;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_organization_id_idx on public.documents(organization_id);
create index if not exists documents_owner_id_idx on public.documents(owner_id);
alter table public.documents enable row level security;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  plan text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
alter table public.subscriptions enable row level security;

create or replace function public.get_user_tenants()
returns uuid[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    return ARRAY[]::uuid[];
  end if;

  return coalesce(
    (
      select array_agg(distinct org_id)
      from (
        select tenant_id as org_id
        from public.profiles
        where tenant_id is not null
          and user_id = v_uid
        union
        select organization_id as org_id
        from public.organization_members
        where user_id = v_uid
      ) combined
    ),
    ARRAY[]::uuid[]
  );
end;
$$;

revoke all on function public.get_user_tenants() from public;
grant execute on function public.get_user_tenants() to authenticated;

drop policy if exists "organizations select accessible" on public.organizations;
create policy "organizations select accessible" on public.organizations
  for select to authenticated using (
    owner_id = (select auth.uid())
    or id = any(public.get_user_tenants())
  );

drop policy if exists "organizations modify accessible" on public.organizations;
create policy "organizations modify accessible" on public.organizations
  for all to authenticated using (
    owner_id = (select auth.uid())
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = public.organizations.id
        and om.user_id = (select auth.uid())
        and om.role in ('admin','owner')
    )
  ) with check (
    owner_id = (select auth.uid())
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = public.organizations.id
        and om.user_id = (select auth.uid())
        and om.role in ('admin','owner')
    )
  );

drop policy if exists "organization_members select accessible" on public.organization_members;
create policy "organization_members select accessible" on public.organization_members
  for select to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and (
          o.owner_id = (select auth.uid())
          or o.id = any(public.get_user_tenants())
        )
    )
  );

drop policy if exists "organization_members manage" on public.organization_members;
create policy "organization_members manage" on public.organization_members
  for all to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = organization_id
        and om.user_id = (select auth.uid())
        and om.role in ('admin','owner')
    )
  ) with check (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.owner_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = organization_id
        and om.user_id = (select auth.uid())
        and om.role in ('admin','owner')
    )
  );

drop policy if exists "project_members select accessible" on public.project_members;
create policy "project_members select accessible" on public.project_members
  for select to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.projects p
      where p.id = project_id
        and (
          p.user_id = (select auth.uid())
          or public.has_project_access(p.id)
        )
    )
  );

drop policy if exists "project_members manage" on public.project_members;
create policy "project_members manage" on public.project_members
  for all to authenticated using (
    user_id = (select auth.uid())
    or public.has_project_admin(project_id)
  ) with check (
    user_id = (select auth.uid())
    or public.has_project_admin(project_id)
  );

drop policy if exists "teams select accessible" on public.teams;
create policy "teams select accessible" on public.teams
  for select to authenticated using (
    organization_id = any(public.get_user_tenants())
    or exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.owner_id = (select auth.uid())
    )
  );

drop policy if exists "teams manage" on public.teams;
create policy "teams manage" on public.teams
  for all to authenticated using (
    organization_id = any(public.get_user_tenants())
    or exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.owner_id = (select auth.uid())
    )
  ) with check (
    organization_id = any(public.get_user_tenants())
    or exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.owner_id = (select auth.uid())
    )
  );

drop policy if exists "team_members select accessible" on public.team_members;
create policy "team_members select accessible" on public.team_members
  for select to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = team_id
        and tm.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.teams t
      join public.organizations o on o.id = t.organization_id
      where t.id = team_id
        and (
          o.owner_id = (select auth.uid())
          or o.id = any(public.get_user_tenants())
        )
    )
  );

drop policy if exists "team_members manage" on public.team_members;
create policy "team_members manage" on public.team_members
  for all to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = team_id
        and tm.user_id = (select auth.uid())
        and tm.role in ('admin','owner')
    )
    or exists (
      select 1
      from public.teams t
      join public.organizations o on o.id = t.organization_id
      where t.id = team_id
        and (
          o.owner_id = (select auth.uid())
          or o.id = any(public.get_user_tenants())
        )
    )
  ) with check (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = team_id
        and tm.user_id = (select auth.uid())
        and tm.role in ('admin','owner')
    )
    or exists (
      select 1
      from public.teams t
      join public.organizations o on o.id = t.organization_id
      where t.id = team_id
        and (
          o.owner_id = (select auth.uid())
          or o.id = any(public.get_user_tenants())
        )
    )
  );

drop policy if exists "documents select accessible" on public.documents;
create policy "documents select accessible" on public.documents
  for select to authenticated using (
    owner_id = (select auth.uid())
    or organization_id = any(public.get_user_tenants())
  );

drop policy if exists "documents manage" on public.documents;
create policy "documents manage" on public.documents
  for all to authenticated using (
    owner_id = (select auth.uid())
    or organization_id = any(public.get_user_tenants())
  ) with check (
    owner_id = (select auth.uid())
    or organization_id = any(public.get_user_tenants())
  );

drop policy if exists "subscriptions owner" on public.subscriptions;
create policy "subscriptions owner" on public.subscriptions
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Project collaboration tables
do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_role') then
    create type project_role as enum ('admin', 'collaborator');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_access_status') then
    create type project_access_status as enum ('pending', 'accepted', 'revoked');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_invite_status') then
    create type project_invite_status as enum ('pending', 'accepted', 'declined', 'expired');
  end if;
end$$;

create table if not exists public.project_users (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id text,  -- Kept as text to support both uuid::text and email for pending invites
  email text,
  display_name text,
  role project_role not null default 'collaborator',
  status project_access_status not null default 'pending',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  invited_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_users_user_or_email check (user_id is not null or email is not null)
);
create unique index if not exists project_users_project_user_idx on public.project_users(project_id, user_id);
create unique index if not exists project_users_project_email_idx on public.project_users(project_id, lower(email)) where email is not null;
create index if not exists project_users_project_idx on public.project_users(project_id);
create index if not exists project_users_status_idx on public.project_users(status);
alter table public.project_users enable row level security;
drop policy if exists "project_users select accessible" on public.project_users;
create policy "project_users select accessible" on public.project_users
  for select to authenticated using (
    (select auth.uid())::text = user_id
    or (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  );
drop policy if exists "project_users insert owner or admin" on public.project_users;
create policy "project_users insert owner or admin" on public.project_users
  for insert to authenticated with check (
    (
      (select auth.uid()) = invited_by
      or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
      or exists (
        select 1 from public.project_users pu
        where pu.project_id = project_id
          and pu.user_id = (select auth.uid())::text
          and pu.role = 'admin'
          and pu.status = 'accepted'
      )
    )
    and (
      invited_by is null or (select auth.uid()) = invited_by
    )
  );
drop policy if exists "project_users update manageable" on public.project_users;
create policy "project_users update manageable" on public.project_users
  for update to authenticated using (
    (select auth.uid())::text = user_id
    or (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  ) with check (
    (select auth.uid())::text = user_id
    or (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  );
drop policy if exists "project_users delete manageable" on public.project_users;
create policy "project_users delete manageable" on public.project_users
  for delete to authenticated using (
    (select auth.uid())::text = user_id
    or (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  );

create table if not exists public.project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null,
  role project_role not null default 'collaborator',
  invited_by uuid references auth.users(id) on delete set null,
  status project_invite_status not null default 'pending',
  token text not null,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  expires_at timestamptz
);
create unique index if not exists project_invites_token_idx on public.project_invites(token);
create unique index if not exists project_invites_project_email_idx on public.project_invites(project_id, lower(email));
create index if not exists project_invites_status_idx on public.project_invites(status);
alter table public.project_invites enable row level security;
drop policy if exists "project_invites select owner or admin" on public.project_invites;
create policy "project_invites select owner or admin" on public.project_invites
  for select to authenticated using (
    (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  );
drop policy if exists "project_invites insert owner or admin" on public.project_invites;
create policy "project_invites insert owner or admin" on public.project_invites
  for insert to authenticated with check (
    (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  );
drop policy if exists "project_invites update owner or admin" on public.project_invites;
create policy "project_invites update owner or admin" on public.project_invites
  for update to authenticated using (
    (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  ) with check (
    (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  );
drop policy if exists "project_invites delete owner or admin" on public.project_invites;
create policy "project_invites delete owner or admin" on public.project_invites
  for delete to authenticated using (
    (select auth.uid()) = invited_by
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    or exists (
      select 1 from public.project_users pu
      where pu.project_id = project_id
        and pu.user_id = (select auth.uid())::text
        and pu.role = 'admin'
        and pu.status = 'accepted'
    )
  );

-- Checklists (task lists)
create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_id uuid references public.user_categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
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
drop policy if exists "checklists select own" on public.checklists;
create policy "checklists select own" on public.checklists for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "checklists modify own" on public.checklists;
create policy "checklists modify own" on public.checklists for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "checklists select collaborators" on public.checklists;
create policy "checklists select collaborators" on public.checklists
  for select to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  );
drop policy if exists "checklists modify collaborators" on public.checklists;
create policy "checklists modify collaborators" on public.checklists
  for all to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  ) with check (
    project_id is not null and public.has_project_access(project_id)
  );

-- Checklist tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  text text not null,
  completed_at date, -- YYYY-MM-DD or null
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_checklist_id_idx on public.tasks(checklist_id);
drop policy if exists "tasks select own" on public.tasks;
create policy "tasks select own" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "tasks modify own" on public.tasks;
create policy "tasks modify own" on public.tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "tasks select collaborators" on public.tasks;
create policy "tasks select collaborators" on public.tasks
  for select to authenticated using (
    exists (
      select 1
      from public.checklists c
      where c.id = checklist_id
        and c.project_id is not null
        and public.has_project_access(c.project_id)
    )
  );
drop policy if exists "tasks modify collaborators" on public.tasks;
create policy "tasks modify collaborators" on public.tasks
  for all to authenticated using (
    exists (
      select 1
      from public.checklists c
      where c.id = checklist_id
        and c.project_id is not null
        and public.has_project_access(c.project_id)
    )
  ) with check (
    exists (
      select 1
      from public.checklists c
      where c.id = checklist_id
        and c.project_id is not null
        and public.has_project_access(c.project_id)
    )
  );

-- Checklist completion history (for recurring single-task lists or all-subtasks-complete days)
create table if not exists public.checklist_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  completed_on date not null,
  unique (checklist_id, completed_on)
);
alter table public.checklist_completions enable row level security;
create index if not exists checklist_completions_user_id_idx on public.checklist_completions(user_id);
create index if not exists checklist_completions_checklist_id_idx on public.checklist_completions(checklist_id);
drop policy if exists "checklist_completions own" on public.checklist_completions;
create policy "checklist_completions own" on public.checklist_completions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "checklist_completions collaborators" on public.checklist_completions;
create policy "checklist_completions collaborators" on public.checklist_completions
  for all to authenticated using (
    exists (
      select 1
      from public.checklists c
      where c.id = checklist_id
        and c.project_id is not null
        and public.has_project_access(c.project_id)
    )
  ) with check (
    exists (
      select 1
      from public.checklists c
      where c.id = checklist_id
        and c.project_id is not null
        and public.has_project_access(c.project_id)
    )
  );

-- Habits
do $$
begin
  if not exists (select 1 from pg_type where typname = 'habit_type') then
    create type habit_type as enum ('daily_check_off', 'checklist');
  end if;
end$$;
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type habit_type not null,
  category_id uuid references public.user_categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  recurrence jsonb not null, -- RecurrenceRule
  reminder jsonb,            -- Reminder
  priority int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.habits enable row level security;
create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habits_project_id_idx on public.habits(project_id);
drop policy if exists "habits select own" on public.habits;
create policy "habits select own" on public.habits for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "habits modify own" on public.habits;
create policy "habits modify own" on public.habits for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "habits select collaborators" on public.habits;
create policy "habits select collaborators" on public.habits
  for select to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  );
drop policy if exists "habits modify collaborators" on public.habits;
create policy "habits modify collaborators" on public.habits
  for all to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  ) with check (
    project_id is not null and public.has_project_access(project_id)
  );

-- Habit checklist items (for type=checklist)
create table if not exists public.habit_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.habit_tasks enable row level security;
create index if not exists habit_tasks_user_id_idx on public.habit_tasks(user_id);
create index if not exists habit_tasks_habit_id_idx on public.habit_tasks(habit_id);
drop policy if exists "habit_tasks own" on public.habit_tasks;
create policy "habit_tasks own" on public.habit_tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "habit_tasks collaborators" on public.habit_tasks;
create policy "habit_tasks collaborators" on public.habit_tasks
  for all to authenticated using (
    exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.project_id is not null
        and public.has_project_access(h.project_id)
    )
  ) with check (
    exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.project_id is not null
        and public.has_project_access(h.project_id)
    )
  );

-- Habit daily completions
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_on date not null,
  unique (habit_id, completed_on)
);
alter table public.habit_completions enable row level security;
create index if not exists habit_completions_user_id_idx on public.habit_completions(user_id);
create index if not exists habit_completions_habit_id_idx on public.habit_completions(habit_id);
drop policy if exists "habit_completions own" on public.habit_completions;
create policy "habit_completions own" on public.habit_completions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "habit_completions collaborators" on public.habit_completions;
create policy "habit_completions collaborators" on public.habit_completions
  for all to authenticated using (
    exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.project_id is not null
        and public.has_project_access(h.project_id)
    )
  ) with check (
    exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.project_id is not null
        and public.has_project_access(h.project_id)
    )
  );

-- Habit subtask per-day checkmarks
create table if not exists public.habit_task_checkmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_task_id uuid not null references public.habit_tasks(id) on delete cascade,
  checked_on date not null,
  unique (habit_task_id, checked_on)
);
alter table public.habit_task_checkmarks enable row level security;
create index if not exists habit_task_checkmarks_user_id_idx on public.habit_task_checkmarks(user_id);
create index if not exists habit_task_checkmarks_task_id_idx on public.habit_task_checkmarks(habit_task_id);
drop policy if exists "habit_task_checkmarks own" on public.habit_task_checkmarks;
create policy "habit_task_checkmarks own" on public.habit_task_checkmarks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "habit_task_checkmarks collaborators" on public.habit_task_checkmarks;
create policy "habit_task_checkmarks collaborators" on public.habit_task_checkmarks
  for all to authenticated using (
    exists (
      select 1
      from public.habit_tasks ht
      join public.habits h on h.id = ht.habit_id
      where ht.id = habit_task_id
        and h.project_id is not null
        and public.has_project_access(h.project_id)
    )
  ) with check (
    exists (
      select 1
      from public.habit_tasks ht
      join public.habits h on h.id = ht.habit_id
      where ht.id = habit_task_id
        and h.project_id is not null
        and public.has_project_access(h.project_id)
    )
  );

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
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
  category_id uuid references public.user_categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  recurrence jsonb, -- matches RecurrenceRule
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_project_id_idx on public.events(project_id);
drop policy if exists "events select own" on public.events;
create policy "events select own" on public.events for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "events modify own" on public.events;
create policy "events modify own" on public.events for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "events select collaborators" on public.events;
create policy "events select collaborators" on public.events
  for select to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  );
drop policy if exists "events modify collaborators" on public.events;
create policy "events modify collaborators" on public.events
  for all to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  ) with check (
    project_id is not null and public.has_project_access(project_id)
  );

-- Notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  content text not null,
  project_id uuid references public.projects(id) on delete set null,
  category_id uuid references public.user_categories(id) on delete set null,
  last_modified timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_project_id_idx on public.notes(project_id);
drop policy if exists "notes select own" on public.notes;
create policy "notes select own" on public.notes for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "notes modify own" on public.notes;
create policy "notes modify own" on public.notes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "notes select collaborators" on public.notes;
create policy "notes select collaborators" on public.notes
  for select to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  );
drop policy if exists "notes modify collaborators" on public.notes;
create policy "notes modify collaborators" on public.notes
  for all to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  ) with check (
    project_id is not null and public.has_project_access(project_id)
  );

-- Project files (for prototype only; consider using Supabase Storage in production)
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  mime_type text not null,
  size int not null,
  data text not null, -- base64 encoded; not ideal for large files
  project_id uuid references public.projects(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.project_files enable row level security;
create index if not exists project_files_user_id_idx on public.project_files(user_id);
create index if not exists project_files_project_id_idx on public.project_files(project_id);
drop policy if exists "project_files select own" on public.project_files;
create policy "project_files select own" on public.project_files for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "project_files modify own" on public.project_files;
create policy "project_files modify own" on public.project_files for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "project_files select collaborators" on public.project_files;
create policy "project_files select collaborators" on public.project_files
  for select to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  );
drop policy if exists "project_files modify collaborators" on public.project_files;
create policy "project_files modify collaborators" on public.project_files
  for all to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  ) with check (
    project_id is not null and public.has_project_access(project_id)
  );

-- Stories (lightweight backlog/kanban)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'story_status') then
    create type story_status as enum ('backlog', 'in_progress', 'review', 'done');
  end if;
end$$;
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  project_id uuid references public.projects(id) on delete set null,
  category_id uuid references public.user_categories(id) on delete set null,
  status story_status not null default 'backlog',
  acceptance_criteria jsonb not null default '[]'::jsonb,
  estimate_points int,
  estimate_time text,
  linked_task_ids uuid[] not null default '{}',  -- Changed from text[] to uuid[]
  skill_ids text[] not null default '{}', -- skill IDs from user's skill categories (stored in localStorage)
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
create index if not exists stories_skill_ids_gin on public.stories using gin (skill_ids);
drop policy if exists "stories select own" on public.stories;
create policy "stories select own" on public.stories for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "stories modify own" on public.stories;
create policy "stories modify own" on public.stories for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "stories select collaborators" on public.stories;
create policy "stories select collaborators" on public.stories
  for select to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  );
drop policy if exists "stories modify collaborators" on public.stories;
create policy "stories modify collaborators" on public.stories
  for all to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  ) with check (
    project_id is not null and public.has_project_access(project_id)
  );

-- updated_at trigger helpers
create or replace function public.set_updated_at()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
-- No grant: trigger functions don't need to be executable by users

create or replace function public.create_updated_at_triggers()
returns void
security definer
set search_path = public
language plpgsql
as $$
declare
  rec record;
  table_name text;
  trigger_name text;
begin
  for rec in
    select c.oid, c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = c.oid
    where n.nspname = 'public'
      and c.relkind = 'r'
      and a.attname = 'updated_at'
      and a.atttypid = 'timestamptz'::regtype
      and not a.attisdropped
  loop
    table_name := format('public.%I', rec.relname);
    trigger_name := rec.relname || '_updated_at';

    execute format('drop trigger if exists %I on %s', trigger_name, table_name);
    execute format(
      'create trigger %I before update on %s for each row execute function public.set_updated_at()',
      trigger_name,
      table_name
    );
  end loop;
end;
$$;

revoke all on function public.create_updated_at_triggers() from public;
-- No grant: only needs to run during schema setup, not by users

do
$$
begin
  perform public.create_updated_at_triggers();
end;
$$;
-- ===============================
-- Conversations & Messages
-- ===============================

-- ===============================
-- Requests Intake
-- ===============================

-- Priority enum for requests (optional; can use text too)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'request_priority') then
    create type request_priority as enum ('low','medium','high','critical');
  end if;
end$$;
-- Request status enum supports both legacy and expanded labels
do $$
begin
  if not exists (select 1 from pg_type where typname = 'request_status') then
    create type request_status as enum (
      'new','triage','in_progress','blocked','done','cancelled',
      'open','in_review','closed'
    );
  end if;
end$$;
-- Add any missing enum values idempotently (for projects created with the earlier, smaller set)
do $$
begin
  begin
    alter type request_status add value 'open';
  exception
    when duplicate_object then null;
  end;

  begin
    alter type request_status add value 'in_review';
  exception
    when duplicate_object then null;
  end;

  begin
    alter type request_status add value 'closed';
  exception
    when duplicate_object then null;
  end;
end $$;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
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
  linked_task_ids uuid[] not null default '{}',  -- Changed from text[] to uuid[]
  requested_expertise text[] not null default '{}', -- new multi-select expertise
  skill_ids text[] not null default '{}', -- skill IDs from user's skill categories (stored in localStorage)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.requests enable row level security;
create index if not exists requests_user_id_idx on public.requests(user_id);
create index if not exists requests_priority_idx on public.requests(priority);
create index if not exists requests_status_idx on public.requests(status);
create index if not exists requests_created_at_idx on public.requests(created_at);
create index if not exists requests_requested_expertise_gin on public.requests using gin (requested_expertise);
create index if not exists requests_skill_ids_gin on public.requests using gin (skill_ids);

drop policy if exists "requests select own" on public.requests;
create policy "requests select own" on public.requests for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "requests modify own" on public.requests;
create policy "requests modify own" on public.requests for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

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
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null references public.requests(id) on delete cascade,
  author text,
  comment text,
  action text,
  created_at timestamptz not null default now()
);
alter table public.request_updates enable row level security;
create index if not exists request_updates_user_id_idx on public.request_updates(user_id);
create index if not exists request_updates_request_id_idx on public.request_updates(request_id);
create index if not exists request_updates_created_at_idx on public.request_updates(created_at);
drop policy if exists "request_updates select own" on public.request_updates;
create policy "request_updates select own" on public.request_updates for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "request_updates modify own" on public.request_updates;
create policy "request_updates modify own" on public.request_updates for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists conversations_project_id_idx on public.conversations(project_id);
drop policy if exists "conversations select own" on public.conversations;
create policy "conversations select own" on public.conversations for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "conversations modify own" on public.conversations;
create policy "conversations modify own" on public.conversations for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "conversations select collaborators" on public.conversations;
create policy "conversations select collaborators" on public.conversations
  for select to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  );
drop policy if exists "conversations modify collaborators" on public.conversations;
create policy "conversations modify collaborators" on public.conversations
  for all to authenticated using (
    project_id is not null and public.has_project_access(project_id)
  ) with check (
    project_id is not null and public.has_project_access(project_id)
  );

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('user','model')),
  text text not null,
  suggestions jsonb,
  suggestion_list_name text,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create index if not exists messages_user_id_idx on public.messages(user_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
drop policy if exists "messages select own" on public.messages;
create policy "messages select own" on public.messages for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "messages modify own" on public.messages;
create policy "messages modify own" on public.messages for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "messages select collaborators" on public.messages;
create policy "messages select collaborators" on public.messages
  for select to authenticated using (
    exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.project_id is not null
        and public.has_project_access(c.project_id)
    )
  );
drop policy if exists "messages modify collaborators" on public.messages;
create policy "messages modify collaborators" on public.messages
  for all to authenticated using (
    exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.project_id is not null
        and public.has_project_access(c.project_id)
    )
  ) with check (
    exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.project_id is not null
        and public.has_project_access(c.project_id)
    )
  );

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
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid := coalesce(nullif(p_checklist->>'id', '')::uuid, gen_random_uuid());
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
    nullif(p_checklist->>'priority','')::int,
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

  -- Verify ownership after upsert
  if not exists (select 1 from public.checklists where id = v_id and user_id = v_user) then
    raise exception 'Cannot update checklist owned by another user';
  end if;

  -- Tasks: replace by checklist
  delete from public.tasks where user_id = v_user and checklist_id = v_id;
  insert into public.tasks (id, user_id, checklist_id, text, completed_at)
  select coalesce(nullif(t->>'id','')::uuid, gen_random_uuid()), v_user, v_id, t->>'text', nullif(t->>'completedAt','')::date
  from jsonb_array_elements(coalesce(p_tasks, '[]'::jsonb)) t;

  -- Completion history: replace by checklist
  delete from public.checklist_completions where user_id = v_user and checklist_id = v_id;
  insert into public.checklist_completions (id, user_id, checklist_id, completed_on)
  select gen_random_uuid(), v_user, v_id, d::date from unnest(coalesce(p_completion_dates, ARRAY[]::text[])) as d;

  return v_id;
end;
$$;

revoke all on function public.upsert_checklist_bundle(jsonb, jsonb, text[]) from public;
grant execute on function public.upsert_checklist_bundle(jsonb, jsonb, text[]) to authenticated;
