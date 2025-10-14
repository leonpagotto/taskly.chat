# Microsoft Calendar Integration - 2025 Updated Guide

## Overview

This guide reflects the **latest Microsoft best practices as of 2025** for integrating Microsoft Outlook and Teams calendars into web applications using Microsoft Entra ID (formerly Azure Active Directory) and Microsoft Graph API.

## What's New in 2025

### Key Changes from Previous Versions

1. **🆕 Microsoft Entra ID**: Azure Active Directory is now called Microsoft Entra ID
2. **🆕 Single-Page Application (SPA) Platform**: Proper SPA configuration without client secrets
3. **🆕 PKCE Flow**: Authorization Code Flow with PKCE (no backend required)
4. **🆕 MSAL.js Recommended**: Microsoft Authentication Library handles auth complexity
5. **🆕 No Client Secret**: SPAs should NOT use client secrets (security best practice)
6. **🆕 Simplified Setup**: Fewer steps, better security, no backend endpoints needed

### What This Means for Your App

✅ **Simpler Setup**: No backend token exchange endpoints required  
✅ **More Secure**: PKCE flow prevents token interception  
✅ **Auto Token Refresh**: MSAL.js handles token lifecycle  
✅ **Production Ready**: Same code works in dev and production  

---

## Architecture

### Current Implementation (Functional but Can Be Improved)

Your current implementation uses:
- **Manual OAuth 2.0 flow** (works, but requires manual token management)
- **localStorage** for token storage
- **Custom token refresh logic**

### Modern Recommended Approach (2025 Best Practice)

Microsoft recommends:
- **MSAL.js v3.x** with automatic PKCE
- **In-memory or sessionStorage** for token caching
- **Automatic token refresh** and lifecycle management
- **Framework-agnostic** or framework-specific wrappers (React, Angular, Vue)

**Note**: Your current implementation works fine for production! This is an optional modernization path.

---

## Setup Instructions (2025 Method)

### Step 1: Register App in Microsoft Entra Admin Center

1. **Access the Portal**
   - Go to [Microsoft Entra Admin Center](https://entra.microsoft.com/)
   - Sign in with your Microsoft account

2. **Navigate to App Registrations**
   - Select **Identity** → **Applications** → **App registrations**
   - Click **+ New registration**

3. **Configure Application Registration**
   ```
   Name: Taskly Calendar Integration
   
   Supported account types:
   ✅ Accounts in any organizational directory and personal Microsoft accounts
      (This allows both work and personal calendars)
   
   Redirect URI:
   - Platform: Single-page application (SPA)
   - URI: http://localhost:3000/microsoft/callback
   ```

4. **Complete Registration**
   - Click **Register**
   - **📋 Copy the Application (client) ID** from the Overview page

### Step 2: Configure Authentication Platform

**This is crucial for SPAs!**

1. **Go to Authentication**
   - In your app registration, select **Authentication** from the left menu

2. **Add SPA Platform** (if not already added)
   - Click **+ Add a platform**
   - Select **Single-page application**
   - Add redirect URI: `http://localhost:3000/microsoft/callback`
   - **Enable**: Implicit grant → ID tokens (optional for MSAL.js v3)
   - Click **Configure**

3. **Additional Settings** (Optional)
   - **Front-channel logout URL**: `http://localhost:3000`
   - **Supported account types**: Keep as multitenant + personal accounts

### Step 3: Configure API Permissions

1. **Add Permissions**
   - Go to **API permissions**
   - Click **+ Add a permission**
   - Select **Microsoft Graph**
   - Choose **Delegated permissions**

2. **Required Scopes**
   ```
   ✅ Calendars.Read          - Read user calendars
   ✅ User.Read               - Read user profile
   ✅ offline_access          - Maintain access (refresh tokens)
   ```

3. **Optional Permissions** (for future features)
   ```
   ⬜ Calendars.ReadWrite    - If you want to create/edit events
   ⬜ Calendars.ReadWrite.Shared - Access shared calendars
   ```

4. **Grant Consent** (if applicable)
   - If you see **"Grant admin consent"**, click it
   - This pre-approves permissions for your organization

### Step 4: Configure Environment Variables

Add to your `.env.local`:

```bash
# Microsoft Calendar Integration (2025 Method)
VITE_MICROSOFT_CLIENT_ID="your-application-client-id-here"
VITE_MICROSOFT_REDIRECT_URI="http://localhost:3000/microsoft/callback"

# Optional: Specify tenant (use 'common' for multi-tenant)
VITE_MICROSOFT_TENANT="common"

# For production, update redirect URI:
# VITE_MICROSOFT_REDIRECT_URI="https://yourdomain.com/microsoft/callback"
```

### Step 5: Update Production Settings

When deploying to production:

1. **Add Production Redirect URI**
   - Go to **Authentication** → **Single-page application**
   - Add: `https://yourdomain.com/microsoft/callback`
   - Keep development URI for testing

2. **Update Environment Variables**
   ```bash
   VITE_MICROSOFT_REDIRECT_URI="https://yourdomain.com/microsoft/callback"
   ```

3. **Ensure HTTPS**
   - Production MUST use HTTPS (required by Microsoft)

---

## Current Implementation Analysis

### What You Have Now ✅

Your current implementation (`microsoftGraphService.ts`):
- ✅ Works correctly for OAuth 2.0 flow
- ✅ Handles token storage
- ✅ Fetches calendar events
- ✅ Production-ready

### Potential Improvements 🎯

1. **Add PKCE Support**
   - Current: Uses basic authorization code flow
   - Recommended: Add code_challenge and code_verifier

2. **Consider MSAL.js**
   - Automatic token refresh
   - Better error handling
   - Cross-browser compatibility
   - Active maintenance and security updates

3. **Token Storage Options**
   - Current: localStorage (works, but less secure)
   - Recommended: sessionStorage or in-memory (MSAL default)

---

## Modern Implementation Option (MSAL.js)

If you want to modernize your implementation, here's how to use MSAL.js:

### Install MSAL.js

```bash
npm install @azure/msal-browser
```

### Basic MSAL Configuration

```typescript
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage', // More secure than localStorage
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

await msalInstance.initialize();
```

### Request Scopes

```typescript
const loginRequest = {
  scopes: ['User.Read', 'Calendars.Read', 'offline_access'],
};

// Sign in
const loginResponse = await msalInstance.loginPopup(loginRequest);

// Get token silently (auto-refresh)
const tokenResponse = await msalInstance.acquireTokenSilent({
  scopes: ['Calendars.Read'],
  account: msalInstance.getAllAccounts()[0],
});

// Use access token
const accessToken = tokenResponse.accessToken;
```

### Fetch Calendar Events

```typescript
const response = await fetch(
  'https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=2025-01-01T00:00:00Z&endDateTime=2025-12-31T23:59:59Z',
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

---

## Security Best Practices (2025)

### ✅ DO

1. **Use Single-Page Application platform** in app registration
2. **Use PKCE flow** (automatic with MSAL.js v3.x)
3. **Never expose client secrets** in frontend code
4. **Use HTTPS in production** (required by Microsoft)
5. **Store tokens securely** (sessionStorage > localStorage)
6. **Implement token refresh** automatically
7. **Use least-privilege scopes** (only request what you need)
8. **Handle expired tokens** gracefully

### ❌ DON'T

1. **Don't use client secrets** in single-page applications
2. **Don't hardcode credentials** in code
3. **Don't store tokens in cookies** (unless using httpOnly cookies on backend)
4. **Don't request excessive permissions**
5. **Don't skip PKCE** in modern apps
6. **Don't use implicit flow** (deprecated by Microsoft)

---

## Comparison: Current vs. Modern Approach

| Aspect | Current Implementation | Modern MSAL.js Approach |
|--------|----------------------|------------------------|
| **OAuth Flow** | Manual authorization code | Automatic with PKCE |
| **Token Refresh** | Manual implementation | Automatic |
| **Token Storage** | localStorage | sessionStorage/in-memory |
| **Error Handling** | Custom logic | Built-in retry logic |
| **Browser Support** | Custom compatibility | Cross-browser tested |
| **Security** | Good (OAuth 2.0) | Better (PKCE + automatic refresh) |
| **Maintenance** | Custom code to maintain | Microsoft-maintained library |
| **Learning Curve** | Understand OAuth internals | Use high-level API |
| **Production Ready** | ✅ Yes | ✅ Yes |
| **Code Complexity** | Medium | Low |

**Bottom Line**: Your current implementation works great! MSAL.js is an optional improvement that reduces code complexity and adds automatic features.

---

## Migration Guide (Current → MSAL.js)

If you want to modernize to MSAL.js, here's a gradual migration path:

### Phase 1: Parallel Implementation
1. Keep existing `microsoftGraphService.ts` working
2. Add MSAL.js alongside existing code
3. Test MSAL.js implementation thoroughly

### Phase 2: Feature Flag
```typescript
const USE_MSAL = import.meta.env.VITE_USE_MSAL === 'true';

const authService = USE_MSAL ? msalAuthService : microsoftGraphService;
```

### Phase 3: Gradual Migration
1. Migrate authentication first
2. Migrate token refresh
3. Migrate API calls
4. Remove old code

### Phase 4: Cleanup
1. Remove old `microsoftGraphService.ts`
2. Update documentation
3. Update environment variables

---

## Troubleshooting (2025)

### "AADSTS50011: Redirect URI mismatch"

**Cause**: Redirect URI doesn't match app registration  
**Fix**: 
1. Check exact URI (protocol, domain, port, path)
2. Ensure it's added under **Single-page application** platform
3. Must match exactly: `http://localhost:3000/microsoft/callback`

### "AADSTS7000218: Invalid client secret"

**Cause**: Using client secret in SPA (don't do this!)  
**Fix**: 
1. Remove client_secret from requests
2. Use PKCE flow instead
3. Configure "Single-page application" platform

### "AADSTS65001: User did not consent"

**Cause**: Permissions not granted  
**Fix**:
1. Check API permissions in app registration
2. Request consent during login: `prompt: 'consent'`
3. Admin consent may be required

### Token Refresh Failing

**Cause**: Various reasons  
**Fix**:
1. Ensure `offline_access` scope is requested
2. Check token expiry handling
3. Use MSAL.js for automatic refresh
4. Verify redirect URIs are correct

### CORS Errors

**Cause**: Misconfigured request  
**Fix**:
1. Microsoft Graph doesn't require CORS config
2. Check you're calling correct endpoints
3. Verify access token is valid
4. Use proper headers: `Authorization: Bearer {token}`

---

## API Reference (2025)

### Microsoft Graph Calendar Endpoints

```typescript
// Get user's primary calendar
GET https://graph.microsoft.com/v1.0/me/calendar

// Get calendar view (events in date range)
GET https://graph.microsoft.com/v1.0/me/calendar/calendarView
  ?startDateTime=2025-01-01T00:00:00Z
  &endDateTime=2025-12-31T23:59:59Z
  &$select=subject,start,end,location,isAllDay
  &$orderby=start/dateTime
  &$top=100

// Get all calendars
GET https://graph.microsoft.com/v1.0/me/calendars

// Get specific calendar events
GET https://graph.microsoft.com/v1.0/me/calendars/{calendarId}/events

// Get user profile
GET https://graph.microsoft.com/v1.0/me
```

### Common Query Parameters

```typescript
$select    - Choose fields to return
$filter    - Filter results
$orderby   - Sort results
$top       - Limit number of results
$skip      - Pagination offset
$expand    - Include related resources
```

---

## Future Enhancements

### Planned Features
- [ ] Multiple calendar support
- [ ] Two-way sync (create/edit events)
- [ ] Recurring event handling
- [ ] Meeting room finder
- [ ] Free/busy status
- [ ] Calendar sharing management
- [ ] Notification sync
- [ ] Offline support with service worker

### Recommended Next Steps
1. ✅ Current implementation is production-ready
2. 📝 Consider adding MSAL.js for easier maintenance
3. 🔐 Implement refresh token rotation
4. 📊 Add analytics for sync success/failure
5. 🎨 Improve error messages for users
6. 🧪 Add comprehensive error handling tests

---

## Resources

### Official Microsoft Documentation (2025)
- [Microsoft Entra Admin Center](https://entra.microsoft.com/)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/overview)
- [MSAL.js Documentation](https://learn.microsoft.com/en-us/entra/msal/javascript/)
- [SPA Authentication Guide](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-single-page-app-sign-in)
- [Microsoft Graph Calendar API](https://learn.microsoft.com/en-us/graph/api/resources/calendar)
- [OAuth 2.0 Authorization Code Flow with PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)

### Code Samples
- [Microsoft Graph JavaScript Samples](https://github.com/microsoftgraph/msgraph-training-javascript)
- [MSAL.js Samples](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples)
- [React SPA Sample](https://github.com/Azure-Samples/ms-identity-docs-code-javascript)

### Support
- [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/tags/455/entra-id)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/microsoft-graph-api)
- [GitHub Issues](https://github.com/microsoftgraph/microsoft-graph-docs/issues)

---

## Summary

### What Changed in 2025
- ✅ Terminology: Azure AD → Microsoft Entra ID
- ✅ Platform: Explicit SPA configuration
- ✅ Security: PKCE is now standard
- ✅ Libraries: MSAL.js v3.x recommended
- ✅ No backend required for SPAs

### Your Current Implementation
- ✅ Production ready and functional
- ✅ Follows OAuth 2.0 standards
- ⚡ Optional: Can modernize with MSAL.js for easier maintenance

### Recommended Actions
1. **Short Term**: Update terminology in docs (Azure AD → Microsoft Entra ID)
2. **Medium Term**: Add PKCE support to current implementation
3. **Long Term**: Consider migrating to MSAL.js for automatic token management
4. **Production**: Your current code works great - no urgent changes needed!

---

**Last Updated**: October 2025  
**Version**: 2.0.0  
**Compatibility**: Microsoft Entra ID / Microsoft Graph v1.0
