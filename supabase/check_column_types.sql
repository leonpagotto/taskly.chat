-- Run this query in your Supabase SQL Editor to check current column types

SELECT 
  c.table_name,
  c.column_name,
  c.data_type,
  c.udt_name,
  CASE 
    WHEN c.data_type = 'uuid' THEN '✅ UUID'
    WHEN c.data_type IN ('text', 'character varying') THEN '⚠️  TEXT'
    ELSE c.data_type
  END as type_indicator
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN (
    'projects', 'organizations', 'teams', 'user_categories',
    'checklists', 'tasks', 'habits', 'habit_tasks', 
    'events', 'notes', 'project_files', 'stories',
    'requests', 'request_updates', 'conversations', 'messages',
    'project_users', 'project_members', 'organization_members'
  )
  AND c.column_name IN ('id', 'project_id', 'organization_id', 'user_id', 'checklist_id', 'habit_id')
ORDER BY c.table_name, c.column_name;
