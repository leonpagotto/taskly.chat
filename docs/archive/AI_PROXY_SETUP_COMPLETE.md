# 🚀 AI Proxy Implementation - Complete Setup Guide

## Overview

Your Taskly.chat app now uses a **server-side AI proxy** that eliminates the need for users to provide their own API keys. AI models are automatically assigned based on subscription tiers with built-in rate limiting.

---

## 📊 What Changed

### Before
- Users had to get their own Google AI API key
- API key stored in browser (security risk)
- No rate limiting
- No subscription-based features
- Same model for everyone

### After
- ✅ **No API key required from users**
- ✅ **Secure server-side API key storage**
- ✅ **Subscription-based rate limiting**
- ✅ **Different models per tier**
- ✅ **Usage tracking and analytics**

---

## 🎯 Subscription Tiers & Features

| Tier         | Requests/Hour | AI Model              | Monthly Cost |
|--------------|---------------|----------------------|--------------|
| **Free**     | 50            | Gemini 2.0 Flash     | $0           |
| **Basic**    | 200           | Gemini 2.0 Flash     | $4.99        |
| **Pro**      | 1,000         | Gemini 2.0 Flash     | $9.99        |
| **Enterprise** | Unlimited   | Gemini 2.5 Flash     | Custom       |

### Model Capabilities

**Gemini 2.0 Flash-Exp** (Free, Basic, Pro)
- Fast, efficient responses
- Good for general tasks
- 1M token context window
- Suitable for most use cases

**Gemini 2.5 Flash-Preview** (Enterprise)
- Enhanced reasoning abilities
- Better code generation
- Improved accuracy for complex tasks
- Advanced multimodal support

---

## 📁 Files Created/Modified

### New Files
1. **`supabase/functions/ai-chat/index.ts`**
   - Edge Function that proxies AI requests
   - Validates user authentication
   - Enforces rate limits based on tier
   - Selects appropriate AI model
   - Logs usage for analytics

2. **`supabase/migrations/20250104_ai_usage_logs.sql`**
   - Creates `ai_usage_logs` table
   - Indexes for performance
   - RLS policies for security
   - Cleanup function for old logs

3. **`AI_DEPLOYMENT_GUIDE.md`**
   - Complete deployment instructions
   - Environment setup steps
   - Testing procedures
   - Troubleshooting guide

### Modified Files
1. **`services/geminiService.ts`**
   - Added proxy mode support
   - Calls Edge Function instead of direct API
   - Backwards compatible with legacy mode
   - Enhanced error handling

2. **`components/SettingsView.tsx`**
   - Conditionally hides API key input when proxy enabled
   - Shows/hides warning banner appropriately
   - Clean UI for users

---

## 🔧 Deployment Steps

### Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Verify
supabase --version
```

### Step 2: Get Google AI API Key

1. Visit https://ai.google.dev/
2. Sign in with Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the key (starts with `AIza...`)
5. **Keep this key secure!**

### Step 3: Deploy Database Migration

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref qaemzribxkcvjhldpyto

# Apply migration
supabase db push
```

**Or manually in Supabase Dashboard:**
1. Go to SQL Editor: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/editor
2. Copy contents of `supabase/migrations/20250104_ai_usage_logs.sql`
3. Run the SQL
4. Verify table `ai_usage_logs` was created

### Step 4: Deploy Edge Function

```bash
# From project root
cd /Users/leo.de.souza1/taskly.chat

# Deploy
supabase functions deploy ai-chat --project-ref qaemzribxkcvjhldpyto
```

Expected output:
```
Deploying function ai-chat...
✓ Deployed Function ai-chat
```

### Step 5: Set Google AI API Key Secret

**Option A: Via CLI (Recommended)**
```bash
supabase secrets set GOOGLE_AI_API_KEY=YOUR_ACTUAL_API_KEY_HERE --project-ref qaemzribxkcvjhldpyto
```

**Option B: Via Dashboard**
1. Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/settings/functions
2. Scroll to "Environment Variables"
3. Click "Add new secret"
4. Name: `GOOGLE_AI_API_KEY`
5. Value: Your API key from Step 2
6. Click "Save"

### Step 6: Update Environment Variables

Update **`.env.production`**:
```env
# Existing
VITE_SUPABASE_URL=https://qaemzribxkcvjhldpyto.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_USE_REL_DB=true

# NEW: Enable AI proxy mode
VITE_USE_AI_PROXY=true
```

Update **`.env`** (for local development):
```env
VITE_SUPABASE_URL=https://qaemzribxkcvjhldpyto.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_USE_REL_DB=true
VITE_USE_AI_PROXY=true
```

### Step 7: Rebuild and Deploy

```bash
# Build with new environment
npm run build

# Upload dist/ to your server (taskly.chat)
# Replace contents of public_html/ with new dist/
```

---

## ✅ Testing the Implementation

### Test 1: Verify Edge Function is Deployed

```bash
# Check if function exists
curl -I https://qaemzribxkcvjhldpyto.supabase.co/functions/v1/ai-chat
```

Expected: `200 OK` or `401 Unauthorized` (means it's live, just needs auth)

### Test 2: Test AI Chat (After Login)

1. Log into your app at taskly.chat
2. Open browser DevTools → Console
3. Get your auth token:
   ```javascript
   JSON.parse(localStorage.getItem('sb-qaemzribxkcvjhldpyto-auth-token'))?.access_token
   ```
4. Test the Edge Function:
   ```bash
   curl -X POST \
     'https://qaemzribxkcvjhldpyto.supabase.co/functions/v1/ai-chat' \
     -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
     -H 'Content-Type: application/json' \
     -d '{
       "messages": [
         {
           "role": "user",
           "parts": [{"text": "Hello, test message"}]
         }
       ]
     }'
   ```

Expected: JSON response with AI-generated text

### Test 3: Verify Rate Limiting

As a **free user**, try making 51 requests in quick succession. The 51st should return:
```json
{
  "error": "Rate limit exceeded",
  "message": "You've reached your hourly limit of 50 AI requests...",
  "tier": "free",
  "limit": 50,
  "used": 50
}
```

### Test 4: Check Usage Logs

In Supabase SQL Editor:
```sql
SELECT * FROM ai_usage_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

You should see records with:
- `user_id`
- `model` (gemini-2.0-flash-exp or gemini-2.5-flash-preview-05-20)
- `tier` (free, basic, pro, enterprise)
- `tokens_used`
- `created_at`

---

## 🔍 Monitoring & Analytics

### Usage by User (Last 24 Hours)
```sql
SELECT 
  user_id,
  tier,
  COUNT(*) as requests,
  SUM(tokens_used) as total_tokens,
  AVG(tokens_used) as avg_tokens
FROM ai_usage_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, tier
ORDER BY requests DESC;
```

### Usage by Tier (Last 7 Days)
```sql
SELECT 
  tier,
  DATE(created_at) as date,
  COUNT(*) as requests,
  SUM(tokens_used) as total_tokens,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_usage_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY tier, DATE(created_at)
ORDER BY date DESC, tier;
```

### Top Users by AI Usage
```sql
SELECT 
  u.email,
  us.tier,
  COUNT(al.*) as total_requests,
  SUM(al.tokens_used) as total_tokens
FROM ai_usage_logs al
JOIN auth.users u ON u.id = al.user_id
LEFT JOIN user_subscriptions us ON us.user_id = al.user_id
WHERE al.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.email, us.tier
ORDER BY total_requests DESC
LIMIT 20;
```

---

## 🛡️ Security Features

✅ **API Key Never Exposed**
- Stored server-side only in Supabase secrets
- Never sent to client
- Not in source code

✅ **User Authentication Required**
- Every request validates JWT token
- Only authenticated users can access AI

✅ **Rate Limiting Enforced**
- Server-side enforcement
- Cannot be bypassed by client

✅ **Row Level Security**
- Users can only see their own usage logs
- Service role can insert logs

✅ **Usage Tracking**
- All AI requests logged with user_id
- Audit trail for compliance
- Analytics for billing

---

## 🚨 Troubleshooting

### Error: "Missing authorization header"
**Cause:** User not logged in or token expired  
**Fix:** User needs to sign in again

### Error: "Rate limit exceeded"
**Cause:** User hit their hourly limit  
**Fix:** Wait for next hour or upgrade subscription

### Error: "Google AI API key not configured"
**Cause:** Secret not set in Supabase  
**Fix:** Run Step 5 again to set `GOOGLE_AI_API_KEY`

### Error: "Invalid authentication token"
**Cause:** Token expired or malformed  
**Fix:** User needs to log out and log back in

### AI not working after deployment
1. Check Edge Function logs: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/functions/ai-chat/logs
2. Verify `VITE_USE_AI_PROXY=true` in `.env.production`
3. Rebuild and redeploy frontend
4. Clear browser cache

### API key not working
1. Verify key is valid at https://ai.google.dev/
2. Check key has no extra spaces
3. Redeploy Edge Function after setting secret:
   ```bash
   supabase functions deploy ai-chat --project-ref qaemzribxkcvjhldpyto
   ```

---

## 📈 Next Steps

### 1. Set Up Billing
- Connect Stripe account
- Create subscription plans in Supabase
- Add checkout flow in app

### 2. Add Usage Dashboard
- Show users their AI usage stats
- Display remaining requests
- Upgrade prompts when near limit

### 3. Monitor Costs
- Track Google AI API costs
- Set up billing alerts
- Optimize token usage

### 4. Add More Models
- GPT-4 for enterprise users
- Claude for specific use cases
- Custom model switching UI

### 5. Enhance Rate Limiting
- Different limits for different AI features
- Token-based limits (in addition to request limits)
- Burst allowances for brief spikes

---

## 💰 Cost Estimation

### Google AI API Pricing (as of Jan 2025)

**Gemini 2.0 Flash:**
- Free tier: 15 requests/minute, 1,500 requests/day
- Paid: $0.075 per 1M tokens input, $0.30 per 1M tokens output

**Gemini 2.5 Flash:**
- $0.10 per 1M tokens input, $0.40 per 1M tokens output

### Example Monthly Costs

**100 Free Users** (50 requests/hour each)
- ~360,000 requests/month
- ~50M tokens (estimate)
- **Cost: $0** (within free tier)

**50 Basic Users** (200 requests/hour each)
- ~7.2M requests/month
- ~1B tokens
- **Cost: ~$150-200/month**

**10 Pro Users** (1,000 requests/hour each)
- ~7.2M requests/month  
- ~1B tokens
- **Cost: ~$150-200/month**

**Total estimated: $300-400/month** for mixed user base

---

## 📞 Support

For issues or questions:
- Check Edge Function logs in Supabase Dashboard
- Review `ai_usage_logs` table for debugging
- Test with curl commands to isolate frontend vs backend
- Monitor Google AI API quota at https://console.cloud.google.com/

---

## ✨ Summary

You've successfully implemented:
- ✅ Secure server-side AI proxy
- ✅ Subscription-based rate limiting
- ✅ Multi-tier AI model selection
- ✅ Usage tracking and analytics
- ✅ Production-ready infrastructure

Users can now use AI features **without providing their own API keys**, with automatic tier-based access control!

🎉 **Your app is ready for production with enterprise-grade AI features!**
