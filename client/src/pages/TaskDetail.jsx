import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, CheckCircle2, Clock, Circle, AlertCircle, Calendar,
  FolderKanban, UserCheck, Tag, Edit3, Save, X, Trash2,
  ChevronRight, Loader2, CheckCheck, ArrowUpRight, Flag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow, format } from 'date-fns';

/* ─── helpers ────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  todo:        { label: 'To Do',       icon: Circle,       bg: 'bg-slate-100 dark:bg-slate-800',        text: 'text-slate-600 dark:text-slate-300',  border: 'border-slate-200 dark:border-slate-700',  ring: 'ring-slate-400'  },
  'in-progress':{ label: 'In Progress', icon: Clock,        bg: 'bg-amber-50 dark:bg-amber-950/30',     text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800',  ring: 'ring-amber-400'  },
  completed:   { label: 'Completed',   icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/30',  text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', ring: 'ring-emerald-400' },
};

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    bg: 'bg-slate-100 dark:bg-slate-800',    text: 'text-slate-600 dark:text-slate-300',  border: 'border-slate-200 dark:border-slate-700'  },
  medium: { label: 'Medium', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800'  },
  high:   { label: 'High',   bg: 'bg-red-50 dark:bg-red-950/30',     text: 'text-red-700 dark:text-red-400',      border: 'border-red-200 dark:border-red-800'      },
};

const STATUS_ORDER = ['todo', 'in-progress', 'completed'];

function StatusPill({ status, onChange, canEdit }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  const Icon = cfg.icon;
  const [saving, setSaving] = useState(false);

  const handleClick = async () => {
    if (!canEdit || saving) return;
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
    setSaving(true);
    await onChange(next);
    setSaving(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canEdit || saving}
      title={canEdit ? 'Click to advance status' : 'Status'}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 select-none
        ${cfg.bg} ${cfg.text} ${cfg.border}
        ${canEdit ? `hover:ring-2 ${cfg.ring} hover:ring-offset-1 cursor-pointer active:scale-95` : 'cursor-default'}
        ${saving ? 'opacity-60' : ''}
      `}
    >
      {saving
        ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        : <Icon className="w-4 h-4 shrink-0" />
      }
      {cfg.label}
      {canEdit && !saving && (
        <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
      )}
    </button>
  );
}

/* ─── inline editable field ──────────────────────────────────── */
function InlineField({ label, value, onSave, multiline = false, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setDraft(value || ''); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = async () => {
    if (draft.trim() === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => { setDraft(value || ''); setEditing(false); };

  const sharedClass = "w-full text-sm bg-white dark:bg-slate-800 border border-emerald-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-slate-100 resize-none";

  if (editing) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</label>
        {multiline
          ? <textarea ref={ref} value={draft} onChange={e => setDraft(e.target.value)} rows={4} className={sharedClass} onKeyDown={e => { if (e.key === 'Escape') cancel(); }} />
          : <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)} className={sharedClass} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }} />
        }
        <div className="flex gap-2">
          <Button size="sm" onClick={commit} disabled={saving} className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
          </Button>
          <Button size="sm" variant="ghost" onClick={cancel} className="h-7 text-xs gap-1 rounded-lg px-3 text-slate-500">
            <X className="w-3 h-3" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => canEdit && setEditing(true)}
      className={`group space-y-1 ${canEdit ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</label>
        {canEdit && (
          <Edit3 className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <p className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed rounded-lg transition-colors duration-150
        ${canEdit ? 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/60 px-2 py-1 -mx-2 -my-1' : ''}
        ${!value ? 'text-slate-400 dark:text-slate-500 italic' : ''}
      `}>
        {value || 'Click to add…'}
      </p>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────── */
export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const saveTimer = useRef(null);

  const isAdmin = user?.role === 'admin';
  const isAssigned = task?.assignedTo?._id === user?._id;
  const canEditAll = isAdmin;
  const canEditStatus = isAdmin || isAssigned;

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/tasks/${id}`);
      setTask(data);
      if (isAdmin) {
        const proj = data.projectId?._id;
        if (proj) {
          const { data: users } = await API.get(`/projects/${proj}/available-members`);
          // Merge available + already assigned
          const members = data.projectId?.members || [];
          const all = [...members, ...users].filter((v, i, a) => a.findIndex(u => u._id === v._id) === i);
          setAvailableUsers(all);
        }
      }
    } catch (err) {
      setError('Task not found or you do not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const patch = async (fields) => {
    setSaveStatus('saving');
    clearTimeout(saveTimer.current);
    try {
      const { data } = await API.put(`/tasks/${id}`, fields);
      setTask(data);
      setSaveStatus('saved');
      saveTimer.current = setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus('error');
      saveTimer.current = setTimeout(() => setSaveStatus(null), 3000);
      throw new Error('Save failed');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/tasks/${id}`);
      navigate('/tasks', { replace: true });
    } catch {
      setSaveStatus('error');
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ── error ── */
  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Task not found</h2>
        <p className="text-sm text-slate-400 max-w-xs">{error || 'This task may have been deleted or you lack permission.'}</p>
        <Button asChild variant="outline" className="rounded-xl mt-2">
          <Link to="/tasks"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Tasks</Link>
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="space-y-5 animate-fade-in pb-10 max-w-5xl">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Link to="/tasks" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Tasks
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {task.projectId && (
            <>
              <Link to={`/projects/${task.projectId._id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1">
                {task.projectId.title}
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-slate-600 dark:text-slate-300 font-bold truncate max-w-[200px]">{task.title}</span>
        </nav>

        {/* Save indicator */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
              <CheckCheck className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-xs text-red-500 font-semibold animate-fade-in">
              <X className="w-3.5 h-3.5" /> Save failed
            </span>
          )}
          {isAdmin && !deleteConfirm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 rounded-lg h-8 px-3"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          )}
          {deleteConfirm && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Delete task?</span>
              <Button size="sm" onClick={handleDelete} className="h-6 text-[11px] bg-red-500 hover:bg-red-600 text-white rounded-lg px-2.5">Yes</Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(false)} className="h-6 text-[11px] rounded-lg px-2">No</Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Title + Description + Status stepper */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title card */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
            {/* Status accent bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${
              task.status === 'completed' ? 'from-emerald-400 to-teal-500' :
              task.status === 'in-progress' ? 'from-amber-400 to-orange-400' :
              'from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600'
            }`} />

            <CardContent className="p-6 space-y-5">
              {/* Title */}
              <InlineField
                label="Task Title"
                value={task.title}
                onSave={(v) => patch({ title: v })}
                canEdit={canEditAll}
              />

              {/* Status stepper */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</p>
                <div className="flex flex-wrap items-center gap-2">
                  {STATUS_ORDER.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    const isActive = task.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!canEditStatus}
                        onClick={() => canEditStatus && task.status !== s && patch({ status: s })}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200
                          ${isActive
                            ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm ring-1 ${cfg.ring}`
                            : 'bg-transparent text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }
                          ${canEditStatus && !isActive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
                          ${!canEditStatus ? 'cursor-default' : ''}
                        `}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current ml-0.5 animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
                {canEditStatus && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Click any status to update instantly</p>
                )}
              </div>

              {/* Description */}
              <InlineField
                label="Description"
                value={task.description}
                onSave={(v) => patch({ description: v })}
                canEdit={canEditAll}
                multiline
              />
            </CardContent>
          </Card>

          {/* Admin-only: Priority + Due Date + Assignee inline edit */}
          {canEditAll && (
            <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-500" /> Edit Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">

                {/* Priority */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Flag className="w-3 h-3" /> Priority
                  </Label>
                  <Select value={task.priority} onValueChange={(v) => patch({ priority: v })}>
                    <SelectTrigger className={`h-9 text-xs font-bold rounded-lg border ${priorityCfg.bg} ${priorityCfg.text} ${priorityCfg.border}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Due Date
                  </Label>
                  <Input
                    type="date"
                    value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
                    onChange={(e) => patch({ dueDate: e.target.value || null })}
                    className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Assigned To */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3" /> Assignee
                  </Label>
                  <Select
                    value={task.assignedTo?._id || 'unassigned'}
                    onValueChange={(v) => patch({ assignedTo: v === 'unassigned' ? null : v })}
                  >
                    <SelectTrigger className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {availableUsers.map(u => (
                        <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                      ))}
                      {task.assignedTo && !availableUsers.find(u => u._id === task.assignedTo._id) && (
                        <SelectItem value={task.assignedTo._id}>{task.assignedTo.name}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Meta sidebar */}
        <div className="space-y-4">

          {/* Task meta */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
            <CardContent className="p-5 space-y-5">

              {/* Project */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <FolderKanban className="w-3 h-3" /> Project
                </p>
                {task.projectId ? (
                  <Link
                    to={`/projects/${task.projectId._id}`}
                    className="flex items-center gap-2 group text-sm"
                  >
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-xs shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
                      {task.projectId.title?.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {task.projectId.title}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-emerald-500 transition-colors" />
                  </Link>
                ) : (
                  <span className="text-sm text-slate-400">No project</span>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Assigned To */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3" /> Assigned To
                </p>
                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                      {task.assignedTo.name?.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{task.assignedTo.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{task.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Priority */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Flag className="w-3 h-3" /> Priority
                </p>
                <Badge className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${priorityCfg.bg} ${priorityCfg.text} ${priorityCfg.border} hover:opacity-80`}>
                  {priorityCfg.label}
                </Badge>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Due Date */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Due Date
                </p>
                {task.dueDate ? (
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isOverdue && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    {isOverdue && <Badge className="text-[10px] font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 rounded-full px-2 py-0">Overdue</Badge>}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500 italic">No due date</span>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Dates */}
              <div className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
                <div className="flex justify-between">
                  <span className="font-semibold">Created</span>
                  <span>{task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Updated</span>
                  <span>{task.updatedAt ? formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true }) : '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick status card for non-admins assigned to this task */}
          {!canEditAll && canEditStatus && (
            <Card className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/10 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Update Your Progress</p>
                <StatusPill status={task.status} onChange={(s) => patch({ status: s })} canEdit />
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/60">Click the pill above to advance to the next stage, or choose from the status bar on the left.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
