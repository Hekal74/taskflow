import type { fetchTasks } from '../../api/api';

type Task = Awaited<ReturnType<typeof fetchTasks>>[number];

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
  isUpdatingStatus: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

const statusLabels: Record<Task['status'], string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdatingStatus,
  currentUserId,
  currentUserName,
}: TaskCardProps) {
  return (
    <article className={`task-card task-card--${task.status}`}>
      <div className="task-card__heading">
        <div>
          <h3>{task.title}</h3>
          <p>{task.description || 'No description provided.'}</p>
        </div>
        <select
          className={`task-badge task-badge--status task-badge--${task.status} task-status-select`}
          value={task.status}
          disabled={isUpdatingStatus}
          aria-label={`Change status for ${task.title}`}
          onChange={(event) =>
            onStatusChange(task, event.target.value as Task['status'])
          }
        >
          {Object.entries(statusLabels).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="task-card__details">
        <span className={`task-badge task-badge--priority task-badge--${task.priority}`}>
          {task.priority} priority
        </span>
        {task.assignee && (
          <span>
            {task.assignee === currentUserId && currentUserName
              ? `Assigned to ${currentUserName}`
              : 'Assigned to another user'}
          </span>
        )}
        {task.dueDate && (
          <span>
            Due{' '}
            {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="task-card__actions">
        <button
          type="button"
          className="button button--secondary button--small"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="button button--danger button--small"
          onClick={() => onDelete(task)}
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
