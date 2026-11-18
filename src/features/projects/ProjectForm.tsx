import { useState, type FormEvent } from 'react';
import { ApiError, createProject, updateProject } from '../../api/api';
import type { fetchProjects } from '../../api/api';

type Project = Awaited<ReturnType<typeof fetchProjects>>[number];
type ProjectData = Parameters<typeof createProject>[0];

interface ProjectFormProps {
  project?: Project;
  onSaved: (project: Project) => void;
  onCancel: () => void;
}

function ProjectForm({ project, onSaved, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const fields: Record<string, string> = {};
    if (!name.trim()) fields.name = 'Project name is required';
    setFieldErrors(fields);
    setError('');

    if (Object.keys(fields).length > 0) return;

    const data: ProjectData = {
      name: name.trim(),
      description: description.trim(),
    };

    setIsSubmitting(true);

    try {
      const savedProject = project
        ? await updateProject(project.id, data)
        : await createProject(data);
      onSaved(savedProject);
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setFieldErrors(submitError.fields ?? {});
        setError(
          Object.keys(submitError.fields ?? {}).length > 0
            ? 'Please correct the highlighted fields.'
            : submitError.message,
        );
      } else {
        setError('Unable to save the project. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate>
      <h2>{project ? 'Edit project' : 'Create a project'}</h2>
      {error && <p className="message message--error" role="alert">{error}</p>}
      <label>
        Project name
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setFieldErrors((current) => {
              const { name: _nameError, ...remaining } = current;
              return remaining;
            });
          }}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'project-name-error' : undefined}
        />
        {fieldErrors.name && (
          <span className="field-error" id="project-name-error">
            {fieldErrors.name}
          </span>
        )}
      </label>
      <label>
        Description
        <textarea
          rows={3}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setFieldErrors((current) => {
              const { description: _descriptionError, ...remaining } = current;
              return remaining;
            });
          }}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={
            fieldErrors.description ? 'project-description-error' : undefined
          }
        />
        {fieldErrors.description && (
          <span className="field-error" id="project-description-error">
            {fieldErrors.description}
          </span>
        )}
      </label>
      <div className="project-form__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : project ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;
