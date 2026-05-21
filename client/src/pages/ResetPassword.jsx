import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layers, AlertCircle, Loader2, Eye, EyeOff, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import API from '../api/axios';

export default function ResetPassword() {
  const { token }  = useParams();
  const navigate   = useNavigate();

  const [password,     setPassword]     = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6)  s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
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
          {success ? (
            /* ── Success state ── */
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Password updated!</h2>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Your password has been reset. Redirecting you to sign in…
                </p>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div className="bg-emerald-500 h-1 rounded-full animate-[progress_3s_linear_forwards]" style={{ width: '100%', animation: 'shrink 3s linear forwards' }} />
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Go to sign in now
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-black tracking-tight text-white">Create new password</h2>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Choose a strong password for your TaskFlow workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* New password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-extrabold text-slate-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Min. 6 characters"
                      className="bg-slate-950/80 border-slate-800 text-white text-xs p-3.5 pr-10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-800'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] font-bold ${strengthColor.replace('bg-', 'text-')}`}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-xs font-extrabold text-slate-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                      placeholder="Re-enter your password"
                      className={`bg-slate-950/80 border-slate-800 text-white text-xs p-3.5 pr-10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 shadow-inner transition-colors ${
                        confirm && (confirm === password ? 'border-emerald-500/50' : 'border-red-500/50')
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-[10px] text-red-400 font-bold">Passwords don't match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all duration-200 gap-2"
                  disabled={loading || (confirm && confirm !== password)}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Updating password…</>
                  ) : (
                    <><Lock className="w-3.5 h-3.5" /> Reset Password</>
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
