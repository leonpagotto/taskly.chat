<div align="center">
  <img width="1200" height="475" alt="Taskly Chat banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <h1>Taskly Chat</h1>
  <p>A fast, local-first productivity app with Tasks, Habits, Notes, Projects, Files, Calendar, and an optional AI assistant.</p>
</div>

## Overview

Taskly Chat is a React + Vite + TypeScript app designed for a clean, cohesive productivity workflow:

- Tasks (lists with items), quick KPIs, due-date filters, and keyboard-friendly interactions
- Habits with streaks, completion rate, 7-day calendar, and recurrence rules
- Notes with a lightweight rich-text editor and attachments
- Projects and Categories for organization and color/icon coding
- Stories (kanban/list) for higher-level planning, drag-and-drop between columns
- Files and Calendar pages
- Optional AI assistant powered by Gemini to help create tasks from notes and chat with context

Everything runs locally in the browser with LocalStorage persistence (no server required). The AI features are disabled unless you provide an API key.

## Tech stack

- React 19, TypeScript, Vite
- Tailwind-style utility classes (via CSS classnames)
- LocalStorage for persistence
- Optional: Google Gemini via `@google/genai`

## Features

- Unified toolbar for Tasks, Habits, and Stories with project/category filters and period/status toggles
- Consistent cards, headers, modals, and empty states across pages
- Stories: list and kanban board view, drag-and-drop, full-page editor
- Notes: simple rich text, quick formatting, file attachments, generate tasks from note content
- Tasks: list KPIs (Completed/Overdue/Todo/Total), period filters Today/Week/Month
- Habits: streak and completion rate calculation, daily/week/interval recurrence

## Setup

Prerequisites: Node.js 18+

1) Install dependencies

```
npm install
```

2) Configure optional AI (Gemini)

- The app looks for `VITE_API_KEY` in your environment. For local development, add a `.env.local` file in the project root with:

```
VITE_API_KEY=your_gemini_api_key
```

If not provided, AI features are disabled gracefully.

3) Run the app in dev mode

```
npm run dev
```

The dev server will start and print a local URL (by default http://localhost:3000 or the next available port).

## Scripts

```
npm run dev      # start the Vite dev server
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Folder structure

```
taskly.chat/
├─ components/           # UI pages and shared components
│  ├─ ListsView.tsx      # Tasks
│  ├─ HabitsView.tsx     # Habits
│  ├─ NotesView.tsx      # Notes editor
│  ├─ StoriesView.tsx    # Stories (list + kanban)
│  ├─ StoryEditorPage.tsx# Full-page editor for stories
│  ├─ UnifiedToolbar.tsx # Shared filters/toolbar
│  └─ ...
├─ services/
│  ├─ geminiService.ts   # Optional Gemini integration
│  └─ pulseService.ts
├─ App.tsx
├─ index.tsx
├─ index.html
├─ types.ts              # Shared app types
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

## Environment

- AI Gemini key (optional): `VITE_API_KEY`
- All user data persists to LocalStorage in the browser.

## Deployment

Static hosting is supported. After `npm run build`, deploy the `dist/` directory to any static host (GitHub Pages, Netlify, Vercel, etc.).

## Notes

- If a dev server port is busy, Vite falls back to the next available port.
- The build may warn about large chunks; this is safe for local usage. For production, consider adding code-splitting via Rollup manualChunks.

---

Made with care for a smooth, consistent productivity workflow.
