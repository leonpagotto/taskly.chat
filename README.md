<div align="center">
  <h1>Taskly Chat</h1>
  <p>A fast, local-first productivity app with Tasks, Habits, Notes, Projects, Files, Calendar, and an optional AI assistant.</p>
</div>

Taskly.Chat blends a clean, efficient SPA for personal productivity with a broader product vision: an AI-powered companion that remembers, adapts, and helps you move from conversation to action. This README focuses on the SPA you’re running now and includes a product overview for context.

## Contents

- Overview and core identity
- Features at a glance
- Quick start (dev, build, preview)
- Optional AI setup (Gemini)
- Folder structure
- Deployment (GitHub Pages CI included)
- Troubleshooting and FAQ

## Overview

Taskly Chat is a React + Vite + TypeScript single-page app. It runs fully in the browser with LocalStorage persistence—no backend required. The optional AI assistant (Gemini) activates only if you provide an API key.

### Core identity (product vision)

- Vision: Be the central hub where ideas, tasks, and goals—personal or professional—come together seamlessly.
- Mission: Help you capture, structure, and accomplish what matters by blending intelligent assistance, persistent memory, and a conversational experience.

## Features

- Unified toolbar across Tasks, Habits, and Stories (project/category selectors, period/status toggles, right-side extras)
- Consistent cards, headers, modals, and empty states
- Stories: list + kanban board with drag-and-drop; full-page story editor
- Tasks: KPIs (Completed/Overdue/Todo/Total), quick filters (Today/Week/Month)
- Habits: streaks and completion rate, 7-day view, recurrence
- Notes: simple rich text, attachments, “note to tasks” extraction
- Calendar and Files pages
- Optional Gemini AI integration for drafting and assistance

## Tech stack

- React 19, TypeScript, Vite
- Tailwind-style utility classes (via className utilities)
- LocalStorage for persistence
- Optional AI: Google Gemini via `@google/genai`

## Quick start

Prerequisites: Node.js 18+

1) Install dependencies

```bash
npm install
```

2) Run in dev

```bash
npm run dev
```

3) Build for production

```bash
npm run build
```

4) Preview the production build

```bash
npm run preview
```

## Optional AI setup (Gemini)

Add a `.env.local` at the repo root:

```env
VITE_API_KEY=your_gemini_api_key
# Optional: set a base path for GitHub Pages or subpath hosting
# PUBLIC_BASE_URL=/taskly.chat/
```

Notes:
- If not provided, AI features are disabled gracefully.
- The app reads `import.meta.env.VITE_API_KEY` in code paths that require AI.
- This app uses text-based Gemini capabilities only; it does not accept image inputs.

## Folder structure

```text
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

## Deployment

### GitHub Pages (CI/CD)

This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds the app and deploys `dist/` to GitHub Pages on pushes to `main`.

Setup steps:
1. In your repository Settings → Pages, set:
   - Source: GitHub Actions
2. Optionally set a custom domain under Settings → Pages.

The workflow uses Node 20, runs `npm ci` and `npm run build`, and publishes the `dist/` output. If you’re deploying under a subpath (e.g., `https://<user>.github.io/<repo>`), you can set a base path using an environment variable:

```env
PUBLIC_BASE_URL=/taskly.chat/
```

The Vite config reads `PUBLIC_BASE_URL` to set the `base` option.

### Other hosts

- Netlify: drag-and-drop the `dist/` folder or point to `npm run build` and `dist` as the publish directory.
- Vercel: import the repo; framework: Vite; build: `npm run build`; output: `dist`.
- Any static host works by serving `dist/`.

## Troubleshooting and FAQ

- Dev server port busy: Vite automatically picks the next available port.
- Big bundle warning: It’s safe. For production-sensitive deployments, consider code-splitting via Rollup `manualChunks`.
- Blank page on GitHub Pages: Ensure `PUBLIC_BASE_URL` matches your repo name (e.g., `/taskly.chat/`) and the Pages settings are using GitHub Actions.

---

Made with care for a smooth, consistent productivity workflow.
