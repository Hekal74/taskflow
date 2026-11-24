import { describe, expect, it } from '@jest/globals';
import {
  filterTasks,
  getTaskSummary,
  type Task,
  type TaskFilters,
} from './taskListUtils';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  projectId: 'project-1',
  title: 'Write project tests',
  description: 'Cover search and status',
  status: 'todo',
  priority: 'medium',
  assignee: 'user-1',
  dueDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const noFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  assignee: 'all',
};

describe('filterTasks', () => {
  const tasks = [
    makeTask(),
    makeTask({
      id: 'task-2',
      title: 'Release notes',
      description: 'Project update',
      status: 'in_progress',
      priority: 'high',
      assignee: null,
    }),
    makeTask({
      id: 'task-3',
      title: 'Review complete',
      status: 'done',
      priority: 'low',
      assignee: 'user-2',
    }),
  ];

  it('combines search, status, priority, and current-user filters', () => {
    expect(
      filterTasks(
        tasks,
        {
          ...noFilters,
          search: 'PROJECT',
          status: 'todo',
          priority: 'medium',
          assignee: 'mine',
        },
        'user-1',
      ).map((task) => task.id),
    ).toEqual(['task-1']);
  });

  it('filters unassigned tasks and does not treat an absent user as mine', () => {
    const taskWithoutAssignee = { ...makeTask({ id: 'task-4' }) };
    Reflect.deleteProperty(taskWithoutAssignee, 'assignee');

    expect(
      filterTasks(
        [...tasks, taskWithoutAssignee],
        { ...noFilters, assignee: 'unassigned' },
        'user-1',
      ).map((task) => task.id),
    ).toEqual(['task-2', 'task-4']);

    expect(
      filterTasks(tasks, { ...noFilters, assignee: 'mine' }, undefined),
    ).toEqual([]);
  });
});

describe('getTaskSummary', () => {
  it('counts statuses and calculates completion independently of filters', () => {
    const summary = getTaskSummary([
      makeTask(),
      makeTask({ id: 'task-2', status: 'in_progress' }),
      makeTask({ id: 'task-3', status: 'done' }),
    ]);

    expect(summary).toEqual({
      total: 3,
      completed: 1,
      remaining: 2,
      completion: 33,
      byStatus: { todo: 1, in_progress: 1, done: 1 },
    });
  });

  it('returns safe zero values when there are no tasks', () => {
    expect(getTaskSummary([])).toEqual({
      total: 0,
      completed: 0,
      remaining: 0,
      completion: 0,
      byStatus: { todo: 0, in_progress: 0, done: 0 },
    });
  });
});
