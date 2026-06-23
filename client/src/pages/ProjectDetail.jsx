import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import {
  ArrowLeft, Plus, UserPlus, CheckCircle2,
  Clock, AlertCircle, Calendar, Users, MoreHorizontal
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const PriorityBadge = ({ priority }) => {
  const map = {
    high:   'badge-high',
    medium: 'badge-medium',
    low:    'badge-low',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${map[priority] || 'badge-low'}`}>
      {priority || 'low'}
    </span>
  );
};

function TaskCard({ task, user, onStatusChange }) {
  const canEdit = user?.role === 'admin' || task.assignedTo?._id === user?._id;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-150 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 flex-1">
          {task.title}
        </h4>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {task.dueDate && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">
                {task.assignedTo.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[80px]">
              {task.assignedTo.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-300 italic">Unassigned</span>
        )}

        {canEdit ? (
          <Select value={task.status} onValueChange={v => onStatusChange(task._id, v)}>
            <SelectTrigger className="h-7 w-[110px] text-[11px] font-medium rounded-md border-gray-200 bg-white focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-xs rounded-lg shadow-lg">
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
            task.status === 'completed' ? 'badge-done' :
            task.status === 'in-progress' ? 'badge-inprogress' : 'badge-todo'
          }`}>
            {task.status.replace('-', ' ')}
          </span>
        )}
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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card-light p-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3 stroke-[1.5]" />
        <h3 className="text-base font-semibold text-gray-700">Project not found</h3>
        <Link to="/projects" className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="card-light p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <div className="flex-1 space-y-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Link to="/projects" className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Projects
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-gray-600 font-medium">{project.title}</span>
            </div>

            <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              {project.description || 'No description provided.'}
            </p>

            {/* Team members */}
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {project.members?.map(m => (
                <div key={m._id} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full border border-gray-200">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{m.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{m.name}</span>
                </div>
              ))}
              {project.members?.length === 0 && (
                <span className="text-xs text-gray-400 italic">No members yet</span>
              )}
            </div>
          </div>

          {/* Actions + Progress */}
          <div className="flex flex-col gap-4 md:items-end shrink-0">
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <button onClick={() => setIsMemberDialogOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> Add Member
                </button>
                <button onClick={() => setIsTaskDialogOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Create Task
                </button>
              </div>
            )}
            {/* Progress summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-w-[200px]">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500 font-medium">Completion</span>
                <span className="font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full">
                <div className="bg-blue-500 h-1.5 rounded-full progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                <span className="flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> {completedTasks} done</span>
                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-blue-400" /> {inProgressTasks} active</span>
                <span>{todoTasks} todo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Kanban Board</h2>
        <span className="text-xs text-gray-400">{tasks.length} total tasks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TO DO */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400" /> To Do
            </h3>
            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{todoTasks}</span>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {tasks.filter(t => t.status === 'todo').map(task => (
              <TaskCard key={task._id} task={task} user={user} onStatusChange={handleStatusUpdate} />
            ))}
            {todoTasks === 0 && (
              <div className="text-center py-10 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <MoreHorizontal className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                No pending tasks
              </div>
            )}
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-200">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> In Progress
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{inProgressTasks}</span>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {tasks.filter(t => t.status === 'in-progress').map(task => (
              <TaskCard key={task._id} task={task} user={user} onStatusChange={handleStatusUpdate} />
            ))}
            {inProgressTasks === 0 && (
              <div className="text-center py-10 text-xs text-blue-400/70 border-2 border-dashed border-blue-200 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-1 text-blue-200" />
                No active tasks
              </div>
            )}
          </div>
        </div>

        {/* COMPLETED */}
        <div className="bg-green-50/40 border border-green-200/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-green-200">
            <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Completed
            </h3>
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{completedTasks}</span>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {tasks.filter(t => t.status === 'completed').map(task => (
              <div key={task._id} className="opacity-75 hover:opacity-100 transition-opacity">
                <TaskCard task={task} user={user} onStatusChange={handleStatusUpdate} />
              </div>
            ))}
            {completedTasks === 0 && (
              <div className="text-center py-10 text-xs text-green-500/60 border-2 border-dashed border-green-200 rounded-lg">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-200" />
                No completed tasks
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border border-gray-200 shadow-xl rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Create New Task</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Add a task to this project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Task Title</Label>
              <Input required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Implement login page" className="text-sm rounded-lg border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Description</Label>
              <Textarea rows={2} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Details..." className="text-sm rounded-lg border-gray-200 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Status</Label>
                <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none text-gray-600">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Priority</Label>
                <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none text-gray-600">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Assign To</Label>
                <select value={taskForm.assignedTo || 'unassigned'} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none text-gray-600">
                  <option value="unassigned">-- Unassigned --</option>
                  {project.members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Due Date</Label>
                <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="text-sm rounded-lg border-gray-200" />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}
                className="text-xs rounded-lg border-gray-200 text-gray-600">Cancel</Button>
              <Button type="submit" className="text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-0">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-white border border-gray-200 shadow-xl rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Add Team Member</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Assign a user to this project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Select Member</Label>
              {availableUsers.length > 0 ? (
                <select required value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none text-gray-600">
                  <option value="">-- Select User --</option>
                  {availableUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  All users are already members of this project.
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsMemberDialogOpen(false)}
                className="text-xs rounded-lg border-gray-200 text-gray-600">Cancel</Button>
              <Button type="submit" disabled={!selectedUser}
                className="text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-0">
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
