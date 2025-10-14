# Namecheap Deployment - Complete Setup Summary

## ✅ What's Ready for Deployment

### Files Created
1. **`.env.production`** - Production environment variables (same Supabase project)
2. **`.htaccess.production`** - Apache config for SPA routing, HTTPS redirect, caching
3. **`deploy.sh`** - Build script with upload instructions
4. **`NAMECHEAP_DEPLOYMENT.md`** - Full deployment guide (detailed)
5. **`DEPLOY_CHECKLIST.md`** - Quick 5-step checklist (fast track)
6. **`dist/`** - Production build (1 MB, ready to upload)

### Build Status
✅ Production build completed successfully:
- `dist/index.html` - 12.25 KB (gzipped: 3.43 KB)
- `dist/assets/index-Bzx3NKn_.js` - 1 MB (gzipped: 245 KB)
- Total: ~1 MB uncompressed, ~250 KB gzipped

---

## 🚀 Deploy Now (5 Minutes)

### Option 1: Quick Deploy via cPanel

1. **Go to your Namecheap cPanel:**
   - URL: `yourdomain.com/cpanel`
   - Login with your Namecheap credentials

2. **Open File Manager:**
   - Navigate to `public_html/`
   - Delete existing files (or backup first)

3. **Upload files:**
   - Click **Upload**
   - Select **ALL files from `dist/` folder**:
     - `index.html`
     - `assets/` folder (entire folder)
   - Wait for upload to complete

4. **Upload .htaccess:**
   - Back in project folder
   - Upload `.htaccess.production`
   - **Rename it to `.htaccess`** (no .production extension)

5. **Enable SSL:**
   - cPanel → **SSL/TLS Status**
   - Find your domain → **Run AutoSSL**
   - Wait 5-15 minutes

### Option 2: Deploy via FTP

```bash
# Using FileZilla, Cyberduck, or any FTP client:
Host: ftp.yourdomain.com
Username: [your_cpanel_username]
Password: [your_cpanel_password]
Port: 21

# Upload:
Local: dist/* → Remote: public_html/
Local: .htaccess.production → Remote: public_html/.htaccess
```

### Option 3: Deploy via Command Line

```bash
# If SSH is enabled on your Namecheap account:
scp -r dist/* username@yourdomain.com:~/public_html/
scp .htaccess.production username@yourdomain.com:~/public_html/.htaccess
```

---

## ⚙️ Configure Supabase (CRITICAL!)

**Without this, authentication won't work in production!**

Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/url-configuration

### 1. Set Site URL
```
Site URL: https://yourdomain.com
```
(Replace `yourdomain.com` with your actual domain)

### 2. Add Redirect URLs
Click "Add URL" and add these **two** URLs:
```
https://yourdomain.com/**
https://yourdomain.com/auth/callback
```

### 3. Keep Dev URLs (for local testing)
Leave these (or add if missing):
```
http://localhost:3002/**
http://localhost:3002/auth/callback
```

### 4. Click **Save**

---

## 🧪 Test Your Deployment

Visit: `https://yourdomain.com`

**Test Checklist:**
1. ✅ Page loads (no blank screen)
2. ✅ No errors in browser console (F12 → Console)
3. ✅ Can navigate to different pages (e.g., /auth, /dashboard)
4. ✅ Sign up with test email
5. ✅ Receive confirmation email
6. ✅ Click email link → redirects to your domain
7. ✅ Can log in
8. ✅ Can create projects/tasks
9. ✅ Data persists after refresh

---

## 🔧 Common Issues & Quick Fixes

### Issue: Blank white screen
**Fix:**
- Check browser console for errors
- Verify `.htaccess` exists in `public_html/`
- Ensure `dist/` contents uploaded (not the folder itself)

### Issue: 404 on routes (/dashboard, etc.)
**Fix:**
- `.htaccess` missing or incorrect
- Re-upload `.htaccess.production` as `.htaccess`
- Check file permissions: 644

### Issue: "Auth redirect error" or "Invalid redirect URL"
**Fix:**
- Add `https://yourdomain.com/**` to Supabase redirect URLs
- Verify Site URL is correct (no trailing slash)
- Rebuild if you changed `.env.production`:
  ```bash
  npm run build
  # Re-upload dist/
  ```

### Issue: Email confirmation link doesn't work
**Fix:**
- Supabase Site URL must match your domain exactly
- Email redirect in templates should be `https://yourdomain.com/auth/callback`
- Check Supabase Dashboard → Auth → Email Templates

### Issue: SSL not working / HTTPS error
**Fix:**
- cPanel → SSL/TLS Status → Run AutoSSL
- Wait 10-15 minutes for propagation
- Contact Namecheap support if still failing

---

## 📊 Deployment Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Build** | ✅ Ready | `dist/` folder created |
| **.htaccess** | ✅ Ready | Forces HTTPS, SPA routing |
| **Environment** | ✅ Ready | `.env.production` configured |
| **Supabase Config** | ⚠️ **Action Required** | Add production URLs in dashboard |
| **Upload** | ⏳ **Your Turn** | Upload `dist/` to Namecheap |
| **SSL** | ⏳ **Your Turn** | Enable AutoSSL in cPanel |

---

## 📁 What to Upload

```
Your local project           Namecheap server
─────────────────────       ─────────────────────
dist/
├── index.html         →    public_html/index.html
└── assets/            →    public_html/assets/
    ├── index-*.js
    └── index-*.css

.htaccess.production   →    public_html/.htaccess (rename!)
```

**Do NOT upload:**
- `src/` folder
- `node_modules/`
- `.env.local` or other env files (secrets baked into build)
- `package.json` (not needed on server)

---

## 🔄 Future Updates

When you make code changes:

```bash
# 1. Build
npm run build

# 2. Upload
# Upload dist/ contents to public_html/ (overwrite)

# 3. Clear cache
# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

**Optional: Use the deploy script**
```bash
./deploy.sh
# Follow instructions for upload
```

---

## 🆘 Get Help

**Namecheap Support:**
- Live Chat: Available in cPanel (bottom right)
- Knowledge Base: https://www.namecheap.com/support/knowledgebase/
- Ticket: https://www.namecheap.com/support/

**Supabase Support:**
- Dashboard Chat: Bottom right in dashboard
- Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

**Your Setup:**
- Supabase Project: `qaemzribxkcvjhldpyto`
- Database: Already configured with RLS + triggers
- Auth: Email verification enabled
- Subscriptions: Auto-creates free tier for new users

---

## ✅ Pre-Deployment Checklist

Before you start:

- [ ] Domain purchased and DNS pointed to Namecheap
- [ ] cPanel access credentials ready
- [ ] Know your production domain URL
- [ ] FTP/SFTP credentials (if using FTP)
- [ ] Supabase dashboard login ready

After upload:

- [ ] Files uploaded to `public_html/`
- [ ] `.htaccess` uploaded and renamed
- [ ] SSL enabled (HTTPS working)
- [ ] Supabase Site URL configured
- [ ] Supabase Redirect URLs added
- [ ] Tested signup + email confirmation
- [ ] Tested login + data access

---

## 🎉 You're Ready!

Everything is prepared for deployment. Follow the **5-step Quick Deploy** above and you'll be live in minutes.

**Next Step:** Upload your files to Namecheap and configure Supabase URLs.

Need step-by-step guidance? See `DEPLOY_CHECKLIST.md` for the fastest path.

Questions? Just ask!
