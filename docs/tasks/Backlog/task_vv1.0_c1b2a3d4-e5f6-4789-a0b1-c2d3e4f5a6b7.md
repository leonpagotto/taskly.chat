---
id: c1b2a3d4-e5f6-4789-a0b1-c2d3e4f5a6b7
title: Implement Database Schema for Google Calendar Integration
responsibleArea: Full-Stack Developer
---
Modify the existing PostgreSQL database schema to store Google Calendar specific information associated with a user.
*   Add `google_access_token` (TEXT) to store the user's Google API access token.
*   Add `google_refresh_token` (TEXT) for obtaining new access tokens.
*   Add `google_token_expiry_date` (TIMESTAMP) to track access token expiration.
*   Add `google_calendar_id` (TEXT, nullable) to store the ID of the connected primary calendar or selected calendar.
*   Add `google_calendar_connected` (BOOLEAN, default FALSE) to indicate connection status.