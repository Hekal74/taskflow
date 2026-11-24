# TaskFlow Architecture

## 1. Architecture Overview

TaskFlow follows a modular frontend architecture built with React and TypeScript. The application separates authentication, dashboard, project management, and task management into focused features.

Shared application concerns, including routing, authentication state, theme preferences, API communication, and reusable UI, are handled centrally.

The application uses a mocked API powered by Mock Service Worker (MSW), allowing frontend features to communicate through API contracts without requiring a real backend.

## 2. Technology Stack

- **React** – Component-based UI.
- **TypeScript** – Static typing and safer development.
- **Vite** – Development server and build tooling.
- **React Router** – Client-side routing and protected routes.
- **SCSS** – Styling and theme tokens.
- **MSW** – Mock API handlers.
- **Testing Library** – Component and interaction testing.
- **Jest** – Test runner.

## 3. Application Structure

The application is initialized through the following provider hierarchy:

1. `ThemeProvider` manages theme and accent-color preferences.
2. `AuthProvider` manages authentication state and session initialization.
3. `ApplicationRouter` handles session initialization and renders the router when initialization is complete.
4. `RouterProvider` renders the route configuration.

The authenticated area is wrapped by `ProtectedRoutes`, which checks whether a user is authenticated before rendering `AppShell`.

`AppShell` provides the shared application layout, including navigation, user information, logout, theme controls, and the main page content.

## 4. Main Modules

### Authentication

Responsible for user authentication and session handling.

Includes:

- Login
- Registration
- Forgot Password
- Session initialization
- Logout
- Protected route access

The Forgot Password feature provides a password-reset request flow through the mocked API. It does not represent real email delivery.

### Dashboard

Provides an overview of the user's workspace, including project information and progress summaries.

### Projects

Responsible for project management.

Includes:

- Listing projects
- Creating projects
- Updating projects
- Deleting projects
- Opening project details

### Tasks

Responsible for task management within projects.

Includes:

- Listing tasks
- Creating tasks
- Updating tasks
- Deleting tasks
- Searching tasks by title or description
- Filtering tasks by status, priority, and assignee

### Application Layout

`AppShell` provides the shared layout for authenticated pages.

Its internal UI sections include:

- Sidebar navigation with Dashboard and Projects links
- TaskFlow brand link
- User identity and logout action
- Header with page context
- Responsive sidebar controls
- Light/Dark theme toggle
- Accent color picker
- Main page content

These sections are implemented inside `AppShell`; they are not separate React components.

### Theme Management

`ThemeProvider` exposes the current theme, accent color, and update functions through `useTheme`.

Supported preferences:

- Light mode
- Dark mode
- System color-scheme preference when no explicit theme has been saved
- Five accent colors: Indigo, Blue, Teal, Rose, and Amber

Theme preferences are stored in browser `localStorage` using:

- `taskflow_theme`
- `taskflow_accent`

The selected values are applied to the document root through `data-theme` and `data-accent` attributes.

If browser storage is unavailable, the current selection still applies for the active session.

## 5. Routing Strategy

The application uses React Router with public and protected routes.

| Route                  | Purpose                                 | Access          |
| ---------------------- | --------------------------------------- | --------------- |
| `/`                    | Redirects based on authentication state | Public entry    |
| `/login`               | Login page                              | Public          |
| `/register`            | Registration page                       | Public          |
| `/forgot-password`     | Password-reset request                  | Public          |
| `/dashboard`           | Dashboard                               | Protected       |
| `/projects`            | Projects list                           | Protected       |
| `/projects/:projectId` | Project details and tasks               | Protected       |
| `*`                    | Not Found page                          | Public fallback |

Authenticated users visiting `/login` or `/register` are redirected to `/dashboard`.

Unauthenticated users attempting to access protected routes are redirected to `/login`.

The root route redirects authenticated users to `/dashboard` and unauthenticated users to `/login`.

## 6. State Management

TaskFlow manages state according to its responsibility.

### Authentication State

Managed by `AuthProvider`.

Includes:

- Current authenticated user
- Session initialization status
- Initialization errors
- Login and logout operations

### Theme State

Managed by `ThemeProvider`.

Includes:

- Current theme
- Selected accent color
- Theme toggle action
- Accent color selection action

Theme preferences are persisted in `localStorage`.

### Local UI State

Managed within pages and components using React state and hooks.

Examples:

- Form input values
- Modal visibility
- Sidebar visibility
- Accent palette visibility
- Search and filter selections

### API and Mock Data

Feature pages communicate with the centralized API client. MSW intercepts API requests and executes the corresponding mock handlers.

The mock handlers validate requests, enforce authentication and ownership rules where applicable, and update the mock data.

## 7. API Communication Flow

The application uses a centralized API client to communicate with the mocked backend.

Typical request flow:

1. A page or component calls an API client method.
2. The API client maps frontend data where required.
3. MSW intercepts the HTTP request.
4. The relevant handler validates the request and performs the operation.
5. Mock data is read or updated.
6. MSW returns an HTTP response.
7. The API client maps the response into frontend data.
8. The page or component updates its UI.

Frontend models use camelCase, while API payloads follow the mocked API's snake_case contract where applicable.

## 8. Design Principles

- **Separation of Concerns:** Keep feature logic, shared application concerns, and API communication organized.
- **Reusability:** Share components and utilities when they have clear responsibilities.
- **Maintainability:** Prefer focused modules and predictable data flow.
- **Type Safety:** Use TypeScript for application models and API contracts.
- **Consistent UI:** Use shared styles and theme tokens.
- **Resilience:** Handle loading, empty, validation, and API error states.
- **Testability:** Keep important logic and UI behavior independently testable.
