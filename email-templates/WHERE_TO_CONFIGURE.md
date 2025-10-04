# Where to Configure Email Templates - Visual Guide

## 🎯 Direct Link to Configuration

**Go here:** https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/templates

---

## 📸 What You'll See

When you open that link, you'll see the Supabase Email Templates configuration page:

```
┌─────────────────────────────────────────────────────────┐
│  Supabase Dashboard                                     │
│  Project: qaemzribxkcvjhldpyto                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Authentication > Email Templates                       │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │ Template: [Confirm signup ▼]        │  <- DROPDOWN │
│  └─────────────────────────────────────┘              │
│                                                         │
│  Subject                                                │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Confirm your email                              │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Email body (HTML)                                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │  <- PASTE YOUR HTML TEMPLATE HERE               │  │
│  │                                                  │  │
│  │                                                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [Preview]  [Save]  [Reset to default]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Step-by-Step Process

### Step 1: Select Template Type
1. Click the **Template** dropdown at the top
2. You'll see options:
   - Confirm signup
   - Invite user  
   - Magic Link
   - Reset Password
   - Change Email Address

### Step 2: Open Corresponding HTML File
- For **"Confirm signup"** → Open `email-templates/confirm-signup.html`
- For **"Invite user"** → Open `email-templates/invite-user.html`
- For **"Magic Link"** → Open `email-templates/magic-link.html`
- For **"Reset Password"** → Open `email-templates/reset-password.html`
- For **"Change Email Address"** → Open `email-templates/change-email.html`

### Step 3: Copy Entire HTML
1. Open the HTML file in VS Code
2. Select ALL content (Cmd+A)
3. Copy (Cmd+C)

### Step 4: Paste into Supabase
1. Back in Supabase Dashboard
2. Click in the **"Email body (HTML)"** text box
3. Select all existing content (Cmd+A)
4. Paste your HTML (Cmd+V)

### Step 5: Update Subject Line
Replace the default subject with:

| Template | Subject Line |
|----------|-------------|
| Confirm signup | `Confirm your email - Welcome to Taskly! ✓` |
| Invite user | `You've been invited to join Taskly 🎉` |
| Magic Link | `Your magic link to sign in to Taskly 🔐` |
| Reset Password | `Reset your Taskly password 🔑` |
| Change Email | `Confirm your new email address 📧` |

### Step 6: Preview & Save
1. Click **[Preview]** to see how it looks
2. Click **[Save]** to apply the template

### Step 7: Repeat for All 5 Templates
Go back to Step 1 and repeat for each template type.

---

## ✅ Verification

After configuring all templates, test them:

### Test 1: Signup Confirmation
```bash
# In your app:
1. Create a new account with a test email
2. Check your email inbox
3. You should see the new branded "Welcome to Taskly" email
```

### Test 2: Password Reset
```bash
# In your app:
1. Click "Forgot Password"
2. Enter your email
3. Check your email inbox
4. You should see the new branded "Reset Your Password" email
```

### Test 3: Magic Link (if enabled)
```bash
# In your app:
1. Use magic link sign-in
2. Enter your email
3. Check your email inbox
4. You should see the new branded "Your Magic Link" email
```

---

## 🔄 Relationship with SMTP Configuration

These templates work with **BOTH**:

### Option 1: Supabase Built-in Email (Current)
- Templates configured in dashboard
- Emails sent via Supabase's email service
- ⚠️ Limited to ~30-50 emails/hour
- **Quick Fix:** Disable email confirmations (see SUPABASE_AUTH_SETUP.md)

### Option 2: Custom SMTP (Recommended for Production)
- Templates STILL configured in dashboard (same place!)
- Emails sent via YOUR SMTP provider (Resend, SendGrid, etc.)
- ✅ Higher rate limits (1000s of emails)
- **Setup:** Follow SUPABASE_AUTH_SETUP.md Step 2-5

**Either way, you configure templates in the SAME place - the Supabase Dashboard!**

---

## ❓ FAQ

### Q: Do I need to use Resend API to use these templates?
**A:** No! Templates are configured in Supabase Dashboard regardless of email provider.

### Q: What if I already configured custom SMTP?
**A:** Great! Just paste the templates in the dashboard as described above.

### Q: Can I test without configuring SMTP first?
**A:** Yes, but you need to **disable email confirmations** first (see SUPABASE_AUTH_SETUP.md Quick Fix).

### Q: Do I need to write any code?
**A:** No! This is 100% configuration in Supabase Dashboard.

### Q: Will this work with the password reset I just built?
**A:** Yes! The reset password template will be used when users click "Forgot Password" in your app.

---

## 🎨 Optional: Add Your Logo

After configuring, you can add the Taskly logo to templates:

1. Upload `taskly_symbol.svg` to Supabase Storage or any CDN
2. Get the public URL
3. In each template's HTML in dashboard, add before the `<h1>`:

```html
<img src="https://your-url-here/taskly_symbol.svg" 
     alt="Taskly" 
     style="width: 48px; height: 48px; margin-bottom: 20px;">
```

---

## 🚨 Current Priority

**Before configuring templates, fix the rate limit issue:**

1. Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/providers
2. Click "Email"
3. **Uncheck "Confirm email"**
4. Save

This lets you test login immediately. Then configure templates at your leisure.

---

**Time to configure all templates:** ~10 minutes  
**Difficulty:** Easy - just copy & paste!  
**Code required:** None!
