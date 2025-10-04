#!/bin/bash

# Quick Fix Upload Script for taskly.chat
# This helps ensure correct file structure

echo "🚀 Taskly.chat - Quick Upload Guide"
echo "===================================="
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist/ folder not found!"
  echo "   Run: npm run build"
  exit 1
fi

echo "✅ dist/ folder found"
echo ""
echo "📦 Files to upload to public_html/:"
echo ""
echo "   FROM YOUR COMPUTER          →    TO NAMECHEAP"
echo "   ================================================"
echo "   dist/index.html             →    public_html/index.html"
echo "   dist/assets/                →    public_html/assets/"
echo "   .htaccess.production        →    public_html/.htaccess"
echo ""
echo "⚠️  IMPORTANT: Upload CONTENTS of dist/, not the dist/ folder itself!"
echo ""
echo "📋 Step-by-Step:"
echo ""
echo "1. Go to: taskly.chat/cpanel"
echo "2. Open: File Manager → public_html/"
echo "3. DELETE all old files first (backup if needed)"
echo ""
echo "4. Upload these files ONE BY ONE:"
echo "   a) dist/index.html → to public_html/"
echo "      (should show as public_html/index.html)"
echo ""
echo "   b) dist/assets/ folder → to public_html/"
echo "      (should show as public_html/assets/)"
echo ""
echo "   c) .htaccess.production → to public_html/"
echo "      Then RENAME to .htaccess"
echo "      (should show as public_html/.htaccess)"
echo ""
echo "5. Enable 'Show Hidden Files' to see .htaccess"
echo "   Settings (top right) → ✅ Show Hidden Files"
echo ""
echo "✅ Final structure should be:"
echo "   public_html/"
echo "   ├── .htaccess"
echo "   ├── index.html"
echo "   └── assets/"
echo "       └── index-Bzx3NKn_.js"
echo ""
echo "6. Visit: https://taskly.chat"
echo "   Should load app (not blank page)"
echo ""
echo "🆘 Still issues? Share screenshot of public_html/ folder!"
