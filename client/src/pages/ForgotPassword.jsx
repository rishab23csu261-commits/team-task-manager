import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, AlertCircle, Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import API from '../api/axios';

export default function ForgotPassword() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            TaskFlow<span className="text-emerald-400">.</span>
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {submitted ? (
            /* ── Success state ── */
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Check your inbox</h2>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  If <span className="text-emerald-400 font-bold">{email}</span> is registered,
                  we've sent a password reset link. Check your spam folder if you don't see it.
                </p>
                <p className="text-slate-500 text-xs font-medium">The link expires in 1 hour.</p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors mt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-black tracking-tight text-white">Forgot password?</h2>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Enter your account email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-extrabold text-slate-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="name@company.com"
                      className="bg-slate-950/80 border-slate-800 text-white text-xs pl-9 p-3.5 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 shadow-inner"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all duration-200 gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending reset link…</>
                  ) : (
                    <><Mail className="w-3.5 h-3.5" /> Send Reset Link</>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
