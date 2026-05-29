import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import API from '../api/axios';
import {
  User, Mail, Lock, Shield, Calendar, CheckCircle2,
  AlertCircle, Loader2, Eye, EyeOff, Save, KeyRound, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function SectionCard({ icon, title, description, children }) {
  return (
    <div className="bg-slate-950/40 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-xl">
      <div className="px-6 py-5 border-b border-white/[0.04] flex items-center gap-3 bg-slate-950/20">
        <div className="w-9 h-9 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">{title}</h3>
          <p className="text-xs text-slate-400 font-medium">{description}</p>
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

function Toast({ type, message }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold animate-fade-in ${
      isError
        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        : 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
    }`}>
      {isError
        ? <AlertCircle className="h-4 w-4 shrink-0" />
        : <CheckCircle2 className="h-4 w-4 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [name,          setName]          = useState(user?.name  || '');
  const [email,         setEmail]         = useState(user?.email || '');
  const [profileMsg,    setProfileMsg]    = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdMsg,      setPwdMsg]      = useState({ type: '', text: '' });
  const [savingPwd,   setSavingPwd]   = useState(false);

  const strength = (() => {
    if (!newPwd) return 0;
    let s = 0;
    if (newPwd.length >= 6)            s++;
    if (newPwd.length >= 10)           s++;
    if (/[A-Z]/.test(newPwd))         s++;
    if (/[0-9]/.test(newPwd))         s++;
    if (/[^A-Za-z0-9]/.test(newPwd))  s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', 'bg-rose-500', 'bg-orange-400', 'bg-yellow-400', 'bg-teal-400', 'bg-teal-500'][strength];
  const strengthText  = ['', 'text-rose-400', 'text-orange-400', 'text-yellow-400', 'text-teal-400', 'text-teal-500'][strength];

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    if (!name.trim()) return setProfileMsg({ type: 'error', text: 'Name cannot be empty.' });
    setSavingProfile(true);
    try {
      const { data } = await API.patch('/users/profile', { name: name.trim(), email: email.trim() });
      updateUser({ name: data.name, email: data.email });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    if (newPwd !== confirmPwd) return setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
    if (newPwd.length < 6)     return setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
    setSavingPwd(true);
    try {
      const { data } = await API.patch('/users/password', {
        currentPassword: currentPwd,
        newPassword:     newPwd,
      });
      setPwdMsg({ type: 'success', text: data.message });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setSavingPwd(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  const inputClass = "text-xs rounded-xl bg-slate-900 border border-white/[0.06] text-white placeholder-slate-500 shadow-inner focus:border-teal-500 focus:outline-none focus:ring-0";

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 font-sans animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 shadow-2xl glow-teal">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Account Configuration
          </span>
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <Avatar className="h-16 w-16 ring-2 ring-teal-500/30 shadow-xl shrink-0">
            <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-lg font-black text-white truncate">{user?.name}</p>
            <p className="text-xs text-teal-400/80 font-medium truncate">{user?.email}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                <Shield className="w-3 h-3 mr-1" />
                {user?.role || 'member'}
              </Badge>
              {user?.createdAt && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Calendar className="w-3 h-3" /> Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal Information ─────────────────────────────────── */}
      <SectionCard
        icon={<User className="w-4 h-4 text-teal-400" />}
        title="Personal Information"
        description="Update your name and email address."
      >
        <form onSubmit={handleProfileSave} className="space-y-5">
          <Toast type={profileMsg.type} message={profileMsg.text} />

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-extrabold text-slate-300">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setProfileMsg({ type: '', text: '' }); }}
                placeholder="Your full name"
                className={`pl-10 py-3 ${inputClass}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-extrabold text-slate-300">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setProfileMsg({ type: '', text: '' }); }}
                placeholder="your@email.com"
                className={`pl-10 py-3 ${inputClass}`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl shadow-xl shadow-teal-500/10 gap-2 border-0"
            >
              {savingProfile
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* ── Change Password ──────────────────────────────────────── */}
      <SectionCard
        icon={<KeyRound className="w-4 h-4 text-teal-400" />}
        title="Change Password"
        description="Keep your account secure with a strong password."
      >
        <form onSubmit={handlePasswordSave} className="space-y-5">
          <Toast type={pwdMsg.type} message={pwdMsg.text} />

          {/* Current password */}
          <div className="space-y-2">
            <Label htmlFor="currentPwd" className="text-xs font-extrabold text-slate-300">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="currentPwd"
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => { setCurrentPwd(e.target.value); setPwdMsg({ type: '', text: '' }); }}
                placeholder="Enter current password"
                className={`pl-10 pr-10 py-3 ${inputClass}`}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="newPwd" className="text-xs font-extrabold text-slate-300">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="newPwd"
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => { setNewPwd(e.target.value); setPwdMsg({ type: '', text: '' }); }}
                placeholder="Min. 6 characters"
                className={`pl-10 pr-10 py-3 ${inputClass}`}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPwd && (
              <div className="space-y-1 pt-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-800'}`} />
                  ))}
                </div>
                <p className={`text-[10px] font-bold ${strengthText}`}>{strengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPwd" className="text-xs font-extrabold text-slate-300">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="confirmPwd"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => { setConfirmPwd(e.target.value); setPwdMsg({ type: '', text: '' }); }}
                placeholder="Re-enter new password"
                className={`pl-10 pr-10 py-3 ${inputClass} transition-colors ${
                  confirmPwd && (confirmPwd === newPwd ? 'border-teal-500/50' : 'border-rose-500/50')
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPwd && confirmPwd !== newPwd && (
              <p className="text-[10px] text-rose-400 font-bold">Passwords don't match</p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={savingPwd || (confirmPwd && confirmPwd !== newPwd)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl shadow-xl shadow-teal-500/10 gap-2 border-0"
            >
              {savingPwd
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
                : <><KeyRound className="h-3.5 w-3.5" /> Update Password</>}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
