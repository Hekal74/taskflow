import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { handlers, initializeMockDatabase } from '../mocks/handlers';
import {
  ApiError,
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  fetchProjects,
  fetchTasks,
  fetchProjectById,
  loginUser,
  logout,
  requestPasswordReset,
  registerUser,
  updateProject,
  updateTask,
} from './api';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  writable: true,
});

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  localStorage.clear();
  initializeMockDatabase();
});
afterEach(() => {
  server.resetHandlers();
  logout();
});
afterAll(() => server.close());

const authenticate = async (): Promise<void> => {
  await loginUser({
    email: 'test@example.com',
    password: 'password123',
  });
};

describe('authentication', () => {
  it('persists the seed database with its existing relationships', () => {
    const database = JSON.parse(
      localStorage.getItem('taskflow_mock_database') ?? 'null',
    ) as {
      users: Array<{ id: string }>;
      projects: Array<{ id: string; owner_id: string }>;
      tasks: Array<{
        id: string;
        project_id: string;
        assignee_id: string | null;
      }>;
    };

    expect(database.users).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'seed-001' })]),
    );
    expect(database.projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'proj-001', owner_id: 'seed-001' }),
      ]),
    );
    expect(database.tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'task-001',
          project_id: 'proj-001',
          assignee_id: 'seed-001',
        }),
      ]),
    );
  });

  it('persists registered users and allows them to log in after reinitialization', async () => {
    await registerUser({
      name: 'Persistent User',
      email: 'persistent@example.com',
      password: 'password123',
    });

    initializeMockDatabase();
    logout();

    await expect(
      loginUser({
        email: 'persistent@example.com',
        password: 'password123',
      }),
    ).resolves.toMatchObject({
      user: {
        name: 'Persistent User',
        email: 'persistent@example.com',
      },
    });
  });

  it('logs in and rejects invalid credentials', async () => {
    await authenticate();
    expect(localStorage.getItem('tf_token')).toBeTruthy();

    logout();
    await expect(
      loginUser({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('requests password reset for a valid email', async () => {
    await expect(
      requestPasswordReset({ email: 'test@example.com' }),
    ).resolves.toEqual({
      message:
        'If an account exists for that email, a password reset link has been sent',
    });
  });

  it('validates missing and malformed forgot-password emails', async () => {
    await expect(requestPasswordReset({ email: '' })).rejects.toMatchObject({
      status: 400,
      fields: { email: 'Email is required' },
    });

    await expect(
      requestPasswordReset({ email: 'not-an-email' }),
    ).rejects.toMatchObject({
      status: 400,
      fields: { email: 'Enter a valid email address' },
    });
  });

  it('returns the same generic response for unknown emails', async () => {
    await expect(
      requestPasswordReset({ email: 'unknown@example.com' }),
    ).resolves.toEqual({
      message:
        'If an account exists for that email, a password reset link has been sent',
    });
  });

  it('preserves 401 and 403 authorization behavior', async () => {
    await expect(fetchProjects()).rejects.toMatchObject({ status: 401 });

    await registerUser({
      name: 'Second User',
      email: 'second@example.com',
      password: 'password123',
    });

    await expect(fetchProjectById('proj-001')).rejects.toMatchObject({
      status: 403,
    });
  });
});

describe('task filters', () => {
  beforeEach(authenticate);

  it('rejects invalid status and priority filters', async () => {
    await expect(
      fetchTasks('proj-001', { status: 'invalid' as 'todo' }),
    ).rejects.toMatchObject({
      status: 400,
      fields: { status: 'Invalid task status' },
    });

    await expect(
      fetchTasks('proj-001', { priority: 'urgent' as 'high' }),
    ).rejects.toMatchObject({
      status: 400,
      fields: { priority: 'Invalid task priority' },
    });
  });

  it('supports valid filtering and search', async () => {
    const tasks = await fetchTasks('proj-001', {
      status: 'done',
      priority: 'high',
      assignee_id: 'seed-001',
      search: 'project',
    });

    expect(tasks.map((task) => task.title)).toContain(
      'Set up project structure',
    );
  });
});

describe('network and CRUD', () => {
  it('converts fetch network failures to ApiError', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(
      requestPasswordReset({ email: 'test@example.com' }),
    ).rejects.toBeInstanceOf(ApiError);

    await expect(
      requestPasswordReset({ email: 'test@example.com' }),
    ).rejects.toMatchObject({
      message: 'Network error',
      status: 0,
    });

    fetchSpy.mockRestore();
  });

  it('supports project and task CRUD and ownership', async () => {
    await authenticate();

    const project = await createProject({
      name: 'Isolated Test Project',
      description: 'Test only',
    });
    expect(project.owner_id).toBe('seed-001');

    const updated = await updateProject(project.id, {
      name: 'Updated Test Project',
    });
    expect(updated.name).toBe('Updated Test Project');

    const task = await createTask(project.id, {
      title: 'Test task',
      status: 'todo',
      priority: 'medium',
      assignee: 'seed-001',
    });
    expect(task.projectId).toBe(project.id);
    expect(task.assignee).toBe('seed-001');

    const updatedTask = await updateTask(task.id, { status: 'done' });
    expect(updatedTask.status).toBe('done');

    await deleteTask(task.id);
    await deleteProject(project.id);

    await expect(fetchProjects()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'proj-001' })]),
    );
  });

  it('persists project and task changes, including cascading project deletion', async () => {
    await authenticate();

    const project = await createProject({
      name: 'Persistent Project',
      description: 'Stored across reloads',
    });

    initializeMockDatabase();
    await expect(fetchProjectById(project.id)).resolves.toMatchObject({
      name: 'Persistent Project',
    });

    await updateProject(project.id, { name: 'Updated Persistent Project' });

    const task = await createTask(project.id, {
      title: 'Persistent task',
      assignee: 'seed-001',
    });

    initializeMockDatabase();
    await expect(fetchTasks(project.id)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: task.id,
          title: 'Persistent task',
          assignee: 'seed-001',
        }),
      ]),
    );

    await updateTask(task.id, { title: 'Updated persistent task' });
    initializeMockDatabase();

    await expect(fetchProjectById(project.id)).resolves.toMatchObject({
      name: 'Updated Persistent Project',
    });
    await expect(fetchTasks(project.id)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: task.id,
          title: 'Updated persistent task',
        }),
      ]),
    );

    await deleteProject(project.id);

    const persistedDatabase = JSON.parse(
      localStorage.getItem('taskflow_mock_database') ?? 'null',
    ) as {
      projects: Array<{ id: string }>;
      tasks: Array<{ id: string; project_id: string }>;
    };

    expect(persistedDatabase.projects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: project.id })]),
    );
    expect(persistedDatabase.tasks).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: task.id, project_id: project.id }),
      ]),
    );
  });
});
