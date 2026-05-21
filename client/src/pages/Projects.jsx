import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import { Plus, Trash2, FolderOpen, Search, FolderKanban, CheckCircle2, Clock, Users, ChevronRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjectsAndTasks();
  }, []);

  const fetchProjectsAndTasks = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get('/projects'),
        API.get('/tasks'),
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
    } catch (error) {
      console.error('Failed to fetch projects and tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/projects', formData);
      setIsDialogOpen(false);
      setFormData({ title: '', description: '' });
      fetchProjectsAndTasks();
    } catch (error) {
      console.error('Failed to create project', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjectsAndTasks();
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to calculate progress for a project
  const getProjectStats = (projectId) => {
    const projTasks = tasks.filter(t => (t.projectId?._id || t.projectId) === projectId);
    const total = projTasks.length;
    const completed = projTasks.filter(t => t.status === 'completed').length;
    const inProgress = projTasks.filter(t => t.status === 'in-progress').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, progress };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full max-w-md rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card dark:bg-slate-900/60 p-6 rounded-2xl border border-border shadow-xs backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FolderKanban className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> Projects
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage workspaces, track task milestones, and collaborate across teams.</p>
        </div>
        
        {user?.role === 'admin' && (
          <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 px-5 py-2.5 text-xs font-semibold gap-2 self-start sm:self-center">
            <Plus className="w-4 h-4 stroke-[3]" /> Create New Project
          </Button>
        )}
      </div>

      {/* Search Bar & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100/80 dark:bg-slate-950/20 p-4 rounded-2xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-550" />
          <Input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 text-xs rounded-xl border border-border shadow-xs focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold px-2">
          <span>Showing <strong className="text-slate-900 dark:text-slate-100">{filteredProjects.length}</strong> of <strong className="text-slate-900 dark:text-slate-100">{projects.length}</strong> projects</span>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 border-border rounded-2xl bg-card dark:bg-slate-900/40 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
            <FolderOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No matching projects</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">Try adjusting your search query or create a new project to get started.</p>
          {user?.role === 'admin' && (
            <Button onClick={() => setIsDialogOpen(true)} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-2">
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project._id);
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className="block group">
                <Card className="h-full flex flex-col bg-card dark:bg-slate-900/40 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0 p-6 border-b border-border bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                          Workspace
                        </Badge>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block truncate">Lead: {project.createdBy?.name || 'Admin'}</span>
                      </div>
                      <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {project.title}
                      </CardTitle>
                    </div>
                    {user?.role === 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(project._id, e)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity self-start shrink-0"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-6 space-y-6">
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {project.description || 'No overview description provided for this project.'}
                    </p>

                    {/* Progress Section */}
                    <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/10 p-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Progress
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{stats.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${stats.progress}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-semibold">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {stats.completed} done</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> {stats.inProgress} active</span>
                        <span className="text-slate-400 dark:text-slate-500">{stats.total} total</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-4 border-t border-border flex items-center justify-between bg-card dark:bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div className="flex -space-x-2">
                        {project.members?.slice(0, 4).map((member) => (
                          <Avatar key={member._id} className="w-7 h-7 border-2 border-white dark:border-slate-900 ring-1 ring-slate-200 dark:ring-slate-850">
                            <AvatarFallback className="bg-emerald-600 text-white font-bold text-[10px]">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.members?.length > 4 && (
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-850 border-2 border-white dark:border-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 flex items-center justify-center text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Open Project <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Create New Project</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Initialize a new workspace to organize milestones and assign team members.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold text-slate-700 dark:text-slate-300">Project Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Q3 Cloud Migration"
                className="text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-border p-3 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-xs text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700 dark:text-slate-300">Description (Optional)</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of project goals and scope..."
                className="text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-border p-3 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-xs resize-none text-foreground"
              />
            </div>
            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-lg shadow-emerald-500/20">
                {submitting ? 'Creating Project...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
