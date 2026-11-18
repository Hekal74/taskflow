import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/api';
import AuthLayout from './AuthLayout';
import { useAuth } from './AuthContext';

function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields: Record<string, string> = {};

    if (!name.trim()) fields.name = 'Name is required';
    if (!email.trim()) {
      fields.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      fields.email = 'Enter a valid email address';
    }
    if (!password.trim()) fields.password = 'Password is required';

    setFieldErrors(fields);
    setError('');

    if (Object.keys(fields).length > 0) return;

    setIsSubmitting(true);

    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setFieldErrors(submitError.fields ?? {});
        setError(
          submitError.fields
            ? 'Please correct the highlighted fields.'
            : submitError.message,
        );
      } else {
        setError('Unable to create your account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Get started with your TaskFlow workspace."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <label>
          Name
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
          />
          {fieldErrors.name && (
            <span className="auth-field-error" id="register-name-error">
              {fieldErrors.name}
            </span>
          )}
        </label>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? 'register-email-error' : undefined
            }
          />
          {fieldErrors.email && (
            <span className="auth-field-error" id="register-email-error">
              {fieldErrors.email}
            </span>
          )}
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'register-password-error' : undefined
            }
          />
          {fieldErrors.password && (
            <span className="auth-field-error" id="register-password-error">
              {fieldErrors.password}
            </span>
          )}
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <nav className="auth-links" aria-label="Authentication">
        <Link to="/login">Already have an account? Sign in</Link>
      </nav>
    </AuthLayout>
  );
}

export default RegisterPage;
