import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';
import Layout from './Layout';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-slate-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
}