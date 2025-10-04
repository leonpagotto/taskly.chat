-- Create AI usage logs table for rate limiting and analytics
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  tier TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created 
  ON ai_usage_logs(user_id, created_at DESC);

-- Add index for analytics
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_tier 
  ON ai_usage_logs(tier, created_at DESC);

-- Enable RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage logs
DROP POLICY IF EXISTS "Users can view own AI usage" ON ai_usage_logs;
CREATE POLICY "Users can view own AI usage"
  ON ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert usage logs (from Edge Function)
DROP POLICY IF EXISTS "Service role can insert AI usage" ON ai_usage_logs;
CREATE POLICY "Service role can insert AI usage"
  ON ai_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- Add cleanup function to delete old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM ai_usage_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Optional: Create a scheduled job to run cleanup weekly
-- This requires pg_cron extension, uncomment if available:
-- SELECT cron.schedule(
--   'cleanup-ai-logs',
--   '0 0 * * 0', -- Every Sunday at midnight
--   $$ SELECT cleanup_old_ai_logs(); $$
-- );

COMMENT ON TABLE ai_usage_logs IS 'Tracks AI API usage for rate limiting and analytics';
COMMENT ON COLUMN ai_usage_logs.tier IS 'Subscription tier at time of request: free, basic, pro, enterprise';
COMMENT ON COLUMN ai_usage_logs.model IS 'AI model used: gemini-2.0-flash-exp or gemini-2.5-flash-preview-05-20';
