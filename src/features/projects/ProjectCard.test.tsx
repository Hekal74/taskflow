/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from './ProjectCard';

describe('ProjectCard', () => {
  it('shows project progress and links to its details', () => {
    render(
      <MemoryRouter>
        <ProjectCard
          project={{
            id: 'project-1',
            name: 'Website refresh',
            description: 'Update the product website',
            task_count: 4,
            done_count: 1,
          }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Website refresh' }),
    ).toHaveAttribute('href', '/projects/project-1');
    expect(screen.getByText('4 tasks')).toBeVisible();
    expect(screen.getByText('25% complete')).toBeVisible();
    expect(screen.getByText('1 of 4 completed')).toBeVisible();
    expect(
      screen.getByRole('progressbar', { name: 'Website refresh completion' }),
    ).toHaveAttribute('aria-valuenow', '25');
  });

  it('reports zero progress when the project has no tasks', () => {
    render(
      <MemoryRouter>
        <ProjectCard
          project={{
            id: 'empty-project',
            name: 'New project',
            description: '',
            task_count: 0,
            done_count: 0,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('0% complete')).toBeVisible();
    expect(
      screen.getByRole('progressbar', { name: 'New project completion' }),
    ).toHaveAttribute('aria-valuenow', '0');
  });
});
