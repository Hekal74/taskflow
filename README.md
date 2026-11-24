# TaskFlow

A modern task and project management application built with React and TypeScript. TaskFlow helps users organize projects, manage tasks, track progress, and customize their workspace.

## Features

### Authentication

- User registration and login.
- Client-side form validation.
- Session initialization and persistence.
- Protected application routes.
- Forgot Password request flow.
- Logout functionality.

### Dashboard & Projects

- Dashboard with project and task progress summaries.
- View and manage projects.
- Create, edit, and delete projects.
- View project details and associated tasks.
- Project progress tracking based on completed tasks.

### Task Management

- Create, edit, and delete tasks.
- Organize tasks within projects.
- Manage task status:
  - To Do
  - In Progress
  - Done
- Set task priority, assignee, and due date.
- Search tasks by title and description.
- Filter tasks by status, priority, and assignee.

### Appearance & User Experience

- Light and Dark themes.
- System color-scheme preference detection.
- Five accent colors:
  - Indigo
  - Blue
  - Teal
  - Rose
  - Amber
- Persisted theme and accent-color preferences.
- Responsive application layout with sidebar navigation.
- Loading, empty, validation, success, and error states.
- Toast notifications for operation feedback.

## Tech Stack

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| Frontend          | React 19                    |
| Language          | TypeScript                  |
| Build Tool        | Vite 8                      |
| Routing           | React Router 7              |
| Styling           | SCSS                        |
| State Management  | React Hooks and Context API |
| Mock API          | MSW 2                       |
| Testing           | Jest 30                     |
| Component Testing | React Testing Library       |
| Type Checking     | TypeScript                  |
| Linting           | ESLint 9                    |

## Getting Started

### Prerequisites

- Node.js (18+)
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/hekal74/taskflow.git
cd taskflow
```

Install dependencies:

```bash
npm install
```

### MSW Setup

TaskFlow uses Mock Service Worker to intercept API requests during development.

The service worker is configured to use the `public` directory.

If the service worker file is not already present, initialize it using:

```bash
npx msw init public/ --save
```

This command generates `public/mockServiceWorker.js`.

### Run the Application

```bash
npm run dev
```

Vite will display the local development URL in the terminal, usually:

```text
http://localhost:5173
```

## Available Scripts

| Command                   | Description                          |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Start the Vite development server    |
| `npm run build`           | Create a production build            |
| `npm run preview`         | Preview the production build locally |
| `npm run lint`            | Run ESLint                           |
| `npm test -- --runInBand` | Run Jest tests sequentially          |

## Architecture

TaskFlow follows a modular, feature-oriented frontend architecture.

### Application Structure

- **ThemeProvider:** Manages theme and accent-color preferences.
- **AuthProvider:** Manages authentication state and session initialization.
- **ApplicationRouter:** Handles authentication initialization before rendering the router.
- **ProtectedRoutes:** Restricts access to authenticated application pages.
- **AppShell:** Provides the shared authenticated layout, navigation, user information, and appearance controls.

### Feature Modules

- **Authentication:** Login, registration, password-reset requests, and session management.
- **Dashboard:** Workspace overview and project progress summaries.
- **Projects:** Project listing and CRUD operations.
- **Tasks:** Task management, search, and filtering.

### API Communication

The application uses a centralized API client to communicate with mocked backend endpoints.

MSW intercepts HTTP requests and routes them to the corresponding handlers.

The API layer handles frontend-to-API data mapping where required, keeping frontend models separate from the mocked API contract.

For more details, see:

- [Architecture](docs/architecture.md)
- [Component Design](docs/component-design.md)
- [Requirements](docs/requirements.md)

## Mock API

TaskFlow uses MSW 2 to simulate backend API behavior without requiring a real backend.

MSW handlers cover authentication, projects, and tasks.

The mocked API handles:

- Request validation.
- Authentication checks.
- Resource ownership checks.
- Mock data operations.
- HTTP responses and error scenarios.

The mock data is maintained by the MSW handlers, allowing the application to exercise realistic API workflows during development and testing.

## Theme Preferences

TaskFlow supports customizable appearance preferences.

### Theme Modes

- Light mode.
- Dark mode.
- Automatic system preference when no explicit theme has been saved.

### Accent Colors

Users can choose from five accent colors: Indigo, Blue, Teal, Rose, and Amber.

Theme preferences are stored in browser `localStorage`:

| Preference   | Storage Key       |
| ------------ | ----------------- |
| Theme mode   | `taskflow_theme`  |
| Accent color | `taskflow_accent` |

## Testing

Run the test suite:

```bash
npm test -- --runInBand
```

The test suite covers important application behavior, including:

- API client behavior and data mapping.
- Task list utilities.
- CRUD error-message handling.
- Project card rendering and interactions.
- Project form behavior and validation.
- Task card rendering and interactions.
- Theme provider behavior and preference persistence.

## Project Structure

```text
src/
├── api/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── AppShell.tsx
├── components/
├── features/
│   ├── auth/
│   ├── dashboard/
│   └── projects/
├── mocks/
├── theme/
├── styles/
└── types/
```

The structure is organized around application infrastructure, shared UI, and feature-specific modules.

## Future Backend Integration

The current application uses MSW to simulate backend behavior.

The API client provides a centralized place for HTTP communication and data mapping. Replacing the mocked API with a real backend will require configuring the actual API endpoint and ensuring that the backend follows the expected API contracts.

MSW is intended for development and testing, not as a production backend.

---

## Author

**Eslam Mohamed Hekal**

- GitHub: [hekal74](https://github.com/hekal74)
- LinkedIn: [Eslam Hekal](https://www.linkedin.com/in/eslamhekal74/)
