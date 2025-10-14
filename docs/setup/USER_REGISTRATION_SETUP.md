# User Registration & Email Verification Setup

## ✅ Database Setup Complete

Auto-initialization triggers are now installed:

### 1. **Auto-Create Profile** (`on_auth_user_created` trigger)
When a user signs up via Supabase Auth:
- ✅ Creates a `profiles` record automatically
- ✅ Sets `email_verified = false` initially
- ✅ Links to `auth.users(id)`

### 2. **Auto-Create Free Subscription** (`on_auth_user_created` trigger)
- ✅ Creates a `subscriptions` record with:
  - `status = 'active'`
  - `plan = 'free'`
- ✅ One subscription per user (unique constraint on `user_id`)

### 3. **Auto-Update Email Verification** (`on_auth_user_email_verified` trigger)
When user confirms email:
- ✅ Updates `profiles.email_verified = true`
- ✅ Sets `profiles.email_verified_at` timestamp

## 🔧 Supabase Dashboard Configuration Needed

You need to configure these settings in your Supabase Dashboard:

### Authentication Settings

Go to: **Dashboard → Authentication → Settings**

#### 1. **Enable Email Confirmations** (CRITICAL)
- ✅ **Require email verification**: ON
- This forces users to click the email link before they can log in

#### 2. **Email Templates**
Go to: **Authentication → Email Templates**

Customize these templates (optional but recommended):
- **Confirm signup**: The email users receive to verify their account
- **Magic Link**: For passwordless login (if you use it)
- **Reset Password**: Self-explanatory

**Important:** Make sure the confirmation link redirects to your app URL:
- Default: `{{ .ConfirmationURL }}`
- Custom redirect: `https://yourdomain.com/auth/confirm?token={{ .Token }}`

#### 3. **Site URL & Redirect URLs**
Go to: **Authentication → URL Configuration**

- **Site URL**: `http://localhost:3002` (dev) or `https://yourdomain.com` (prod)
- **Redirect URLs**: Add:
  - `http://localhost:3002/**` (allow all localhost paths)
  - `http://localhost:3002/auth/callback` (specific callback)
  - Your production URLs when deploying

#### 4. **Email Auth Provider**
Go to: **Authentication → Providers**

- ✅ **Email** should be enabled (it is by default)
- Optional: Enable other providers (Google, GitHub, etc.)

### SMTP Configuration (Email Sending)

Supabase provides default SMTP for development, but for production:

Go to: **Project Settings → Auth → SMTP Settings**

**Development (uses Supabase's SMTP):**
- ✅ Works out of the box
- ⚠️ Limited sending rate
- ⚠️ Emails may land in spam

**Production (recommended):**
Configure custom SMTP (SendGrid, AWS SES, Mailgun, etc.):
```
SMTP Host: smtp.sendgrid.net (or your provider)
SMTP Port: 587
SMTP User: apikey (or your username)
SMTP Password: YOUR_API_KEY
Sender Email: noreply@yourdomain.com
Sender Name: Taskly
```

## 📱 Client-Side Integration

### Sign Up Flow (in your React app)

```typescript
import { supabase } from './supabaseClient'

async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:3002/auth/callback'
    }
  })

  if (error) {
    console.error('Sign up error:', error.message)
    return { success: false, error: error.message }
  }

  // User created! Check if email confirmation is required
  if (data.user && !data.session) {
    return {
      success: true,
      message: 'Check your email to confirm your account!'
    }
  }

  // If instant login (email confirmation disabled)
  return { success: true, user: data.user }
}
```

### Email Confirmation Handler

Create `/auth/callback` route or handle in your app:

```typescript
// In your router or App.tsx
useEffect(() => {
  // Listen for auth state changes
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user)
        // Redirect to dashboard or app
      }
      
      if (event === 'USER_UPDATED') {
        console.log('User email verified:', session?.user)
      }
    }
  )

  return () => {
    authListener?.subscription.unsubscribe()
  }
}, [])
```

Or specific callback page:

```typescript
// pages/auth/callback.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Extract token from URL and exchange it
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken!
      }).then(({ data, error }) => {
        if (error) {
          console.error('Auth error:', error)
          navigate('/login?error=confirmation_failed')
        } else {
          console.log('Email confirmed! User:', data.user)
          navigate('/dashboard')
        }
      })
    }
  }, [navigate])

  return <div>Confirming your email...</div>
}
```

## 🧪 Testing the Flow

### Option 1: Test via Supabase Dashboard (Quick)

1. Go to: **Authentication → Users**
2. Click **"Add user"**
3. Enter email + password
4. ✅ Check that:
   - User appears in `auth.users`
   - Profile created automatically in `public.profiles`
   - Subscription created in `public.subscriptions` with `plan='free'`

Verify with SQL:
```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.email_verified,
  s.plan,
  s.status
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.subscriptions s ON s.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 5;
```

### Option 2: Test via Your App (Real Flow)

1. Start your app: `npm run dev` (or equivalent)
2. Go to signup page
3. Register with a real email you can access
4. Check email inbox (including spam)
5. Click confirmation link
6. Verify you're redirected and logged in

### Option 3: Test with Automated Script

Create `test_signup.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qaemzribxkcvjhldpyto.supabase.co',
  'YOUR_ANON_KEY'
)

async function testSignup() {
  const testEmail = `test+${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  console.log('Signing up:', testEmail)
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  })

  if (error) {
    console.error('❌ Signup failed:', error.message)
    return
  }

  console.log('✅ User created:', data.user?.id)
  console.log('📧 Check email for confirmation')

  // Wait a moment then check database
  await new Promise(resolve => setTimeout(resolve, 2000))

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', data.user!.id)
    .single()

  console.log('Profile:', profile ? '✅ Created' : '❌ Missing')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', data.user!.id)
    .single()

  console.log('Subscription:', subscription ? `✅ ${subscription.plan}` : '❌ Missing')
}

testSignup()
```

## 🚨 Common Issues & Fixes

### Issue 1: User created but no profile/subscription
**Cause:** Triggers didn't fire (permissions or trigger not installed)

**Fix:**
```sql
-- Re-run user_initialization.sql
\i supabase/user_initialization.sql

-- Or manually create for existing users:
INSERT INTO profiles (user_id, created_at, updated_at)
SELECT id, created_at, updated_at FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO subscriptions (user_id, status, plan, created_at, updated_at)
SELECT id, 'active', 'free', created_at, updated_at FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

### Issue 2: Emails not sending
**Causes:**
- SMTP not configured (dev mode works but limited)
- Email in spam folder
- Invalid Site URL in Auth settings

**Fix:**
1. Check: Dashboard → Project Settings → Auth → SMTP Settings
2. Use custom SMTP provider for production
3. Add SPF/DKIM records to your domain

### Issue 3: Confirmation link broken
**Cause:** Redirect URL mismatch

**Fix:**
1. Dashboard → Auth → URL Configuration
2. Add your app URL to allowed redirects
3. Ensure `emailRedirectTo` matches in signup call

### Issue 4: RLS blocks new user access
**Cause:** Policies require auth.uid() but user not authenticated yet

**Fix:** Already handled! Your policies use `auth.uid()` which works after email confirmation. If users can't access data:

```sql
-- Check if user is in auth.users
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- Check if session is active (run as that user via app)
SELECT auth.uid(); -- Should return user's UUID, not null
```

## ✅ Final Checklist

Before going live:

- [ ] ✅ Triggers installed (`user_initialization.sql` applied)
- [ ] Dashboard → Auth → Enable "Require email verification"
- [ ] Dashboard → Auth → Configure Site URL
- [ ] Dashboard → Auth → Add Redirect URLs
- [ ] (Production) Configure custom SMTP
- [ ] Test signup with real email
- [ ] Test email confirmation link
- [ ] Verify profile + subscription created
- [ ] Verify user can access app after confirmation

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status:** 🟢 Database ready. Configure dashboard settings → test → deploy!
