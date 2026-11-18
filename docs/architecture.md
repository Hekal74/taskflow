# TaskFlow - Application Architecture

## 1. Architecture Overview

TaskFlow follows a modular frontend architecture based on
feature separation and separation of concerns.

The application separates:

- UI Components
- Pages and Routing
- Business Logic
- API Communication
- Mock API Layer
- Shared Utilities and Types

## 2. Technology Stack

| Technology      | Purpose                         |
| --------------- | ------------------------------- |
| React           | UI development                  |
| TypeScript      | Static type checking            |
| Vite            | Development server and bundling |
| React Router    | Client-side routing             |
| SCSS            | Styling                         |
| MSW             | API mocking                     |
| Testing Library | Component testing               |

## 3. High-Level Architecture

The application follows this communication flow:

1. User interacts with a UI component.
2. The component triggers an action.
3. The relevant API function is called.
4. The API client sends an HTTP request.
5. MSW intercepts the request.
6. The matching handler validates and processes it.
7. The response is returned to the API client.
8. The UI updates based on the result.

## 4. Main Application Modules

### Authentication

- Login
- Register
- Forgot Password
- Session Management
- Logout

### Dashboard

- Overview
- Project Summary
- Task Summary
- Progress Indicators

### Projects

- Project List
- Project Details
- Create Project
- Edit Project
- Delete Project

### Tasks

- Task List
- Task Form
- Task Search
- Task Filters
- Task Status Management

## 5. Architectural Principles

- Separation of Concerns
- Single Responsibility Principle
- Reusable Components
- Explicit Data Contracts
- Centralized API Communication
- Consistent Error Handling
- Type Safety

## 6. Routing Strategy

Planned routes:

- /login
- /register
- /forgot-password
- /dashboard
- /projects
- /projects/:projectId

Protected routes require a valid authenticated session.

## 7. State Management

State is divided into:

- Local UI State: modal visibility, form inputs, dropdowns.
- Application State: authenticated user and shared preferences.
- Server State: projects and tasks retrieved from APIs.

The state management solution should remain proportional
to the application's complexity.

## 8. Planned Folder Structure

src/
├── app/
│ ├── App.tsx
│ ├── router.tsx
│ └── providers/
├── features/
│ ├── auth/
│ ├── projects/
│ └── tasks/
├── components/
│ ├── ui/
│ └── layout/
├── api/
├── mocks/
├── styles/
├── types/
└── main.tsx
