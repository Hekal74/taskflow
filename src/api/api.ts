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
type UpdateProjectData = Partial<CreateProjectData>;
type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskApiResponse = {
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
};
type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};
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

const mapTask = (task: TaskApiResponse): Task => ({
  id: task.id,
  projectId: task.project_id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  assignee: task.assignee_id,
  dueDate: task.due_date,
  createdAt: task.created_at,
  updatedAt: task.updated_at,
});

const toTaskPayload = (data: CreateTaskData | UpdateTaskData) => {
  const payload: Record<string, unknown> = {};

  if (data.title !== undefined) {
    payload.title = data.title;
  }

  if (data.description !== undefined) {
    payload.description = data.description;
  }

  if (data.status !== undefined) {
    payload.status = data.status;
  }

  if (data.priority !== undefined) {
    payload.priority = data.priority;
  }

  if (data.assignee !== undefined) {
    payload.assignee_id = data.assignee;
  }

  if (data.dueDate !== undefined) {
    payload.due_date = data.dueDate;
  }

  return payload;
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
};

export const createProject = async (
  data: CreateProjectData,
): Promise<Project> => {
  return post<Project>('/projects', data);
};

type ProjectDetailsResponse = Project & {
  tasks: TaskApiResponse[];
};

export const fetchProjectById = async (
  id: string,
): Promise<Project & { tasks: Task[] }> => {
  const response = await get<ProjectDetailsResponse>(`/projects/${id}`);

  return {
    ...response,
    tasks: response.tasks.map(mapTask),
  };
};

export const fetchProject = fetchProjectById;

export const updateProject = async (
  id: string,
  data: UpdateProjectData,
): Promise<Project> => {
  return patch<Project>(`/projects/${id}`, data);
};

export const deleteProject = async (id: string): Promise<void> => {
  return del(`/projects/${id}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// TODO 7: Tasks API
// ─────────────────────────────────────────────────────────────────────────────

export const fetchTasks = async (
  projectId: string,
  filters: TaskFilters = {},
): Promise<Task[]> => {
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

  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  const path = `/projects/${projectId}/tasks${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await get<{ tasks: TaskApiResponse[] }>(path);

  return response.tasks.map(mapTask);
};

export const createTask = async (
  projectId: string,
  data: CreateTaskData,
): Promise<Task> => {
  const response = await post<TaskApiResponse>(
    `/projects/${projectId}/tasks`,
    toTaskPayload(data),
  );

  return mapTask(response);
};

export const updateTask = async (
  taskId: string,
  data: UpdateTaskData,
): Promise<Task> => {
  const response = await patch<TaskApiResponse>(
    `/tasks/${taskId}`,
    toTaskPayload(data),
  );

  return mapTask(response);
};

export const deleteTask = async (taskId: string): Promise<void> => {
  return del(`/tasks/${taskId}`);
};
