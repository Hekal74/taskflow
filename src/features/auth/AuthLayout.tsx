import type { ReactNode } from 'react';
import './auth.scss';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-brand">TaskFlow</p>
        <h1>{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </section>
    </main>
  );
}

export default AuthLayout;
