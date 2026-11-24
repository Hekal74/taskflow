import { useState, type FormEvent } from 'react';
import {
  ApiError,
  createTask,
  updateTask,
  type fetchTasks,
} from '../../api/api';
import type { useAuth } from '../auth/AuthContext';
import { getCrudErrorMessage } from './crudErrorMessage';

type Task = Awaited<ReturnType<typeof fetchTasks>>[number];
type CurrentUser = NonNullable<ReturnType<typeof useAuth>['user']>;

interface TaskFormProps {
  projectId: string;
  task?: Task;
  user: CurrentUser | null;
  onSaved: (task: Task) => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

function TaskForm({
  projectId,
  task,
  user,
  onSaved,
  onError,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<Task['status']>(
    task?.status ?? 'todo',
  );
  const [priority, setPriority] = useState<Task['priority']>(
    task?.priority ?? 'medium',
  );
  const [assignee, setAssignee] = useState(task?.assignee ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      const { [field]: _fieldError, ...remaining } = current;
      return remaining;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!title.trim()) {
      setFieldErrors({ title: 'Task title is required' });
      return;
    }

    setFieldErrors({});
    setError('');
    setIsSubmitting(true);

    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee: assignee || null,
        dueDate: dueDate || null,
      };
      const savedTask = task
        ? await updateTask(task.id, data)
        : await createTask(projectId, data);
      onSaved(savedTask);
    } catch (submitError) {
      const fields =
        submitError instanceof ApiError ? submitError.fields : undefined;
      setFieldErrors(fields ?? {});

      if (Object.keys(fields ?? {}).length > 0) {
        setError('Please correct the highlighted fields.');
      } else {
        setError('');
        onError(
          getCrudErrorMessage(
            submitError,
            'Failed to save task. Please try again.',
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <h3>{task ? 'Edit task' : 'Create a task'}</h3>
      {error && (
        <p className="message message--error" role="alert">
          {error}
        </p>
      )}
      <label>
        Title
        <input
          autoFocus
          required
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            clearFieldError('title');
          }}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'task-title-error' : undefined}
        />
        {fieldErrors.title && (
          <span className="field-error" id="task-title-error">
            {fieldErrors.title}
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
            clearFieldError('description');
          }}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={
            fieldErrors.description ? 'task-description-error' : undefined
          }
        />
        {fieldErrors.description && (
          <span className="field-error" id="task-description-error">
            {fieldErrors.description}
          </span>
        )}
      </label>
      <div className="task-form__row">
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as Task['status']);
              clearFieldError('status');
            }}
            aria-invalid={Boolean(fieldErrors.status)}
            aria-describedby={fieldErrors.status ? 'task-status-error' : undefined}
          >
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
          {fieldErrors.status && (
            <span className="field-error" id="task-status-error">
              {fieldErrors.status}
            </span>
          )}
        </label>
        <label>
          Priority
          <select
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value as Task['priority']);
              clearFieldError('priority');
            }}
            aria-invalid={Boolean(fieldErrors.priority)}
            aria-describedby={
              fieldErrors.priority ? 'task-priority-error' : undefined
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {fieldErrors.priority && (
            <span className="field-error" id="task-priority-error">
              {fieldErrors.priority}
            </span>
          )}
        </label>
      </div>
      <div className="task-form__row">
        <label>
          Assignee
          <select
            value={assignee}
            onChange={(event) => {
              setAssignee(event.target.value);
              clearFieldError('assignee_id');
            }}
            aria-invalid={Boolean(fieldErrors.assignee_id)}
            aria-describedby={
              fieldErrors.assignee_id ? 'task-assignee-error' : undefined
            }
          >
            <option value="">Unassigned</option>
            {user && <option value={user.id}>Assign to me ({user.name})</option>}
            {task?.assignee && task.assignee !== user?.id && (
              <option value={task.assignee}>Keep existing assignee</option>
            )}
          </select>
          {fieldErrors.assignee_id && (
            <span className="field-error" id="task-assignee-error">
              {fieldErrors.assignee_id}
            </span>
          )}
        </label>
        <label>
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={(event) => {
              setDueDate(event.target.value);
              clearFieldError('due_date');
            }}
            aria-invalid={Boolean(fieldErrors.due_date)}
            aria-describedby={
              fieldErrors.due_date ? 'task-due-date-error' : undefined
            }
          />
          {fieldErrors.due_date && (
            <span className="field-error" id="task-due-date-error">
              {fieldErrors.due_date}
            </span>
          )}
        </label>
      </div>
      <div className="task-form__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
