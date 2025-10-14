# AI Edge Function Deployment Guide

This guide walks you through setting up the AI chat proxy with subscription-based rate limiting.

## Architecture Overview

```
Frontend (Browser)
    ↓ (Auth Token)
Supabase Edge Function (ai-chat)
    ↓ (Validates user, checks tier, enforces limits)
Google AI API (Gemini 2.0/2.5)
    ↓ (Returns AI response)
Frontend (Display response)
```

## Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

## Step 2: Apply Database Migration

Run the AI usage logs migration:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref qaemzribxkcvjhldpyto

# Apply the migration
supabase db push
```

Or manually run the SQL in Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/editor
2. Open SQL Editor
3. Copy contents of `supabase/migrations/20250104_ai_usage_logs.sql`
4. Run the SQL

## Step 3: Get Your Google AI API Key

1. Go to https://ai.google.dev/
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the API key (starts with `AIza...`)

## Step 4: Deploy the Edge Function

```bash
# Navigate to your project directory
cd /Users/leo.de.souza1/taskly.chat

# Deploy the Edge Function
supabase functions deploy ai-chat --project-ref qaemzribxkcvjhldpyto
```

## Step 5: Set Environment Variables in Supabase

You need to set the Google AI API key as a secret:

### Option A: Via CLI (Recommended)

```bash
# Set the Google AI API key
supabase secrets set GOOGLE_AI_API_KEY=your_actual_api_key_here --project-ref qaemzribxkcvjhldpyto
```

### Option B: Via Dashboard

1. Go to https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/settings/functions
2. Scroll to "Environment Variables"
3. Click "Add new secret"
4. Name: `GOOGLE_AI_API_KEY`
5. Value: Your API key from Step 3
6. Click "Save"

## Step 6: Verify Edge Function is Working

Test the Edge Function:

```bash
curl -i --location --request POST \
  'https://qaemzribxkcvjhldpyto.supabase.co/functions/v1/ai-chat' \
  --header 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "messages": [
      {
        "role": "user",
        "parts": [{"text": "Hello, test message"}]
      }
    ]
  }'
```

Replace `YOUR_USER_JWT_TOKEN` with an actual user token (you can get this from the browser's localStorage after logging in).

## Step 7: Update Frontend Environment Variables

Update your `.env.production` file:

```env
# Existing variables
VITE_SUPABASE_URL=https://qaemzribxkcvjhldpyto.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_USE_REL_DB=true

# NEW: Enable AI proxy
VITE_USE_AI_PROXY=true
```

## Rate Limits by Tier

| Tier       | Requests/Hour | Model                    | Cost  |
|------------|--------------|--------------------------|-------|
| Free       | 50           | Gemini 2.0 Flash         | $0    |
| Basic      | 200          | Gemini 2.0 Flash         | $4.99 |
| Pro        | 1,000        | Gemini 2.0 Flash         | $9.99 |
| Enterprise | Unlimited    | Gemini 2.5 Flash         | Custom|

## Model Capabilities

### Gemini 2.0 Flash (Free, Basic, Pro)
- Fast responses
- Good for general tasks
- 1M token context window
- Multimodal support

### Gemini 2.5 Flash (Enterprise)
- Enhanced reasoning
- Better code generation
- Improved accuracy
- 1M token context window

## Monitoring Usage

Query AI usage:

```sql
-- Usage by user (last 24 hours)
SELECT 
  user_id,
  tier,
  COUNT(*) as requests,
  SUM(tokens_used) as total_tokens
FROM ai_usage_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, tier
ORDER BY requests DESC;

-- Usage by tier (last 7 days)
SELECT 
  tier,
  DATE(created_at) as date,
  COUNT(*) as requests,
  SUM(tokens_used) as total_tokens
FROM ai_usage_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY tier, DATE(created_at)
ORDER BY date DESC, tier;
```

## Troubleshooting

### Error: "Missing authorization header"
- Make sure user is logged in
- Check that auth token is being sent in requests

### Error: "Rate limit exceeded"
- User has hit their hourly limit
- Check their subscription tier
- Encourage upgrade to higher tier

### Error: "Google AI API key not configured"
- Make sure you set the secret in Step 5
- Redeploy the Edge Function after setting secrets

### Error: "Invalid authentication token"
- Token may be expired
- User needs to log out and log back in

## Security Notes

✅ **Secure**: API key is stored server-side only  
✅ **Validated**: All requests require valid user authentication  
✅ **Rate Limited**: Prevents abuse based on subscription tier  
✅ **Logged**: All usage tracked for analytics and billing  
✅ **Isolated**: Each user can only access their own data  

## Next Steps

After deployment:
1. Test with a free user account (should get 50/hour limit)
2. Test rate limiting by making 51+ requests in an hour
3. Monitor the `ai_usage_logs` table for data
4. Update subscription tiers as needed
5. Consider adding usage dashboard in the app

## Support

For issues:
- Check Supabase Edge Function logs: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/functions/ai-chat/logs
- Check database logs for failed queries
- Test directly with curl to isolate frontend vs backend issues
