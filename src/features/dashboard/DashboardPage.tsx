import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, fetchProjects } from '../../api/api';
import { useAuth } from '../auth/AuthContext';
import ProjectCard from '../projects/ProjectCard';
import './dashboard.scss';

type Project = Awaited<ReturnType<typeof fetchProjects>>[number];

function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetchProjects()
      .then((result) => {
        if (active) setProjects(result);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Unable to load your dashboard. Please try again.',
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const totalProjects = projects.length;
  const totalTasks = projects.reduce(
    (total, project) => total + (project.task_count ?? 0),
    0,
  );
  const completedTasks = projects.reduce(
    (total, project) => total + (project.done_count ?? 0),
    0,
  );
  const completion =
    totalTasks > 0
      ? Math.round((Math.min(completedTasks, totalTasks) / totalTasks) * 100)
      : 0;
  const retryLoading = () => {
    setIsLoading(true);
    setError('');
    setReloadKey((key) => key + 1);
  };

  return (
    <section className="feature-page dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>Good to see you, {user?.name ?? 'there'}</h1>
          <p className="page-subtitle">
            Here’s an overview of your projects and progress.
          </p>
        </div>
        <Link className="button" to="/projects">
          View projects
        </Link>
      </header>

      {isLoading ? (
        <div className="page-state" role="status">Loading your dashboard…</div>
      ) : error ? (
        <div className="page-state page-state--error" role="alert">
          <p>{error}</p>
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
          <div className="dashboard-stats">
            <article className="stat-card">
              <span className="stat-card__label">Total projects</span>
              <strong>{totalProjects}</strong>
              <span className="stat-card__note">Across your workspace</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Total tasks</span>
              <strong>{totalTasks}</strong>
              <span className="stat-card__note">In all projects</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Completed tasks</span>
              <strong>{completedTasks}</strong>
              <span className="stat-card__note">Marked as done</span>
            </article>
            <article className="stat-card stat-card--highlight">
              <span className="stat-card__label">Overall completion</span>
              <strong>{completion}%</strong>
              <span className="stat-card__note">Across all tasks</span>
            </article>
          </div>

          <div className="dashboard-section-heading">
            <div>
              <p className="eyebrow">At a glance</p>
              <h2>Your projects</h2>
            </div>
            {projects.length > 0 && (
              <Link className="text-link" to="/projects">
                Manage projects <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">＋</div>
              <h2>No projects yet</h2>
              <p>Create your first project to start organizing your work.</p>
              <Link className="button" to="/projects">Create a project</Link>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DashboardPage;
