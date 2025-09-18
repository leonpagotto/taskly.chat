---
id: d1a0b9c8-e7f6-4234-8b5c-6a7b8c9d0e1f
title: Integrate Frontend Quick Capture with Backend API
responsibleArea: Full-Stack Developer
---
Connect the frontend quick capture component to the newly implemented backend API. This task involves:
*   Using a fetch API or an HTTP client (e.g., Axios) to send POST requests to the `/api/v1/capture` endpoint.
*   Including the user's JWT in the request headers for authentication.
*   Handling successful responses (e.g., clearing the input, providing a temporary 'captured!' message).
*   Handling API errors gracefully (e.g., displaying an error message to the user if the request fails).