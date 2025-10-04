-- Add skill_ids column to stories table
-- This stores the IDs of skills that are required/relevant for this story
-- Skills themselves are stored in localStorage (skillCategories_v1)

-- Add the column if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'stories' 
    and column_name = 'skill_ids'
  ) then
    alter table public.stories 
    add column skill_ids text[] not null default '{}';
  end if;
end$$;

-- Add GIN index for efficient skill_ids array queries
create index if not exists stories_skill_ids_gin on public.stories using gin (skill_ids);

-- Comment for documentation
comment on column public.stories.skill_ids is 'Array of skill IDs from user skill categories. Skills are managed in frontend localStorage.';
