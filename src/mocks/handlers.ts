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

type Project = {
  id: string;
  name: string;
  description: string;
  owner_id?: string;
  created_at?: string;
  task_count?: number;
  done_count?: number;
};

type TaskStatus = 'todo' | 'in_progress' | 'done';

type TaskPriority = 'low' | 'medium' | 'high';
type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  dueDate: string | null;
};
type CreateProjectData = {
  name: string;
  description?: string;
};

type UpdateProjectData = Partial<CreateProjectData>;
type CreateTaskData = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string | null;
  dueDate?: string | null;
};
type UpdateTaskData = Partial<CreateTaskData>;

type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  search?: string;
};
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
    'title' | 'description' | 'status' | 'priority' | 'assignee_id' | 'due_date'
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
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const getCurrentDate = (): string => {
  // TODO:
  // Return the current date/time in ISO format.
  return new Date().toISOString();
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

  const payload = {
    userId,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };

  return btoa(JSON.stringify(payload));
};

const getPublicUser = (user: User): PublicUser => {
  // TODO:
  // Convert User into PublicUser.
  //
  // IMPORTANT:
  // Never expose the user's password.

  //not returning the password field to ensure security and privacy of user data
  const { id, name, email } = user;

  return { id, name, email };
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
  try {
    const authorization = request.headers.get('Authorization');
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return null;
    }

    const payload = JSON.parse(atob(token)) as {
      userId?: string;
      exp?: number;
    };

    if (
      !payload.userId ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return db.users.find((user) => user.id === payload.userId) ?? null;
  } catch {
    return null;
  }
};

const unauthorized = () => {
  // TODO:
  // Return JSON:
  //
  // { error: 'unauthorized' }
  //
  // HTTP status: 401

  return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
};

const notFound = () => {
  // TODO:
  // Return JSON:
  //
  // { error: 'not found' }
  //
  // HTTP status: 404

  return HttpResponse.json({ error: 'not found' }, { status: 404 });
};

const forbidden = () => {
  // TODO:
  // Return JSON:
  //
  // { error: 'forbidden' }
  //
  // HTTP status: 403

  return HttpResponse.json({ error: 'forbidden' }, { status: 403 });
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

  return HttpResponse.json(
    { error: 'validation failed', fields },
    { status: 400 },
  );
};

const getParam = (param: string | readonly string[] | undefined): string => {
  // TODO:
  // MSW route params may contain different value types.
  //
  // Convert the given route parameter into a string.
  //
  // Return an empty string when no valid value exists.

  if (typeof param === 'string') {
    return param;
  }

  if (Array.isArray(param)) {
    return param[0] ?? '';
  }

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

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    const name = body.name?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const password = body.password ?? '';

    const fields: ValidationFields = {};

    if (!name) {
      fields.name = 'Name is required';
    }

    if (!email) {
      fields.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fields.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      fields.password = 'Password is required';
    }

    if (Object.keys(fields).length > 0) {
      return validationError(fields);
    }

    const existingUser = db.users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingUser) {
      return HttpResponse.json(
        { error: 'Email already registered' },
        { status: 409 },
      );
    }

    const user: User = {
      id: createId(),
      name,
      email,
      password,
    };

    db.users.push(user);

    const token = makeToken(user.id);

    return HttpResponse.json(
      {
        token,
        user: getPublicUser(user),
      },
      { status: 201 },
    );
  }),

  // POST /auth/login
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as LoginRequest;

    const email = body.email?.trim() ?? '';
    const password = body.password ?? '';

    if (!email || !password) {
      return validationError({
        ...(!email && { email: 'Email is required' }),
        ...(!password && { password: 'Password is required' }),
      });
    }

    const user = db.users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password,
    );

    if (!user) {
      return HttpResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    const token = makeToken(user.id);

    return HttpResponse.json({
      token,
      user: getPublicUser(user),
    });
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

    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    return HttpResponse.json({
      user: getPublicUser(user),
    });
  }),

  // ───────────────────────────────────────────────────────────────────────────
  // PROJECTS
  // ───────────────────────────────────────────────────────────────────────────

  // GET /projects
  http.get(`${BASE_URL}/projects`, ({ request }) => {
    // 1. Authenticate the current user
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }
    // 2. Return only projects owned by the current user
    const projects = db.projects
      .filter((project) => project.owner_id === user.id)
      .map((project) => {
        // 3. Get all tasks belonging to this project
        const projectTasks = db.tasks.filter(
          (task) => task.project_id === project.id,
        );
        // 4. Calculate project statistics
        const task_count = projectTasks.length;

        const done_count = projectTasks.filter(
          (task) => task.status === 'done',
        ).length;
        return {
          ...project,
          task_count,
          done_count,
        };
      });

    return HttpResponse.json({ projects });
  }),

  // POST /projects
  http.post(`${BASE_URL}/projects`, async ({ request }) => {
    // 1. Authenticate the current user
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    // 2. Read the request body
    const body = (await request.json()) as CreateProjectRequest;

    // 3. Validate the project name
    const name = body.name?.trim();

    if (!name) {
      return validationError({
        name: 'Project name is required',
      });
    }

    // 4. Create the project
    const project: Project = {
      id: createId(),
      name,
      description: body.description?.trim() ?? '',
      owner_id: user.id,
      created_at: getCurrentDate(),
    };

    // 5. Save it in the mock database
    db.projects.push(project);

    // 6. Return the created project
    return HttpResponse.json(project, { status: 201 });
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
  http.post(`${BASE_URL}/projects/:id/tasks`, async ({ request, params }) => {
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
  }),

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
