import { useEffect, useState } from 'react';
import { ApiError, deleteProject, fetchProjects } from '../../api/api';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import './projects.scss';

type Project = Awaited<ReturnType<typeof fetchProjects>>[number];

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formProject, setFormProject] = useState<Project | null | undefined>(
    undefined,
  );
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let active = true;

    fetchProjects()
      .then((result) => {
        if (active) setProjects(result);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load projects. Please try again.',
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleSaved = (project: Project) => {
    setProjects((current) => {
      const exists = current.some((item) => item.id === project.id);
      return exists
        ? current.map((item) =>
            item.id === project.id
              ? {
                  ...item,
                  ...project,
                  task_count: project.task_count ?? item.task_count,
                  done_count: project.done_count ?? item.done_count,
                }
              : item,
          )
        : [project, ...current];
    });
    setFormProject(undefined);
  };

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This will also delete its tasks.`,
    );
    if (!confirmed) return;

    setDeleteError('');

    try {
      await deleteProject(project.id);
      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      );
    } catch (error) {
      setDeleteError(
        error instanceof ApiError
          ? error.message
          : 'Unable to delete the project. Please try again.',
      );
    }
  };

  const retryLoading = () => {
    setIsLoading(true);
    setLoadError('');
    setReloadKey((key) => key + 1);
  };

  return (
    <section className="feature-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Projects</h1>
          <p className="page-subtitle">Organize work and track progress.</p>
        </div>
        {!isLoading && !loadError && (
          <button
            type="button"
            className="button"
            onClick={() => setFormProject(null)}
          >
            + New project
          </button>
        )}
      </header>

      {deleteError && (
        <p className="message message--error" role="alert">{deleteError}</p>
      )}

      {formProject !== undefined && (
        <div className="form-panel">
          <ProjectForm
            key={formProject?.id ?? 'new'}
            project={formProject ?? undefined}
            onSaved={handleSaved}
            onCancel={() => setFormProject(undefined)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="page-state" role="status">Loading projects…</div>
      ) : loadError ? (
        <div className="page-state page-state--error" role="alert">
          <p>{loadError}</p>
          <button type="button" className="button button--secondary" onClick={retryLoading}>
            Try again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon" aria-hidden="true">＋</div>
          <h2>Your projects start here</h2>
          <p>Create a project to bring related work together.</p>
          <button
            type="button"
            className="button"
            onClick={() => setFormProject(null)}
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(selectedProject) => setFormProject(selectedProject)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProjectsPage;
