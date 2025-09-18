---
id: f3a4b5c6-d7e8-4f90-a1b2-c3d4e5f6a7b8
title: 'Develop Backend API for Updating Projects (PUT/PATCH /projects/:id)'
responsibleArea: Full-Stack Developer
---
Implement a RESTful API endpoint (`PATCH /api/projects/:id` or `PUT`) to update an existing project. This includes:
*   Validating input for `title` and `description`.
*   Ensuring the authenticated user owns the project to be updated.
*   Updating the project in the database and returning the updated object.