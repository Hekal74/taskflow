/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import AppShell from './AppShell';
import { ACCENT_COLORS, ThemeProvider } from '../theme/ThemeProvider';

function renderShell(initialEntry = '/dashboard') {
  const rendered = render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="*"
            element={
              <AppShell user={{ name: 'Test User' }} onLogout={() => {}}>
                <RoutesContent />
              </AppShell>
            }
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

  return { unmount: rendered.unmount };
}

function RoutesContent() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <h1>{location.pathname}</h1>
      <button type="button" onClick={() => navigate(-1)}>
        Back in history
      </button>
      <button type="button" onClick={() => navigate(1)}>
        Forward in history
      </button>
    </>
  );
}

describe('AppShell', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({
        matches: false,
        media: '(max-width: 900px)',
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });
  });

  it('navigates between Dashboard and Projects and highlights the active link', async () => {
    renderShell('/dashboard');
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
    const dashboardLink = within(navigation).getByRole('link', {
      name: /Dashboard/,
    });
    const projectsLink = within(navigation).getByRole('link', {
      name: /Projects/,
    });

    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    expect(projectsLink).not.toHaveAttribute('aria-current', 'page');

    fireEvent.click(projectsLink);
    expect(await screen.findByRole('heading', { name: '/projects' })).toBeVisible();
    expect(projectsLink).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('link', { name: 'TaskFlow dashboard' }));
    expect(await screen.findByRole('heading', { name: '/dashboard' })).toBeVisible();
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    fireEvent.click(projectsLink);
    await screen.findByRole('heading', { name: '/projects' });
    fireEvent.click(screen.getByRole('button', { name: 'Back in history' }));
    expect(await screen.findByRole('heading', { name: '/dashboard' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Forward in history' }));
    expect(await screen.findByRole('heading', { name: '/projects' })).toBeVisible();
  });

  it('toggles theme and selects a persisted accent from the popover', () => {
    const view = renderShell();

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    fireEvent.click(screen.getByRole('button', { name: 'Choose accent color' }));
    let palette = screen.getByRole('group', { name: 'Accent colors' });
    expect(
      within(palette).getAllByRole('button').map((button) =>
        button.getAttribute('aria-label'),
      ),
    ).toEqual(ACCENT_COLORS.map((color) => color.label));

    for (const theme of ['dark', 'light']) {
      if (theme === 'light') {
        fireEvent.click(
          screen.getByRole('button', { name: 'Switch to light mode' }),
        );
        expect(document.documentElement).toHaveAttribute('data-theme', 'light');
      }

      for (const color of ACCENT_COLORS) {
        fireEvent.click(
          within(palette).getByRole('button', { name: color.label }),
        );
        expect(document.documentElement).toHaveAttribute('data-accent', color.id);
        expect(localStorage.getItem('taskflow_accent')).toBe(color.id);
        fireEvent.click(
          screen.getByRole('button', { name: 'Choose accent color' }),
        );
        palette = screen.getByRole('group', { name: 'Accent colors' });
        expect(
          within(palette)
            .getByRole('button', { name: color.label })
            .getAttribute('aria-pressed'),
        ).toBe('true');
      }
    }

    fireEvent.click(screen.getByRole('button', { name: 'Choose accent color' }));
    expect(
      screen.getByRole('button', { name: 'Choose accent color' }),
    ).toHaveAttribute('aria-expanded', 'false');

    view.unmount();
    renderShell();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement).toHaveAttribute('data-accent', 'amber');
    expect(localStorage.getItem('taskflow_theme')).toBe('light');
    expect(localStorage.getItem('taskflow_accent')).toBe('amber');
  });

  it('keeps the Projects item active on a project details route', () => {
    renderShell('/projects/project-1');
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });

    expect(
      within(navigation).getByRole('link', { name: /Projects/ }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByText('Project workspace', { selector: '.app-header__title' }),
    ).toBeVisible();
  });

  it('uses a toggleable navigation drawer on compact screens', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({
        matches: true,
        media: '(max-width: 900px)',
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });

    renderShell('/projects');

    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(
      screen.getByRole('button', { name: 'Close navigation' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Close navigation' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Close sidebar' }));
    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the desktop sidebar and restores it from the header', () => {
    renderShell('/dashboard');
    const shell = document.querySelector('.app-shell');

    fireEvent.click(screen.getByRole('button', { name: 'Close sidebar' }));
    expect(shell).toHaveClass('app-shell--sidebar-closed');
    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(shell).not.toHaveClass('app-shell--sidebar-closed');
    expect(
      screen.getByRole('button', { name: 'Close navigation' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});
