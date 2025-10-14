# User Registration Flow - Complete ✅

## Summary

Your user registration and free subscription flow is now fully configured and ready to use!

## What's Set Up

### ✅ Database Triggers (Automatic)
1. **on_auth_user_created** - When user signs up:
   - Creates `profiles` record
   - Creates `subscriptions` record with `plan='free'` and `status='active'`

2. **on_auth_user_email_verified** - When user confirms email:
   - Updates `profiles.email_verified = true`
   - Sets `profiles.email_verified_at` timestamp

### ✅ Existing Users Backfilled
All 3 existing users now have:
- ✅ Profile records
- ✅ Free subscription (active)
- ✅ Email verification status synced

Current users:
```
leopagotto@gmail.com  → email_verified: ✅ true  | subscription: free (active)
alice+dev@example.com → email_verified: ❌ false | subscription: free (active)
bob+dev@example.com   → email_verified: ❌ false | subscription: free (active)
```

### ✅ RLS Policies Verified
All tables have proper policies for authenticated users:
- `profiles`: Users can read/write their own profile
- `subscriptions`: Users can manage their own subscription
- `checklists`, `tasks`, `projects`: Users can access their own data + shared projects
- All policies restricted to `authenticated` role (no anonymous access)

## User Flow

### 1. User Signs Up (via your app)
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'newuser@example.com',
  password: 'SecurePassword123!',
  options: {
    emailRedirectTo: 'http://localhost:3002/auth/callback'
  }
})
```

**Automatic actions (database triggers):**
- ✅ Creates `auth.users` record
- ✅ Creates `profiles` record (email_verified = false)
- ✅ Creates `subscriptions` record (plan = 'free', status = 'active')

### 2. User Receives Confirmation Email
- Supabase sends email with confirmation link
- Link format: `https://[project].supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=...`

### 3. User Clicks Confirmation Link
- Email verified in `auth.users.email_confirmed_at`
- Trigger updates `profiles.email_verified = true`
- User redirected to your app

### 4. User Can Now Use App
- Authentication: `supabase.auth.getSession()` returns valid session
- Authorization: RLS policies grant access to user's own data
- Subscription: `plan='free'` and `status='active'` ✅

## Supabase Dashboard Configuration

### Required Settings (Go to Dashboard)

1. **Authentication → Settings**
   - ✅ Enable "Confirm email" (require email verification)
   - Set "Confirm email" to: **Enabled**

2. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3002` (dev) or your production URL
   - Redirect URLs: Add:
     - `http://localhost:3002/**`
     - `http://localhost:3002/auth/callback`

3. **Authentication → Email Templates** (optional customization)
   - Confirm signup template
   - Customize branding, copy, button text

4. **Project Settings → Auth → SMTP Settings** (for production)
   - Use custom SMTP provider (SendGrid, AWS SES, etc.)
   - Development: Supabase's default SMTP works (limited rate)

## Testing Instructions

### Quick Test (via Dashboard)
1. Go to **Authentication → Users**
2. Click "Add user" or "Invite user"
3. Enter test email + password
4. Check:
   - User appears in `auth.users` ✅
   - Profile exists in `profiles` ✅
   - Subscription exists with `plan='free'` ✅

### Full Flow Test (via Your App)
1. Open your app: `npm run dev`
2. Go to signup page
3. Register with a real email you can access
4. Check inbox for confirmation email
5. Click confirmation link
6. Verify you're logged in and can access app

### Verify with SQL
```sql
-- Check new user
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as confirmed,
  p.email_verified,
  s.plan,
  s.status
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE u.email = 'newuser@example.com';
```

## App Integration Code Examples

### SignUp Component
```typescript
import { useState } from 'react'
import { supabase } from '@/services/supabaseClient'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    setLoading(false)

    if (error) {
      setMessage(`Error: ${error.message}`)
      return
    }

    if (data.user && !data.session) {
      setMessage('Success! Check your email to confirm your account.')
    } else if (data.session) {
      setMessage('Signed up and logged in!')
      // Navigate to dashboard
    }
  }

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        minLength={6}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      {message && <p>{message}</p>}
    </form>
  )
}
```

### Auth Callback Handler
```typescript
// pages/auth/callback.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

export function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Confirming your email...')

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (!accessToken) {
        setStatus('No access token found')
        return
      }

      if (type === 'signup') {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken!
        })

        if (error) {
          setStatus(`Error: ${error.message}`)
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        setStatus('Email confirmed! Redirecting...')
        setTimeout(() => navigate('/dashboard'), 2000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>{status}</h2>
    </div>
  )
}
```

### Check Subscription in App
```typescript
// hooks/useSubscription.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'

export function useSubscription() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscription() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setSubscription(data)
      }

      setLoading(false)
    }

    fetchSubscription()
  }, [])

  return { subscription, loading, isFree: subscription?.plan === 'free' }
}
```

## Common Issues & Solutions

### Issue: No email received
**Solution:**
- Check spam folder
- Verify SMTP settings in Dashboard → Project Settings → Auth
- For dev: Supabase default SMTP may have delays
- For prod: Use custom SMTP (SendGrid, AWS SES)

### Issue: Email confirmation link doesn't work
**Solution:**
- Check redirect URLs in Dashboard → Auth → URL Configuration
- Ensure `emailRedirectTo` matches allowed URLs
- Verify callback handler exists at redirect path

### Issue: User can't access data after signup
**Solution:**
- Verify user session: `const { data: { session } } = await supabase.auth.getSession()`
- Check RLS policies allow `auth.uid()` access
- Verify triggers created profile + subscription

### Issue: Profile/subscription not created automatically
**Solution:**
```sql
-- Re-apply triggers
\i supabase/user_initialization.sql

-- Or manually create for user
INSERT INTO profiles (user_id, email_verified, created_at, updated_at)
VALUES ('USER_UUID_HERE', false, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO subscriptions (user_id, status, plan, created_at, updated_at)
VALUES ('USER_UUID_HERE', 'active', 'free', NOW(), NOW());
```

## Files Created
- ✅ `supabase/user_initialization.sql` - Auto-create profile/subscription triggers
- ✅ `USER_REGISTRATION_SETUP.md` - Full setup guide (this file)

## Next Steps

1. **Configure Dashboard Settings** (see above)
2. **Test signup flow** with real email
3. **Customize email templates** (optional)
4. **Set up custom SMTP** (for production)
5. **Implement signup UI** in your React app
6. **Add password reset flow** (similar pattern)

## Resources
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email Verification](https://supabase.com/docs/guides/auth/auth-email)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

---

**Status:** 🟢 Ready for user registration with automatic free subscription!

Need help with implementation? Check the code examples above or ask for specific component scaffolding.
