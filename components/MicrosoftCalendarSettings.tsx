import React, { useState, useEffect } from 'react';
import { microsoftGraphService } from '../services/microsoftGraphService';
import { CheckCircleIcon, CloseIcon, WarningIcon } from './icons';

interface MicrosoftCalendarSettingsProps {
  onSyncComplete?: (eventsCount: number) => void;
  t: (key: string) => string;
}

const MicrosoftCalendarSettings: React.FC<MicrosoftCalendarSettingsProps> = ({ onSyncComplete, t }) => {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    userEmail?: string;
    userName?: string;
  }>({ connected: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    if (!microsoftGraphService.isEnabled()) {
      return;
    }
    
    try {
      const status = await microsoftGraphService.getConnectionStatus();
      setConnectionStatus(status);
    } catch (err) {
      console.error('Failed to check connection status:', err);
    }
  };

  const handleConnect = () => {
    setLoading(true);
    setError(null);
    
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
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect your Microsoft calendar? Synced events will no longer be updated.')) {
      microsoftGraphService.disconnect();
      setConnectionStatus({ connected: false });
      setError(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      const events = await microsoftGraphService.fetchCalendarEvents();
      
      // Dispatch event so App.tsx can merge the events
      window.dispatchEvent(new CustomEvent('microsoft-calendar-sync', {
        detail: { events }
      }));
      
      if (onSyncComplete) {
        onSyncComplete(events.length);
      }
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync calendar events');
    } finally {
      setSyncing(false);
    }
  };

  if (!microsoftGraphService.isEnabled()) {
    return (
      <div className="bg-white dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Microsoft Calendar Integration
        </h2>
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-900/20">
          <div className="w-8 h-8 rounded-full bg-amber-200/70 dark:bg-amber-800/60 flex items-center justify-center flex-shrink-0">
            <WarningIcon className="text-base" />
          </div>
          <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
            <div className="font-semibold mb-2">Setup Required</div>
            <p className="mb-3">Microsoft Calendar integration requires configuration. Add the following environment variables:</p>
            <div className="space-y-2">
              <code className="block px-3 py-2 rounded bg-amber-100/70 dark:bg-amber-800/40 font-mono text-xs">
                VITE_MICROSOFT_CLIENT_ID=your-client-id
              </code>
              <code className="block px-3 py-2 rounded bg-amber-100/70 dark:bg-amber-800/40 font-mono text-xs">
                VITE_MICROSOFT_REDIRECT_URI=http://localhost:3002/microsoft/callback
              </code>
            </div>
            <a 
              href="https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block mt-3 text-sm underline hover:no-underline"
            >
              Learn how to register an Azure AD app →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Microsoft Calendar Integration
      </h2>

      {error && (
        <div className="mb-4 flex items-start gap-3 p-3 rounded-lg border border-red-300/60 bg-red-50 dark:bg-red-900/20">
          <div className="w-8 h-8 rounded-full bg-red-200/70 dark:bg-red-800/60 flex items-center justify-center flex-shrink-0">
            <CloseIcon className="text-base text-red-600 dark:text-red-300" />
          </div>
          <div className="flex-1 text-sm text-red-800 dark:text-red-200">
            <div className="font-semibold">Error</div>
            <p>{error}</p>
          </div>
        </div>
      )}

      {connectionStatus.connected ? (
        <div className="space-y-4">
          {/* Connected Status */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-300/60 bg-green-50 dark:bg-green-900/20">
            <div className="w-8 h-8 rounded-full bg-green-200/70 dark:bg-green-800/60 flex items-center justify-center flex-shrink-0">
              <CheckCircleIcon className="text-base text-green-600 dark:text-green-300" />
            </div>
            <div className="flex-1 text-sm text-green-800 dark:text-green-200">
              <div className="font-semibold mb-1">Connected to Microsoft Calendar</div>
              {connectionStatus.userName && (
                <p className="opacity-90">Signed in as: {connectionStatus.userName}</p>
              )}
              {connectionStatus.userEmail && (
                <p className="opacity-90 text-xs">{connectionStatus.userEmail}</p>
              )}
            </div>
          </div>

          {/* Sync Controls */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your Outlook/Teams calendar events will be synced automatically. You can also manually sync at any time.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={syncing}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Information */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">About Synced Events</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Events from the next 90 days will be synced</li>
              <li>Synced events are read-only and can only be edited in Microsoft Outlook</li>
              <li>Changes in your Microsoft calendar will be reflected after the next sync</li>
              <li>You can manually sync at any time using the "Sync Now" button</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Not Connected */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect your Microsoft account to sync your Outlook and Teams calendar events with Taskly.
          </p>
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Features:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
              <li>View your Outlook and Teams meetings in Taskly's calendar</li>
              <li>Automatic synchronization of calendar events</li>
              <li>Secure OAuth 2.0 authentication</li>
              <li>Read-only access - your Microsoft calendar won't be modified</li>
            </ul>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Connect Microsoft Calendar'}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            By connecting, you'll be redirected to Microsoft to sign in. We only request read access to your calendar.
          </p>
        </div>
      )}
    </div>
  );
};

export default MicrosoftCalendarSettings;
