import type { fetchTasks } from '../../api/api';

type Task = Awaited<ReturnType<typeof fetchTasks>>[number];

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
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
        <span
          className={`task-badge task-badge--status task-badge--${task.status}`}
        >
          {statusLabels[task.status]}
        </span>
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
