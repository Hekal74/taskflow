# TaskFlow - Component Design

## 1. Component-Extraction Guideline

Components should be extracted only when they provide a clear benefit:

- A component has an independent responsibility.
- It is reused in more than one place.
- It contains meaningful rendering or internal interaction logic.
- It improves readability or testability.

Simple labels, one-off wrappers, short text sections, and small badges should
remain inside their parent component unless reuse or complexity makes
extraction worthwhile. The project should not create one component for every
small UI element.

## 2. Essential Components

The following components are appropriate candidates for implementation:

- `TaskCard`: renders task details and meaningful task actions.
- `TaskForm`: manages the create/edit form and validation.
- `TaskList`: renders task collections and loading, empty, and error states.
- `TaskFilters`: owns the filter controls and reports filter changes.
- `ProjectCard`: renders project summary and completion progress.
- `ProjectForm`: manages project create/edit behavior and validation.
- `AppLayout`: provides the authenticated application shell.
- `AuthLayout`: provides the shared authentication-page shell.
- Shared reusable UI such as `Modal`, `Button`, `Input`, `Loader`, or
  `ErrorMessage` only when the implementation actually duplicates it.

Feature pages can compose these components directly. They do not need a
separate component for each heading or section.

## 3. Optional Components

The following components are not required and should be created only if they
become useful in the implementation:

- Separate search or filter-input components
- Badge components for every status or priority
- Project header, project actions, and task action wrappers
- Dashboard welcome, stats-card, recent-task, or project-summary wrappers
- Sidebar/header/body subcomponents that have no independent behavior

Grouping related UI in a page or feature component is preferable when
extraction does not reduce complexity.

## 4. Responsibilities

- Pages coordinate routing, data loading, and feature-level state.
- Forms own their user input and validation state.
- Lists and cards remain presentation-focused, receiving data and callbacks.
- Shared layout and genuinely reusable controls keep behavior consistent.
- API calls remain in the centralized API layer.

Business data mapping and API error handling should not be duplicated in
presentation components.

## 5. Testing

Prioritize tests for meaningful behavior:

- Task and project forms
- Task filtering and search
- Task cards with edit/delete/status actions
- Project cards and progress calculations
- Authentication and protected routing

Tests should cover rendering, interaction, validation, loading, error, and
empty states as applicable. They do not need to test every small wrapper.
