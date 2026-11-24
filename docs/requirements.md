# TaskFlow Requirements

## 1. Project Overview

TaskFlow is a task management application that allows users to manage projects and organize tasks within each project.

The application provides authentication, a dashboard, project management, task management, search and filtering, and customizable appearance.

## 2. Functional Requirements

### Authentication

- **FR-01:** The system shall allow users to create an account.
- **FR-02:** The system shall allow registered users to sign in.
- **FR-03:** The system shall allow users to submit a password-reset request.
- **FR-04:** The system shall allow authenticated users to log out.
- **FR-05:** The system shall restrict protected application pages to authenticated users.

### Dashboard and Project Management

- **FR-06:** The system shall provide a dashboard after successful authentication.
- **FR-07:** The dashboard shall display project information and progress summaries.
- **FR-08:** The system shall allow users to view their projects.
- **FR-09:** The system shall allow users to create projects.
- **FR-10:** The system shall allow users to update existing projects.
- **FR-11:** The system shall allow users to delete projects.
- **FR-12:** The system shall allow users to open a project and view its tasks.

### Task Management

- **FR-13:** The system shall allow users to create tasks within a project.
- **FR-14:** The system shall allow users to update existing tasks.
- **FR-15:** The system shall allow users to delete tasks.
- **FR-16:** Each task shall support the following information:
  - Title
  - Description
  - Due date
  - Priority
  - Assignee
  - Status
- **FR-17:** The system shall support the following task statuses:
  - To Do
  - In Progress
  - Done
- **FR-18:** The system shall allow users to search tasks by title or description.
- **FR-19:** The system shall allow users to filter tasks by status, priority, and assignee.

## 3. Bonus Features

- **BF-01:** The dashboard shall display project progress information.
- **BF-02:** The application shall support Light and Dark themes.
- **BF-03:** The application shall allow users to select an accent color from the available palette.

### Theme Behavior

- The application shall use the system color-scheme preference when no explicit theme preference has been saved.
- Users shall be able to switch between Light and Dark modes.
- The application shall provide five accent colors: Indigo, Blue, Teal, Rose, and Amber.
- Theme and accent-color selections shall be persisted in browser `localStorage`.

## 4. Non-Functional Requirements

- **NFR-01 – Maintainability:** The application shall use a modular and reusable component structure.
- **NFR-02 – Type Safety:** TypeScript shall be used for application code and data models.
- **NFR-03 – Styling:** SCSS shall be used for styling and shared theme tokens.
- **NFR-04 – API Mocking:** MSW shall provide mocked API endpoints for frontend development and testing.
- **NFR-05 – Testing:** Important API methods, utilities, and UI behavior shall be covered by automated tests.
- **NFR-06 – User Feedback:** The application shall provide appropriate loading, validation, empty, success, and error states.
- **NFR-07 – Responsiveness:** The application shall support desktop and compact viewport layouts.
- **NFR-08 – Data Access:** Mock API handlers shall enforce authentication and relevant resource ownership rules.

## 5. User Stories

### Authentication

- As a new user, I want to create an account so that I can access TaskFlow.
- As a registered user, I want to sign in so that I can manage my projects and tasks.
- As a user who cannot remember my password, I want to submit a password-reset request.
- As an authenticated user, I want to log out securely.

### Projects

- As a user, I want to view my projects so that I can organize my work.
- As a user, I want to create, edit, and delete projects.
- As a user, I want to open a project to manage its tasks.

### Tasks

- As a user, I want to create, edit, and delete tasks within a project.
- As a user, I want to update task status and priority.
- As a user, I want to search and filter tasks so that I can find relevant work quickly.

### Dashboard and Appearance

- As a user, I want to see project progress on my dashboard.
- As a user, I want to switch between Light and Dark themes.
- As a user, I want to choose an accent color and keep my appearance preferences between sessions.

## 6. Scope Notes

TaskFlow uses MSW to simulate backend API behavior. Authentication, project, task, and password-reset interactions are implemented against mocked endpoints.

The password-reset requirement refers to submitting a reset request through the mocked flow; it does not imply integration with a real email delivery service.
