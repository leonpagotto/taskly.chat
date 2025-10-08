# Microsoft Calendar Integration - Quick Start Guide

## 🚀 Get Started in 5 Minutes

## ⚠️ Important: Who Needs an Azure Account?

**YOU (the developer)** need to register an OAuth application - but this is NOT creating Azure accounts for users!

- ✅ **You create ONE app registration** (free, no subscription needed)
- ✅ **Users connect with their EXISTING Microsoft accounts** (company or personal)
- ✅ **No Azure account needed for end users**
- ✅ **Works with any Microsoft account** (Office 365, Outlook.com, Hotmail, etc.)

Think of it like creating a "Sign in with Microsoft" button - you register the app once, users sign in with their own accounts.

### Visual Explanation

```
┌─────────────────────────────────────────────────────────────┐
│  YOU (Developer)                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Register "Taskly" in Azure Portal                 │  │
│  │    (ONE TIME - Free, no subscription)                │  │
│  │                                                       │  │
│  │ 2. Get Client ID: "abc-123-def-456"                  │  │
│  │                                                       │  │
│  │ 3. Deploy Taskly with that Client ID                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  USERS (Each connects their OWN Microsoft account)         │
│                                                             │
│  Alice (alice@acmecorp.com)                                │
│    → Signs in with her company account                     │
│    → Her work calendar syncs to Taskly                     │
│                                                             │
│  Bob (bob@outlook.com)                                     │
│    → Signs in with his personal account                    │
│    → His personal calendar syncs to Taskly                 │
│                                                             │
│  Carol (carol@techstartup.com)                            │
│    → Signs in with her different company account           │
│    → Her calendar syncs to Taskly                          │
└─────────────────────────────────────────────────────────────┘

Each user independently authorizes Taskly to read THEIR calendar.
You (developer) never see or manage their accounts!
```

### Step 1: Register Azure AD Application (3 min)

**What You Need:**
- A Microsoft account (any account - even free Outlook.com works)
- No Azure subscription required
- No credit card required

**Steps:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Azure Active Directory → App registrations → New registration
3. Name: "Taskly Calendar"
4. Supported accounts: **Accounts in any organizational directory and personal Microsoft accounts** ← This allows ANY Microsoft user to connect!
5. Redirect URI: `http://localhost:3002/microsoft/callback`
6. Click **Register**
7. **Copy the Application (client) ID**

### Step 2: Add API Permissions (1 min)

1. Go to **API permissions** → Add a permission
2. Microsoft Graph → Delegated permissions
3. Add: `Calendars.Read`, `User.Read`, `offline_access`
4. Click **Grant admin consent** (if applicable)

### Step 3: Configure Environment (1 min)

Create or update `.env.local`:

```bash
# Add this line with your Application (client) ID from Step 1
VITE_MICROSOFT_CLIENT_ID="YOUR_CLIENT_ID_HERE"
VITE_MICROSOFT_REDIRECT_URI="http://localhost:3002/microsoft/callback"
```

### Step 4: Restart Dev Server

```bash
npm run dev
```

### Step 5: Test Integration

1. Open app → **Settings** → **Integrations** tab
2. Click **"Connect Microsoft Calendar"**
3. Sign in with **YOUR OWN Microsoft account** (can be your company email!)
4. Grant permissions
5. Click **"Sync Now"**
6. Go to **Calendar** view to see synced events

**Note:** Each user will connect their own Microsoft account - you're just testing with yours first!

## ⚠️ Important Notes

### For Development (localhost)
- Works with just the Client ID (no backend needed for testing)
- Tokens stored in localStorage
- OAuth flow works end-to-end

### For Production Deployment
You **MUST** implement backend endpoints:

```javascript
// Example: server.js
const msal = require('@azure/msal-node');

app.post('/api/microsoft/token', async (req, res) => {
  // Exchange code for tokens
  // See MICROSOFT_CALENDAR_INTEGRATION.md for full implementation
});

app.post('/api/microsoft/refresh', async (req, res) => {
  // Refresh expired tokens
  // See MICROSOFT_CALENDAR_INTEGRATION.md for full implementation
});
```

## 🛠️ Troubleshooting

### "Setup Required" message?
- Add `VITE_MICROSOFT_CLIENT_ID` to `.env.local`
- Restart dev server (`npm run dev`)

### OAuth redirect not working?
- Check redirect URI in Azure Portal matches exactly
- Ensure it's `http://localhost:3002/microsoft/callback` (with port)

### "Token exchange failed"?
- For localhost testing: This is expected (backend not implemented)
- For production: Implement backend endpoints (see docs)

## 📖 Full Documentation

- **Complete Setup**: `MICROSOFT_CALENDAR_INTEGRATION.md`
- **Implementation Details**: `MICROSOFT_CALENDAR_IMPLEMENTATION_SUMMARY.md`

## 🎯 Next Steps

1. Test with your Microsoft account
2. Check synced events in Calendar view
3. Try disconnecting and reconnecting
4. Review full documentation for production deployment

## ❓ Frequently Asked Questions

### Do I need an Azure subscription?
**NO!** You only need access to portal.azure.com with any Microsoft account. App registration is completely free.

### Can users from my company connect their calendars?
**YES!** Users sign in with their own `user@company.com` accounts. You're not accessing company data - each user individually authorizes Taskly to read their calendar.

### Do I need my company IT's permission?
**Usually NO** - OAuth is a standard authorization method. However, if your company has strict security policies that block third-party apps, IT might need to approve. Check with your IT department if concerned.

### Can I use my personal Microsoft account to register the app?
**YES!** You can register the app with any Microsoft account (even free Outlook.com). Users will still be able to connect with their company accounts.

### What if I want ONLY my company users to connect?
Change the "Supported accounts" setting to **"Accounts in this organizational directory only"** when registering the app. This restricts it to your company's tenant.

### Is this secure?
**YES!** OAuth 2.0 is the industry-standard authorization protocol. Users grant permission explicitly, and tokens are stored securely. You never see users' passwords.

---

**Need Help?** Check browser console for detailed error messages.
