/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  ApiError,
  fetchCurrentUser,
  isAuthenticated,
  loginUser,
  logout as clearStoredSession,
  registerUser,
} from '../../api/api';

type User = Awaited<ReturnType<typeof fetchCurrentUser>>;
type LoginCredentials = Parameters<typeof loginUser>[0];
type RegistrationData = Parameters<typeof registerUser>[0];

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean;
  initializationError: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
  retryInitialization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  const initialize = useCallback(async () => {
    setIsInitializing(true);
    setInitializationError(null);

    if (!isAuthenticated()) {
      setUser(null);
      setIsInitializing(false);
      return;
    }

    try {
      setUser(await fetchCurrentUser());
    } catch (error) {
      setUser(null);

      if (!(error instanceof ApiError && error.status === 401)) {
        setInitializationError(
          error instanceof Error
            ? error.message
            : 'Unable to validate your session',
        );
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await loginUser(credentials);
    setUser(response.user);
  };

  const register = async (data: RegistrationData): Promise<void> => {
    const response = await registerUser(data);
    setUser(response.user);
  };

  const logout = (): void => {
    clearStoredSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitializing,
        initializationError,
        login,
        register,
        logout,
        retryInitialization: initialize,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
