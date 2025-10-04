-- Add skill_ids column to requests table
-- This stores the IDs of skills selected from the user's skill categories
-- Skills themselves are stored in localStorage (skillCategories_v1)

-- Add the column if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'requests' 
    and column_name = 'skill_ids'
  ) then
    alter table public.requests 
    add column skill_ids text[] not null default '{}';
  end if;
end$$;

-- Add GIN index for efficient skill_ids array queries
create index if not exists requests_skill_ids_gin on public.requests using gin (skill_ids);

-- Comment for documentation
comment on column public.requests.skill_ids is 'Array of skill IDs from user skill categories. Skills are managed in frontend localStorage.';
