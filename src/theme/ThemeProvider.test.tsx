/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ThemeProvider, useTheme } from './ThemeProvider';

function ThemeProbe() {
  const { theme, accentColor, toggleTheme, setAccentColor } = useTheme();

  return (
    <>
      <p>Theme: {theme}</p>
      <p>Accent: {accentColor}</p>
      <button type="button" onClick={toggleTheme}>
        Toggle theme
      </button>
      <button type="button" onClick={() => setAccentColor('teal')}>
        Select teal
      </button>
    </>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn().mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }),
    });
  });

  it('uses the system preference when no theme is saved', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText('Theme: dark')).toBeVisible();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('taskflow_theme')).toBeNull();
  });

  it('persists an explicit theme selection', () => {
    localStorage.setItem('taskflow_theme', 'light');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));

    expect(screen.getByText('Theme: dark')).toBeVisible();
    expect(localStorage.getItem('taskflow_theme')).toBe('dark');
  });

  it('applies and persists a selected accent color', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select teal' }));

    expect(screen.getByText('Accent: teal')).toBeVisible();
    expect(document.documentElement).toHaveAttribute('data-accent', 'teal');
    expect(localStorage.getItem('taskflow_accent')).toBe('teal');
  });
});
