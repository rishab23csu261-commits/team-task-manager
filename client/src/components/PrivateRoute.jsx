import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Full-screen loader while we verify the token with the backend
function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-semibold tracking-wide">
          Verifying workspace credentials…
        </p>
      </div>
    </div>
  );
}

export default function PrivateRoute({ children }) {
  const { token, user, loading } = useAuth();

  // Still checking with backend — show spinner, never render layout
  if (loading) return <AuthLoader />;

  // No valid session → send to login immediately
  if (!token || !user) return <Navigate to="/login" replace />;

  // Valid session → render the protected layout
  return children;
}
