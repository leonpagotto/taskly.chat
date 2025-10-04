# Deploying Taskly.chat to Namecheap Shared Hosting

## Overview

Your app is a **Vite + React SPA (Single Page Application)** that needs:
- Static file hosting (HTML, CSS, JS)
- Supabase handles all backend (auth, database, storage)
- No server-side rendering or Node.js runtime needed on Namecheap

## Prerequisites

✅ **Namecheap hosting account** with cPanel access  
✅ **Domain pointed to Namecheap** (DNS configured)  
✅ **Supabase project** (already set up)  
✅ **FTP/SFTP credentials** or cPanel File Manager access

## Step-by-Step Deployment

### 1. Build Your App for Production

From your local project directory:

```bash
# Install dependencies (if not already)
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [other files]
```

**Verify the build:**
```bash
# Preview locally before deploying
npm run preview
# Opens at http://localhost:4173
```

### 2. Prepare Production Environment

Create `.env.production` (already created for you):

```env
VITE_SUPABASE_URL="https://qaemzribxkcvjhldpyto.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGc..."
VITE_USE_REL_DB="true"
GEMINI_API_KEY="AIzaSy..."
PUBLIC_BASE_URL=/
```

**Important:** These variables are baked into the build at build time (not runtime), so rebuild if you change them:

```bash
npm run build
```

### 3. Configure Supabase for Production Domain

**Go to Supabase Dashboard:**

1. **Authentication → URL Configuration**
   - **Site URL:** `https://yourdomain.com` (your Namecheap domain)
   - **Redirect URLs:** Add:
     - `https://yourdomain.com/**`
     - `https://yourdomain.com/auth/callback`
     - Keep localhost URLs for dev: `http://localhost:3002/**`

2. **Authentication → Settings**
   - Verify "Confirm email" is enabled
   - Set redirect URL in email templates to: `https://yourdomain.com/auth/callback`

3. **(Optional) Project Settings → Auth → SMTP**
   - Configure custom SMTP for production (SendGrid, AWS SES, etc.)
   - Default Supabase SMTP works but may land in spam

### 4. Upload Files to Namecheap

#### Option A: Via cPanel File Manager (Easiest)

1. Log in to **cPanel** (typically `yourdomain.com/cpanel`)
2. Open **File Manager**
3. Navigate to `public_html/` (or your domain's root folder)
4. **Delete** existing files if this is a fresh install (or backup first)
5. **Upload** all contents from your local `dist/` folder:
   - Select `dist/` contents (not the folder itself)
   - Upload `index.html`, `assets/`, etc.
6. **Set Permissions** (if needed):
   - Files: 644
   - Folders: 755

#### Option B: Via FTP/SFTP (Faster for large files)

Use an FTP client (FileZilla, Cyberduck, or WinSCP):

1. **Connect:**
   - Host: `ftp.yourdomain.com` (or SFTP: `sftp://yourdomain.com`)
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Navigate** to `public_html/` on remote

3. **Upload** contents of `dist/` folder

4. **Verify** upload completed (check `index.html` and `assets/` folder exist)

#### Option C: Via SSH/Command Line (Advanced)

If Namecheap provides SSH access:

```bash
# From your local machine
scp -r dist/* username@yourdomain.com:~/public_html/

# Or using rsync
rsync -avz --delete dist/ username@yourdomain.com:~/public_html/
```

### 5. Configure .htaccess for SPA Routing

Vite SPAs need a `.htaccess` file to handle client-side routing (so `/dashboard` doesn't 404).

**Create `.htaccess` in `public_html/`:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html for SPA routing
  RewriteRule ^ index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

**Upload this file** to the same directory as `index.html`.

### 6. Set Up SSL/HTTPS (Required for Supabase Auth)

Supabase requires HTTPS for authentication in production.

**Namecheap typically provides free SSL via cPanel:**

1. Go to cPanel → **SSL/TLS Status**
2. Find your domain
3. Click **Run AutoSSL** or **Install Let's Encrypt**
4. Wait for SSL to provision (usually 5-15 minutes)
5. Verify HTTPS works: `https://yourdomain.com`

**If SSL isn't auto-enabled:**
- Contact Namecheap support
- Or manually install Let's Encrypt via cPanel

**Force HTTPS redirect** (add to `.htaccess` at the top):

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [L,R=301]
```

### 7. Test Your Deployment

1. **Visit your domain:** `https://yourdomain.com`
2. **Check console** for errors (F12 → Console)
3. **Test signup:**
   - Register a new user
   - Check email for confirmation
   - Click link → Should redirect to your domain
4. **Test authentication:**
   - Log in with existing user
   - Verify you can create projects, tasks, etc.
5. **Test RLS:**
   - Ensure users only see their own data
   - Try sharing a project (if implemented)

### 8. Common Issues & Fixes

#### Issue: White screen / blank page
**Causes:**
- Wrong `PUBLIC_BASE_URL` in `.env.production`
- Missing `.htaccess`
- Build not uploaded correctly

**Fix:**
```bash
# Rebuild with correct base
PUBLIC_BASE_URL=/ npm run build

# Re-upload dist/ contents
# Verify .htaccess exists
```

#### Issue: 404 on routes (e.g., /dashboard)
**Cause:** `.htaccess` not working or missing

**Fix:**
1. Verify `.htaccess` is in `public_html/`
2. Ensure `mod_rewrite` is enabled (most Namecheap plans have it)
3. Check file permissions: 644

#### Issue: Auth redirect errors
**Cause:** Production URL not in Supabase allowed redirects

**Fix:**
- Supabase Dashboard → Auth → URL Configuration
- Add `https://yourdomain.com/**`
- Rebuild + redeploy if you changed env vars

#### Issue: CORS errors
**Cause:** Supabase CORS settings (rare)

**Fix:**
- Should auto-allow your domain
- If not: Supabase Dashboard → Settings → API → CORS allowed origins

#### Issue: Environment variables not working
**Cause:** Vite bakes vars at build time, not runtime

**Fix:**
```bash
# Update .env.production
# Rebuild
npm run build
# Re-upload dist/
```

#### Issue: Assets not loading (CSS/JS)
**Cause:** Wrong base path or MIME type issues

**Fix:**
- Verify `PUBLIC_BASE_URL=/` (or correct subpath)
- Check `.htaccess` is not interfering with assets
- Ensure `assets/` folder uploaded correctly

### 9. Deployment Automation (Optional)

For future updates, automate with GitHub Actions or a deploy script:

**Simple deploy script** (`deploy.sh`):

```bash
#!/bin/bash
set -e

echo "Building for production..."
npm run build

echo "Uploading to Namecheap..."
# Using SFTP (install lftp: brew install lftp)
lftp -u $FTP_USER,$FTP_PASS sftp://yourdomain.com -e "
  mirror -R --delete --verbose dist/ public_html/;
  bye
"

echo "Deployed successfully!"
```

**Usage:**
```bash
export FTP_USER="your_cpanel_user"
export FTP_PASS="your_cpanel_pass"
./deploy.sh
```

### 10. Performance Optimization

**Enable Gzip compression** (if not already):

Already in `.htaccess` above. Verify:
```bash
curl -H "Accept-Encoding: gzip" -I https://yourdomain.com
# Should see: Content-Encoding: gzip
```

**CDN (Optional):**
- Use Cloudflare (free plan) for caching + DDoS protection
- Point domain DNS to Cloudflare → origin: Namecheap IP

**Image optimization:**
- Compress images before deploying
- Use WebP format where possible
- Consider Supabase Storage + CDN for large assets

## Final Checklist

Before going live:

- [ ] ✅ Production build created (`npm run build`)
- [ ] ✅ `.env.production` configured
- [ ] ✅ Supabase Site URL set to production domain
- [ ] ✅ Supabase Redirect URLs include production
- [ ] ✅ Files uploaded to `public_html/`
- [ ] ✅ `.htaccess` configured for SPA routing
- [ ] ✅ SSL/HTTPS enabled and working
- [ ] ✅ Test signup + email confirmation
- [ ] ✅ Test login + data access
- [ ] ✅ Verify RLS policies work in production
- [ ] ✅ Check browser console for errors

## Support

**Namecheap Support:**
- Live Chat: Available in cPanel
- Ticket: https://www.namecheap.com/support/

**Supabase Support:**
- Dashboard: Has built-in support chat (bottom right)
- Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

**Common Namecheap Plans:**
- Shared Hosting: Stellar, Stellar Plus (most common, works fine)
- VPS: If you need more control
- Reseller: Overkill for single app

---

**Status:** 🟢 Ready to deploy!

Need help with a specific step? Just ask!
