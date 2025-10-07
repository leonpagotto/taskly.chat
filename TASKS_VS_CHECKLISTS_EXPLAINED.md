# Tasks vs Checklists: Database Structure Explained

## Overview

The Taskly.Chat database uses a **parent-child relationship** between `checklists` and `tasks` tables. This is **not duplication** – it's the correct relational design pattern for managing task lists and their items.

## Table Structure

### `checklists` Table (Parent)
**Purpose:** Represents a task list/container – the overall item that holds multiple tasks.

**Fields:**
- `id` - Unique identifier for the list
- `user_id` - Owner of the list
- `name` - List name (e.g., "Morning Routine", "Shopping List", "Project Launch Tasks")
- `category_id` - Optional category assignment
- `project_id` - Optional project assignment
- `due_date` / `due_time` - When the entire list is due
- `priority` - Importance of the list
- `recurrence` - For recurring lists (e.g., daily habits)
- `reminder` - Notification settings
- `created_at` / `updated_at` - Timestamps

**Example Records:**
```sql
-- Checklist 1: Morning Routine
id: "550e8400-e29b-41d4-a716-446655440001"
name: "Morning Routine"
recurrence: {"freq": "daily"}

-- Checklist 2: Project Launch
id: "550e8400-e29b-41d4-a716-446655440002"  
name: "Project Launch Tasks"
project_id: "abc-123"
due_date: "2025-10-15"
```

### `tasks` Table (Child)
**Purpose:** Represents individual items within a checklist – the actual things to do.

**Fields:**
- `id` - Unique identifier for the task item
- `user_id` - Owner (must match checklist owner)
- `checklist_id` - **REQUIRED** - Which list this task belongs to
- `text` - The actual task text (e.g., "Drink water", "Send email")
- `completed_at` - Date when marked complete (null = not done)
- `created_at` / `updated_at` - Timestamps

**Example Records:**
```sql
-- Tasks for Morning Routine checklist
task 1: {checklist_id: "...0001", text: "Drink water"}
task 2: {checklist_id: "...0001", text: "Exercise 10 mins"}
task 3: {checklist_id: "...0001", text: "Review today's goals"}

-- Tasks for Project Launch checklist
task 4: {checklist_id: "...0002", text: "Update documentation"}
task 5: {checklist_id: "...0002", text: "Run final tests"}
```

## Why This Design?

### 1. **Relational Integrity**
A task **cannot exist without** a checklist. This enforces data consistency:
```sql
-- tasks table has foreign key constraint
checklist_id uuid NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE
```
When a checklist is deleted, all its tasks are automatically deleted (cascade).

### 2. **Flexible List Management**
- Single-task lists: Create checklist with 1 task
- Multi-task lists: Create checklist with many tasks
- Recurring lists: Checklist recurs, tasks reset each cycle

### 3. **Proper Metadata Placement**
- **List-level attributes** (due date, priority, recurrence) → `checklists` table
- **Item-level attributes** (text, completion status) → `tasks` table

### 4. **Efficient Queries**
```sql
-- Get all tasks for a specific list
SELECT * FROM tasks WHERE checklist_id = 'uuid-here';

-- Get list with its tasks (join)
SELECT c.name, t.text, t.completed_at 
FROM checklists c
LEFT JOIN tasks t ON t.checklist_id = c.id
WHERE c.id = 'uuid-here';
```

## Common Patterns

### Single-Task Quick Add (e.g., from Today page)
When you create a task from the Today page or AI:

1. **Create checklist** (the container)
   ```typescript
   const checklist = {
     name: "Quick task",
     due_date: "2025-10-07"
   };
   ```

2. **Create task** (the actual item)
   ```typescript
   const task = {
     checklist_id: checklist.id,
     text: "Send the report"
   };
   ```

This creates what **appears** as a single task to users, but is properly structured as checklist + task in the database.

### Multi-Task Lists
When creating a shopping list or project plan:

1. **Create checklist once**
   ```typescript
   const checklist = {
     name: "Grocery Shopping",
     category_id: "errands-category-id"
   };
   ```

2. **Create multiple tasks**
   ```typescript
   const tasks = [
     { checklist_id: checklist.id, text: "Milk" },
     { checklist_id: checklist.id, text: "Bread" },
     { checklist_id: checklist.id, text: "Eggs" }
   ];
   ```

### Recurring Checklists (Habits)
For habits or recurring lists:

1. **Checklist has recurrence**
   ```typescript
   const checklist = {
     name: "Daily Review",
     recurrence: { freq: "daily" }
   };
   ```

2. **Tasks reset each cycle**
   - Completion is tracked per date in `tasks.completed_at`
   - Or overall completion in `checklist_completions` table

## Migration Notes

If you have existing data that only uses one table, you'll need to migrate:

```sql
-- Example: If you have standalone tasks, wrap them in checklists
INSERT INTO checklists (id, user_id, name)
SELECT gen_random_uuid(), user_id, 'Quick task'
FROM old_tasks_table;

-- Then associate tasks with their new checklists
UPDATE tasks SET checklist_id = (generated_id) WHERE ...;
```

## API Usage

### Creating a Task (App Code)
```typescript
// Always create checklist first
const { data: checklist } = await supabase
  .from('checklists')
  .insert({ 
    user_id: userId,
    name: taskName || 'Quick task',
    due_date: dueDate 
  })
  .select()
  .single();

// Then create the task
const { data: task } = await supabase
  .from('tasks')
  .insert({
    user_id: userId,
    checklist_id: checklist.id,
    text: taskText
  })
  .select()
  .single();
```

### Fetching Tasks for Display
```typescript
// Get all tasks with their parent checklist info
const { data } = await supabase
  .from('tasks')
  .select(`
    *,
    checklist:checklists(
      name,
      due_date,
      priority,
      recurrence
    )
  `)
  .eq('user_id', userId);
```

## Summary

✅ **This is NOT duplication** – it's proper relational database design  
✅ **Checklists** = containers/lists (metadata holder)  
✅ **Tasks** = individual items (content holder)  
✅ **Every task must belong to a checklist** (enforced by foreign key)  
✅ **Most efficient way** to manage task lists of any size  

The structure allows for:
- Simple single tasks
- Complex multi-task lists  
- Recurring habits
- Project task organization
- Proper metadata management
- Database integrity and cascading deletes

---

**Last Updated:** October 7, 2025  
**Related Files:** 
- `supabase/schema.sql` (lines 1056-1140)
- `services/supabaseService.ts`
- `types.ts` (Checklist and Task types)
