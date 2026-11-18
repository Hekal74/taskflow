# TaskFlow - Requirements

## 1. Project Overview

TaskFlow is a web-based task management application that
allows users to organize projects, manage tasks, track
their progress, and collaborate through task assignments.

The application is built using React and TypeScript,
with mocked APIs powered by MSW.

## 2. Project Goals

- Provide a simple authentication experience.
- Allow users to manage their projects.
- Allow users to create, update, and delete tasks.
- Support task search and filtering.
- Provide a clear overview of project and task progress.
- Build a maintainable and reusable frontend architecture.

## 3. Functional Requirements

### 3.1 Authentication

- FR-01: Users can create an account.
- FR-02: Users can sign in.
- FR-03: Users can request a password reset.
- FR-04: Authenticated users can log out.
- FR-05: Protected pages require authentication.

### 3.2 Dashboard & Project Management

- FR-06: Users can view their projects.
- FR-07: Users can create a project.
- FR-08: Users can edit a project.
- FR-09: Users can delete a project.
- FR-10: Each project displays its related tasks.
- FR-11: Users can view project completion progress.

### 3.3 Task Management

- FR-12: Users can create tasks within a project.
- FR-13: Users can edit existing tasks.
- FR-14: Users can delete tasks.
- FR-15: Users can search tasks by title and description.
- FR-16: Users can filter tasks by priority.
- FR-17: Users can filter tasks by assignee. The filter uses the assigned
  user's ID.
- FR-18: Users can update task status.

### 3.4 Task Attributes

Each task must contain:

- Title
- Description
- Due date
- Priority: Low / Medium / High
- Assignee name for display
- Status: To Do / In Progress / Done

### 3.5 Bonus Features

- BF-01: Display project/task progress cards.
- BF-02: Support Dark and Light themes.

## 4. Non-Functional Requirements

- NFR-01: Use reusable and maintainable components.
- NFR-02: Use TypeScript for type safety.
- NFR-03: Use SCSS for styling.
- NFR-04: Use MSW for API mocking.
- NFR-05: Add unit tests for important application logic.
- NFR-06: Handle loading, error, and empty states.
- NFR-07: Provide a responsive user interface.
- NFR-08: Protect project data from unauthorized access.

## 5. User Stories

- As a user, I want to register and log in so I can access my workspace.
- As a user, I want to create projects to organize my work.
- As a user, I want to manage tasks inside each project.
- As a user, I want to search and filter tasks to find them easily.
- As a user, I want to track project progress to understand completion.

## 6. Acceptance Criteria

- A user cannot access protected pages without authentication.
- A user can only manage their own projects.
- Tasks belong to a specific project.
- Search returns tasks matching the entered title or description.
- Filters return tasks matching the selected criteria.
- Invalid form data displays validation errors.
- Deleting a project also removes its related tasks.
