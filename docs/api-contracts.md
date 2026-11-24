# TaskFlow - API Contracts

## 1. Base Configuration

Base URL:
http://localhost:4000

This is the base URL configured in the API client for MSW interception. It
does not require a separate backend server to be running on port 4000.

Authentication:
Bearer Token

Content-Type:
application/json

## 2. Authentication APIs

| Method | Endpoint              | Purpose                |
| ------ | --------------------- | ---------------------- |
| POST   | /auth/register        | Create account         |
| POST   | /auth/login           | Sign in                |
| GET    | /auth/me              | Get current user       |
| POST   | /auth/forgot-password | Request password reset |

Logout is currently handled by clearing the local session.

### Register

Request:
{
"name": "John Doe",
"email": "john@example.com",
"password": "password123"
}

### Login

Request:
{
"email": "john@example.com",
"password": "password123"
}

### Forgot Password

Request:
{
"email": "john@example.com"
}

Response:
```json
{
  "message": "If an account exists for that email, a password reset link has been sent"
}
```

The response is intentionally generic and must not reveal whether the email
exists. Missing or malformed email values return a 400 validation response.

## 3. Project APIs

| Method | Endpoint      | Purpose              |
| ------ | ------------- | -------------------- |
| GET    | /projects     | List user's projects |
| POST   | /projects     | Create project       |
| GET    | /projects/:id | Get project details  |
| PATCH  | /projects/:id | Update project       |
| DELETE | /projects/:id | Delete project       |

## 4. Task APIs

| Method | Endpoint            | Purpose            |
| ------ | ------------------- | ------------------ |
| GET    | /projects/:id/tasks | List project tasks |
| POST   | /projects/:id/tasks | Create task        |
| PATCH  | /tasks/:id          | Update task        |
| DELETE | /tasks/:id          | Delete task        |

## 5. Task Filtering

GET /projects/:id/tasks

Supported query parameters:

- status (`todo`, `in_progress`, `done`)
- priority (`low`, `medium`, `high`)
- assignee_id
- search

`assignee_id` filters by the assigned user's ID. Search checks task title and
description.

Example:

/projects/proj-001/tasks?priority=high&status=todo&assignee_id=seed-001&search=design

## 6. HTTP Status Codes

| Status | Meaning                       |
| ------ | ----------------------------- |
| 200    | Successful request            |
| 201    | Resource created              |
| 204    | Resource deleted successfully |
| 400    | Invalid request data          |
| 401    | Unauthorized                  |
| 403    | Forbidden                     |
| 404    | Resource not found            |
| 409    | Resource conflict             |

## 7. Error Response

Example:

{
"error": "validation failed",
"fields": {
"title": "Title is required"
}
}

## 8. API Implementation Status

Implemented in the MSW mock API:

- Register
- Login
- Get current user
- Forgot password request
- Project CRUD
- Task CRUD
- Task search and filtering
- Task status and priority validation
- Authentication and ownership checks
- Consistent API error handling
- Network failures are represented as API client errors
- API regression tests

Notes:

- Forgot password currently returns a generic mock response.
- No real password reset email or reset-token workflow is implemented.
- Authentication and persistence are simulated by MSW.
