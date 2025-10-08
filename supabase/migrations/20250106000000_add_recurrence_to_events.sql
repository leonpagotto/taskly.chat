-- Add recurrence column to events table to support recurring events

ALTER TABLE public.events 
ADD COLUMN recurrence jsonb;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.events.recurrence IS 'Stores RecurrenceRule object for recurring events';