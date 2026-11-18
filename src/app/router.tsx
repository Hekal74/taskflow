/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';

function ProjectDetailsPage() {
  const { projectId } = useParams();

  return <h1>Project {projectId}</h1>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <h1>Login</h1>,
  },
  {
    path: '/register',
    element: <h1>Register</h1>,
  },
  {
    path: '/forgot-password',
    element: <h1>Forgot Password</h1>,
  },
  {
    path: '/dashboard',
    element: <h1>Dashboard</h1>,
  },
  {
    path: '/projects',
    element: <h1>Projects</h1>,
  },
  {
    path: '/projects/:projectId',
    element: <ProjectDetailsPage />,
  },
  {
    path: '*',
    element: <h1>Not Found</h1>,
  },
]);
