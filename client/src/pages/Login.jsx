import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { AlertCircle, Loader2, Eye, EyeOff, Lock, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="5" height="5" rx="1"/>
                <rect x="9" y="2" width="5" height="5" rx="1"/>
                <rect x="2" y="9" width="5" height="5" rx="1"/>
                <rect x="9" y="9" width="5" height="5" rx="1"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">TaskFlow</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Log in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Email Address</Label>
              <Input
                id="email" name="email" type="email" required
                value={formData.email} onChange={handleChange}
                placeholder="name@company.com"
                className="text-sm rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-3.5 py-2.5 h-auto bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-700">Password</Label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••••••"
                  className="text-sm rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-3.5 py-2.5 h-auto pr-10 bg-white text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 h-auto rounded-lg shadow-sm mt-2 transition-all"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</> : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
            Create workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
