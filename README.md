# TaskFlow

A minimal but real task management system. Users can register, log in, create projects, add tasks, and assign them to team members.

---

## 🛠 Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Frontend     | React 19.3.1 (Vite) |
| Routing      | React Router v7.14.0 |
| Mock API     | MSW (Mock Service Worker) |
| Styling      | Custom CSS (no external UI libraries) |
| State        | React Hooks (useState, useContext) |
| Auth         | Mock JWT (localStorage) |


**Mock API approach**: MSW intercepts real `fetch()` calls at the network level. The same `api.ts` file works against both MSW (dev) and a real backend (production) — no code changes needed.

---

## Getting Started

### Prerequisites
- Node.ts 18+
- npm

### Install

```bash
npm install
```

### Set up MSW service worker

```bash
npx msw init public/ --save
```

This copies `mockServiceWorker.js` into your `public/` folder. Only needed once.

### Run

```bash
npm run dev
```

App runs at `http://localhost:5173`  
Mock API intercepts requests to `http://localhost:4000`

---

## Test Credentials

Log in immediately — no registration needed:

```
Email:    test@example.com
Password: password123
```

Click the **"Use test credentials"** hint on the login page to auto-fill.

---

## Features

### Authentication
- Register / Login with full client-side validation
- JWT stored in `localStorage` — persists across page refreshes
- Protected routes — redirect to `/login` if unauthenticated
- Auto-redirect to dashboard if already logged in

### Projects
- List, create, delete projects
- Progress bar per project (% of done tasks)
- Stats: total projects, tasks, completed, finished
- Optimistic delete with revert on error
- Loading and error states with retry

### Tasks (Kanban Board)
- Three status columns: **To Do**, **In Progress**, **Done**
- Create tasks: title, description, status, priority, due date, assignee
- **Edit tasks** via modal panel
- **Drag and drop** between columns
- **Optimistic UI** — all updates apply instantly, revert on API error
- Task completion animation (green flash when moved to Done)
- Overdue dates highlighted in red
- Strikethrough on done tasks

### Filtering & Search
- Full-text search (title, description, assignee)
- Filter by priority and assignee
- Clear all filters

### UX
- Loading spinners on all async operations
- Error states with retry buttons — no silent failures
- Empty states on all views
- 6 color themes (Rose, Ocean, Forest, Violet, Amber, Slate)
- Fully responsive (375px mobile + 1280px desktop)

---

## API Reference

Base URL: `http://localhost:4000` (intercepted by MSW in development)

All protected endpoints require: `Authorization: Bearer <token>`

----
## 🧠 Architecture Decisions

### Mock API (MSW)
- Intercepts real network requests
- Same API works for mock and real backend
- No code changes needed when switching environments

### Optimistic UI
- Updates UI instantly before API response
- Rolls back on failure
- Improves perceived performance

---
## 🐳 Docker Note

Docker configuration has been included as part of the assignment requirements.  
However, due to local environment compatibility constraints, it could not be fully tested during development.

The application has been thoroughly tested using the standard Node.js setup, and the Docker configuration is structured to work correctly in a compatible environment.
-----
### POST /auth/register

```
Request:  { "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
Response 201: { "token": "<jwt>", "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } }
Error 400: { "error": "validation failed", "fields": { "email": "already taken" } }
```

### POST /auth/login

```
Request:  { "email": "jane@example.com", "password": "secret123" }
Response 200: { "token": "<jwt>", "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } }
Error 401: { "error": "unauthorized" }
```

### GET /auth/me

```
Response 200: { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" }
Error 401: { "error": "unauthorized" }
```

---

### GET /projects

```
Response 200: { "projects": [ { "id": "uuid", "name": "...", "description": "...", "owner_id": "uuid", "created_at": "..." } ] }
```

### POST /projects

```
Request:  { "name": "New Project", "description": "Optional" }
Response 201: { "id": "uuid", "name": "New Project", "description": "Optional", "owner_id": "uuid", "created_at": "..." }
Error 400: { "error": "validation failed", "fields": { "name": "is required" } }
```

### GET /projects/:id

```
Response 200: { "id": "uuid", "name": "...", "tasks": [ /* task objects */ ] }
Error 404: { "error": "not found" }
Error 403: { "error": "forbidden" }
```

### PATCH /projects/:id

```
Request:  { "name": "Updated Name", "description": "Updated" }
Response 200: { /* updated project */ }
```

### DELETE /projects/:id

```
Response 204: No Content
```

---

### GET /projects/:id/tasks?status=todo&assignee=uuid

```
Response 200: { "tasks": [ /* task objects */ ] }
```

### POST /projects/:id/tasks

```
Request:  { "title": "Design homepage", "description": "...", "priority": "high", "assignee_id": "uuid", "due_date": "2026-04-15" }
Response 201: { "id": "uuid", "title": "...", "status": "todo", "priority": "high", ... }
Error 400: { "error": "validation failed", "fields": { "title": "is required" } }
```

### PATCH /tasks/:id

```
Request:  { "status": "done", "priority": "low" }   (all fields optional)
Response 200: { /* updated task */ }
```

### DELETE /tasks/:id

```
Response 204: No Content
```

## Connecting a Real Backend

MSW only runs in development (`import.meta.env.PROD` check in `main.tsx`). In production builds, all fetch calls in `api.ts` hit the real server directly — no changes needed.

```js
// main.tsx
async function enableMocking() {
  if (import.meta.env.PROD) return; // ← MSW skipped in production
  const { worker } = await import("./mocks/browser");
  return worker.start();
}
```