import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:4000';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface PublicUser {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

type TaskStatus = 'todo' | 'in_progress' | 'done';

type TaskPriority = 'low' | 'medium' | 'high';

interface TaskRecord {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Database {
  users: User[];
  projects: Project[];
  tasks: TaskRecord[];
}

interface RegisterRequest {
  name?: string;
  email?: string;
  password?: string;
}

interface LoginRequest {
  email?: string;
  password?: string;
}

interface CreateProjectRequest {
  name?: string;
  description?: string;
}

interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

interface CreateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
}

type UpdateTaskRequest = Partial<
  Pick<
    TaskRecord,
    | 'title'
    | 'description'
    | 'status'
    | 'priority'
    | 'assignee_id'
    | 'due_date'
  >
>;

interface TokenPayload {
  userId: string;
  exp: number;
}

type ValidationFields = Record<string, string>;

// ─────────────────────────────────────────────────────────────────────────────
// In-memory Database
// ─────────────────────────────────────────────────────────────────────────────
//
// This data is provided to simulate a backend database.
// Students should NOT modify the initial data unless necessary for testing.

const db: Database = {
  users: [
    {
      id: 'seed-001',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    },
  ],

  projects: [
    {
      id: 'proj-001',
      name: 'TaskFlow App',
      description: 'Main product dashboard and task system',
      owner_id: 'seed-001',
      created_at: '2026-04-01T10:00:00Z',
    },
    {
      id: 'proj-002',
      name: 'Marketing Site',
      description: 'Landing page redesign and SEO updates',
      owner_id: 'seed-001',
      created_at: '2026-04-02T10:00:00Z',
    },
  ],

  tasks: [
    {
      id: 'task-001',
      project_id: 'proj-001',
      title: 'Set up project structure',
      description: 'Follow Vite + React template',
      status: 'done',
      priority: 'high',
      assignee_id: 'seed-001',
      due_date: '2026-04-10',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-10T10:00:00Z',
    },
    {
      id: 'task-002',
      project_id: 'proj-001',
      title: 'Design auth pages',
      description: 'Use AuthPage.css for styling',
      status: 'done',
      priority: 'high',
      assignee_id: 'seed-001',
      due_date: '2026-04-11',
      created_at: '2026-04-01T11:00:00Z',
      updated_at: '2026-04-11T10:00:00Z',
    },
    {
      id: 'task-003',
      project_id: 'proj-001',
      title: 'Build dashboard UI',
      description: 'Cards with color tops and progress bars',
      status: 'in_progress',
      priority: 'medium',
      assignee_id: 'seed-001',
      due_date: '2026-04-14',
      created_at: '2026-04-02T10:00:00Z',
      updated_at: '2026-04-02T10:00:00Z',
    },
    {
      id: 'task-004',
      project_id: 'proj-001',
      title: 'Connect mock API',
      description: 'Wire up MSW handlers',
      status: 'in_progress',
      priority: 'low',
      assignee_id: null,
      due_date: '2026-04-15',
      created_at: '2026-04-02T11:00:00Z',
      updated_at: '2026-04-02T11:00:00Z',
    },
    {
      id: 'task-005',
      project_id: 'proj-001',
      title: 'Write unit tests',
      description: '',
      status: 'todo',
      priority: 'low',
      assignee_id: null,
      due_date: '2026-04-20',
      created_at: '2026-04-03T10:00:00Z',
      updated_at: '2026-04-03T10:00:00Z',
    },
    {
      id: 'task-006',
      project_id: 'proj-002',
      title: 'Redesign landing page',
      description: 'New hero section',
      status: 'in_progress',
      priority: 'high',
      assignee_id: 'seed-001',
      due_date: '2026-04-18',
      created_at: '2026-04-02T10:00:00Z',
      updated_at: '2026-04-02T10:00:00Z',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

const createId = (): string => {
  // TODO:
  // Generate and return a unique string ID.
  //
  // Hint:
  // You can use Date.now() + a random value.

  throw new Error('TODO: Implement createId()');
};

const getCurrentDate = (): string => {
  // TODO:
  // Return the current date/time in ISO format.

  throw new Error('TODO: Implement getCurrentDate()');
};

const makeToken = (userId: string): string => {
  // TODO:
  // Create a mock authentication token.
  //
  // Token payload must contain:
  // - userId
  // - expiration time
  //
  // Token should expire after 24 hours.
  //
  // Hint:
  // Use JSON.stringify() and btoa().

  void userId;

  throw new Error('TODO: Implement makeToken()');
};

const getPublicUser = (user: User): PublicUser => {
  // TODO:
  // Convert User into PublicUser.
  //
  // IMPORTANT:
  // Never expose the user's password.

  void user;

  throw new Error('TODO: Implement getPublicUser()');
};

const getUser = (request: Request): User | null => {
  // TODO:
  // Extract the currently authenticated user.
  //
  // Steps:
  // 1. Read the Authorization header.
  // 2. Extract the Bearer token.
  // 3. Decode the token.
  // 4. Validate that userId exists.
  // 5. Check token expiration.
  // 6. Find the user in db.users.
  // 7. Return null for invalid authentication.
  //
  // IMPORTANT:
  // Invalid tokens must not crash the application.

  void request;

  return null;
};

const unauthorized = () => {
  // TODO:
  // Return JSON:
  //
  // { error: 'unauthorized' }
  //
  // HTTP status: 401

  return HttpResponse.json(
    { error: 'TODO' },
    { status: 501 },
  );
};

const notFound = () => {
  // TODO:
  // Return JSON:
  //
  // { error: 'not found' }
  //
  // HTTP status: 404

  return HttpResponse.json(
    { error: 'TODO' },
    { status: 501 },
  );
};

const forbidden = () => {
  // TODO:
  // Return JSON:
  //
  // { error: 'forbidden' }
  //
  // HTTP status: 403

  return HttpResponse.json(
    { error: 'TODO' },
    { status: 501 },
  );
};

const validationError = (fields: ValidationFields) => {
  // TODO:
  // Return a validation error containing:
  //
  // {
  //   error: 'validation failed',
  //   fields
  // }
  //
  // HTTP status: 400

  void fields;

  return HttpResponse.json(
    { error: 'TODO' },
    { status: 501 },
  );
};

const getParam = (
  param: string | readonly string[] | undefined,
): string => {
  // TODO:
  // MSW route params may contain different value types.
  //
  // Convert the given route parameter into a string.
  //
  // Return an empty string when no valid value exists.

  void param;

  return '';
};

// ─────────────────────────────────────────────────────────────────────────────
// API Handlers
// ─────────────────────────────────────────────────────────────────────────────

export const handlers = [
  // ───────────────────────────────────────────────────────────────────────────
  // AUTHENTICATION
  // ───────────────────────────────────────────────────────────────────────────

  // POST /auth/register
  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    // TODO:
    //
    // 1. Read RegisterRequest from request body.
    // 2. Trim name and email.
    // 3. Validate name, email and password.
    // 4. Return validation errors for missing fields.
    // 5. Check whether email is already registered.
    // 6. Email comparison should be case-insensitive.
    // 7. Create a new User.
    // 8. Add the user to db.users.
    // 9. Generate authentication token.
    // 10. Return token + PublicUser.
    //
    // Success HTTP status: 201.

    void request;

    return HttpResponse.json(
      { error: 'TODO: Implement registration' },
      { status: 501 },
    );
  }),

  // POST /auth/login
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    // TODO:
    //
    // 1. Read LoginRequest from body.
    // 2. Find user by email and password.
    // 3. Email comparison should be case-insensitive.
    // 4. Return 401 for invalid credentials.
    // 5. Generate authentication token.
    // 6. Return token + PublicUser.

    void request;

    return HttpResponse.json(
      { error: 'TODO: Implement login' },
      { status: 501 },
    );
  }),

  // GET /auth/me
  http.get(`${BASE_URL}/auth/me`, ({ request }) => {
    // TODO:
    //
    // 1. Get authenticated user from request.
    // 2. Return 401 when authentication is invalid.
    // 3. Return PublicUser.
    //
    // IMPORTANT:
    // Password must not be returned.

    void request;

    return HttpResponse.json(
      { error: 'TODO: Implement current user' },
      { status: 501 },
    );
  }),

  // ───────────────────────────────────────────────────────────────────────────
  // PROJECTS
  // ───────────────────────────────────────────────────────────────────────────

  // GET /projects
  http.get(`${BASE_URL}/projects`, ({ request }) => {
    // TODO:
    //
    // 1. Authenticate the request.
    // 2. Return 401 if necessary.
    // 3. Get projects belonging to the current user.
    // 4. Calculate task_count for each project.
    // 5. Calculate done_count for each project.
    // 6. Return:
    //
    // {
    //   projects: [...]
    // }

    void request;

    return HttpResponse.json(
      { error: 'TODO: Implement fetch projects' },
      { status: 501 },
    );
  }),

  // POST /projects
  http.post(`${BASE_URL}/projects`, async ({ request }) => {
    // TODO:
    //
    // 1. Authenticate user.
    // 2. Read CreateProjectRequest.
    // 3. Validate project name.
    // 4. Trim name and description.
    // 5. Create Project.
    // 6. Set owner_id to current user's ID.
    // 7. Set created_at.
    // 8. Add project to db.projects.
    // 9. Return created project.
    //
    // Success HTTP status: 201.

    void request;

    return HttpResponse.json(
      { error: 'TODO: Implement create project' },
      { status: 501 },
    );
  }),

  // GET /projects/:id
  http.get(`${BASE_URL}/projects/:id`, ({ request, params }) => {
    // TODO:
    //
    // 1. Authenticate user.
    // 2. Extract project ID from params.
    // 3. Find project.
    // 4. Return 404 when project doesn't exist.
    // 5. Verify current user owns the project.
    // 6. Return 403 when access isn't allowed.
    // 7. Get tasks belonging to this project.
    // 8. Return project including tasks.

    void request;
    void params;

    return HttpResponse.json(
      { error: 'TODO: Implement fetch project' },
      { status: 501 },
    );
  }),

  // PATCH /projects/:id
  http.patch(`${BASE_URL}/projects/:id`, async ({ request, params }) => {
    // TODO:
    //
    // 1. Authenticate user.
    // 2. Find project by ID.
    // 3. Handle 404.
    // 4. Check ownership.
    // 5. Handle 403.
    // 6. Read UpdateProjectRequest.
    // 7. Update only provided fields.
    // 8. Validate project name when supplied.
    // 9. Return updated project.

    void request;
    void params;

    return HttpResponse.json(
      { error: 'TODO: Implement update project' },
      { status: 501 },
    );
  }),

  // DELETE /projects/:id
  http.delete(`${BASE_URL}/projects/:id`, ({ request, params }) => {
    // TODO:
    //
    // 1. Authenticate user.
    // 2. Find project.
    // 3. Handle 404.
    // 4. Check ownership.
    // 5. Handle 403.
    // 6. Delete project.
    // 7. Delete all tasks belonging to that project.
    // 8. Return HTTP 204 No Content.

    void request;
    void params;

    return HttpResponse.json(
      { error: 'TODO: Implement delete project' },
      { status: 501 },
    );
  }),

  // ───────────────────────────────────────────────────────────────────────────
  // TASKS
  // ───────────────────────────────────────────────────────────────────────────

  // GET /projects/:id/tasks
  http.get(`${BASE_URL}/projects/:id/tasks`, ({ request, params }) => {
    // TODO:
    //
    // 1. Authenticate user.
    // 2. Find project.
    // 3. Handle 404.
    // 4. Check project ownership.
    // 5. Handle 403.
    // 6. Read query parameters.
    //
    // Supported filters:
    // - status
    // - priority
    // - assignee
    // - search
    //
    // 7. Get tasks belonging to the project.
    // 8. Apply provided filters.
    // 9. Search should check title and description.
    // 10. Search should be case-insensitive.
    // 11. Return:
    //
    // {
    //   tasks: [...]
    // }

    void request;
    void params;

    return HttpResponse.json(
      { error: 'TODO: Implement fetch tasks' },
      { status: 501 },
    );
  }),

  // POST /projects/:id/tasks
  http.post(
    `${BASE_URL}/projects/:id/tasks`,
    async ({ request, params }) => {
      // TODO:
      //
      // 1. Authenticate user.
      // 2. Find project.
      // 3. Handle 404.
      // 4. Check project ownership.
      // 5. Handle 403.
      // 6. Read CreateTaskRequest.
      // 7. Validate title.
      // 8. Create task.
      //
      // Defaults:
      // status   -> todo
      // priority -> medium
      //
      // 9. Generate created_at.
      // 10. Generate updated_at.
      // 11. Add task to db.tasks.
      // 12. Return created task.
      //
      // Success HTTP status: 201.

      void request;
      void params;

      return HttpResponse.json(
        { error: 'TODO: Implement create task' },
        { status: 501 },
      );
    },
  ),

  // PATCH /tasks/:id
  http.patch(`${BASE_URL}/tasks/:id`, async ({ request, params }) => {
    // TODO:
    //
    // 1. Authenticate user.
    // 2. Find task.
    // 3. Handle 404.
    // 4. Find parent project.
    // 5. Verify project ownership.
    // 6. Handle 403.
    // 7. Read UpdateTaskRequest.
    // 8. Update only provided properties.
    //
    // Supported fields:
    // - title
    // - description
    // - status
    // - priority
    // - assignee_id
    // - due_date
    //
    // 9. Do not allow an empty title.
    // 10. Update updated_at.
    // 11. Return updated task.

    void request;
    void params;

    return HttpResponse.json(
      { error: 'TODO: Implement update task' },
      { status: 501 },
    );
  }),

  // DELETE /tasks/:id
  http.delete(`${BASE_URL}/tasks/:id`, ({ request, params }) => {
    // TODO:
    //
    // 1. Authenticate user.
    // 2. Find task.
    // 3. Handle 404.
    // 4. Find parent project.
    // 5. Check project ownership.
    // 6. Handle 403.
    // 7. Delete task from db.tasks.
    // 8. Return HTTP 204 No Content.

    void request;
    void params;

    return HttpResponse.json(
      { error: 'TODO: Implement delete task' },
      { status: 501 },
    );
  }),
];