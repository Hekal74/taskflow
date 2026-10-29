// API Client - Student Exercise
//
// API base: http://localhost:4000
//
// The API is intercepted by MSW during development.
//
// Your task:
// Complete the TODOs below using TypeScript and fetch().

const BASE_URL = 'http://localhost:4000';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiErrorResponse {
  error?: string;
  fields?: Record<string, string>;
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
type CreateProjectData = {
  name: string;
  description?: string;
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
const getToken = (): string | null => {
  // TODO:
  // Read "tf_token" from localStorage.

  return localStorage.getItem('tf_token');
};

// ─────────────────────────────────────────────────────────────────────────────
// TODO 3: HTTP request helper
// ─────────────────────────────────────────────────────────────────────────────

// TODO:
// Replace "string" with a proper HttpMethod type.
//
// Only allow:
// GET
// POST
// PATCH
// DELETE

const request = async <T>(
  // TODO:
  // 1. Create the HTTP headers.
  //
  // Content-Type should be:
  // application/json

  // TODO:
  // 2. If auth === true:
  // - Get the token using getToken()
  // - Throw an Error if the token doesn't exist
  // - Add the Authorization header
  //
  // Expected format:
  // Bearer <token>

  // TODO:
  // 3. Send the request using fetch().
  //
  // Use:
  // - BASE_URL
  // - path
  // - method
  // - headers
  // - body

  // TODO:
  // 4. Handle status 204 No Content.

  // TODO:
  // 5. Parse the JSON response.

  // TODO:
  // 6. Handle unsuccessful HTTP responses.
  //
  // Example API validation error:
  //
  // {
  //   error: "validation failed",
  //   fields: {
  //     email: "already taken"
  //   }
  // }

  // TODO:
  // 7. Return the successful response.

  method: HttpMethod,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> => {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (auth) {
    const token = getToken();

    if (!token) {
      throw new ApiError('Authentication required', 401);
    }

    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json()) as ApiErrorResponse | T;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new ApiError(
      errorData.error ?? 'Request failed',
      response.status,
      errorData.fields,
    );
  }

  return data as T;
};

// ─────────────────────────────────────────────────────────────────────────────
// TODO 4: HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────

// TODO:
// Create reusable helper functions for:
//
// get<T>()
// post<T>()
// patch<T>()
// del<T>()
const get = <T>(path: string, auth = true): Promise<T> =>
  request<T>('GET', path, undefined, auth);

const post = <T>(path: string, body: unknown, auth = true): Promise<T> =>
  request<T>('POST', path, body, auth);

const patch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>('PATCH', path, body);

const del = (path: string): Promise<void> => request<void>('DELETE', path);

// ─────────────────────────────────────────────────────────────────────────────
// TODO 5: Authentication
// ─────────────────────────────────────────────────────────────────────────────
const saveSession = (response: AuthResponse): void => {
  localStorage.setItem('tf_token', response.token);
  localStorage.setItem('tf_user', JSON.stringify(response.user));
};
export const registerUser = async (
  data: RegisterData,
): Promise<AuthResponse> => {
  // TODO:
  // Replace "unknown" with your RegisterData and AuthResponse types.
  //
  // POST /auth/register
  //
  // Authentication is NOT required.
  //
  // After successful registration:
  // - Save the token
  // - Save the user
  // - Return the response

  const response = await post<AuthResponse>('/auth/register', data, false);
  saveSession(response);
  return response;
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  // TODO:
  // Replace "unknown" with the correct TypeScript types.
  //
  // POST /auth/login
  //
  // Authentication is NOT required.
  //
  // After success:
  // - Save token
  // - Save user
  // - Return response

  const response = await post<AuthResponse>('/auth/login', data, false);

  saveSession(response);
  return response;
};

export const getMe = (): User | null => {
  // TODO:
  // Replace "unknown" with the proper return type.
  //
  // Read "tf_user" from localStorage.
  // Parse the JSON safely.
  //
  // Return null when:
  // - no user exists
  // - stored JSON is invalid

  const storedUser = localStorage.getItem('tf_user');
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  //check if the token and user exist in localStorage but not granting access to the user if the token is invalid or expired in the api server. The token should be validated on the server side for secure authentication.
  return Boolean(getToken() && getMe());
};

export const logout = (): void => {
  localStorage.removeItem('tf_token');
  localStorage.removeItem('tf_user');
};

// TODO:
// Create a private saveSession() helper.
//
// It should save:
// - token as "tf_token"
// - user as "tf_user"

// ─────────────────────────────────────────────────────────────────────────────
// TODO 6: Projects API
// ─────────────────────────────────────────────────────────────────────────────

export const fetchProjects = async (): Promise<Project[]> => {
  // TODO:
  // Replace "unknown[]" with the proper type.
  //
  // GET /projects
  //
  // Expected response:
  //
  // {
  //   projects: [...]
  // }
  //
  // Return ONLY the projects array.
  const response = await get<{ projects: Project[] }>('/projects');
  return response.projects;

  throw new Error('TODO: Implement fetchProjects()');
};

export const createProject = async (
  data: CreateProjectData,
): Promise<Project> => {
  return post<Project>('/projects', data);
};

export const fetchProject = async (id: string): Promise<unknown> => {
  // TODO:
  // GET /projects/:id

  throw new Error('TODO: Implement fetchProject()');
};

export const updateProject = async (
  id: string,
  data: unknown,
): Promise<unknown> => {
  // TODO:
  // PATCH /projects/:id

  throw new Error('TODO: Implement updateProject()');
};

export const deleteProject = async (id: string): Promise<void> => {
  // TODO:
  // DELETE /projects/:id

  throw new Error('TODO: Implement deleteProject()');
};

// ─────────────────────────────────────────────────────────────────────────────
// TODO 7: Tasks API
// ─────────────────────────────────────────────────────────────────────────────

export const fetchTasks = async (
  projectId: string,
  filters: Record<string, string> = {},
): Promise<unknown[]> => {
  // TODO:
  // Replace temporary types with your Task and TaskFilters types.
  //
  // GET /projects/:projectId/tasks
  //
  // Build the query string using URLSearchParams.
  //
  // Example:
  //
  // /projects/proj-001/tasks?status=todo&priority=high
  //
  // Do NOT add undefined filter values.

  throw new Error('TODO: Implement fetchTasks()');
};

export const createTask = async (
  projectId: string,
  data: unknown,
): Promise<unknown> => {
  // TODO:
  // POST /projects/:projectId/tasks
  //
  // Replace the temporary types.

  throw new Error('TODO: Implement createTask()');
};

export const updateTask = async (
  taskId: string,
  data: unknown,
): Promise<unknown> => {
  // TODO:
  // PATCH /tasks/:taskId
  //
  // Replace the temporary types.

  throw new Error('TODO: Implement updateTask()');
};

export const deleteTask = async (taskId: string): Promise<void> => {
  // TODO:
  // DELETE /tasks/:taskId

  throw new Error('TODO: Implement deleteTask()');
};
