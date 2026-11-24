# TaskFlow Component Design

## 1. Component Design Approach

TaskFlow uses a feature-oriented component structure.

Components are extracted when they have a clear responsibility, are reused, or contain meaningful UI or interaction logic.

The goal is to keep components focused and maintainable without creating unnecessary abstractions or splitting every visual section into a separate component.

## 2. Main Application Components

### App

The application entry component.

Responsibilities:

- Wrap the application with `ThemeProvider`.
- Wrap the application with `AuthProvider`.
- Render `ApplicationRouter`.

### ApplicationRouter

Handles authentication initialization before rendering the router.

Responsibilities:

- Display a session-checking state while authentication is initializing.
- Display an initialization error and retry action when session verification fails.
- Render `RouterProvider` after initialization completes.

### ThemeProvider

Provides theme preferences to the application through the `useTheme` hook.

Responsibilities:

- Manage Light and Dark themes.
- Follow the system color-scheme preference when no explicit theme is saved.
- Update the theme when the system preference changes, as long as the user has not explicitly selected a theme.
- Manage the selected accent color.
- Persist theme and accent preferences in `localStorage`.
- Apply the selected values to the document root.

### AuthProvider

Provides authentication state and operations to the application.

Responsibilities:

- Manage the authenticated user.
- Initialize the user's session.
- Expose authentication operations.
- Handle logout and session-related state.

### AppShell

Provides the shared layout for authenticated pages.

Responsibilities:

- Render the TaskFlow brand link.
- Provide Dashboard and Projects navigation.
- Display the authenticated user's identity.
- Provide the logout action.
- Display the current page context.
- Control the responsive sidebar.
- Provide the theme toggle.
- Provide the accent color picker.
- Render the current page through its children.

The Sidebar, Header, navigation, theme toggle, and accent picker are internal sections of `AppShell`, not separate React components.

## 3. Feature Components

### Authentication

Authentication pages:

- `LoginPage`
- `RegisterPage`
- `ForgotPasswordPage`

Responsibilities:

- Collect authentication or password-reset information.
- Validate user input.
- Call the relevant API client methods.
- Display loading, validation, and error feedback.

### Dashboard

`DashboardPage` coordinates the dashboard content and displays project information and progress summaries.

### Projects

Main components:

- `ProjectsPage`
- `ProjectCard`
- `ProjectForm`

Responsibilities:

- `ProjectsPage`: Loads and coordinates the project list and project-related actions.
- `ProjectCard`: Displays project information and available project actions.
- `ProjectForm`: Handles project creation and editing input and validation.

### Tasks

Main components:

- `ProjectDetailsPage`
- `TaskList`
- `TaskCard`
- `TaskForm`
- `TaskFilters`

Responsibilities:

- `ProjectDetailsPage`: Loads the selected project and its tasks, and coordinates task-related actions.
- `TaskList`: Displays the task collection.
- `TaskCard`: Displays task information and available task actions.
- `TaskForm`: Handles task creation and editing input and validation.
- `TaskFilters`: Provides task search and filtering controls.

## 4. Shared Logic and API Layer

### API Client

The API client centralizes communication with the mocked backend.

Responsibilities:

- Expose methods for authentication, projects, and tasks.
- Handle HTTP requests and responses.
- Map frontend camelCase models to API snake_case payloads where required.
- Map API responses back to frontend models.
- Normalize API errors for the application.

### MSW Handlers

MSW provides mocked API behavior for the application.

Handlers are organized around authentication, projects, and tasks.

They validate requests, enforce relevant authentication and ownership rules, and interact with mock data.

### Shared Utilities

Shared utilities contain logic that is useful across multiple features.

Examples include:

- Task filtering and list utilities.
- CRUD error-message handling.
- API and data validation helpers.

## 5. Component Responsibilities

The following guidelines help keep the component structure maintainable:

- **Pages** coordinate routing, data loading, and feature-level state.
- **Forms** manage input values and field validation.
- **Cards and Lists** focus on displaying data and exposing relevant actions.
- **Layout** provides consistent navigation and shared application controls.
- **Providers** expose application-wide state through React Context.
- **API methods** centralize communication and data mapping.
- **Utilities** contain reusable logic rather than duplicating it across pages.

## 6. Testing Strategy

Tests focus on important API behavior, reusable logic, component behavior, and theme management.

Current test coverage includes:

- API client behavior and data mapping.
- Task list utilities.
- CRUD error-message handling.
- Project card rendering and behavior.
- Project form behavior and validation.
- Task card rendering and behavior.
- Theme provider behavior, including system preference, explicit theme persistence, and accent-color selection.

Tests should verify relevant rendering, user interactions, validation, and error handling without coupling implementation details unnecessarily.
