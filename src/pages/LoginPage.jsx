import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';

export default function LoginPage() {
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    try {
      const { error } = await signIn(email);
      if (!error) {
        setIsSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <Layout>
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-slate-600 mb-4">
              We sent a magic link to:<br />
              <span className="font-medium text-slate-900">{email}</span>
            </p>
            <p className="text-sm text-slate-500">
              Click the link in your email to sign in. If you don't see it, check your spam folder.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 ${
                isLoading ? 'cursor-wait' : ''
              }`}
            >
              {isLoading ? 'Sending Link...' : 'Send Magic Link'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            No account needed! We'll create one for you.
          </p>
        </div>
      </div>
    </Layout>
  );
}