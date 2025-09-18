---
id: d0c1b2a3-e4f5-4678-9a0b-1c2d3e4f5a6b
title: Develop Google Calendar Event Conversion Service
responsibleArea: Full-Stack Developer
---
Create a backend service or utility module responsible for mapping Taskly.chat task objects to Google Calendar event objects, adhering to Google Calendar API specifications.
*   Map Taskly.chat `title` to Google Calendar `summary`.
*   Map Taskly.chat `description` to Google Calendar `description`.
*   Map Taskly.chat `due_date` to Google Calendar `start.dateTime` and `end.dateTime` (e.g., all-day event for tasks without specific times, or a default time slot for timed tasks).
*   Store Taskly.chat's `task_id` in Google Calendar's `extendedProperties` or `iCalUID` to facilitate updates and deletions.