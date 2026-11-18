import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/api';
import AuthLayout from './AuthLayout';
import { useAuth } from './AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields: Record<string, string> = {};

    if (!email.trim()) fields.email = 'Email is required';
    if (!password) fields.password = 'Password is required';

    setFieldErrors(fields);
    setError('');

    if (Object.keys(fields).length > 0) return;

    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setFieldErrors(submitError.fields ?? {});
        setError(
          submitError.fields
            ? 'Please correct the highlighted fields.'
            : submitError.message,
        );
      } else {
        setError('Unable to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" description="Sign in to your TaskFlow account.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
          />
          {fieldErrors.email && (
            <span className="auth-field-error" id="login-email-error">
              {fieldErrors.email}
            </span>
          )}
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'login-password-error' : undefined
            }
          />
          {fieldErrors.password && (
            <span className="auth-field-error" id="login-password-error">
              {fieldErrors.password}
            </span>
          )}
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <nav className="auth-links" aria-label="Authentication">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Create an account</Link>
      </nav>
    </AuthLayout>
  );
}

export default LoginPage;
