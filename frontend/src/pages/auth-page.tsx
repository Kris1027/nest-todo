import { useState } from 'react';
import { AuthForm } from '../components/auth-form';
import { useAuth } from '../context/auth-context';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  async function handleSubmit(email: string, password: string) {
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-slate-100 py-8 px-4 flex items-center justify-center'>
      <div className='card w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center text-slate-800 mb-6'>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h1>

        <AuthForm
          mode={mode}
          onSubmit={handleSubmit}
          error={error}
          isLoading={isLoading}
        />

        <p className='text-center text-sm text-slate-600 mt-4'>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type='button'
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className='text-blue-600 hover:underline font-medium'
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type='button'
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className='text-blue-600 hover:underline font-medium'
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
