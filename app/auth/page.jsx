'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, LogIn, UserPlus } from 'lucide-react';
import styles from './auth.module.css';

// Schemas for forms
const signInSchema = z.object({
  email: z.string().trim().email({ message: 'Zadejte platnou e-mailovou adresu' }),
  password: z.string().min(1, { message: 'Zadejte heslo' }),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, { message: 'Jméno musí mít alespoň 2 znaky' }).max(50, { message: 'Jméno může mít maximálně 50 znaků' }),
  email: z.string().trim().email({ message: 'Zadejte platnou e-mailovou adresu' }),
  password: z.string().min(6, { message: 'Heslo musí mít alespoň 6 znaků' }),
});

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get('redirect') : null;

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form hooks
  const loginForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleLoginSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      setSuccess('Přihlášení bylo úspěšné. Přesměrovávám...');
      
      // Let authentication state propagation complete, then redirect
      setTimeout(() => {
        router.push(redirectPath || '/movies');
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Chyba při přihlašování:', err);
      setError(err.message || 'Chyba při přihlašování. Zkontrolujte e-mail a heslo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.name,
          },
        },
      });

      if (authError) throw authError;

      // Note: In Supabase, if email confirmation is enabled, they need to check email.
      // If disabled, they are logged in directly or need to sign in.
      // We will inform them based on whether a session was created.
      if (authData.session) {
        setSuccess('Registrace proběhla úspěšně! Nyní jste přihlášeni.');
        setTimeout(() => {
          router.push(redirectPath || '/movies');
          router.refresh();
        }, 1500);
      } else {
        setSuccess('Registrace byla úspěšná! Zkontrolujte svůj e-mail pro potvrzení účtu.');
        registerForm.reset();
      }
    } catch (err) {
      console.error('Chyba při registraci:', err);
      setError(err.message || 'Chyba při registraci. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccess(null);
            }}
            id="tab-login"
          >
            Přihlášení
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'register' ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab('register');
              setError(null);
              setSuccess(null);
            }}
            id="tab-register"
          >
            Registrace
          </button>
        </div>

        <div className={styles.formContent}>
          <div className={styles.titleSection}>
            <h1>{activeTab === 'login' ? 'Vítejte zpět' : 'Vytvořit účet'}</h1>
            <p>
              {activeTab === 'login'
                ? 'Přihlaste se ke svému účtu CineVault'
                : 'Zaregistrujte se a začněte si ukládat své oblíbené filmy'}
            </p>
          </div>

          {error && (
            <div className={`${styles.alert} ${styles.alertError}`} id="auth-error-alert">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={`${styles.alert} ${styles.alertSuccess}`} id="auth-success-alert">
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} noValidate>
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">
                  E-mailová adresa *
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  placeholder="jmeno@example.com"
                  autocomplete="username"
                  required
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <span className="form-error">
                    <AlertCircle size={14} />
                    {loginForm.formState.errors.email.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="form-label">
                  Heslo *
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <span className="form-error">
                    <AlertCircle size={14} />
                    {loginForm.formState.errors.password.message}
                  </span>
                )}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading} id="btn-login-submit">
                <LogIn size={18} />
                <span>{loading ? 'Přihlašování...' : 'Přihlásit se'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} noValidate>
              <div className="form-group">
                <label htmlFor="register-name" className="form-label">
                  Celé jméno *
                </label>
                <input
                  id="register-name"
                  type="text"
                  className="form-control"
                  placeholder="Např. Jan Novák"
                  autocomplete="name"
                  required
                  {...registerForm.register('name')}
                />
                {registerForm.formState.errors.name && (
                  <span className="form-error">
                    <AlertCircle size={14} />
                    {registerForm.formState.errors.name.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="register-email" className="form-label">
                  E-mailová adresa *
                </label>
                <input
                  id="register-email"
                  type="email"
                  className="form-control"
                  placeholder="jmeno@example.com"
                  autocomplete="email"
                  required
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <span className="form-error">
                    <AlertCircle size={14} />
                    {registerForm.formState.errors.email.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="register-password" className="form-label">
                  Heslo (min. 6 znaků) *
                </label>
                <input
                  id="register-password"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  required
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password && (
                  <span className="form-error">
                    <AlertCircle size={14} />
                    {registerForm.formState.errors.password.message}
                  </span>
                )}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading} id="btn-register-submit">
                <UserPlus size={18} />
                <span>{loading ? 'Registrování...' : 'Registrovat se'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--glass-border)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'pulseGlow 1.5s infinite linear'
        }} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
