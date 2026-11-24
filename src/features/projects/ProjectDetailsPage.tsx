import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ApiError,
  deleteTask,
  fetchProjectById,
  fetchTasks,
} from '../../api/api';
import { useAuth } from '../auth/AuthContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import Toast from './Toast';
import { getCrudErrorMessage } from './crudErrorMessage';
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
  const { toast, showToast } = useToast();

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
            <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
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
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(selectedTask) => setTaskForm(selectedTask)}
                  onDelete={handleDeleteTask}
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
