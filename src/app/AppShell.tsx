import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ACCENT_COLORS, useTheme } from '../theme/ThemeProvider';
import './app-shell.scss';

interface AppShellProps {
  user: { name: string };
  onLogout: () => void;
  children: ReactNode;
}

const isCompactViewport = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(max-width: 900px)').matches;

function AppShell({ user, onLogout, children }: AppShellProps) {
  const { pathname } = useLocation();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => !isCompactViewport(),
  );
  const [isCompactLayout, setIsCompactLayout] = useState(isCompactViewport);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const breakpoint = window.matchMedia('(max-width: 900px)');
    const updateLayout = () => {
      setIsCompactLayout(breakpoint.matches);
      setIsSidebarOpen(!breakpoint.matches);
    };

    breakpoint.addEventListener('change', updateLayout);
    return () => breakpoint.removeEventListener('change', updateLayout);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen || !isCompactLayout) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCompactLayout, isSidebarOpen]);

  useEffect(() => {
    if (!isPaletteOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!paletteRef.current?.contains(event.target as Node)) {
        setIsPaletteOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPaletteOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaletteOpen]);

  const pageContext = pathname.startsWith('/projects/')
    ? 'Project workspace'
    : pathname === '/projects'
      ? 'Workspace'
      : 'Your workspace';

  return (
    <div
      className={`app-shell${!isSidebarOpen && !isCompactLayout ? ' app-shell--sidebar-closed' : ''}${isSidebarOpen && isCompactLayout ? ' app-shell--mobile-nav-open' : ''}`}
    >
      {isSidebarOpen && isCompactLayout && (
        <button
          type="button"
          className="app-sidebar__backdrop"
          aria-label="Dismiss navigation overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className="app-sidebar" id="app-sidebar">
        <div className="app-sidebar__top">
          <div className="app-sidebar__brand-row">
            <Link
              className="app-brand"
              to="/dashboard"
              aria-label="TaskFlow dashboard"
              onClick={() => {
                if (isCompactLayout) setIsSidebarOpen(false);
              }}
            >
              <span className="app-brand__mark" aria-hidden="true">T</span>
              <span>TaskFlow</span>
            </Link>
            <button
              type="button"
              className="app-sidebar__close"
              aria-label="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <nav className="app-nav" aria-label="Main navigation">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `app-nav__link${isActive ? ' is-active' : ''}`
              }
              onClick={() => {
                if (isCompactLayout) setIsSidebarOpen(false);
              }}
            >
              <span aria-hidden="true">▦</span>
              <span className="app-nav__label">Dashboard</span>
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `app-nav__link${isActive ? ' is-active' : ''}`
              }
              onClick={() => {
                if (isCompactLayout) setIsSidebarOpen(false);
              }}
            >
              <span aria-hidden="true">▤</span>
              <span className="app-nav__label">Projects</span>
            </NavLink>
          </nav>
        </div>

        <div className="app-sidebar__user">
          <div className="app-sidebar__identity">
            <span className="app-sidebar__avatar" aria-hidden="true">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <span className="app-sidebar__user-name" title={user.name}>
              {user.name}
            </span>
          </div>
          <button
            type="button"
            className="app-sidebar__logout"
            onClick={onLogout}
          >
            <span aria-hidden="true">↪</span>
            <span className="app-sidebar__logout-label">Log out</span>
          </button>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="app-header">
          <div className="app-header__leading">
            <button
              type="button"
              className="app-sidebar-toggle"
              aria-controls="app-sidebar"
              aria-expanded={isSidebarOpen}
              aria-label={`${isSidebarOpen ? 'Close' : 'Open'} navigation`}
              title={`${isSidebarOpen ? 'Close' : 'Open'} navigation`}
              onClick={() => setIsSidebarOpen((open) => !open)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <div className="app-header__context">
              <span className="app-header__eyebrow">TaskFlow</span>
              <span className="app-header__title">{pageContext}</span>
            </div>
          </div>
          <div className="app-header__controls">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
              <span className="theme-toggle__label">
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </span>
            </button>
            <div className="accent-picker" ref={paletteRef}>
              <button
                type="button"
                className="accent-picker__trigger"
                style={{
                  '--swatch-color': ACCENT_COLORS.find(
                    (color) => color.id === accentColor,
                  )?.swatch,
                } as CSSProperties}
                aria-label="Choose accent color"
                aria-expanded={isPaletteOpen}
                aria-controls="accent-palette"
                onClick={() => setIsPaletteOpen((open) => !open)}
              />
              {isPaletteOpen && (
                <div
                  className="accent-picker__popover"
                  id="accent-palette"
                  role="group"
                  aria-label="Accent colors"
                >
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className="accent-picker__swatch"
                      style={
                        { '--swatch-color': color.swatch } as CSSProperties
                      }
                      aria-label={color.label}
                      aria-pressed={accentColor === color.id}
                      title={color.label}
                      onClick={() => {
                        setAccentColor(color.id);
                        setIsPaletteOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="app-shell__main">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
