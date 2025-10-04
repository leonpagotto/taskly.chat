# Taskly Email Templates for Supabase

Professional, branded email templates for all Supabase authentication flows.

## 📧 Templates Included

1. **confirm-signup.html** - Welcome email with email confirmation link
2. **invite-user.html** - Team invitation email
3. **magic-link.html** - Passwordless sign-in link
4. **reset-password.html** - Password reset request email
5. **change-email.html** - Email address change confirmation

## 🎨 Design Features

- **Modern, clean design** matching Taskly's purple gradient brand
- **Responsive layout** that works on all devices and email clients
- **Professional styling** with proper spacing and typography
- **Security notices** for sensitive operations
- **Clear CTAs** with prominent action buttons
- **Fallback links** for accessibility

## 📝 How to Configure in Supabase

### Step 1: Access Email Templates

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Each Template

For each email type, follow these steps:

#### Confirm Signup
1. Select **"Confirm signup"** from the template dropdown
2. Copy the contents of `confirm-signup.html`
3. Paste into the **"Email body (HTML)"** field
4. Subject line suggestion: `Confirm your email - Welcome to Taskly! ✓`
5. Click **Save**

#### Invite User
1. Select **"Invite user"** from the template dropdown
2. Copy the contents of `invite-user.html`
3. Paste into the **"Email body (HTML)"** field
4. Subject line suggestion: `You've been invited to join Taskly 🎉`
5. Click **Save**

#### Magic Link
1. Select **"Magic Link"** from the template dropdown
2. Copy the contents of `magic-link.html`
3. Paste into the **"Email body (HTML)"** field
4. Subject line suggestion: `Your magic link to sign in to Taskly 🔐`
5. Click **Save**

#### Reset Password
1. Select **"Change Email Address"** or **"Reset Password"** from the dropdown
2. Copy the contents of `reset-password.html`
3. Paste into the **"Email body (HTML)"** field
4. Subject line suggestion: `Reset your Taskly password 🔑`
5. Click **Save**

#### Change Email Address
1. Select **"Change Email Address"** from the template dropdown
2. Copy the contents of `change-email.html`
3. Paste into the **"Email body (HTML)"** field
4. Subject line suggestion: `Confirm your new email address 📧`
5. Click **Save**

## 🔗 Template Variables

Supabase automatically replaces these variables in your templates:

- `{{ .ConfirmationURL }}` - The action link (confirmation, magic link, reset, etc.)
- `{{ .Token }}` - The verification token (if needed separately)
- `{{ .TokenHash }}` - Hashed token (if needed)
- `{{ .SiteURL }}` - Your site URL from Supabase settings
- `{{ .Email }}` - The recipient's email address

**Note:** The templates use `{{ .ConfirmationURL }}` which Supabase generates automatically based on your Site URL configuration.

## ⚙️ Configuration Requirements

### Set Your Site URL

Make sure your Site URL is configured correctly in Supabase:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3002` (for development) or your production domain
3. Add redirect URLs if needed

### Configure SMTP (Optional but Recommended)

For production use, configure a custom SMTP provider (see `SUPABASE_AUTH_SETUP.md`):

- **Recommended:** Resend (3,000 free emails/month)
- **Alternatives:** SendGrid, Gmail, AWS SES

This ensures reliable email delivery and avoids Supabase's built-in email rate limits.

## 🧪 Testing Your Templates

### Test Emails in Development

1. **Signup Flow:**
   ```bash
   # Go to your app and create a new account
   # Check your email for the confirmation email
   ```

2. **Password Reset:**
   ```bash
   # Click "Forgot Password" in your app
   # Check your email for the reset email
   ```

3. **Magic Link:**
   ```bash
   # Use the magic link sign-in option
   # Check your email for the magic link
   ```

### Preview in Supabase Dashboard

1. In the Email Templates section, you can use the **Preview** feature
2. Supabase will show how the email will look with sample data
3. Test the responsive design by resizing the preview

## 🎨 Customization

### Brand Colors

The templates use Taskly's purple gradient. To customize:

```css
/* Find and replace these colors: */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary purple: #667eea */
/* Secondary purple: #764ba2 */
```

### Logo

To add your logo:

1. Host your logo image (e.g., on Supabase Storage)
2. Add before the H1 in the header section:

```html
<img src="https://your-logo-url.com/logo.png" 
     alt="Taskly Logo" 
     style="width: 120px; height: auto; margin-bottom: 20px;">
```

### Footer Links

Add privacy policy and terms links to the footer:

```html
<p style="margin: 10px 0 0;">
    <a href="https://taskly.chat/privacy" style="color: #667eea; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
    |
    <a href="https://taskly.chat/terms" style="color: #667eea; text-decoration: none; margin: 0 10px;">Terms of Service</a>
</p>
```

## 🔒 Security Best Practices

1. **Link Expiration:** All confirmation links expire (1 hour for most flows)
2. **Single Use:** Magic links and reset links can only be used once
3. **Security Notices:** Templates include warnings about suspicious emails
4. **HTTPS Only:** Ensure your Site URL uses HTTPS in production
5. **No Sensitive Data:** Never include passwords or tokens directly in emails

## 📊 Email Client Compatibility

These templates are tested and work in:

- ✅ Gmail (Desktop & Mobile)
- ✅ Outlook (Desktop & Web)
- ✅ Apple Mail (macOS & iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird
- ✅ Most modern email clients

**Note:** Uses inline CSS for maximum compatibility.

## 🐛 Troubleshooting

### Emails Not Sending

1. Check Supabase Auth logs: **Authentication** → **Logs**
2. Verify SMTP configuration if using custom provider
3. Check spam folder
4. Verify rate limits haven't been exceeded

### Broken Links

1. Verify Site URL is correct in **Authentication** → **URL Configuration**
2. Ensure redirect URLs are whitelisted
3. Check that `{{ .ConfirmationURL }}` variable is present in template

### Styling Issues

1. Email clients strip `<style>` tags - all CSS must be inline
2. Test in multiple email clients
3. Use email testing tools like Litmus or Email on Acid

## 📚 Resources

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Email Template Best Practices](https://www.caniemail.com/)
- [Taskly Auth Setup Guide](../SUPABASE_AUTH_SETUP.md)

## 🚀 Deployment Checklist

Before going to production:

- [ ] All 5 email templates configured in Supabase
- [ ] Subject lines customized
- [ ] Site URL set to production domain (https://taskly.chat)
- [ ] SMTP provider configured (Resend, SendGrid, etc.)
- [ ] Test emails sent and verified in multiple clients
- [ ] Logo added (optional)
- [ ] Footer links updated with privacy/terms pages
- [ ] Email confirmations re-enabled after testing

---

**Need Help?** Refer to `SUPABASE_AUTH_SETUP.md` for complete authentication setup instructions.
