# Login Timeout Troubleshooting Guide

## 🚨 Problem: Login Still Timing Out After 10 Seconds

You're seeing this error:
```
Sign in timed out after 10000ms. Please check your internet connection and try again.
```

## 🔍 Diagnostic Steps

### Step 1: Use the Diagnostic Tool

Open this page in your browser:
```
http://localhost:3002/supabase-diagnostics.html
```

Or if running dev server:
```
http://localhost:5173/supabase-diagnostics.html
```

This tool will help identify the exact issue!

---

## 🎯 Common Causes & Solutions

### Cause 1: Email Confirmation Still Required ⚠️ MOST COMMON

**Symptoms:**
- Timeout after exactly 10 seconds
- No error in Supabase Auth Logs
- Sign up works but creates no session

**Solution:**

1. Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/providers
2. Click "Email" provider
3. **UNCHECK** "Confirm email"
4. Click **Save**
5. **IMPORTANT**: Delete any test accounts you created while confirmation was enabled
6. Create a NEW account with the diagnostic tool or your app

**Why:** Even if you disable email confirmation, accounts created BEFORE you disabled it will still require confirmation!

---

### Cause 2: Email Rate Limits Hit 🚫

**Symptoms:**
- Multiple failed login attempts
- Timeout specifically on authentication calls
- Works after waiting 1 hour

**Check:**
1. Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/logs/auth-logs
2. Look for "rate limit" errors

**Solution:**
- **Quick fix:** Wait 1 hour and try again
- **Permanent fix:** Configure custom SMTP (see `SUPABASE_AUTH_SETUP.md`)

---

### Cause 3: Project Paused or Network Issues 🌐

**Symptoms:**
- Timeout on ALL Supabase calls (not just auth)
- Even database API times out

**Check:**
1. Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/settings/general
2. Check "Pause project" status

**Solution:**
- Resume project if paused
- Check your internet connection
- Try from a different network (mobile hotspot)
- Check if corporate firewall is blocking Supabase

---

### Cause 4: Wrong Credentials or User Doesn't Exist 👤

**Symptoms:**
- Instant error (< 1 second), not timeout
- Error message: "Invalid login credentials"

**Solution:**
1. Use the diagnostic tool to **Sign Up** first
2. Then try **Sign In** with the same credentials
3. Make sure "Confirm email" is disabled BEFORE signing up

---

### Cause 5: Redirect URLs Not Configured 🔗

**Symptoms:**
- Login works but redirects fail
- "Invalid redirect URL" errors

**Solution:**
1. Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/url-configuration
2. Set **Site URL** to: `http://localhost:3002`
3. Add **Redirect URLs**: `http://localhost:3002/**`
4. Click **Save**

---

## 📋 Step-by-Step Diagnostic Checklist

Run through this checklist:

- [ ] **Open diagnostic tool** at http://localhost:3002/supabase-diagnostics.html
- [ ] **Run Network Tests** - Should show "✓ Supabase reachable"
- [ ] **Test Database API** - Should show "✓ Database connected"
- [ ] **Test Auth Endpoint** - Should show "✓ Auth health endpoint: 200"
- [ ] **Check Auth Settings:**
  - [ ] Go to Auth → Providers → Email
  - [ ] Verify "Confirm email" is **UNCHECKED**
  - [ ] Click Save if you made changes
- [ ] **Delete old test accounts:**
  - [ ] Go to Auth → Users
  - [ ] Delete any users created before you disabled email confirmation
- [ ] **Try Sign Up with diagnostic tool:**
  - [ ] Enter test email (e.g., test@example.com)
  - [ ] Enter password (min 6 characters)
  - [ ] Click "Test Sign Up"
  - [ ] Should complete in < 2 seconds and create a session
- [ ] **Try Sign In with diagnostic tool:**
  - [ ] Use same credentials
  - [ ] Click "Test Sign In"
  - [ ] Should complete in < 2 seconds
- [ ] **Check Auth Logs for errors:**
  - [ ] Go to Logs → Auth Logs
  - [ ] Look for red error entries
  - [ ] Check for rate limit warnings

---

## 🔧 Emergency Fixes

### If Nothing Works:

1. **Create a new Supabase project** (10 minutes):
   - Go to https://supabase.com/dashboard
   - Create new project
   - Update `.env.local` with new URL and anon key
   - Disable email confirmation from the start
   - Test login

2. **Use local auth only** (temporary):
   - The app works without Supabase
   - Data stays in browser localStorage
   - Good for testing UI/features

3. **Check Supabase Status**:
   - https://status.supabase.com/
   - Verify no ongoing incidents

---

## 📊 What the Logs Should Show

### Successful Sign In (< 2 seconds):
```
🔐 [authService] signInWithPassword called
🔐 [authService] Calling supabase.auth.signInWithPassword...
🔐 [authService] Sign-in response received
🔐 [authService] Sign-in successful
```

### Failed Sign In (timeout):
```
🔐 [authService] signInWithPassword called
🔐 [authService] Calling supabase.auth.signInWithPassword...
[10 seconds pass]
🔐 [authService] Sign-in exception: Error: Sign in timed out after 10000ms
```

---

## 🎯 Next Steps

1. **Use the diagnostic tool FIRST** - it will pinpoint the exact issue
2. **Focus on email confirmation** - this is the #1 cause
3. **Check Supabase Auth Logs** - they show the real errors
4. **If all else fails** - create a new Supabase project with email confirmation disabled from the start

---

## 💡 Pro Tips

1. **Always disable email confirmation for development**
2. **Use the diagnostic tool after ANY Supabase config change**
3. **Delete and recreate test accounts** after changing auth settings
4. **Configure custom SMTP** before going to production
5. **Monitor rate limits** in Supabase dashboard

---

## 🆘 Still Not Working?

If you've tried everything:

1. Take a screenshot of the diagnostic tool results
2. Check the browser console for ALL errors
3. Go to Supabase → Logs → Auth Logs and check for errors
4. Share:
   - Diagnostic tool results
   - Browser console errors
   - Supabase Auth Log errors
   - What you've tried so far

---

**Remember:** The timeout happens because Supabase is WAITING for something (usually email confirmation). It's not a network issue - it's a configuration issue!
