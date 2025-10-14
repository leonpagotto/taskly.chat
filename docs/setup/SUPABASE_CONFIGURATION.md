# Complete Supabase Configuration Guide for Taskly.chat

## ✅ Already Configured

- ✅ **Database Schema**: All 28 tables with RLS policies
- ✅ **Helper Functions**: Security definer functions for access control
- ✅ **Triggers**: Auto-create profile + subscription on signup
- ✅ **API Keys**: Anon key configured in `.env.production`

---

## 🔧 Required Configuration in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto

### 1. Authentication URLs (CRITICAL - Must Do!)

**Location:** Authentication → URL Configuration

**Set these exact values:**

```
Site URL:
https://taskly.chat

Redirect URLs (click "Add URL" for each):
https://taskly.chat/**
https://taskly.chat/auth/callback

Keep for development:
http://localhost:3002/**
http://localhost:3002/auth/callback
```

**Why:** Without this, users can't sign up, log in, or confirm their email.

**Status:** ⚠️ **NOT YET CONFIGURED** - Do this after uploading files!

---

### 2. Email Authentication Settings

**Location:** Authentication → Providers → Email

**Current Settings to Verify:**

```
✅ Enable Email provider: ON
✅ Confirm email: ON (required by your app)
✅ Secure email change: ON (recommended)
✅ Double confirm email change: Optional (your choice)
```

**Email Rate Limiting:**
- Default: 4 emails per hour (per user)
- Recommended for production: Keep default or increase to 6/hour
- Located in: Authentication → Rate Limits

**Why:** Controls how email confirmation and auth work.

**Status:** ✅ Should already be enabled (default)

---

### 3. Email Templates (Optional but Recommended)

**Location:** Authentication → Email Templates

Customize these emails with your branding:

#### **Confirm Signup Email:**
Default subject: `Confirm Your Signup`
Recommended: `Welcome to Taskly.chat - Confirm Your Email`

```html
<h2>Welcome to Taskly.chat!</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>If you didn't create this account, you can safely ignore this email.</p>
```

#### **Magic Link Email:**
(If you use magic link login in the future)

#### **Reset Password Email:**
Default subject: `Reset Your Password`

```html
<h2>Reset Your Taskly.chat Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
```

**Why:** Better user experience with branded emails.

**Status:** ⏳ Optional - Can customize later

---

### 4. Database Connection (Already Working)

**Location:** Settings → Database

Your connection string is already working:
```
Host: db.qaemzribxkcvjhldpyto.supabase.co
Database: postgres
User: postgres
Password: Palmeiras4786@@
```

**Status:** ✅ Already configured and tested

---

### 5. API Settings (Already Working)

**Location:** Settings → API

Your API keys are already in `.env.production`:
```bash
VITE_SUPABASE_URL="https://qaemzribxkcvjhldpyto.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGc..."
```

**Status:** ✅ Already configured

---

### 6. Security Settings (Recommended to Check)

**Location:** Authentication → Policies

**Recommended Settings:**

```
✅ Minimum password length: 8 characters (default)
✅ Require lowercase: Optional
✅ Require uppercase: Optional
✅ Require numbers: Optional
✅ Require special characters: Optional
```

**Rate Limits:**
```
Authentication attempts: 5 per minute (default)
Password recovery: 2 per hour (default)
Email signups: 4 per hour (default)
```

**Status:** ✅ Defaults are good for starting

---

### 7. Custom SMTP (Optional - For Production Scaling)

**Location:** Settings → Auth → SMTP Settings

**Default:** Supabase provides free email sending
**Limits:** ~100 emails/hour per project

**When to configure custom SMTP:**
- You have 50+ users signing up per day
- You want branded sender email (from@taskly.chat)
- You need higher email limits

**Recommended Providers:**
- SendGrid (99k emails/month free)
- AWS SES ($0.10 per 1k emails)
- Resend (3k emails/month free)

**Status:** ⏳ Not needed now - Configure when you scale

---

### 8. RLS Policies (Already Done!)

**Location:** Database → Policies

**Status:** ✅ All 28 tables have RLS enabled + forced
- Projects: Owner-based access
- Tasks/Notes/Files: Via project membership
- Subscriptions: User-specific
- Profiles: User-specific

You can view policies in SQL Editor:
```sql
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Status:** ✅ Already configured

---

### 9. CORS Settings (Default is Fine)

**Location:** Settings → API → CORS Settings

**Current (should be):**
```
Allowed origins: * (all origins)
```

**For production hardening (optional):**
```
Allowed origins: https://taskly.chat
```

**Status:** ✅ Default works - Can tighten later

---

### 10. Storage Buckets (NOT NEEDED)

Your app uses browser `localStorage` for file references, not Supabase Storage.

**Status:** ✅ Not required for your app

---

## 📋 Configuration Checklist

Before going live:

- [ ] **CRITICAL:** Set Site URL to `https://taskly.chat`
- [ ] **CRITICAL:** Add Redirect URLs (`https://taskly.chat/**`)
- [ ] Verify Email provider is enabled
- [ ] Check email rate limits (default is fine)
- [ ] Customize email templates (optional but recommended)
- [ ] Review password requirements (defaults are good)
- [ ] Test signup flow works
- [ ] Test email confirmation works
- [ ] Test login works
- [ ] Verify RLS prevents unauthorized access

---

## 🧪 Testing Your Configuration

After configuring URLs, test these flows:

### Test 1: New User Signup
```
1. Go to https://taskly.chat
2. Click "Sign Up"
3. Enter email + password
4. Should see "Check your email" message
5. Check email inbox (and spam folder)
6. Click confirmation link
7. Should redirect to https://taskly.chat and be logged in
8. Verify profile + subscription created (check Supabase Table Editor)
```

### Test 2: Login
```
1. Go to https://taskly.chat
2. Click "Log In"
3. Enter credentials
4. Should log in successfully
5. Create a project/task
6. Data should save to database
```

### Test 3: RLS Security
```
1. Create second account (different email)
2. Log in with second account
3. Try to access first account's data
4. Should see NOTHING (RLS blocking)
5. Each user sees only their own data
```

### Test 4: Email Confirmation Required
```
1. Sign up with new email
2. Try to access app WITHOUT clicking confirmation link
3. Should require email verification first
4. After confirming, access should be granted
```

---

## 🎯 What Data Gets Saved to Supabase

When a user signs up and uses the app, this is saved:

### On Signup (Automatic via Triggers):
- ✅ **auth.users** - User account (email, encrypted password)
- ✅ **public.profiles** - User profile (display name, preferences)
- ✅ **public.subscriptions** - Free subscription record

### When User Creates Data:
- ✅ **projects** - User's projects
- ✅ **tasks** - Tasks within projects
- ✅ **notes** - User's notes
- ✅ **events** - Calendar events
- ✅ **habits** - User's habits + completions
- ✅ **stories** - User stories (for agile workflow)
- ✅ **requests** - User requests/intake forms
- ✅ **checklists** - Task checklists
- ✅ **conversations** - Chat conversations with AI
- ✅ **messages** - Chat messages
- ✅ **user_categories** - Custom categories
- ✅ **project_files** - File metadata (actual files in localStorage)

### What's NOT Saved to Supabase:
- ❌ File contents (stored in browser localStorage)
- ❌ UI preferences like sidebar collapsed state (localStorage)
- ❌ Temporary filters/view modes (localStorage)
- ❌ Gemini AI API key (localStorage + env var)

---

## 🔒 Security Features Already Active

Your database has these protections:

1. **RLS Enabled + Forced** - Users can only access their own data
2. **Email Verification Required** - No access before confirming email
3. **Secure Functions** - Helper functions use SECURITY DEFINER properly
4. **Password Hashing** - Supabase Auth handles secure password storage
5. **JWT Tokens** - Short-lived tokens (1 hour), auto-refresh
6. **Rate Limiting** - Prevents brute force attacks
7. **SQL Injection Protected** - Using parameterized queries

---

## 🚀 Production Readiness Summary

| Component | Status | Action Needed |
|-----------|--------|---------------|
| **Database Schema** | ✅ Ready | None |
| **RLS Policies** | ✅ Ready | None |
| **API Keys** | ✅ Ready | None |
| **Site URL** | ⚠️ Configure | Add taskly.chat |
| **Redirect URLs** | ⚠️ Configure | Add taskly.chat/** |
| **Email Templates** | ⏳ Optional | Customize branding |
| **SMTP** | ✅ Default OK | Scale later |
| **Rate Limits** | ✅ Default OK | Monitor usage |
| **Triggers** | ✅ Ready | None |

---

## 📊 Monitoring Your Database

After deployment, monitor these:

**Location:** Dashboard → Project Home

### Key Metrics:
- **Database Size** - Free tier: 500 MB
- **Bandwidth** - Free tier: 2 GB egress/month
- **Authentication** - Monthly active users
- **API Requests** - Monitor for spikes

### Logs to Check:
- **Auth Logs** - Authentication → Logs (signup/login events)
- **Database Logs** - Database → Logs (errors, slow queries)
- **API Logs** - Logs → API (request errors)

---

## ❓ Common Questions

### Q: Do I need to configure anything for data to save?
**A:** No! Just configure the URLs. Your database schema + RLS is already set up.

### Q: Will user data automatically save to Supabase?
**A:** Yes! Once logged in, all projects/tasks/notes save to database automatically.

### Q: Do I need to set up Storage buckets?
**A:** No! Your app uses browser localStorage for files.

### Q: What happens if a user signs up?
**A:** Automatically:
1. Account created in `auth.users`
2. Profile created in `public.profiles` (trigger)
3. Free subscription created in `public.subscriptions` (trigger)
4. Email confirmation sent
5. After confirming, user can log in and use app

### Q: How do I verify data is saving?
**A:** Go to: Table Editor → Select table (e.g., projects) → See user data

---

## 🆘 Troubleshooting

### Issue: "Email confirmation link doesn't work"
**Fix:** Verify Site URL is `https://taskly.chat` (no trailing slash)

### Issue: "Can't log in after signup"
**Fix:** Check if email was confirmed. Resend confirmation in Auth → Users

### Issue: "Data not saving"
**Fix:** Check browser console for RLS policy errors. Verify user is logged in.

### Issue: "Email not received"
**Fix:** Check spam folder. Verify email provider enabled. Check rate limits.

### Issue: "Other users can see my data"
**Fix:** RLS issue. Run: `SELECT * FROM pg_policies;` to verify policies exist.

---

## 🎉 Next Steps

1. **Upload your files** to taskly.chat (dist/ contents + .htaccess)
2. **Configure URLs** in Supabase Dashboard (Site URL + Redirect URLs)
3. **Test signup flow** - Create account, confirm email, log in
4. **Test data saving** - Create project, verify in Table Editor
5. **Test RLS** - Create second account, verify data isolation

---

**Your Supabase Project:** qaemzribxkcvjhldpyto  
**Dashboard:** https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto  
**Quick Link to URL Config:** https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/url-configuration

**Ready to deploy!** 🚀
