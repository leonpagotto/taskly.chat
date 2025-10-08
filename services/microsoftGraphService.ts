/**
 * Microsoft Graph API Service
 * Handles OAuth authentication and calendar data syncing with Microsoft 365 (Outlook/Teams)
 */

import { Event } from '../types';

interface MicrosoftAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface MicrosoftTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  bodyPreview?: string;
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
}

class MicrosoftGraphService {
  private config: MicrosoftAuthConfig | null = null;
  private tokens: MicrosoftTokens | null = null;
  private readonly STORAGE_KEY = 'microsoft_calendar_tokens';
  private readonly GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

  /**
   * Initialize the service with configuration
   */
  initialize(clientId: string, redirectUri: string): void {
    this.config = {
      clientId,
      redirectUri,
      scopes: [
        'Calendars.Read',
        'Calendars.ReadWrite',
        'User.Read',
        'offline_access'
      ],
    };
    this.loadTokens();
  }

  /**
   * Check if the service is properly configured
   */
  isEnabled(): boolean {
    return this.config !== null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.tokens) return false;
    return Date.now() < this.tokens.expiresAt;
  }

  /**
   * Get the OAuth authorization URL
   */
  getAuthorizationUrl(): string | null {
    if (!this.config) return null;

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_mode: 'query',
      prompt: 'select_account',
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   * Note: This requires a backend endpoint to securely exchange the code
   */
  async handleCallback(code: string): Promise<boolean> {
    if (!this.config) return false;

    try {
      // In production, this should call your backend endpoint
      // that securely exchanges the code for tokens
      const response = await fetch('/api/microsoft/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirectUri: this.config.redirectUri,
        }),
      });

      if (!response.ok) throw new Error('Token exchange failed');

      const data = await response.json();
      this.setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
      });

      return true;
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error);
      return false;
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.config || !this.tokens?.refreshToken) return false;

    try {
      // In production, call your backend endpoint
      const response = await fetch('/api/microsoft/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: this.tokens.refreshToken,
        }),
      });

      if (!response.ok) throw new Error('Token refresh failed');

      const data = await response.json();
      this.setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || this.tokens.refreshToken,
        expiresAt: Date.now() + (data.expires_in * 1000),
      });

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.disconnect();
      return false;
    }
  }

  /**
   * Make an authenticated request to Microsoft Graph API
   */
  private async graphRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.isAuthenticated()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) throw new Error('Not authenticated');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.GRAPH_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.tokens!.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request
          return this.graphRequest(endpoint, options);
        }
      }
      throw new Error(`Graph API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch calendar events from Microsoft 365
   */
  async fetchCalendarEvents(startDate?: Date, endDate?: Date): Promise<Event[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Microsoft');
    }

    try {
      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

      // Build query parameters
      const params = new URLSearchParams({
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        $select: 'id,subject,bodyPreview,start,end,isAllDay,location,organizer',
        $orderby: 'start/dateTime',
        $top: '100',
      });

      const response = await this.graphRequest<{ value: MicrosoftCalendarEvent[] }>(
        `/me/calendar/calendarView?${params.toString()}`
      );

      // Convert Microsoft events to app Event format
      return response.value.map(msEvent => this.convertToEvent(msEvent));
    } catch (error) {
      console.error('Failed to fetch Microsoft calendar events:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<{ displayName: string; email: string } | null> {
    try {
      const response = await this.graphRequest<{ displayName: string; mail: string; userPrincipalName: string }>(
        '/me?$select=displayName,mail,userPrincipalName'
      );
      return {
        displayName: response.displayName,
        email: response.mail || response.userPrincipalName,
      };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  /**
   * Convert Microsoft calendar event to app Event format
   */
  private convertToEvent(msEvent: MicrosoftCalendarEvent): Event {
    const startDate = new Date(msEvent.start.dateTime);
    const endDate = new Date(msEvent.end.dateTime);

    return {
      id: `ms-${msEvent.id}`,
      title: msEvent.subject || 'Untitled Event',
      description: msEvent.bodyPreview || undefined,
      startDate: startDate.toISOString().split('T')[0],
      startTime: msEvent.isAllDay ? null : startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: msEvent.isAllDay ? null : endDate.toTimeString().slice(0, 5),
      isAllDay: msEvent.isAllDay || false,
      location: msEvent.location?.displayName,
      reminders: ['15m'], // Default reminder
      projectId: undefined,
      categoryId: undefined,
      // Store Microsoft-specific metadata
      externalSource: 'microsoft',
      externalId: msEvent.id,
    };
  }

  /**
   * Store tokens securely
   */
  private setTokens(tokens: MicrosoftTokens): void {
    this.tokens = tokens;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store Microsoft tokens:', error);
    }
  }

  /**
   * Load tokens from storage
   */
  private loadTokens(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.tokens = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load Microsoft tokens:', error);
      this.tokens = null;
    }
  }

  /**
   * Disconnect and clear tokens
   */
  disconnect(): void {
    this.tokens = null;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove Microsoft tokens:', error);
    }
  }

  /**
   * Get connection status and user info
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    userEmail?: string;
    userName?: string;
  }> {
    if (!this.isAuthenticated()) {
      return { connected: false };
    }

    const profile = await this.getUserProfile();
    return {
      connected: true,
      userEmail: profile?.email,
      userName: profile?.displayName,
    };
  }
}

// Singleton instance
export const microsoftGraphService = new MicrosoftGraphService();

// Initialize if environment variables are present
if (typeof window !== 'undefined') {
  const clientId = (import.meta as any).env?.VITE_MICROSOFT_CLIENT_ID;
  const redirectUri = (import.meta as any).env?.VITE_MICROSOFT_REDIRECT_URI || `${window.location.origin}/microsoft/callback`;
  
  if (clientId) {
    microsoftGraphService.initialize(clientId, redirectUri);
  }
}

export default microsoftGraphService;
