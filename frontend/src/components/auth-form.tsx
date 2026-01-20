import { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (email: string, password: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

export function AuthForm({ mode, onSubmit, error, isLoading }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password) {
      onSubmit(email.trim(), password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {error && <p className='alert-error'>{error}</p>}

      <div>
        <label htmlFor='email' className='block text-sm font-medium text-slate-700 mb-1'>
          Email
        </label>
        <input
          id='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='you@example.com'
          className='input w-full'
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor='password' className='block text-sm font-medium text-slate-700 mb-1'>
          Password
        </label>
        <input
          id='password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Enter your password'
          className='input w-full'
          required
          minLength={6}
          disabled={isLoading}
        />
      </div>

      <button type='submit' className='btn-primary w-full' disabled={isLoading}>
        {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    </form>
  );
}
