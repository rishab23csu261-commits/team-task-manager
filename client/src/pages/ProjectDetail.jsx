import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import {
  ArrowLeft, Plus, UserPlus, FolderKanban, CheckCircle2,
  Clock, AlertCircle, Calendar, Users, Layers, MoreHorizontal, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const priorityConfig = {
  high:   { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'    },
  medium: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low:    { color: 'bg-slate-800 text-slate-400 border-white/[0.06]'    },
};

function TaskCard({ task, user, onStatusChange }) {
  const pc = priorityConfig[task.priority] || priorityConfig.low;
  const canEdit = user?.role === 'admin' || task.assignedTo?._id === user?._id;

  return (
    <div className="group relative flex flex-col bg-slate-950/60 rounded-2xl border border-white/[0.05] shadow-lg hover:shadow-xl hover:border-teal-500/20 hover:bg-slate-900/50 transition-all duration-200 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/[0.04] group-hover:bg-teal-500/60 transition-colors duration-200 rounded-l-2xl" />
      <div className="p-4 pl-5 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-extrabold text-white text-sm leading-snug group-hover:text-teal-400 transition-colors line-clamp-2">
            {task.title}
          </h4>
          <Badge variant="outline" className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${pc.color}`}>
            {task.priority}
          </Badge>
        </div>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
          {task.description || 'No detailed instructions provided.'}
        </p>

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
            <Calendar className="w-3 h-3 text-slate-600" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]">
          {task.assignedTo ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignedTo.name}`}>
              <Avatar className="w-5 h-5">
                <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 text-[9px] font-extrabold">
                  {task.assignedTo.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-slate-400 font-bold truncate max-w-[80px]">
                {task.assignedTo.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-600 italic font-medium">Unassigned</span>
          )}

          {canEdit && (
            <Select value={task.status} onValueChange={(value) => onStatusChange(task._id, value)}>
              <SelectTrigger className="h-7 w-[110px] text-[10px] font-bold rounded-xl border border-white/[0.06] bg-slate-900 text-slate-300 focus:ring-0 shadow-inner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border border-white/[0.08] text-xs rounded-2xl shadow-2xl text-slate-200">
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'todo',
    priority: 'medium', assignedTo: '', dueDate: '',
  });

  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?projectId=${id}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      if (user?.role === 'admin') {
        const usersRes = await API.get(`/projects/${id}/available-members`);
        setAvailableUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...taskForm, projectId: id };
      if (!payload.assignedTo || payload.assignedTo === 'unassigned') delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await API.post('/tasks', payload);
      setIsTaskDialogOpen(false);
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const updatedMembers = [...project.members.map(m => m._id), selectedUser];
      await API.put(`/projects/${id}`, { members: updatedMembers });
      setIsMemberDialogOpen(false);
      setSelectedUser('');
      fetchData();
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-2">
        <Skeleton className="h-44 w-full rounded-3xl bg-slate-800/40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-3xl bg-slate-800/40" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-slate-950/40 rounded-3xl border border-white/[0.05] p-8 shadow-xl">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-3 stroke-[1.5]" />
        <h3 className="text-lg font-bold text-white">Project Not Found</h3>
        <p className="text-slate-400 text-xs mt-1 mb-6 max-w-sm">
          The project you are looking for does not exist or you do not have permission to view it.
        </p>
        <Button asChild className="bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-2xl text-xs font-black gap-2 border-0">
          <Link to="/projects"><ArrowLeft className="w-4 h-4" /> Back to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 font-sans">

      {/* ── 1. Project Hero Header ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-md shadow-2xl glow-teal">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8 border-b border-white/[0.04]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1 relative z-10">
              <div className="flex items-center gap-2.5">
                <Button variant="ghost" size="icon" asChild
                  className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-colors border border-white/[0.04]">
                  <Link to="/projects"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5" /> Workspace Project
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{project.title}</h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {project.description || 'No overview description provided for this project.'}
              </p>
            </div>

            {user?.role === 'admin' && (
              <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setIsMemberDialogOpen(true)}
                  className="rounded-2xl border-white/[0.08] bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-bold gap-2 h-10"
                >
                  <UserPlus className="w-4 h-4 text-teal-400" /> Add Member
                </Button>
                <Button
                  onClick={() => setIsTaskDialogOpen(true)}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black text-xs px-5 rounded-2xl shadow-xl shadow-teal-500/10 gap-2 h-10 border-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Create Task
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Team members */}
          <div className="md:col-span-2 space-y-2.5">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-400" /> Team Collaborators ({project.members?.length || 0})
            </span>
            <div className="flex flex-wrap gap-2">
              {project.members?.map(member => (
                <div key={member._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-white/[0.05] shadow-inner hover:border-teal-500/20 transition-colors">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black text-[9px]">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-300 font-bold">{member.name}</span>
                </div>
              ))}
              {project.members?.length === 0 && (
                <span className="text-xs text-slate-600 italic">No collaborators assigned yet.</span>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="md:col-span-2 bg-slate-950 border border-white/[0.03] p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" /> Overall Completion
              </span>
              <span className="font-extrabold text-teal-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 border border-white/[0.03] h-2.5 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold pt-0.5">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> {completedTasks} done</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-violet-400 animate-pulse" /> {inProgressTasks} in progress</span>
              <span className="text-slate-600">{todoTasks} to do</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Kanban Board ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-teal-400" /> Kanban Board
        </h2>
        <span className="text-xs text-slate-500 font-bold">{tasks.length} total tasks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TO DO */}
        <div className="flex flex-col gap-3 bg-slate-950/30 p-4 rounded-3xl border border-white/[0.04] min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] px-1">
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" /> To Do
            </h3>
            <Badge className="bg-slate-800 text-slate-400 border border-white/[0.04] text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {todoTasks}
            </Badge>
          </div>
          <div className="space-y-3 flex-1">
            {tasks.filter(t => t.status === 'todo').map(task => (
              <TaskCard key={task._id} task={task} user={user} onStatusChange={handleTaskStatusUpdate} />
            ))}
            {todoTasks === 0 && (
              <div className="rounded-2xl p-8 border-2 border-white/[0.04] border-dashed text-center flex flex-col items-center justify-center min-h-[140px]">
                <MoreHorizontal className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-600">No pending tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="flex flex-col gap-3 bg-violet-950/10 p-4 rounded-3xl border border-violet-500/10 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-violet-500/10 px-1">
            <h3 className="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" /> In Progress
            </h3>
            <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {inProgressTasks}
            </Badge>
          </div>
          <div className="space-y-3 flex-1">
            {tasks.filter(t => t.status === 'in-progress').map(task => (
              <TaskCard key={task._id} task={task} user={user} onStatusChange={handleTaskStatusUpdate} />
            ))}
            {inProgressTasks === 0 && (
              <div className="rounded-2xl p-8 border-2 border-violet-500/10 border-dashed text-center flex flex-col items-center justify-center min-h-[140px]">
                <Clock className="w-8 h-8 text-violet-700 mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold text-violet-600/60">No active tasks in progress</p>
              </div>
            )}
          </div>
        </div>

        {/* COMPLETED */}
        <div className="flex flex-col gap-3 bg-teal-950/10 p-4 rounded-3xl border border-teal-500/10 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-teal-500/10 px-1">
            <h3 className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" /> Completed
            </h3>
            <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {completedTasks}
            </Badge>
          </div>
          <div className="space-y-3 flex-1">
            {tasks.filter(t => t.status === 'completed').map(task => (
              <div key={task._id} className="opacity-70 hover:opacity-100 transition-opacity">
                <TaskCard task={task} user={user} onStatusChange={handleTaskStatusUpdate} />
              </div>
            ))}
            {completedTasks === 0 && (
              <div className="rounded-2xl p-8 border-2 border-teal-500/10 border-dashed text-center flex flex-col items-center justify-center min-h-[140px]">
                <CheckCircle2 className="w-8 h-8 text-teal-700 mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold text-teal-600/60">No completed tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Task Dialog ─────────────────────────────────── */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-950 border border-white/[0.08] shadow-2xl rounded-3xl p-6 glass-premium">
          <DialogHeader className="pb-4 border-b border-white/[0.05]">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-400" /> Create New Task
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Add a new task to this project backlog and assign a collaborator.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-extrabold text-slate-300">Task Title</Label>
              <Input required placeholder="e.g. Implement OAuth2 Authentication"
                value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] p-3.5 focus:border-teal-500 text-white placeholder-slate-500 shadow-inner focus:outline-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-extrabold text-slate-300">Description</Label>
              <Textarea rows={3} placeholder="Describe requirements, acceptance criteria..."
                value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] p-3.5 focus:border-teal-500 text-white placeholder-slate-500 shadow-inner resize-none focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-extrabold text-slate-300">Status</Label>
                <Select value={taskForm.status} onValueChange={v => setTaskForm({...taskForm, status: v})}>
                  <SelectTrigger className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] text-slate-200 font-semibold shadow-inner focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-white/[0.08] text-xs rounded-2xl shadow-2xl text-slate-200">
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-extrabold text-slate-300">Priority</Label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm({...taskForm, priority: v})}>
                  <SelectTrigger className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] text-slate-200 font-semibold shadow-inner focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-white/[0.08] text-xs rounded-2xl shadow-2xl text-slate-200">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-extrabold text-slate-300">Assign To</Label>
                <Select value={taskForm.assignedTo || 'unassigned'} onValueChange={v => setTaskForm({...taskForm, assignedTo: v})}>
                  <SelectTrigger className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] text-slate-200 font-semibold shadow-inner focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-white/[0.08] text-xs rounded-2xl shadow-2xl text-slate-200 max-h-56">
                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                    {project.members?.map(m => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-extrabold text-slate-300">Due Date</Label>
                <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                  className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] p-3.5 text-slate-300 shadow-inner focus:border-teal-500 focus:outline-none [color-scheme:dark]" />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-white/[0.05] flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}
                className="rounded-xl text-xs font-semibold bg-transparent border-white/[0.06] text-slate-300 hover:bg-slate-900 hover:text-white">
                Cancel
              </Button>
              <Button type="submit"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black rounded-xl text-xs px-5 shadow-lg shadow-teal-500/10 border-0">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Member Dialog ──────────────────────────────────── */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-950 border border-white/[0.08] shadow-2xl rounded-3xl p-6 glass-premium">
          <DialogHeader className="pb-4 border-b border-white/[0.05]">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-400" /> Add Team Member
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Select a workspace user to grant them collaboration access to this project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-extrabold text-slate-300">Available Collaborators</Label>
              {availableUsers.length > 0 ? (
                <Select required value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] text-slate-200 font-semibold p-3 shadow-inner focus:ring-0">
                    <SelectValue placeholder="-- Select User --" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-white/[0.08] text-xs rounded-2xl shadow-2xl text-slate-200 max-h-56">
                    {availableUsers.map(u => (
                      <SelectItem key={u._id} value={u._id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-900/60 border border-white/[0.04] p-3.5 rounded-xl font-medium">
                  All active workspace users are already assigned to this project.
                </p>
              )}
            </div>
            <DialogFooter className="pt-4 border-t border-white/[0.05] flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsMemberDialogOpen(false)}
                className="rounded-xl text-xs font-semibold bg-transparent border-white/[0.06] text-slate-300 hover:bg-slate-900 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedUser}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black rounded-xl text-xs px-5 shadow-lg shadow-teal-500/10 border-0">
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
