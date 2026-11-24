/* eslint-disable react-refresh/only-export-components */
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import ProjectDetailsPage from '../features/projects/ProjectDetailsPage';
import ProjectsPage from '../features/projects/ProjectsPage';
import AppShell from './AppShell';

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function PublicAuthRoutes() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function ProtectedRoutes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell user={user} onLogout={handleLogout}>
      <Outlet />
    </AppShell>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <PublicAuthRoutes />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/projects',
        element: <ProjectsPage />,
      },
      {
        path: '/projects/:projectId',
        element: <ProjectDetailsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <h1>Not Found</h1>,
  },
]);
