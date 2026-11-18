import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';

function ApplicationRouter() {
  const { isInitializing, initializationError, retryInitialization } = useAuth();

  if (isInitializing) {
    return (
      <main className="auth-status" role="status">
        Checking your session…
      </main>
    );
  }

  if (initializationError) {
    return (
      <main className="auth-status" role="alert">
        <p>We couldn’t verify your session: {initializationError}</p>
        <button type="button" onClick={() => void retryInitialization()}>
          Try again
        </button>
      </main>
    );
  }

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <ApplicationRouter />
    </AuthProvider>
  );
}

export default App;
