import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Full-screen loader while we verify the token with the backend
function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-semibold tracking-wide">
          Loading workspace…
        </p>
      </div>
    </div>
  );
}

export default function PublicRoute({ children }) {
  const { token, user, loading } = useAuth();

  // Still checking — do not flash the login form yet
  if (loading) return <AuthLoader />;

  // Already authenticated → send to dashboard
  if (token && user) return <Navigate to="/dashboard" replace />;

  // Not authenticated → show the public page (login/signup)
  return children;
}
