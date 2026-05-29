import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import { Plus, Trash2, FolderOpen, Search, FolderKanban, CheckCircle2, Clock, Users, ChevronRight, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
      <div className="space-y-8 animate-fade-in p-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 rounded-xl bg-slate-800/60" />
            <Skeleton className="h-4 w-96 rounded-lg bg-slate-800/40" />
          </div>
          <Skeleton className="h-11 w-44 rounded-xl bg-slate-800/60" />
        </div>
        <Skeleton className="h-12 w-full max-w-md rounded-2xl bg-slate-800/40" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-3xl bg-slate-800/40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 font-sans">
      
      {/* ── 1. Page Header ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl glow-teal">
        {/* Glowing orb */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Projects Catalog
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-teal-400 shrink-0" /> Projects
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Manage dynamic workspaces, track active deliverables milestones, and orchestrate cross-team execution.
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl shadow-teal-500/10 gap-2 h-11 border-0 shrink-0"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3.5]" /> Initialize Project
          </Button>
        )}
      </div>

      {/* ── 2. Filters & Toolbar ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-3xl border border-white/[0.04] backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/[0.05] focus:border-teal-500/50 focus:bg-slate-950 text-xs rounded-2xl text-slate-200 placeholder-slate-500 shadow-inner focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold px-2 shrink-0">
          <span>Showing <strong className="text-white">{filteredProjects.length}</strong> of <strong className="text-slate-400">{projects.length}</strong> active projects</span>
        </div>
      </div>

      {/* ── 3. Projects Grid ────────────────────────────────────────── */}
      {filteredProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 border-white/[0.06] rounded-3xl bg-slate-950/20 shadow-xl">
          <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <FolderOpen className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-white">No matching projects found</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">Try relaxing your search terms or create a new workspace project above.</p>
          {user?.role === 'admin' && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="mt-6 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-2xl text-xs font-black gap-2 border-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Create Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project._id);
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className="block group">
                <Card className="h-full flex flex-col bg-slate-950/40 rounded-3xl border border-white/[0.05] shadow-xl hover:shadow-2xl hover:border-teal-500/30 hover:bg-slate-900/30 transition-all duration-300 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0 p-6 border-b border-white/[0.04] bg-slate-950/20">
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-inner">
                          Workspace
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-bold block truncate">Lead: {project.createdBy?.name || 'Admin'}</span>
                      </div>
                      <CardTitle className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1 mt-2">
                        {project.title}
                      </CardTitle>
                    </div>
                    {user?.role === 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(project._id, e)}
                        className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity self-start shrink-0"
                        title="Delete project"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    )}
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-6 space-y-6">
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium">
                      {project.description || 'No overview details defined for this workspace project.'}
                    </p>

                    {/* Progress Section */}
                    <div className="space-y-3 bg-slate-950 border border-white/[0.03] p-4 rounded-2xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-teal-400" /> Completion Progress
                        </span>
                        <span className="font-extrabold text-teal-400">{stats.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-900 border border-white/[0.03] h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${stats.progress}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-450 pt-1 font-bold">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> {stats.completed} done</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-violet-400 animate-pulse" /> {stats.inProgress} active</span>
                        <span className="text-slate-500">{stats.total} total</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-4 border-t border-white/[0.04] flex items-center justify-between bg-slate-950/20">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <div className="flex -space-x-2.5">
                        {project.members?.slice(0, 4).map((member) => (
                          <Avatar key={member._id} className="w-7 h-7 border border-slate-950 shadow-md">
                            <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black text-[9px]">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.members?.length > 4 && (
                          <div className="w-7 h-7 rounded-full bg-slate-900 border border-white/[0.05] flex items-center justify-center text-[9px] font-black text-teal-450 shadow-inner">
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Open Project <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── 4. Create Project Dialog ────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-slate-950 border border-white/[0.08] shadow-2xl rounded-3xl p-6 glass-premium">
          <DialogHeader className="pb-4 border-b border-white/[0.05]">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <FolderKanban className="w-5.5 h-5.5 text-teal-400" /> Create Workspace Project
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Set up a collaborative workspace to allocate sprint tasks, timelines, and lead members.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-black text-slate-300">Project Workspace Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. NextGen Web App Redesign"
                className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] p-3.5 focus:border-teal-500 focus:ring-teal-500/20 shadow-inner text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-black text-slate-300">Goal Scope & Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Core parameters and milestones of this workspace..."
                className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] p-3.5 focus:border-teal-500 focus:ring-teal-500/20 shadow-inner resize-none text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <DialogFooter className="pt-4 border-t border-white/[0.05] flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl text-xs font-semibold bg-transparent border-white/[0.06] text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black rounded-xl text-xs px-5 shadow-lg shadow-teal-500/10 border-0"
              >
                {submitting ? 'Creating workspace...' : 'Initialize Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
