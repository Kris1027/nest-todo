import { useAuth } from './context/auth-context';
import { AuthPage } from './pages/auth-page';
import { TodoPage } from './pages/todo-page';

function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-100 flex items-center justify-center'>
        <p className='text-slate-500'>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <TodoPage /> : <AuthPage />;
}

export default App;
