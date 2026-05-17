import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, Zap, UserCheck, UserCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signup(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-900 overflow-hidden font-sans">
      {/* Left Marketing Panel (Hidden on smaller screens) */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white relative overflow-hidden border-r border-emerald-900/30">
        {/* Abstract Glowing Orb Backdrops */}
        <div className="absolute top-1/4 -left-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <Layers className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">TaskFlow<span className="text-emerald-400">.</span></span>
        </div>

        {/* Value Proposition */}
        <div className="space-y-6 max-w-lg relative z-10 my-auto">
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
            Enterprise Grade SaaS
          </Badge>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
            Deploy your enterprise workspace in <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">seconds.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Join thousands of modern product teams managing complex roadmaps with absolute clarity and precision.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md p-4 rounded-2xl">
              <Zap className="w-5 h-5 text-emerald-400 mb-2 stroke-[2]" />
              <div className="text-lg font-black text-white">Instant Setup</div>
              <div className="text-[11px] text-slate-400 font-medium">Zero configuration required</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md p-4 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-teal-400 mb-2 stroke-[2]" />
              <div className="text-lg font-black text-white">Role RBAC</div>
              <div className="text-[11px] text-slate-400 font-medium">Strict permissions & controls</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold relative z-10">
          <span>&copy; {new Date().getFullYear()} TaskFlow Inc.</span>
          <span>Privacy & Terms</span>
        </div>
      </div>

      {/* Right Signup Form Container */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-900/95 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl relative my-auto">
          
          {/* Mobile Header Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layers className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">TaskFlow<span className="text-emerald-400">.</span></span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-black tracking-tight text-white">Create Workspace</h2>
            <p className="text-xs text-slate-400 font-medium">Initialize your team account and start collaborating instantly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-extrabold text-slate-300">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className="bg-slate-950/80 border-slate-800 text-white text-xs p-3.5 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-extrabold text-slate-300">Work Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@company.com"
                className="bg-slate-950/80 border-slate-800 text-white text-xs p-3.5 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 shadow-inner"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-xs font-extrabold text-slate-300">Secure Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="bg-slate-950/80 border-slate-800 text-white text-xs p-3.5 pr-10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-extrabold text-slate-300">Account Role</Label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'member' })}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    formData.role === 'member'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <UserCircle className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-extrabold">Member</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Contributor access</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    formData.role === 'admin'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Shield className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-extrabold">Admin</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Workspace manager</span>
                </button>
              </div>
            </div>

            <Button
              id="signup-submit-btn"
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all duration-200 mt-4 gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Provisioning Account...
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" /> Complete Workspace Setup
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 font-semibold">
              Already configured your workspace?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
