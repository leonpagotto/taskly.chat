# Supabase Authentication Setup Guide

## 🚨 Important: Email Rate Limits Issue

If you're experiencing **login timeouts** or authentication hanging, it's likely due to Supabase's built-in email service rate limits.

### The Problem

Supabase's built-in email service:
- ❌ Has **very restrictive rate limits** (few emails per hour)
- ❌ **Not meant for production** use
- ❌ Gets **throttled or blocked** after a few attempts
- ❌ Causes auth operations to **timeout** when rate limited

### Quick Fix for Development (5 minutes)

**Disable Email Confirmations Temporarily:**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/providers

2. Click on **"Email"** provider

3. **Disable** "Enable email confirmations"
   - Uncheck: "Confirm email"
   - This allows sign-ups without email verification

4. Click **"Save"**

5. **Clear your browser cache** and try logging in again

✅ **This will let you sign in immediately without email verification**

### Production Solution (30 minutes)

For production, you **must** configure a custom SMTP provider:

#### Option 1: Resend (Recommended - Easy & Free tier)

1. Sign up at https://resend.com (Free: 3,000 emails/month)

2. Get your API key from https://resend.com/api-keys

3. In Supabase Dashboard → Authentication → Settings → SMTP Settings:
   ```
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [Your Resend API Key]
   From: noreply@yourdomain.com
   ```

#### Option 2: SendGrid (Reliable)

1. Sign up at https://sendgrid.com (Free: 100 emails/day)

2. Get your API key

3. In Supabase Dashboard → SMTP Settings:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   From: noreply@yourdomain.com
   ```

#### Option 3: Gmail (Development Only)

1. Enable 2FA on your Gmail account
2. Generate an App Password
3. In Supabase Dashboard → SMTP Settings:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your.email@gmail.com
   Password: [Your App Password]
   From: your.email@gmail.com
   ```

⚠️ **Note:** Gmail has daily limits (500 emails/day) and is not recommended for production.

### Verify It's Working

After configuring SMTP:

1. **Test Sign Up:**
   - Go to your app
   - Create a new account
   - Check your email inbox for verification

2. **Check Logs:**
   - Supabase Dashboard → Authentication → Logs
   - Look for successful email sends

3. **Test Password Reset:**
   - Click "Forgot Password"
   - Check email for reset link

### Troubleshooting

**Still timing out?**

1. **Check Supabase Logs:**
   - Dashboard → Authentication → Logs
   - Look for rate limit or email errors

2. **Verify SMTP Settings:**
   - Dashboard → Authentication → Settings → SMTP Settings
   - Test the connection

3. **Check Rate Limits:**
   - Free tier: Check if you've hit limits
   - Paid tier: Verify your plan limits

**Can't receive emails?**

1. **Check spam folder**
2. **Verify domain DNS** (for custom domains)
3. **Test with different email** (Gmail, Outlook, etc.)
4. **Check SMTP provider** dashboard for delivery logs

### Rate Limits by Provider

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| **Supabase Built-in** | ~30-50/hour ⚠️ | N/A |
| **Resend** | 3,000/month | From $20/month |
| **SendGrid** | 100/day | From $15/month |
| **Mailgun** | 5,000/month | From $35/month |
| **AWS SES** | 62,000/month | $0.10 per 1,000 emails |

### Development vs Production

**Development:**
```bash
# Disable email confirmations for faster testing
✅ Supabase Dashboard → Auth → Email → Disable "Confirm email"
```

**Production:**
```bash
# Enable confirmations with custom SMTP
✅ Configure custom SMTP provider
✅ Enable email confirmations
✅ Set up custom email templates
✅ Configure rate limiting
```

### Need Help?

- **Supabase Docs:** https://supabase.com/docs/guides/auth/auth-smtp
- **Rate Limits:** https://supabase.com/docs/guides/platform/rate-limits
- **Email Templates:** https://supabase.com/docs/guides/auth/auth-email-templates

---

## Quick Checklist

- [ ] Disable email confirmations for development
- [ ] Sign up and test login works
- [ ] Choose SMTP provider for production
- [ ] Configure SMTP settings in Supabase
- [ ] Re-enable email confirmations
- [ ] Test email delivery
- [ ] Monitor rate limits
- [ ] Set up custom domain (optional)
