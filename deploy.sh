#!/bin/bash
set -e

# Simple deployment script for Namecheap via SFTP
# Usage:
#   1. Set env vars: export FTP_USER="..." FTP_PASS="..."
#   2. Run: ./deploy.sh

echo "🔨 Building production bundle..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist/ folder not found"
  exit 1
fi

echo "📦 Build complete. dist/ size:"
du -sh dist/

echo ""
echo "📤 Ready to upload to Namecheap"
echo ""
echo "Please upload the contents of dist/ folder to your Namecheap public_html/"
echo ""
echo "Options:"
echo "  1. cPanel File Manager (drag & drop)"
echo "  2. FTP client (FileZilla, Cyberduck)"
echo "  3. SFTP command line (see below)"
echo ""
echo "--- SFTP Upload Command ---"
echo "If you have lftp installed:"
echo ""
echo "  export FTP_USER='your_cpanel_username'"
echo "  export FTP_PASS='your_cpanel_password'"
echo "  export FTP_HOST='ftp.yourdomain.com'"
echo ""
echo "  lftp -u \$FTP_USER,\$FTP_PASS sftp://\$FTP_HOST -e \"mirror -R --delete --verbose dist/ public_html/; bye\""
echo ""
echo "Or using scp (if SSH enabled):"
echo "  scp -r dist/* username@yourdomain.com:~/public_html/"
echo ""
echo "--- Post-Upload Steps ---"
echo "1. Upload .htaccess.production as .htaccess to public_html/"
echo "2. Verify SSL is enabled (https://yourdomain.com)"
echo "3. Test site: https://yourdomain.com"
echo "4. Check Supabase Dashboard → Auth → URL Configuration"
echo "   - Site URL: https://yourdomain.com"
echo "   - Redirect URLs: https://yourdomain.com/**"
echo ""
echo "✅ Build ready for deployment!"
