import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ApiError,
  deleteTask,
  fetchProjectById,
  fetchTasks,
  updateTask,
} from '../../api/api';
import { useAuth } from '../auth/AuthContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import Toast from './Toast';
import { getCrudErrorMessage } from './crudErrorMessage';
import {
  filterTasks,
  getTaskSummary,
  initialTaskFilters,
  type TaskFilters,
} from './taskListUtils';
import { useToast } from './useToast';
import './project-details.scss';
import './projects.scss';

type ProjectDetails = Awaited<ReturnType<typeof fetchProjectById>>;
type Task = Awaited<ReturnType<typeof fetchTasks>>[number];

function ProjectDetailsPage() {
  const { projectId } = useParams();

  if (!projectId) {
    return (
      <section className="feature-page project-details-page">
        <nav className="project-details__breadcrumbs" aria-label="Breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <Link to="/projects">Projects</Link>
        </nav>
        <div className="page-state page-state--error" role="alert">
          <h1>Project not found</h1>
          <p>This project may have been deleted or is not available to you.</p>
          <Link className="button button--secondary" to="/projects">
            Back to projects
          </Link>
        </div>
      </section>
    );
  }

  return <ProjectDetails key={projectId} projectId={projectId} />;
}

function ProjectDetails({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [taskForm, setTaskForm] = useState<Task | null | undefined>(undefined);
  const [filters, setFilters] = useState<TaskFilters>(initialTaskFilters);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(
    () => new Set(),
  );
  const { toast, showToast } = useToast();
  const taskSummary = useMemo(() => getTaskSummary(tasks), [tasks]);
  const visibleTasks = useMemo(
    () => filterTasks(tasks, filters, user?.id),
    [tasks, filters, user?.id],
  );
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assignee !== 'all';

  useEffect(() => {
    let active = true;

    Promise.all([fetchProjectById(projectId), fetchTasks(projectId)])
      .then(([projectResult, taskResults]) => {
        if (!active) return;
        setProject(projectResult);
        setTasks(taskResults);
        setIsNotFound(false);
        setLoadError('');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setIsNotFound(error instanceof ApiError && error.status === 404);
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load this project. Please try again.',
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [projectId, reloadKey]);

  const retryLoading = () => {
    setIsLoading(true);
    setLoadError('');
    setIsNotFound(false);
    setReloadKey((key) => key + 1);
  };

  const handleTaskSaved = (savedTask: Task) => {
    showToast(
      taskForm ? 'Task updated successfully' : 'Task created successfully',
      'success',
    );
    setTasks((current) => {
      const exists = current.some((task) => task.id === savedTask.id);
      return exists
        ? current.map((task) => (task.id === savedTask.id ? savedTask : task))
        : [savedTask, ...current];
    });
    setTaskForm(undefined);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      showToast('Task deleted successfully', 'success');
    } catch (error) {
      showToast(
        getCrudErrorMessage(error, 'Failed to delete task. Please try again.'),
        'error',
      );
    }
  };

  const handleTaskStatusChange = async (
    task: Task,
    status: Task['status'],
  ) => {
    if (task.status === status || updatingTaskIds.has(task.id)) return;

    setUpdatingTaskIds((current) => new Set(current).add(task.id));

    try {
      const updatedTask = await updateTask(task.id, { status });
      setTasks((current) =>
        current.map((item) => (item.id === updatedTask.id ? updatedTask : item)),
      );
      showToast('Task status updated successfully', 'success');
    } catch (error) {
      showToast(
        getCrudErrorMessage(error, 'Failed to update task status. Please try again.'),
        'error',
      );
    } finally {
      setUpdatingTaskIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  };

  return (
    <section className="feature-page project-details-page">
      <Toast toast={toast} />
      <nav className="project-details__breadcrumbs" aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <Link to="/projects">Projects</Link>
      </nav>

      {isLoading ? (
        <div className="page-state" role="status">
          Loading project…
        </div>
      ) : isNotFound ? (
        <div className="page-state page-state--error" role="alert">
          <h1>Project not found</h1>
          <p>This project may have been deleted or is not available to you.</p>
          <Link className="button button--secondary" to="/projects">
            Back to projects
          </Link>
        </div>
      ) : loadError || !project ? (
        <div className="page-state page-state--error" role="alert">
          <p>{loadError || 'Unable to load this project.'}</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={retryLoading}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <header className="project-details__header">
            <div>
              <p className="eyebrow">Project details</p>
              <h1>{project.name}</h1>
              <p className="page-subtitle">
                {project.description || 'No description provided.'}
              </p>
              {project.created_at && (
                <p className="project-details__created">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              type="button"
              className="button"
              onClick={() => setTaskForm(null)}
            >
              + New task
            </button>
          </header>

          {taskForm !== undefined && (
            <div className="task-form-panel">
              <TaskForm
                key={taskForm?.id ?? 'new'}
                projectId={project.id}
                task={taskForm ?? undefined}
                user={user}
                onSaved={handleTaskSaved}
                onError={(message) => showToast(message, 'error')}
                onCancel={() => setTaskForm(undefined)}
              />
            </div>
          )}

          <div className="project-details__section-heading">
            <div>
              <p className="eyebrow">Project work</p>
              <h2>Tasks</h2>
            </div>
            <span>
              {visibleTasks.length} of {tasks.length} tasks
            </span>
          </div>

          <section className="task-summary" aria-label="Project task progress">
            <div className="task-summary__metrics">
              <article>
                <span>Total tasks</span>
                <strong>{taskSummary.total}</strong>
              </article>
              <article>
                <span>Completed</span>
                <strong>{taskSummary.completed}</strong>
              </article>
              <article>
                <span>Remaining</span>
                <strong>{taskSummary.remaining}</strong>
              </article>
              <article>
                <span>Completion</span>
                <strong>{taskSummary.completion}%</strong>
              </article>
            </div>
            <div
              className="task-summary__progress"
              role="progressbar"
              aria-label="Project completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={taskSummary.completion}
            >
              <span style={{ width: `${taskSummary.completion}%` }} />
            </div>
            <div className="task-summary__statuses" aria-label="Task counts by status">
              <span>To do: {taskSummary.byStatus.todo}</span>
              <span>In progress: {taskSummary.byStatus.in_progress}</span>
              <span>Done: {taskSummary.byStatus.done}</span>
            </div>
          </section>

          <div className="task-filters" aria-label="Filter project tasks">
            <label>
              Search tasks
              <input
                type="search"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                placeholder="Search title or description"
              />
            </label>
            <label>
              Status
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as TaskFilters['status'],
                  }))
                }
              >
                <option value="all">All statuses</option>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              Priority
              <select
                value={filters.priority}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    priority: event.target.value as TaskFilters['priority'],
                  }))
                }
              >
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Assignee
              <select
                value={filters.assignee}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    assignee: event.target.value as TaskFilters['assignee'],
                  }))
                }
              >
                <option value="all">All assignees</option>
                <option value="mine">My tasks</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </label>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setFilters(initialTaskFilters)}
              disabled={!hasActiveFilters}
            >
              Reset filters
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">＋</div>
              <h2>No tasks yet</h2>
              <p>Add a task to start organizing this project’s work.</p>
              <button
                type="button"
                className="button"
                onClick={() => setTaskForm(null)}
              >
                Create the first task
              </button>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <h2>No matching tasks</h2>
              <p>Try changing or clearing the filters.</p>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setFilters(initialTaskFilters)}
                disabled={!hasActiveFilters}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="task-list">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(selectedTask) => setTaskForm(selectedTask)}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleTaskStatusChange}
                  isUpdatingStatus={updatingTaskIds.has(task.id)}
                  currentUserId={user?.id}
                  currentUserName={user?.name}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProjectDetailsPage;
