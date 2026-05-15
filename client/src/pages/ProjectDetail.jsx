import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-muted-foreground text-center py-12">Project not found or access denied.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Link to="/projects">
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
              </div>
              <CardDescription className="ml-11">{project.description || 'No description'}</CardDescription>
            </div>
            
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsMemberDialogOpen(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Member
                </Button>
                <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Task
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Members List */}
          <div className="ml-11">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Team Members</h3>
            <div className="flex flex-wrap gap-2">
              {project.members.map(member => (
                <div key={member._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{member.name}</span>
                </div>
              ))}
              {project.members.length === 0 && <span className="text-sm text-muted-foreground">No members added yet.</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-semibold">Project Tasks</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kanban Columns */}
        {['todo', 'in-progress', 'completed'].map(status => (
          <div key={status} className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {status.replace('-', ' ')}
              </h3>
              <Badge variant="secondary" className="px-2">
                {tasks.filter(t => t.status === status).length}
              </Badge>
            </div>
            
            {tasks.filter(t => t.status === status).map(task => (
              <Card key={task._id} className="hover:border-primary/50 transition-colors shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' :
                      task.priority === 'medium' ? 'secondary' : 'outline'
                    } className={task.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' : ''}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignedTo.name}`}>
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-primary/10 text-[9px] font-bold">
                              {task.assignedTo.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">{task.assignedTo.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Unassigned</span>
                      )}
                    </div>
                    
                    {/* Status update dropdown (if user can update) */}
                    {(user?.role === 'admin' || task.assignedTo?._id === user?._id) && (
                      <Select 
                        value={task.status} 
                        onValueChange={(value) => handleTaskStatusUpdate(task._id, value)}
                      >
                        <SelectTrigger className="h-7 w-[110px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
            
            {tasks.filter(t => t.status === status).length === 0 && (
              <div className="rounded-xl p-4 border border-border border-dashed text-center bg-muted/30">
                <p className="text-xs text-muted-foreground">No tasks</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Add a new task to this project and assign it to a team member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input required type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={2} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={taskForm.status} onValueChange={value => setTaskForm({...taskForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={value => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={taskForm.assignedTo || "unassigned"} onValueChange={value => setTaskForm({...taskForm, assignedTo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {project.members.map(m => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Select a user to add them to this project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              {availableUsers.length > 0 ? (
                <Select required value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Choose User --" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(u => (
                      <SelectItem key={u._id} value={u._id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">All users are already in this project.</p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsMemberDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!selectedUser}>Add Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
