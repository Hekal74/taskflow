import type { fetchProjects } from '../../api/api';

type Project = Awaited<ReturnType<typeof fetchProjects>>[number];

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const taskCount = project.task_count ?? 0;
  const doneCount = project.done_count ?? 0;
  const progress =
    taskCount > 0
      ? Math.round((Math.min(doneCount, taskCount) / taskCount) * 100)
      : 0;

  return (
    <article className="project-card">
      <div className="project-card__top">
        <div>
          <h2>{project.name}</h2>
          <p className="project-card__description">
            {project.description || 'No description provided.'}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="project-card__actions">
            {onEdit && (
              <button
                type="button"
                className="button button--secondary button--small"
                onClick={() => onEdit(project)}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="button button--danger button--small"
                onClick={() => onDelete(project)}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      <div className="project-card__progress-copy">
        <span>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
        <span>{progress}% complete</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={`${project.name} completion`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="project-card__completed">
        {doneCount} of {taskCount} completed
      </p>
    </article>
  );
}

export default ProjectCard;
