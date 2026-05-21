import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import API from '../api/axios';
import {
  User, Mail, Lock, Shield, Calendar, CheckCircle2,
  AlertCircle, Loader2, Eye, EyeOff, Save, KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function SectionCard({ icon, title, description, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{description}</p>
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
    <div className={`flex items-center gap-3 p-3.5 rounded-xl text-xs font-bold animate-fade-in ${
      isError
        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
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

  // ── Profile form state ──
  const [name,          setName]          = useState(user?.name  || '');
  const [email,         setEmail]         = useState(user?.email || '');
  const [profileMsg,    setProfileMsg]    = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password form state ──
  const [currentPwd,    setCurrentPwd]    = useState('');
  const [newPwd,        setNewPwd]        = useState('');
  const [confirmPwd,    setConfirmPwd]    = useState('');
  const [showCurrent,   setShowCurrent]   = useState(false);
  const [showNew,       setShowNew]       = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [pwdMsg,        setPwdMsg]        = useState({ type: '', text: '' });
  const [savingPwd,     setSavingPwd]     = useState(false);

  // Password strength
  const strength = (() => {
    if (!newPwd) return 0;
    let s = 0;
    if (newPwd.length >= 6)             s++;
    if (newPwd.length >= 10)            s++;
    if (/[A-Z]/.test(newPwd))          s++;
    if (/[0-9]/.test(newPwd))          s++;
    if (/[^A-Za-z0-9]/.test(newPwd))   s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'][strength];
  const strengthText  = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400', 'text-emerald-500'][strength];

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    if (!name.trim()) return setProfileMsg({ type: 'error', text: 'Name cannot be empty.' });

    setSavingProfile(true);
    try {
      const { data } = await API.patch('/users/profile', { name: name.trim(), email: email.trim() });
      // Push changes into AuthContext so Sidebar/Navbar update instantly
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
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
          Manage your account information and security.
        </p>
      </div>

      {/* ── Avatar / Account overview card ── */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 border border-emerald-900/30 rounded-2xl p-6 flex items-center gap-5 shadow-xl">
        <Avatar className="h-16 w-16 ring-4 ring-emerald-500/30 shadow-xl">
          <AvatarFallback className="bg-gradient-to-tr from-emerald-400 to-teal-600 text-slate-950 font-black text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-white truncate">{user?.name}</p>
          <p className="text-sm text-emerald-300/80 font-medium truncate">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              <Shield className="w-3 h-3 mr-1" />
              {user?.role || 'member'}
            </Badge>
            {user?.createdAt && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Calendar className="w-3 h-3" /> Member since {memberSince}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal Information ── */}
      <SectionCard
        icon={<User className="w-4 h-4 text-emerald-400" />}
        title="Personal Information"
        description="Update your name and email address."
      >
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Toast type={profileMsg.type} message={profileMsg.text} />

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setProfileMsg({ type: '', text: '' }); }}
                placeholder="Your full name"
                className="pl-9 text-sm bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setProfileMsg({ type: '', text: '' }); }}
                placeholder="your@email.com"
                className="pl-9 text-sm bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 gap-2"
            >
              {savingProfile
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* ── Change Password ── */}
      <SectionCard
        icon={<KeyRound className="w-4 h-4 text-emerald-400" />}
        title="Change Password"
        description="Keep your account secure with a strong password."
      >
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <Toast type={pwdMsg.type} message={pwdMsg.text} />

          {/* Current password */}
          <div className="space-y-2">
            <Label htmlFor="currentPwd" className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              Current Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="currentPwd"
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => { setCurrentPwd(e.target.value); setPwdMsg({ type: '', text: '' }); }}
                placeholder="Enter current password"
                className="pl-9 pr-10 text-sm bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="newPwd" className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="newPwd"
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => { setNewPwd(e.target.value); setPwdMsg({ type: '', text: '' }); }}
                placeholder="Min. 6 characters"
                className="pl-9 pr-10 text-sm bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPwd && (
              <div className="space-y-1 pt-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-200 dark:bg-slate-800'}`} />
                  ))}
                </div>
                <p className={`text-[10px] font-bold ${strengthText}`}>{strengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPwd" className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="confirmPwd"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => { setConfirmPwd(e.target.value); setPwdMsg({ type: '', text: '' }); }}
                placeholder="Re-enter new password"
                className={`pl-9 pr-10 text-sm bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors ${
                  confirmPwd && (confirmPwd === newPwd ? 'border-emerald-400' : 'border-red-400')
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPwd && confirmPwd !== newPwd && (
              <p className="text-[10px] text-red-400 font-bold">Passwords don't match</p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={savingPwd || (confirmPwd && confirmPwd !== newPwd)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 gap-2"
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
