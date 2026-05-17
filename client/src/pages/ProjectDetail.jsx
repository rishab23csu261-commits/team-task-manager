import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, UserPlus, FolderKanban, CheckCircle2, Clock, AlertCircle, Calendar, Users, Layers, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Dialog state
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });

  // Member Dialog state
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

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

  // Helper stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Project Not Found</h3>
        <p className="text-slate-500 text-xs mt-1 mb-6">The project you are looking for does not exist or you do not have permission to view it.</p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs px-5">
          <Link to="/projects"><ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Navigation Breadcrumb & Header Card */}
      <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <CardHeader className="p-6 sm:p-8 pb-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2.5">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors">
                  <Link to="/projects">
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  Workspace Project
                </Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{project.title}</CardTitle>
              <CardDescription className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {project.description || 'No overview description provided for this project.'}
              </CardDescription>
            </div>

            {user?.role === 'admin' && (
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setIsMemberDialogOpen(true)} className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold gap-2 shadow-xs">
                  <UserPlus className="w-4 h-4 text-emerald-600" /> Add Member
                </Button>
                <Button onClick={() => setIsTaskDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 text-xs font-semibold gap-2">
                  <Plus className="w-4 h-4 stroke-[3]" /> Create Task
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Team Members List */}
            <div className="md:col-span-2 space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> Team Collaborators ({project.members?.length || 0})
              </span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {project.members?.map(member => (
                  <div key={member._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors font-medium">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="bg-emerald-600 text-white font-bold text-[10px]">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-800 font-bold">{member.name}</span>
                  </div>
                ))}
                {project.members?.length === 0 && <span className="text-xs text-slate-400 italic">No collaborators assigned yet.</span>}
              </div>
            </div>

            {/* Progress Bar Summary */}
            <div className="md:col-span-2 bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" /> Overall Completion
                </span>
                <span className="font-extrabold text-emerald-600 text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {completedTasks} done</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {inProgressTasks} in progress</span>
                <span className="text-slate-400">{todoTasks} to do</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board Headers */}
      <div className="flex items-center justify-between pt-4 pb-2 border-b border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-emerald-600" /> Kanban Board
        </h2>
        <span className="text-xs text-slate-500 font-semibold">{tasks.length} total tasks</span>
      </div>
      
      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. TO DO COLUMN */}
        <div className="flex flex-col gap-4 bg-slate-100/60 p-4 rounded-2xl border border-slate-200/80 min-h-[500px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 px-2">
            <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> To Do
            </h3>
            <Badge variant="secondary" className="bg-slate-200/80 text-slate-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {todoTasks}
            </Badge>
          </div>
          
          <div className="space-y-3 flex-1">
            {tasks.filter(t => t.status === 'todo').map(task => (
              <Card key={task._id} className="hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 rounded-xl bg-white border-slate-200/90 shadow-xs relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
                <CardContent className="p-5 pl-6 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-emerald-600 transition-colors">{task.title}</h4>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className={`text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-2 rounded-md ${
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                      task.priority === 'low' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700 border border-red-200 shadow-xs'
                    }`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description || 'No detailed instructions provided.'}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-2">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100 font-semibold" title={`Assigned to ${task.assignedTo.name}`}>
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-emerald-600 text-white text-[9px] font-extrabold">
                              {task.assignedTo.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-slate-700 truncate max-w-[90px]">{task.assignedTo.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100">Unassigned</span>
                      )}
                    </div>
                    
                    {(user?.role === 'admin' || task.assignedTo?._id === user?._id) && (
                      <Select value={task.status} onValueChange={(value) => handleTaskStatusUpdate(task._id, value)}>
                        <SelectTrigger className="h-8 w-[115px] text-xs font-semibold rounded-lg bg-white border-slate-200 shadow-xs focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl">
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {todoTasks === 0 && (
              <div className="rounded-2xl p-8 border-2 border-slate-200/80 border-dashed text-center bg-white/50 flex flex-col items-center justify-center min-h-[160px]">
                <MoreHorizontal className="w-8 h-8 text-slate-300 mb-1" />
                <p className="text-xs font-bold text-slate-400">No pending tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. IN PROGRESS COLUMN */}
        <div className="flex flex-col gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60 min-h-[500px]">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/80 px-2">
            <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> In Progress
            </h3>
            <Badge variant="secondary" className="bg-amber-200/70 text-amber-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {inProgressTasks}
            </Badge>
          </div>
          
          <div className="space-y-3 flex-1">
            {tasks.filter(t => t.status === 'in-progress').map(task => (
              <Card key={task._id} className="hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 rounded-xl bg-white border-slate-200/90 shadow-xs relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <CardContent className="p-5 pl-6 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-amber-600 transition-colors">{task.title}</h4>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className={`text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-2 rounded-md ${
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                      task.priority === 'low' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700 border border-red-200 shadow-xs'
                    }`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description || 'No detailed instructions provided.'}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-2">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100 font-semibold" title={`Assigned to ${task.assignedTo.name}`}>
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-amber-600 text-white text-[9px] font-extrabold">
                              {task.assignedTo.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-slate-700 truncate max-w-[90px]">{task.assignedTo.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100">Unassigned</span>
                      )}
                    </div>
                    
                    {(user?.role === 'admin' || task.assignedTo?._id === user?._id) && (
                      <Select value={task.status} onValueChange={(value) => handleTaskStatusUpdate(task._id, value)}>
                        <SelectTrigger className="h-8 w-[115px] text-xs font-semibold rounded-lg bg-white border-slate-200 shadow-xs focus:ring-amber-500 text-amber-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl">
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {inProgressTasks === 0 && (
              <div className="rounded-2xl p-8 border-2 border-amber-200/80 border-dashed text-center bg-white/50 flex flex-col items-center justify-center min-h-[160px]">
                <Clock className="w-8 h-8 text-amber-300 mb-1 stroke-[1.5]" />
                <p className="text-xs font-bold text-amber-600/70">No active tasks in progress</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. COMPLETED COLUMN */}
        <div className="flex flex-col gap-4 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200/60 min-h-[500px]">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80 px-2">
            <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
            </h3>
            <Badge variant="secondary" className="bg-emerald-200/70 text-emerald-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {completedTasks}
            </Badge>
          </div>
          
          <div className="space-y-3 flex-1">
            {tasks.filter(t => t.status === 'completed').map(task => (
              <Card key={task._id} className="hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 rounded-xl bg-white border-slate-200/90 shadow-xs relative overflow-hidden group opacity-85 hover:opacity-100">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <CardContent className="p-5 pl-6 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-through decoration-emerald-500/50 group-hover:text-emerald-700 transition-colors">{task.title}</h4>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-2 rounded-md">
                      Done
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description || 'No detailed instructions provided.'}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-2">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100 font-semibold" title={`Assigned to ${task.assignedTo.name}`}>
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-emerald-600 text-white text-[9px] font-extrabold">
                              {task.assignedTo.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-slate-700 truncate max-w-[90px]">{task.assignedTo.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100">Unassigned</span>
                      )}
                    </div>
                    
                    {(user?.role === 'admin' || task.assignedTo?._id === user?._id) && (
                      <Select value={task.status} onValueChange={(value) => handleTaskStatusUpdate(task._id, value)}>
                        <SelectTrigger className="h-8 w-[115px] text-xs font-semibold rounded-lg bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xs focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl">
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {completedTasks === 0 && (
              <div className="rounded-2xl p-8 border-2 border-emerald-200/80 border-dashed text-center bg-white/50 flex flex-col items-center justify-center min-h-[160px]">
                <CheckCircle2 className="w-8 h-8 text-emerald-300 mb-1 stroke-[1.5]" />
                <p className="text-xs font-bold text-emerald-600/70">No completed tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-xl font-extrabold text-slate-900">Create New Task</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Add a new task item to this project backlog and assign a collaborator.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Task Title</Label>
              <Input required type="text" placeholder="e.g. Implement OAuth2 Authentication" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="text-xs rounded-xl border-slate-200 p-3 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Detailed Description</Label>
              <Textarea rows={3} placeholder="Describe requirements, acceptance criteria..." value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="text-xs rounded-xl border-slate-200 p-3 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-xs resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Initial Status</Label>
                <Select value={taskForm.status} onValueChange={value => setTaskForm({...taskForm, status: value})}>
                  <SelectTrigger className="text-xs rounded-xl border-slate-200 focus:ring-emerald-500 font-semibold shadow-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl">
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Priority Level</Label>
                <Select value={taskForm.priority} onValueChange={value => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger className="text-xs rounded-xl border-slate-200 focus:ring-emerald-500 font-semibold shadow-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Assign Collaborator</Label>
                <Select value={taskForm.assignedTo || "unassigned"} onValueChange={value => setTaskForm({...taskForm, assignedTo: value})}>
                  <SelectTrigger className="text-xs rounded-xl border-slate-200 focus:ring-emerald-500 font-semibold shadow-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl max-h-56">
                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                    {project.members?.map(m => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Target Due Date</Label>
                <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="text-xs rounded-xl border-slate-200 p-2.5 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-xs" />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="rounded-xl text-xs font-semibold">Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-lg shadow-emerald-500/20">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-xl font-extrabold text-slate-900">Add Team Member</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select an available workspace user to grant them full collaboration access to this project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Available Collaborators</Label>
              {availableUsers.length > 0 ? (
                <Select required value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="text-xs rounded-xl border-slate-200 focus:ring-emerald-500 font-semibold p-3 shadow-xs">
                    <SelectValue placeholder="-- Select User --" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl max-h-56">
                    {availableUsers.map(u => (
                      <SelectItem key={u._id} value={u._id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl font-medium">All active workspace users are already assigned to this project.</p>
              )}
            </div>
            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsMemberDialogOpen(false)} className="rounded-xl text-xs font-semibold">Cancel</Button>
              <Button type="submit" disabled={!selectedUser} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-lg shadow-emerald-500/20">Add Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
