import type { fetchTasks } from '../../api/api';

export type Task = Awaited<ReturnType<typeof fetchTasks>>[number];

export interface TaskFilters {
  search: string;
  status: Task['status'] | 'all';
  priority: Task['priority'] | 'all';
  assignee: 'all' | 'mine' | 'unassigned';
}

export interface TaskSummary {
  total: number;
  completed: number;
  remaining: number;
  completion: number;
  byStatus: Record<Task['status'], number>;
}

export const initialTaskFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  assignee: 'all',
};

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  userId: string | undefined,
): Task[] {
  const search = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (
      search &&
      !task.title.toLowerCase().includes(search) &&
      !task.description.toLowerCase().includes(search)
    ) {
      return false;
    }

    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    if (
      filters.assignee === 'mine' &&
      (!userId || task.assignee !== userId)
    ) {
      return false;
    }

    if (
      filters.assignee === 'unassigned' &&
      task.assignee !== null &&
      task.assignee !== undefined
    ) {
      return false;
    }

    return true;
  });
}

export function getTaskSummary(tasks: Task[]): TaskSummary {
  const byStatus: TaskSummary['byStatus'] = {
    todo: 0,
    in_progress: 0,
    done: 0,
  };

  tasks.forEach((task) => {
    byStatus[task.status] += 1;
  });

  const total = tasks.length;
  const completed = byStatus.done;

  return {
    total,
    completed,
    remaining: total - completed,
    completion:
      total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100)),
    byStatus,
  };
}
