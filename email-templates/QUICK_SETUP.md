# Quick Setup: Email Templates in Supabase

Follow these steps to configure all 5 email templates in your Supabase Dashboard.

## 🚀 Quick Steps

### 1. Access Email Templates
Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/templates

### 2. Configure Each Template

#### ✅ Confirm Signup Template
1. Select **"Confirm signup"** from dropdown
2. Copy contents of `email-templates/confirm-signup.html`
3. Paste into "Email body (HTML)" field
4. **Subject:** `Confirm your email - Welcome to Taskly! ✓`
5. Click **Save**

#### 🎉 Invite User Template
1. Select **"Invite user"** from dropdown
2. Copy contents of `email-templates/invite-user.html`
3. Paste into "Email body (HTML)" field
4. **Subject:** `You've been invited to join Taskly 🎉`
5. Click **Save**

#### 🔐 Magic Link Template
1. Select **"Magic Link"** from dropdown
2. Copy contents of `email-templates/magic-link.html`
3. Paste into "Email body (HTML)" field
4. **Subject:** `Your magic link to sign in to Taskly 🔐`
5. Click **Save**

#### 🔑 Reset Password Template
1. Select **"Reset Password"** from dropdown
2. Copy contents of `email-templates/reset-password.html`
3. Paste into "Email body (HTML)" field
4. **Subject:** `Reset your Taskly password 🔑`
5. Click **Save**

#### 📧 Change Email Template
1. Select **"Change Email Address"** from dropdown
2. Copy contents of `email-templates/change-email.html`
3. Paste into "Email body (HTML)" field
4. **Subject:** `Confirm your new email address 📧`
5. Click **Save**

---

## ✅ Checklist

- [ ] Confirm Signup template configured
- [ ] Invite User template configured
- [ ] Magic Link template configured
- [ ] Reset Password template configured
- [ ] Change Email template configured
- [ ] All subject lines customized
- [ ] Test email sent and verified

---

## 🧪 Testing

After configuration, test each email flow:

1. **Signup:** Create a new account → Check confirmation email
2. **Magic Link:** Use passwordless sign-in → Check magic link email
3. **Password Reset:** Click "Forgot Password" → Check reset email

---

## 🎨 Optional Customization

Add your logo to templates (see `email-templates/README.md`):

```html
<img src="https://your-logo-url.com/logo.png" 
     alt="Taskly Logo" 
     style="width: 120px; height: auto; margin-bottom: 20px;">
```

---

**Time Required:** ~10 minutes  
**Difficulty:** Easy - Just copy & paste!
