/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';
import ProjectForm from './ProjectForm';

describe('ProjectForm', () => {
  it('shows required-name validation inline and does not submit', () => {
    const onSaved = jest.fn();
    const onError = jest.fn();
    const onCancel = jest.fn();

    render(
      <ProjectForm
        onSaved={onSaved}
        onError={onError}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create project' }));

    expect(screen.getByText('Project name is required')).toBeVisible();
    expect(screen.getByRole('textbox', { name: /Project name/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('clears the name validation when the user enters a project name', () => {
    render(
      <ProjectForm
        onSaved={jest.fn()}
        onError={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create project' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Project name/ }), {
      target: { value: 'Planning' },
    });

    expect(screen.queryByText('Project name is required')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Project name/ })).toHaveAttribute(
      'aria-invalid',
      'false',
    );
  });
});
