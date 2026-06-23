import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import { Plus, Trash2, FolderOpen, Search, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const StatusBadge = ({ status }) => {
  const map = {
    active:    { cls: 'badge-active',    label: 'ACTIVE'    },
    planning:  { cls: 'badge-planning',  label: 'PLANNING'  },
    completed: { cls: 'badge-done',      label: 'COMPLETED' },
    paused:    { cls: 'badge-todo',      label: 'PAUSED'    },
  };
  const cfg = map[status?.toLowerCase()] || map.planning;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get('/projects'),
        API.get('/tasks'),
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/projects', formData);
      setIsDialogOpen(false);
      setFormData({ title: '', description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStats = (projectId) => {
    const pt = tasks.filter(t => (t.projectId?._id || t.projectId) === projectId);
    const total = pt.length;
    const completed = pt.filter(t => t.status === 'completed').length;
    const inProgress = pt.filter(t => t.status === 'in-progress').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, progress };
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track your projects</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-700 placeholder-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600 cursor-pointer"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Planning</option>
          <option>Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600 cursor-pointer"
        >
          <option>All Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="card-light p-16 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-base font-semibold text-gray-600">No projects found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? 'Try a different search term.' : 'Create your first project to get started.'}
          </p>
          {user?.role === 'admin' && !searchQuery && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="mt-5 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(project => {
            const stats = getStats(project._id);
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className="block group">
                <div className="card-light p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 relative">
                  {/* Delete button */}
                  {user?.role === 'admin' && (
                    <button
                      onClick={e => handleDelete(project._id, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Title + Status */}
                  <div className="flex items-start gap-3 mb-2 pr-8">
                    <h3 className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 flex-1 line-clamp-1">
                      {project.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Status + Priority row */}
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge status="active" />
                    <span className="text-xs text-gray-400 font-medium">MEDIUM Priority</span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full progress-bar"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> {stats.completed} done
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" /> {stats.inProgress} active
                      </span>
                    </div>
                    <span className="text-xs text-blue-500 font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                      Open <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Create New Project</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Add a new project to your workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Project Title</Label>
              <Input required value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mobile App Redesign"
                className="text-sm rounded-lg border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Description</Label>
              <Textarea rows={3} value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project goals and scope..."
                className="text-sm rounded-lg border-gray-200 resize-none" />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}
                className="text-xs rounded-lg border-gray-200 text-gray-600">Cancel</Button>
              <Button type="submit" disabled={submitting}
                className="text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-0">
                {submitting ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
