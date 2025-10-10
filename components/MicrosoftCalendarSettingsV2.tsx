import React, { useState, useEffect } from 'react';
import { msalAuthService } from '../services/msalAuthService';
import { microsoftGraphService } from '../services/microsoftGraphService';
import { CheckCircleIcon, CloseIcon, WarningIcon } from './icons';

interface Calendar {
  id: string;
  name: string;
  color: string;
  isEnabled: boolean;
  isDefault: boolean;
}

interface MicrosoftCalendarSettingsProps {
  onSyncComplete?: (eventsCount: number) => void;
  t: (key: string) => string;
}

const MicrosoftCalendarSettingsV2: React.FC<MicrosoftCalendarSettingsProps> = ({ onSyncComplete, t }) => {
  const [useMSAL, setUseMSAL] = useState(true); // Toggle between MSAL and old implementation
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    userEmail?: string;
    userName?: string;
  }>({ connected: false });
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [enableWriteAccess, setEnableWriteAccess] = useState(false);
  const [showCalendarList, setShowCalendarList] = useState(false);

  const service = useMSAL ? msalAuthService : microsoftGraphService;

  useEffect(() => {
    checkConnectionStatus();
  }, [useMSAL]);

  const checkConnectionStatus = async () => {
    if (!service.isEnabled()) {
      return;
    }
    
    try {
      const status = await service.getConnectionStatus();
      setConnectionStatus(status);
      
      // Load calendars if connected
      if (status.connected && useMSAL) {
        await loadCalendars();
      }
    } catch (err) {
      console.error('Failed to check connection status:', err);
    }
  };

  const loadCalendars = async () => {
    if (!useMSAL) return;
    
    try {
      const msCalendars = await msalAuthService.getCalendars();
      const calendarList: Calendar[] = msCalendars.map((cal) => ({
        id: cal.id,
        name: cal.name,
        color: cal.color || '#0078D4',
        isEnabled: cal.isDefaultCalendar, // Default: only sync primary calendar
        isDefault: cal.isDefaultCalendar,
      }));
      setCalendars(calendarList);
    } catch (err) {
      console.error('Failed to load calendars:', err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMSAL) {
        // Use MSAL redirect flow
        await msalAuthService.signInRedirect(enableWriteAccess);
      } else {
        // Use old OAuth flow
        const authUrl = microsoftGraphService.getAuthorizationUrl();
        if (!authUrl) {
          setError('Microsoft Calendar integration is not configured. Please contact your administrator.');
          setLoading(false);
          return;
        }

        // Store current location to return after OAuth
        try {
          sessionStorage.setItem('microsoft_oauth_return_url', window.location.pathname);
        } catch (e) {
          console.warn('Failed to store return URL:', e);
        }

        // Redirect to Microsoft OAuth
        window.location.href = authUrl;
      }
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Microsoft');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Microsoft calendar? Synced events will no longer be updated.')) {
      try {
        if (useMSAL) {
          await msalAuthService.signOut();
        } else {
          microsoftGraphService.disconnect();
        }
        setConnectionStatus({ connected: false });
        setCalendars([]);
        setError(null);
      } catch (err) {
        console.error('Disconnect failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to disconnect');
      }
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      let events;
      
      if (useMSAL) {
        // Sync from multiple selected calendars
        const enabledCalendarIds = calendars
          .filter((cal) => cal.isEnabled)
          .map((cal) => cal.id);
        
        if (enabledCalendarIds.length === 0) {
          // Default to primary calendar
          enabledCalendarIds.push('primary');
        }
        
        events = await msalAuthService.fetchAllCalendarEvents(enabledCalendarIds);
      } else {
        // Use old service (single calendar)
        events = await microsoftGraphService.fetchCalendarEvents();
      }
      
      // Dispatch event so App.tsx can merge the events
      window.dispatchEvent(new CustomEvent('microsoft-calendar-sync', {
        detail: { events }
      }));
      
      if (onSyncComplete) {
        onSyncComplete(events.length);
      }
      
      setError(null);
    } catch (err) {
      console.error('Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync calendar events');
    } finally {
      setSyncing(false);
    }
  };

  const toggleCalendar = (calendarId: string) => {
    setCalendars((prev) =>
      prev.map((cal) =>
        cal.id === calendarId ? { ...cal, isEnabled: !cal.isEnabled } : cal
      )
    );
  };

  if (!service.isEnabled()) {
    return (
      <div className="bg-white dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Microsoft Calendar Integration
        </h2>
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-900/20">
          <div className="w-8 h-8 rounded-full bg-amber-200/70 dark:bg-amber-800/60 flex items-center justify-center flex-shrink-0">
            <WarningIcon className="text-base" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1 text-gray-900 dark:text-amber-100">
              Setup Required
            </h3>
            <p className="text-sm text-gray-700 dark:text-amber-200/90 mb-3">
              Microsoft Calendar integration is not configured. To enable this feature, add the following to your <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 font-mono text-xs">.env.local</code> file:
            </p>
            <pre className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono overflow-x-auto mb-3">
{`VITE_MICROSOFT_CLIENT_ID="your-application-client-id"
VITE_MICROSOFT_REDIRECT_URI="http://localhost:3000/microsoft/callback"`}
            </pre>
            <a 
              href="https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block mt-3 text-sm underline hover:no-underline"
            >
              Learn how to register a Microsoft Entra ID app →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Microsoft Calendar Integration
        </h2>
        
        {/* Toggle between MSAL and old implementation */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useMSAL}
              onChange={(e) => setUseMSAL(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-600 dark:text-gray-400">Use MSAL (2025)</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 p-3 rounded-lg border border-red-300/60 bg-red-50 dark:bg-red-900/20">
          <div className="w-8 h-8 rounded-full bg-red-200/70 dark:bg-red-800/60 flex items-center justify-center flex-shrink-0">
            <CloseIcon className="text-base" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1 text-red-900 dark:text-red-100">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-200/90">{error}</p>
          </div>
        </div>
      )}

      {connectionStatus.connected ? (
        <div>
          {/* Connected Status */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-300/60 bg-green-50 dark:bg-green-900/20 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-200/70 dark:bg-green-800/60 flex items-center justify-center flex-shrink-0">
              <CheckCircleIcon className="text-base" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-green-900 dark:text-green-100">Connected</h3>
              <p className="text-sm text-green-700 dark:text-green-200/90">
                {connectionStatus.userName} ({connectionStatus.userEmail})
              </p>
              <p className="text-xs text-green-600 dark:text-green-300/80 mt-1">
                {useMSAL 
                  ? `Using MSAL.js with ${enableWriteAccess ? 'read/write' : 'read-only'} access`
                  : 'Using legacy OAuth flow (read-only)'
                }
              </p>
            </div>
          </div>

          {/* Multiple Calendars (MSAL only) */}
          {useMSAL && calendars.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowCalendarList(!showCalendarList)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-2"
              >
                <span>📅 Calendars ({calendars.filter((c) => c.isEnabled).length} synced)</span>
                <span className="text-xs">{showCalendarList ? '▼' : '▶'}</span>
              </button>
              
              {showCalendarList && (
                <div className="space-y-2 pl-4">
                  {calendars.map((calendar) => (
                    <label
                      key={calendar.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={calendar.isEnabled}
                        onChange={() => toggleCalendar(calendar.id)}
                        className="rounded"
                        style={{ accentColor: calendar.color }}
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: calendar.color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {calendar.name}
                        {calendar.isDefault && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Primary)</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <span className="animate-spin">🔄</span>
                  Syncing...
                </>
              ) : (
                <>
                  🔄 Sync Now
                </>
              )}
            </button>

            {useMSAL && calendars.length > 0 && (
              <button
                onClick={loadCalendars}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                Refresh Calendar List
              </button>
            )}

            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {useMSAL 
                ? enableWriteAccess
                  ? '✨ Two-way sync enabled: You can create and edit events in both Taskly and Microsoft Calendar.'
                  : '📖 Read-only mode: Events are synced from Microsoft Calendar but can only be edited in Outlook.'
                : '📖 Legacy mode: Events are synced from Microsoft Calendar (read-only).'
              }
            </p>
          </div>
        </div>
      ) : (
        <div>
          {/* Not Connected */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
              Connect your Microsoft Calendar
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <li>✅ View your Outlook and Teams meetings in Taskly's calendar</li>
              <li>✅ Automatic synchronization of calendar events</li>
              <li>✅ Secure OAuth 2.0 {useMSAL ? 'with PKCE' : 'authentication'}</li>
              {useMSAL && enableWriteAccess && <li>✅ Create and edit events from Taskly</li>}
              {useMSAL && <li>✅ Sync multiple calendars (primary + shared)</li>}
            </ul>

            {/* Write Access Option (MSAL only) */}
            {useMSAL && (
              <label className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={enableWriteAccess}
                  onChange={(e) => setEnableWriteAccess(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable two-way sync (read/write access)
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Create and edit calendar events from Taskly
                  </div>
                </div>
              </label>
            )}
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Connect Microsoft Calendar'}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
            By connecting, you'll be redirected to Microsoft to sign in. We only request {enableWriteAccess ? 'read/write' : 'read'} access to your calendar.
          </p>
        </div>
      )}
    </div>
  );
};

export default MicrosoftCalendarSettingsV2;
