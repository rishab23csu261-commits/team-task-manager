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

function SectionCard({ title, description, children }) {
  return (
    <div className="card-light overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

function Toast({ type, message }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium animate-fade-in ${
      isError ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-green-50 border border-green-200 text-green-700'
    }`}>
      {isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
      {message}
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
    if (newPwd.length >= 6)           s++;
    if (newPwd.length >= 10)          s++;
    if (/[A-Z]/.test(newPwd))        s++;
    if (/[0-9]/.test(newPwd))        s++;
    if (/[^A-Za-z0-9]/.test(newPwd)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500', 'bg-green-600'][strength];
  const strengthText  = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600', 'text-green-700'][strength];

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
    if (newPwd !== confirmPwd) return setPwdMsg({ type: 'error', text: 'Passwords do not match.' });
    if (newPwd.length < 6)     return setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    setSavingPwd(true);
    try {
      const { data } = await API.patch('/users/password', { currentPassword: currentPwd, newPassword: newPwd });
      setPwdMsg({ type: 'success', text: data.message });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setSavingPwd(false);
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  const inputClass = "text-sm rounded-lg border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information and security.</p>
      </div>

      {/* Avatar card */}
      <div className="card-light p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              <Shield className="w-3 h-3" /> {user?.role || 'member'}
            </span>
            {user?.createdAt && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" /> Member since {memberSince}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <SectionCard title="Personal Information" description="Update your name and email address.">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Toast type={profileMsg.type} message={profileMsg.text} />
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-gray-600">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="name" value={name} placeholder="Your full name"
                onChange={e => { setName(e.target.value); setProfileMsg({ type:'', text:'' }); }}
                className={`pl-9 ${inputClass}`} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-600">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="email" type="email" value={email} placeholder="your@email.com"
                onChange={e => { setEmail(e.target.value); setProfileMsg({ type:'', text:'' }); }}
                className={`pl-9 ${inputClass}`} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={savingProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 rounded-lg border-0 gap-1.5">
              {savingProfile ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* Change Password */}
      <SectionCard title="Change Password" description="Keep your account secure with a strong password.">
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <Toast type={pwdMsg.type} message={pwdMsg.text} />

          {/* Current */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPwd" className="text-xs font-semibold text-gray-600">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="currentPwd" type={showCurrent ? 'text' : 'password'} value={currentPwd}
                placeholder="Enter current password"
                onChange={e => { setCurrentPwd(e.target.value); setPwdMsg({ type:'', text:'' }); }}
                className={`pl-9 pr-9 ${inputClass}`} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New */}
          <div className="space-y-1.5">
            <Label htmlFor="newPwd" className="text-xs font-semibold text-gray-600">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="newPwd" type={showNew ? 'text' : 'password'} value={newPwd}
                placeholder="Min. 6 characters"
                onChange={e => { setNewPwd(e.target.value); setPwdMsg({ type:'', text:'' }); }}
                className={`pl-9 pr-9 ${inputClass}`} />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPwd && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className={`text-[11px] font-semibold ${strengthText}`}>{strengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPwd" className="text-xs font-semibold text-gray-600">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="confirmPwd" type={showConfirm ? 'text' : 'password'} value={confirmPwd}
                placeholder="Re-enter new password"
                onChange={e => { setConfirmPwd(e.target.value); setPwdMsg({ type:'', text:'' }); }}
                className={`pl-9 pr-9 ${inputClass} ${confirmPwd ? (confirmPwd === newPwd ? 'border-green-400' : 'border-red-400') : ''}`} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPwd && confirmPwd !== newPwd && (
              <p className="text-[11px] text-red-500 font-medium">Passwords don't match</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={savingPwd || (confirmPwd && confirmPwd !== newPwd)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 rounded-lg border-0 gap-1.5">
              {savingPwd ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating…</> : <><KeyRound className="w-3.5 h-3.5" /> Update Password</>}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
