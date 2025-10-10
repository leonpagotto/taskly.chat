/**
 * Microsoft Authentication Library (MSAL) Service
 * Modern 2025 implementation using MSAL.js v3.x with PKCE and automatic token refresh
 * 
 * Features:
 * - Automatic PKCE (Proof Key for Code Exchange)
 * - Automatic token refresh
 * - sessionStorage for better security
 * - Multiple calendar support
 * - Two-way sync capabilities
 */

import {
  PublicClientApplication,
  AccountInfo,
  AuthenticationResult,
  InteractionRequiredAuthError,
  LogLevel,
  Configuration,
  RedirectRequest,
  PopupRequest,
  SilentRequest,
} from '@azure/msal-browser';
import { Event } from '../types';

// MSAL Configuration
const getMSALConfig = (): Configuration => {
  const clientId = (import.meta as any).env?.VITE_MICROSOFT_CLIENT_ID;
  const redirectUri = (import.meta as any).env?.VITE_MICROSOFT_REDIRECT_URI || `${window.location.origin}/microsoft/callback`;
  const tenant = (import.meta as any).env?.VITE_MICROSOFT_TENANT || 'common';

  return {
    auth: {
      clientId: clientId || '',
      authority: `https://login.microsoftonline.com/${tenant}`,
      redirectUri,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'sessionStorage', // More secure than localStorage
      storeAuthStateInCookie: false, // Set to true for IE11 or Edge compatibility
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          switch (level) {
            case LogLevel.Error:
              console.error('[MSAL]', message);
              return;
            case LogLevel.Warning:
              console.warn('[MSAL]', message);
              return;
            case LogLevel.Info:
              console.info('[MSAL]', message);
              return;
            case LogLevel.Verbose:
              console.debug('[MSAL]', message);
              return;
          }
        },
        logLevel: LogLevel.Warning,
      },
    },
  };
};

// Scopes for different operations
const SCOPES = {
  // Basic read access
  read: ['User.Read', 'Calendars.Read', 'offline_access'],
  
  // Read/write access for two-way sync
  readWrite: ['User.Read', 'Calendars.ReadWrite', 'offline_access'],
  
  // Shared calendars access
  shared: ['User.Read', 'Calendars.Read', 'Calendars.ReadWrite', 'Calendars.Read.Shared', 'Calendars.ReadWrite.Shared', 'offline_access'],
};

// Microsoft Calendar Event Type
interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  bodyPreview?: string;
  body?: {
    contentType: string;
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  isAllDay?: boolean;
  location?: {
    displayName?: string;
  };
  organizer?: {
    emailAddress?: {
      name?: string;
      address?: string;
    };
  };
  attendees?: Array<{
    emailAddress: {
      name?: string;
      address?: string;
    };
    status?: {
      response: string;
    };
  }>;
}

// Microsoft Calendar Type
interface MicrosoftCalendar {
  id: string;
  name: string;
  color: string;
  isDefaultCalendar: boolean;
  canEdit: boolean;
  canShare: boolean;
  canViewPrivateItems: boolean;
  owner?: {
    name?: string;
    address?: string;
  };
}

class MSALAuthService {
  private msalInstance: PublicClientApplication | null = null;
  private account: AccountInfo | null = null;
  private isInitialized = false;
  private readonly GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

  /**
   * Initialize MSAL instance
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      const config = getMSALConfig();
      
      if (!config.auth.clientId) {
        console.warn('[MSAL] Client ID not configured');
        return false;
      }

      this.msalInstance = new PublicClientApplication(config);
      await this.msalInstance.initialize();

      // Handle redirect response if coming back from Microsoft login
      const response = await this.msalInstance.handleRedirectPromise();
      if (response) {
        this.account = response.account;
      } else {
        // Try to get account from cache
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          this.account = accounts[0];
        }
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[MSAL] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if MSAL is enabled (configured)
   */
  isEnabled(): boolean {
    const clientId = (import.meta as any).env?.VITE_MICROSOFT_CLIENT_ID;
    return !!clientId;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.isInitialized || !this.msalInstance) return false;
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0;
  }

  /**
   * Get current account
   */
  getAccount(): AccountInfo | null {
    if (!this.isInitialized || !this.msalInstance) return null;
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Sign in with popup
   */
  async signInPopup(requireWriteAccess: boolean = false): Promise<boolean> {
    if (!this.isInitialized || !this.msalInstance) {
      await this.initialize();
    }

    if (!this.msalInstance) return false;

    try {
      const loginRequest: PopupRequest = {
        scopes: requireWriteAccess ? SCOPES.readWrite : SCOPES.read,
        prompt: 'select_account',
      };

      const response = await this.msalInstance.loginPopup(loginRequest);
      this.account = response.account;
      return true;
    } catch (error) {
      console.error('[MSAL] Login failed:', error);
      return false;
    }
  }

  /**
   * Sign in with redirect
   */
  async signInRedirect(requireWriteAccess: boolean = false): Promise<void> {
    if (!this.isInitialized || !this.msalInstance) {
      await this.initialize();
    }

    if (!this.msalInstance) return;

    const loginRequest: RedirectRequest = {
      scopes: requireWriteAccess ? SCOPES.readWrite : SCOPES.read,
      prompt: 'select_account',
    };

    // Store return URL
    try {
      sessionStorage.setItem('microsoft_oauth_return_url', window.location.pathname);
    } catch (e) {
      console.warn('[MSAL] Failed to store return URL:', e);
    }

    await this.msalInstance.loginRedirect(loginRequest);
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.msalInstance || !this.account) return;

    try {
      await this.msalInstance.logoutPopup({
        account: this.account,
      });
      this.account = null;
    } catch (error) {
      console.error('[MSAL] Logout failed:', error);
    }
  }

  /**
   * Get access token (with automatic refresh)
   */
  private async getAccessToken(scopes: string[]): Promise<string | null> {
    if (!this.isInitialized || !this.msalInstance) {
      await this.initialize();
    }

    if (!this.msalInstance) return null;

    const account = this.getAccount();
    if (!account) return null;

    try {
      // Try silent token acquisition first
      const silentRequest: SilentRequest = {
        scopes,
        account,
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Token expired or user needs to re-consent
        try {
          const response = await this.msalInstance.acquireTokenPopup({ scopes, account });
          return response.accessToken;
        } catch (popupError) {
          console.error('[MSAL] Token acquisition failed:', popupError);
          return null;
        }
      }
      console.error('[MSAL] Silent token acquisition failed:', error);
      return null;
    }
  }

  /**
   * Make authenticated request to Microsoft Graph API
   */
  private async graphRequest<T>(endpoint: string, options: RequestInit = {}, requireWriteAccess: boolean = false): Promise<T> {
    const scopes = requireWriteAccess ? SCOPES.readWrite : SCOPES.read;
    const accessToken = await this.getAccessToken(scopes);

    if (!accessToken) {
      throw new Error('Not authenticated with Microsoft');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.GRAPH_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Microsoft Graph API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<{ displayName: string; email: string } | null> {
    try {
      const profile = await this.graphRequest<{
        displayName: string;
        userPrincipalName: string;
        mail?: string;
      }>('/me');

      return {
        displayName: profile.displayName,
        email: profile.mail || profile.userPrincipalName,
      };
    } catch (error) {
      console.error('[MSAL] Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    userEmail?: string;
    userName?: string;
  }> {
    if (!this.isAuthenticated()) {
      return { connected: false };
    }

    try {
      const profile = await this.getUserProfile();
      return {
        connected: true,
        userEmail: profile?.email,
        userName: profile?.displayName,
      };
    } catch (error) {
      return { connected: false };
    }
  }

  /**
   * Get all calendars (primary + shared)
   */
  async getCalendars(): Promise<MicrosoftCalendar[]> {
    try {
      const response = await this.graphRequest<{ value: MicrosoftCalendar[] }>('/me/calendars');
      return response.value;
    } catch (error) {
      console.error('[MSAL] Failed to fetch calendars:', error);
      return [];
    }
  }

  /**
   * Fetch calendar events from specific calendar
   */
  async fetchCalendarEvents(
    calendarId: string = 'primary',
    startDate?: Date,
    endDate?: Date
  ): Promise<Event[]> {
    try {
      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

      const params = new URLSearchParams({
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        $select: 'id,subject,bodyPreview,body,start,end,isAllDay,location,organizer,attendees',
        $orderby: 'start/dateTime',
        $top: '250',
      });

      const endpoint = calendarId === 'primary' 
        ? `/me/calendar/calendarView?${params.toString()}`
        : `/me/calendars/${calendarId}/calendarView?${params.toString()}`;

      const response = await this.graphRequest<{ value: MicrosoftCalendarEvent[] }>(endpoint);

      return response.value.map((event) => this.convertToEvent(event, calendarId));
    } catch (error) {
      console.error('[MSAL] Failed to fetch calendar events:', error);
      throw error;
    }
  }

  /**
   * Fetch events from multiple calendars
   */
  async fetchAllCalendarEvents(
    calendarIds: string[],
    startDate?: Date,
    endDate?: Date
  ): Promise<Event[]> {
    try {
      const eventPromises = calendarIds.map((calendarId) =>
        this.fetchCalendarEvents(calendarId, startDate, endDate)
      );

      const results = await Promise.allSettled(eventPromises);
      
      const allEvents: Event[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allEvents.push(...result.value);
        } else {
          console.error(`[MSAL] Failed to fetch events from calendar ${calendarIds[index]}:`, result.reason);
        }
      });

      return allEvents;
    } catch (error) {
      console.error('[MSAL] Failed to fetch all calendar events:', error);
      return [];
    }
  }

  /**
   * Create a new calendar event (two-way sync)
   */
  async createCalendarEvent(
    event: {
      subject: string;
      start: Date;
      end: Date;
      description?: string;
      location?: string;
      isAllDay?: boolean;
      attendees?: string[];
    },
    calendarId: string = 'primary'
  ): Promise<string | null> {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const eventData = {
        subject: event.subject,
        body: {
          contentType: 'HTML',
          content: event.description || '',
        },
        start: {
          dateTime: event.start.toISOString(),
          timeZone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone,
        },
        isAllDay: event.isAllDay || false,
        location: event.location ? { displayName: event.location } : undefined,
        attendees: event.attendees?.map((email) => ({
          emailAddress: { address: email },
          type: 'required',
        })),
      };

      const endpoint = calendarId === 'primary'
        ? '/me/calendar/events'
        : `/me/calendars/${calendarId}/events`;

      const response = await this.graphRequest<{ id: string }>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify(eventData),
        },
        true // Requires write access
      );

      return response.id;
    } catch (error) {
      console.error('[MSAL] Failed to create calendar event:', error);
      throw error;
    }
  }

  /**
   * Update an existing calendar event (two-way sync)
   */
  async updateCalendarEvent(
    eventId: string,
    updates: {
      subject?: string;
      start?: Date;
      end?: Date;
      description?: string;
      location?: string;
      isAllDay?: boolean;
    },
    calendarId: string = 'primary'
  ): Promise<boolean> {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const eventData: any = {};
      if (updates.subject) eventData.subject = updates.subject;
      if (updates.description) {
        eventData.body = {
          contentType: 'HTML',
          content: updates.description,
        };
      }
      if (updates.start) {
        eventData.start = {
          dateTime: updates.start.toISOString(),
          timeZone,
        };
      }
      if (updates.end) {
        eventData.end = {
          dateTime: updates.end.toISOString(),
          timeZone,
        };
      }
      if (updates.isAllDay !== undefined) {
        eventData.isAllDay = updates.isAllDay;
      }
      if (updates.location) {
        eventData.location = { displayName: updates.location };
      }

      const endpoint = calendarId === 'primary'
        ? `/me/calendar/events/${eventId}`
        : `/me/calendars/${calendarId}/events/${eventId}`;

      await this.graphRequest(
        endpoint,
        {
          method: 'PATCH',
          body: JSON.stringify(eventData),
        },
        true // Requires write access
      );

      return true;
    } catch (error) {
      console.error('[MSAL] Failed to update calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete a calendar event (two-way sync)
   */
  async deleteCalendarEvent(eventId: string, calendarId: string = 'primary'): Promise<boolean> {
    try {
      const endpoint = calendarId === 'primary'
        ? `/me/calendar/events/${eventId}`
        : `/me/calendars/${calendarId}/events/${eventId}`;

      await this.graphRequest(
        endpoint,
        { method: 'DELETE' },
        true // Requires write access
      );

      return true;
    } catch (error) {
      console.error('[MSAL] Failed to delete calendar event:', error);
      throw error;
    }
  }

  /**
   * Convert Microsoft calendar event to app Event format
   */
  private convertToEvent(msEvent: MicrosoftCalendarEvent, calendarId: string): Event {
    const startDate = new Date(msEvent.start.dateTime);
    const endDate = new Date(msEvent.end.dateTime);

    return {
      id: `microsoft-${calendarId}-${msEvent.id}`,
      title: msEvent.subject || 'Untitled Event',
      startDate: startDate.toISOString().split('T')[0],
      startTime: msEvent.isAllDay ? null : startDate.toTimeString().slice(0, 5),
      endDate: msEvent.isAllDay ? null : endDate.toISOString().split('T')[0],
      endTime: msEvent.isAllDay ? null : endDate.toTimeString().slice(0, 5),
      description: msEvent.bodyPreview || '',
      location: msEvent.location?.displayName,
      isAllDay: msEvent.isAllDay || false,
      reminders: [],
      externalSource: 'microsoft',
      externalId: msEvent.id,
      isReadOnly: false, // With MSAL and write permissions, events are editable
    };
  }
}

// Singleton instance
export const msalAuthService = new MSALAuthService();

// Auto-initialize if environment variables are present
if (typeof window !== 'undefined') {
  const clientId = (import.meta as any).env?.VITE_MICROSOFT_CLIENT_ID;
  if (clientId) {
    msalAuthService.initialize().catch((error) => {
      console.error('[MSAL] Auto-initialization failed:', error);
    });
  }
}

export default msalAuthService;
