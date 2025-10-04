# Taskly.chat Production Deployment - Ready to Go! 🚀

## ✅ Everything Configured for taskly.chat

### Your Production Setup

**Domain:** `https://taskly.chat`  
**Supabase Project:** `qaemzribxkcvjhldpyto`  
**Build Status:** ✅ Ready (dist/ folder created - 1 MB)

---

## 🚀 Deploy Now (3 Simple Steps)

### Step 1: Upload Files to taskly.chat

**Via cPanel File Manager:**
1. Go to: `taskly.chat/cpanel`
2. Open **File Manager** → `public_html/`
3. **Clean folder first:**
   - Select all old files (Ctrl+A / Cmd+A)
   - Click **Delete** → Confirm
4. **Upload new files:**
   - Click **Upload**
   - Select ALL files from your local `dist/` folder:
     - `index.html`
     - `assets/` folder
   - Wait for upload to complete
5. **Upload .htaccess:**
   - Upload `.htaccess.production` from your project
   - **Rename it** to `.htaccess` (right-click → Rename)

**Via FTP (if you prefer):**
```
Host: ftp.taskly.chat
Username: [your cPanel username]
Password: [your cPanel password]

Upload: dist/* → public_html/
Upload: .htaccess.production → public_html/.htaccess
```

### Step 2: Configure Supabase

**CRITICAL: Do this or authentication will fail!**

Go to: https://supabase.com/dashboard/project/qaemzribxkcvjhldpyto/auth/url-configuration

**Set these exact values:**

1. **Site URL:**
   ```
   https://taskly.chat
   ```

2. **Redirect URLs** (click "Add URL" for each):
   ```
   https://taskly.chat/**
   https://taskly.chat/auth/callback
   ```

3. **Keep localhost for development:**
   ```
   http://localhost:3002/**
   http://localhost:3002/auth/callback
   ```

4. Click **Save**

### Step 3: Enable SSL

1. cPanel → **SSL/TLS Status**
2. Find `taskly.chat` in the list
3. Click **Run AutoSSL**
4. Wait 5-15 minutes for SSL certificate to activate
5. Test: Visit `https://taskly.chat` (should show secure padlock)

---

## 🧪 Test Your Live Site

### Immediate Checks:
1. **Visit:** `https://taskly.chat`
   - ✅ Should load without errors
   - ✅ Check browser console (F12) - no red errors

2. **Test Signup:**
   - Click signup/register
   - Enter test email (use real email you can access)
   - Should show "Check your email" message

3. **Check Email:**
   - Look for confirmation email from Supabase
   - **Check spam folder** if not in inbox
   - Click confirmation link

4. **Verify Redirect:**
   - Should redirect to `https://taskly.chat`
   - Should be logged in automatically

5. **Test App:**
   - Create a project
   - Add a task
   - Refresh page → data should persist

---

## 📁 Final File Structure on Server

```
public_html/
├── .htaccess          ← Renamed from .htaccess.production
├── index.html         ← From dist/
└── assets/            ← From dist/
    ├── index-Bzx3NKn_.js
    └── index-[hash].css
```

---

## ⚠️ Quick Troubleshooting

### Blank white screen
- **Fix:** Re-upload `.htaccess` (might be missing or wrong)
- Check browser console for errors

### 404 on routes (like /dashboard)
- **Fix:** Verify `.htaccess` exists in `public_html/`
- File permissions should be 644

### Auth redirect error
- **Fix:** Verify Supabase URLs are exactly:
  - Site URL: `https://taskly.chat`
  - Redirect: `https://taskly.chat/**`

### Email link doesn't work
- **Fix:** Check Supabase Site URL has NO trailing slash
- Should be `https://taskly.chat` not `https://taskly.chat/`

### SSL not working
- **Fix:** Run AutoSSL again in cPanel
- Wait 10-15 minutes for propagation
- Contact Namecheap support if still failing

---

## ✅ Pre-Flight Checklist

Before you start:
- [ ] `dist/` folder exists (run `npm run build` if not)
- [ ] `.htaccess.production` file exists in project root
- [ ] Namecheap cPanel login credentials ready
- [ ] Supabase dashboard access ready

After deployment:
- [ ] Files uploaded to `public_html/`
- [ ] `.htaccess` uploaded and renamed
- [ ] SSL enabled (green padlock at `https://taskly.chat`)
- [ ] Supabase Site URL = `https://taskly.chat`
- [ ] Supabase Redirect URLs added
- [ ] Test signup works
- [ ] Test email confirmation works
- [ ] Test login works
- [ ] Test data persistence works

---

## 🎯 What Happens Next

Once deployed, **new users will automatically get:**
- ✅ Profile created (via database trigger)
- ✅ Free subscription activated (plan='free', status='active')
- ✅ Email verification required before access
- ✅ Full RLS protection (users only see their own data)

---

## 📊 Deployment Info

| Component | Status | Details |
|-----------|--------|---------|
| **Build** | ✅ Ready | dist/ folder: 1 MB |
| **Domain** | ⏳ Upload | taskly.chat |
| **SSL** | ⏳ Enable | Run AutoSSL after upload |
| **Supabase URLs** | ⚠️ Configure | Must add taskly.chat |
| **Database** | ✅ Ready | RLS + triggers active |
| **Auth Triggers** | ✅ Ready | Auto-create profile + subscription |

---

## 🆘 Need Help?

**Namecheap:**
- Live chat in cPanel (bottom right)
- Support: https://www.namecheap.com/support/

**Supabase:**
- Dashboard chat (bottom right)
- Auth logs: Dashboard → Logs → Auth

**Your Setup:**
- Domain: taskly.chat
- Supabase: qaemzribxkcvjhldpyto
- Database: Production-ready with RLS
- Email: Confirmation required for new users

---

## 🎉 You're Almost Live!

Follow the 3 steps above and you'll be online in 15 minutes:
1. Upload files (5 min)
2. Configure Supabase URLs (2 min)
3. Enable SSL + test (8 min)

**Start here:** Upload `dist/` folder to `public_html/` via cPanel!

Questions? Just ask! 🚀
