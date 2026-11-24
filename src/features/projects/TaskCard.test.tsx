/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';
import TaskCard from './TaskCard';

describe('TaskCard', () => {
  it('renders task details and exposes its actions', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const task = {
      id: 'task-1',
      projectId: 'project-1',
      title: 'Review release notes',
      description: 'Check the final changes',
      status: 'in_progress' as const,
      priority: 'high' as const,
      assignee: 'user-1',
      dueDate: '2026-12-01',
      createdAt: '2026-11-24T10:00:00.000Z',
      updatedAt: '2026-11-24T10:00:00.000Z',
    };

    render(
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        currentUserId="user-1"
        currentUserName="Alex"
      />,
    );

    expect(screen.getByRole('heading', { name: task.title })).toBeVisible();
    expect(screen.getByText(task.description)).toBeVisible();
    expect(screen.getByText('In progress')).toBeVisible();
    expect(screen.getByText('high priority')).toBeVisible();
    expect(screen.getByText('Assigned to Alex')).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Edit Review release notes' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete Review release notes' }),
    );

    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onDelete).toHaveBeenCalledWith(task);
  });
});
