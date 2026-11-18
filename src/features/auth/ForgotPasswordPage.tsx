import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiError,
  requestPasswordReset,
} from '../../api/api';
import AuthLayout from './AuthLayout';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    setFieldError('');
    setError('');
    setSuccess('');

    if (!trimmedEmail) {
      setFieldError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldError('Enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({ email: trimmedEmail });
      setSuccess(response.message);
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setFieldError(submitError.fields?.email ?? '');
        setError(
          submitError.fields
            ? 'Please correct the highlighted field.'
            : submitError.message,
        );
      } else {
        setError('Unable to request a password reset. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we’ll let you know if a reset request can be completed."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {success && <p className="auth-success" role="status">{success}</p>}
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? 'forgot-email-error' : undefined}
          />
          {fieldError && (
            <span className="auth-field-error" id="forgot-email-error">
              {fieldError}
            </span>
          )}
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Request password reset'}
        </button>
      </form>
      <nav className="auth-links" aria-label="Authentication">
        <Link to="/login">Back to sign in</Link>
      </nav>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
