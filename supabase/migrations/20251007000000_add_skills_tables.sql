-- Migration: Add Skills Management Tables
-- Date: 2025-10-07
-- Description: Add dedicated tables for skill categories and skills
--              Currently skills are stored in app_state.data.skillCategories
--              This migration enables proper relational management

-- ============================================================================
-- SKILL CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Prevent duplicate category names per user
  CONSTRAINT skill_categories_user_name_unique UNIQUE (user_id, name)
);

COMMENT ON TABLE public.skill_categories IS 'User-defined skill categories for organizing skills';
COMMENT ON COLUMN public.skill_categories.name IS 'Category name (e.g., "Programming", "Design", "Management")';

-- ============================================================================
-- SKILLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Prevent duplicate skill names within same category
  CONSTRAINT skills_category_name_unique UNIQUE (category_id, name)
);

COMMENT ON TABLE public.skills IS 'Individual skills within categories';
COMMENT ON COLUMN public.skills.name IS 'Skill name (e.g., "React", "Figma", "Team Leadership")';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Skill Categories Policies
DROP POLICY IF EXISTS "Users can view their own skill categories" ON public.skill_categories;
CREATE POLICY "Users can view their own skill categories"
  ON public.skill_categories
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own skill categories" ON public.skill_categories;
CREATE POLICY "Users can insert their own skill categories"
  ON public.skill_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own skill categories" ON public.skill_categories;
CREATE POLICY "Users can update their own skill categories"
  ON public.skill_categories
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own skill categories" ON public.skill_categories;
CREATE POLICY "Users can delete their own skill categories"
  ON public.skill_categories
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Skills Policies
DROP POLICY IF EXISTS "Users can view their own skills" ON public.skills;
CREATE POLICY "Users can view their own skills"
  ON public.skills
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own skills" ON public.skills;
CREATE POLICY "Users can insert their own skills"
  ON public.skills
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own skills" ON public.skills;
CREATE POLICY "Users can update their own skills"
  ON public.skills
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own skills" ON public.skills;
CREATE POLICY "Users can delete their own skills"
  ON public.skills
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS skill_categories_user_id_idx 
  ON public.skill_categories(user_id);

CREATE INDEX IF NOT EXISTS skill_categories_name_idx 
  ON public.skill_categories(name);

CREATE INDEX IF NOT EXISTS skills_user_id_idx 
  ON public.skills(user_id);

CREATE INDEX IF NOT EXISTS skills_category_id_idx 
  ON public.skills(category_id);

CREATE INDEX IF NOT EXISTS skills_name_idx 
  ON public.skills(name);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for skill_categories
DROP TRIGGER IF EXISTS update_skill_categories_updated_at ON public.skill_categories;
CREATE TRIGGER update_skill_categories_updated_at
  BEFORE UPDATE ON public.skill_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for skills
DROP TRIGGER IF EXISTS update_skills_updated_at ON public.skills;
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- DATA MIGRATION (Optional)
-- ============================================================================

-- This query can be used to migrate existing skill data from app_state
-- Run manually after verifying your app_state structure
--
-- INSERT INTO public.skill_categories (id, user_id, name, description)
-- SELECT 
--   (category->>'id')::uuid,
--   user_id,
--   category->>'name',
--   category->>'description'
-- FROM public.app_state,
--   jsonb_array_elements(data->'skillCategories') AS category
-- WHERE (category->>'id') IS NOT NULL
-- ON CONFLICT DO NOTHING;
--
-- INSERT INTO public.skills (id, user_id, category_id, name, description)
-- SELECT 
--   (skill->>'id')::uuid,
--   user_id,
--   (category->>'id')::uuid,
--   skill->>'name',
--   skill->>'description'
-- FROM public.app_state,
--   jsonb_array_elements(data->'skillCategories') AS category,
--   jsonb_array_elements(category->'skills') AS skill
-- WHERE (skill->>'id') IS NOT NULL
--   AND (category->>'id') IS NOT NULL
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check skill categories count
-- SELECT user_id, COUNT(*) as category_count 
-- FROM public.skill_categories 
-- GROUP BY user_id;

-- Check skills count by category
-- SELECT 
--   sc.name as category_name,
--   COUNT(s.id) as skill_count
-- FROM public.skill_categories sc
-- LEFT JOIN public.skills s ON s.category_id = sc.id
-- GROUP BY sc.id, sc.name
-- ORDER BY sc.name;
