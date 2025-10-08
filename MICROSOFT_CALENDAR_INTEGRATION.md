# Microsoft Calendar Integration - Setup Guide

## Overview

Taskly now supports integration with Microsoft Outlook and Teams calendars via OAuth 2.0. This allows users to sync their calendar events directly into Taskly's calendar view.

## Features

- ✅ OAuth 2.0 authentication with Microsoft
- ✅ Read-only calendar access (Calendars.Read permission)
- ✅ Automatic event syncing (next 90 days)
- ✅ Manual sync on demand
- ✅ Secure token storage and refresh
- ✅ Read-only synced events (can only be edited in Outlook)

## Architecture

### Components

1. **microsoftGraphService.ts**: Core service handling OAuth, token management, and Graph API calls
2. **MicrosoftCalendarSettings.tsx**: Settings UI component for connecting/disconnecting calendar
3. **MicrosoftCallback.tsx**: OAuth callback handler component
4. **App.tsx**: Event listener for calendar sync and route handling

### Data Flow

```
User clicks "Connect Microsoft Calendar"
    ↓
Redirects to Microsoft OAuth (login.microsoftonline.com)
    ↓
User grants permission
    ↓
Microsoft redirects back to /microsoft/callback?code=...
    ↓
MicrosoftCallback component exchanges code for tokens (via backend)
    ↓
Tokens stored in localStorage
    ↓
User can manually sync or events auto-sync
    ↓
Events fetched from Graph API (/me/calendar/calendarView)
    ↓
Events merged into app state (marked as read-only)
```

## Setup Instructions

### 1. Register Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: "Taskly Calendar Integration" (or your app name)
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: 
     - Type: **Web**
     - URL: `http://localhost:3002/microsoft/callback` (for development)
     - For production: `https://yourdomain.com/microsoft/callback`
5. Click **Register**

### 2. Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `Calendars.Read` (Read user calendars)
   - `Calendars.ReadWrite` (optional, for future features)
   - `User.Read` (Read user profile)
   - `offline_access` (Refresh tokens)
6. Click **Grant admin consent** (if applicable)

### 3. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description: "Taskly Calendar Secret"
4. Choose expiration (recommend: 24 months)
5. Click **Add**
6. **⚠️ IMPORTANT**: Copy the secret VALUE immediately (you won't see it again)

### 4. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Microsoft Calendar Integration
VITE_MICROSOFT_CLIENT_ID="your-application-client-id"
VITE_MICROSOFT_REDIRECT_URI="http://localhost:3002/microsoft/callback"

# For production, use your actual domain:
# VITE_MICROSOFT_REDIRECT_URI="https://yourdomain.com/microsoft/callback"
```

**Where to find the Client ID:**
- Azure Portal → Your app registration → **Overview** → Application (client) ID

### 5. Backend Token Exchange (Required)

**⚠️ SECURITY WARNING**: The current implementation includes placeholder backend endpoints. You MUST implement these securely on your backend:

#### Required Backend Endpoints

**POST `/api/microsoft/token`**
- Exchanges authorization code for access/refresh tokens
- Request body: `{ code: string, redirectUri: string }`
- Response: `{ access_token: string, refresh_token: string, expires_in: number }`

**POST `/api/microsoft/refresh`**
- Refreshes access token using refresh token
- Request body: `{ refreshToken: string }`
- Response: `{ access_token: string, refresh_token: string, expires_in: number }`

#### Example Backend Implementation (Node.js/Express)

```javascript
const msal = require('@azure/msal-node');

const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        authority: "https://login.microsoftonline.com/common"
    }
};

const confidentialClient = new msal.ConfidentialClientApplication(msalConfig);

// Exchange code for tokens
app.post('/api/microsoft/token', async (req, res) => {
    const { code, redirectUri } = req.body;
    
    try {
        const tokenResponse = await confidentialClient.acquireTokenByCode({
            code,
            scopes: ['Calendars.Read', 'User.Read', 'offline_access'],
            redirectUri
        });
        
        res.json({
            access_token: tokenResponse.accessToken,
            refresh_token: tokenResponse.refreshToken,
            expires_in: tokenResponse.expiresIn
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Refresh token
app.post('/api/microsoft/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    
    try {
        const tokenResponse = await confidentialClient.acquireTokenByRefreshToken({
            refreshToken,
            scopes: ['Calendars.Read', 'User.Read', 'offline_access']
        });
        
        res.json({
            access_token: tokenResponse.accessToken,
            refresh_token: tokenResponse.refreshToken || refreshToken,
            expires_in: tokenResponse.expiresIn
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});
```

### 6. Update Redirect URIs for Production

When deploying to production:

1. Go to Azure Portal → Your app registration → **Authentication**
2. Add your production redirect URI:
   - `https://yourdomain.com/microsoft/callback`
3. Update `VITE_MICROSOFT_REDIRECT_URI` in production environment variables

## Usage

### Connecting Calendar

1. Open **Settings** → **Integrations** tab
2. Click **"Connect Microsoft Calendar"**
3. Sign in with your Microsoft account
4. Grant calendar permissions
5. You'll be redirected back to Settings with a success message

### Syncing Events

- **Automatic**: Events are synced when you connect
- **Manual**: Click **"Sync Now"** in Settings → Integrations
- **Frequency**: Events from the next 90 days are synced each time

### Managing Synced Events

- Synced events appear in the Calendar view with a Microsoft badge
- These events are **read-only** in Taskly
- To edit: open the event in Microsoft Outlook or Teams
- Changes will be reflected after the next sync

### Disconnecting

1. Go to **Settings** → **Integrations**
2. Click **"Disconnect"**
3. Confirm the action
4. Synced events will remain but won't be updated

## Security Considerations

1. **Never expose Client Secret**: Keep it on the backend only
2. **Token Storage**: Tokens are stored in localStorage (consider more secure options for production)
3. **HTTPS Only**: Always use HTTPS in production
4. **Token Refresh**: Tokens are automatically refreshed when expired
5. **Minimal Permissions**: Only request necessary permissions
6. **Revocation**: Users can revoke access from their [Microsoft account settings](https://account.microsoft.com/privacy/app-access)

## Troubleshooting

### "Setup Required" Message in Settings

- **Cause**: Environment variables not configured
- **Fix**: Add `VITE_MICROSOFT_CLIENT_ID` to `.env.local` and restart dev server

### "Token exchange failed" Error

- **Cause**: Backend endpoints not implemented or incorrect configuration
- **Fix**: Implement `/api/microsoft/token` and `/api/microsoft/refresh` endpoints

### "Authentication failed" Error

- **Cause**: Invalid client ID, wrong redirect URI, or expired tokens
- **Fix**: 
  - Verify client ID matches Azure Portal
  - Check redirect URI matches exactly (including protocol and port)
  - Try disconnecting and reconnecting

### Events Not Syncing

- **Cause**: Token expired or invalid
- **Fix**: Disconnect and reconnect calendar
- **Alternative**: Check browser console for errors

### "Not authenticated with Microsoft" Error

- **Cause**: No active authentication or tokens expired
- **Fix**: Connect your calendar again from Settings

## API Reference

### microsoftGraphService

```typescript
// Check if service is enabled (env vars present)
microsoftGraphService.isEnabled(): boolean

// Check authentication status
microsoftGraphService.isAuthenticated(): boolean

// Get OAuth authorization URL
microsoftGraphService.getAuthorizationUrl(): string | null

// Handle OAuth callback (exchanges code for tokens)
microsoftGraphService.handleCallback(code: string): Promise<boolean>

// Fetch calendar events
microsoftGraphService.fetchCalendarEvents(
  startDate?: Date, 
  endDate?: Date
): Promise<Event[]>

// Get user profile
microsoftGraphService.getUserProfile(): Promise<{
  displayName: string;
  email: string;
} | null>

// Get connection status
microsoftGraphService.getConnectionStatus(): Promise<{
  connected: boolean;
  userEmail?: string;
  userName?: string;
}>

// Disconnect and clear tokens
microsoftGraphService.disconnect(): void
```

## Future Enhancements

- [ ] Two-way sync (create/edit events in Taskly)
- [ ] Background auto-sync with service worker
- [ ] Multiple calendar support
- [ ] Calendar event creation from tasks
- [ ] Conflict detection and resolution
- [ ] Google Calendar integration
- [ ] iCloud Calendar integration
- [ ] Notification sync

## Support

For issues or questions:
- Check browser console for error messages
- Verify all environment variables are set correctly
- Ensure backend endpoints are implemented
- Review Azure app registration permissions

## References

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/overview)
- [Azure AD App Registration Guide](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph Calendar API](https://learn.microsoft.com/en-us/graph/api/resources/calendar)
- [OAuth 2.0 Authorization Code Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
