API models use snake_case as represented below. Frontend models may use
camelCase for component and application state. The centralized API client in
`src/api/api.ts` is responsible for mapping snake_case API fields to camelCase
frontend fields and converting frontend payloads back to snake_case.

# TaskFlow - Data Models

## 1. User

Represents an application user.

| Field    | Type   | Description               |
| -------- | ------ | ------------------------- |
| id       | string | Unique user identifier    |
| name     | string | User's full name          |
| email    | string | Unique email address      |
| password | string | Authentication credential |

`password` is an internal authentication field and must never be included in
public user responses.

## 2. Project

Represents a collection of related tasks.

| Field       | Type   | Description               |
| ----------- | ------ | ------------------------- |
| id          | string | Unique project identifier |
| name        | string | Project name              |
| description | string | Project description       |
| owner_id    | string | ID of the owning user     |
| created_at  | string | Creation timestamp        |
| updated_at  | string | Last update timestamp     |

## 3. Task

Represents an individual task within a project.

| Field       | Type           | Description            |
| ----------- | -------------- | ---------------------- |
| id          | string         | Unique task identifier |
| project_id  | string         | Parent project ID      |
| title       | string         | Task title             |
| description | string         | Task description       |
| status      | TaskStatus     | Current task status    |
| priority    | TaskPriority   | Task priority          |
| assignee_id | string or null | Assigned user ID       |
| due_date    | string or null | Task due date          |
| created_at  | string         | Creation timestamp     |
| updated_at  | string         | Last update timestamp  |

## 4. Enums

### TaskStatus

- todo
- in_progress
- done

### TaskPriority

- low
- medium
- high

## 5. Relationships

- One User can own multiple Projects.
- One Project can contain multiple Tasks.
- Each Task belongs to one Project.
- A Task can be assigned to a User.
- A Task can have no assignee.

`assignee_id` is the API representation of the assigned user's ID. It is used
for task data and assignee filtering. It does not itself provide a display
name. If the interface needs to show a name rather than an ID, that requires a
separate documented user-name representation or an existing user lookup source;
it should not be invented as part of this API contract.

Displaying the assignee name requires a suitable user data source or lookup.
No additional assignee-name endpoint or lookup is defined or implemented here.

## 6. Frontend Representation

Example frontend mapping:

| API field     | Frontend field |
| ------------- | -------------- |
| `project_id`  | `projectId`    |
| `assignee_id` | `assignee`     |
| `due_date`    | `dueDate`      |
| `created_at`  | `createdAt`    |
| `updated_at`  | `updatedAt`    |

Only fields that require clearer component usage need explicit frontend
properties. The mapping should remain centralized in the API layer.

## 7. Derived Data

Some values can be calculated instead of stored:

- Total task count per project.
- Completed task count.
- Project completion percentage.
- Task completion percentage.

Project completion percentage:

(completed tasks / total tasks) \* 100

If a project has no tasks, its completion percentage is 0.
