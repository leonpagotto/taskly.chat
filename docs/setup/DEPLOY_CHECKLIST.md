# Quick Deployment Checklist for Namecheap

## 🚀 Fast Track (5 Steps)

### 1. Build Your App ✅
```bash
npm run build
```
Output: `dist/` folder created (1 MB total)

### 2. Upload to Namecheap
**Via cPanel File Manager:**
1. Log in: `taskly.chat/cpanel`
2. Open **File Manager** → `public_html/`
3. **Delete** old files (if any) or backup first
4. **Upload** everything from `dist/` folder
5. **Upload** `.htaccess.production` as `.htaccess`

**Via FTP (FileZilla/Cyberduck):**
- Host: `ftp.taskly.chat`
- Username: cPanel username
- Password: cPanel password
- Upload `dist/*` to `/public_html/`
- Upload `.htaccess.production` as `.htaccess`

### 3. Enable SSL (Required)
1. cPanel → **SSL/TLS Status**
2. Click **Run AutoSSL** for your domain
3. Wait 5-15 minutes
4. Verify: `https://taskly.chat` works

### 4. Configure Supabase Dashboard
**Critical: Do this or auth won't work!**

Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto

1. **Authentication → URL Configuration**
   - Site URL: `https://taskly.chat`
   - Redirect URLs (click "Add URL"):
     - `https://taskly.chat/**`
     - `https://taskly.chat/auth/callback`

2. Click **Save**

### 5. Test It! 🧪
1. Visit: `https://taskly.chat`
2. Sign up with test email
3. Check email inbox → click confirmation link
4. Should redirect back and log you in
5. Create a project/task → verify data persists

---

## ⚠️ Troubleshooting

### Site shows blank page
```bash
# Check browser console (F12)
# Usually: wrong base URL or missing .htaccess
# Fix: Re-upload .htaccess.production as .htaccess
```

### Routes 404 (e.g., /dashboard)
```bash
# Missing .htaccess or mod_rewrite disabled
# Fix: Ensure .htaccess exists in public_html/
# Verify file permissions: 644
```

### Auth redirect fails
```bash
# Supabase URLs not configured
# Fix: Add https://taskly.chat/** to Supabase redirect URLs
```

### Email confirmation link broken
```bash
# Site URL mismatch in Supabase
# Fix: Set Site URL to https://taskly.chat (no trailing slash)
```

---

## 📁 Files You Need to Upload

From your project:
- `dist/index.html` → `public_html/index.html`
- `dist/assets/*` → `public_html/assets/*`
- `.htaccess.production` → `public_html/.htaccess` (rename!)

**Important:** Upload the **contents** of `dist/`, not the `dist/` folder itself.

Correct structure on server:
```
public_html/
├── .htaccess
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

---

## 🔄 Updates & Redeployment

When you make changes:
```bash
# 1. Build
npm run build

# 2. Upload dist/ contents to public_html/
#    (overwrite existing files)

# 3. Clear browser cache or hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
```

**Pro tip:** Use `deploy.sh` script:
```bash
./deploy.sh
# Follow upload instructions
```

---

## ✅ Final Verification

- [ ] `https://taskly.chat` loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Can sign up + receive email
- [ ] Email confirmation redirects correctly
- [ ] Can log in
- [ ] Can create data (projects, tasks, etc.)
- [ ] Data persists after refresh
- [ ] Other users can't see your data (RLS working)

---

## 🆘 Still Stuck?

**Check:**
1. Browser console (F12) for errors
2. Supabase Dashboard → Logs → Auth logs
3. cPanel → Errors log

**Get help:**
- Namecheap support: Live chat in cPanel
- Supabase support: Dashboard bottom-right chat
- See full guide: `NAMECHEAP_DEPLOYMENT.md`

---

**Your domain:** taskly.chat 🚀
