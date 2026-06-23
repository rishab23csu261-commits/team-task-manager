import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import {
  FolderOpen, CheckCircle2, ClipboardList, AlertTriangle,
  ArrowRight, Bell, Activity, Plus, ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusBadge = (status) => {
  const map = {
    completed:    'badge-done',
    'in-progress':'badge-inprogress',
    todo:         'badge-todo',
  };
  const label = {
    completed: 'DONE',
    'in-progress': 'IN PROGRESS',
    todo: 'TODO',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${map[status] || 'badge-todo'}`}>
      {label[status] || status}
    </span>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({ title: '', description: '' });
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, projRes] = await Promise.all([
        API.get('/dashboard'),
        API.get('/projects'),
      ]);
      setDashboardData(dashRes.data);
      setProjects(projRes.data.slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setProjectSubmitting(true);
    try {
      await API.post('/projects', projectFormData);
      setIsProjectDialogOpen(false);
      setProjectFormData({ title: '', description: '' });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setProjectSubmitting(false);
    }
  };

  const stats = dashboardData?.stats || {};
  const recentTasks = dashboardData?.recentTasks || [];

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects ?? 0,
      sub: `projects in workspace`,
      icon: FolderOpen,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Completed Projects',
      value: stats.completedTasks ?? 0,
      sub: `of ${stats.totalTasks ?? 0} total`,
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'My Tasks',
      value: stats.inProgressTasks ?? 0,
      sub: 'assigned to me',
      icon: ClipboardList,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks ?? 0,
      sub: 'need attention',
      icon: AlertTriangle,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Welcome Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's what's happening with your projects today
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-light p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-400">{card.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid: Project Overview + Notifications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Project Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Project Overview</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((proj) => {
                const isActive = true;
                return (
                  <Link key={proj._id} to={`/projects/${proj._id}`} className="block">
                    <div className="card-light p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-150">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="text-sm font-semibold text-blue-600 hover:text-blue-700 truncate">
                              {proj.title}
                            </h3>
                            <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shrink-0">
                              ACTIVE
                            </span>
                            <span className="text-xs text-gray-400 shrink-0">MEDIUM Priority</span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {proj.description || 'No description provided.'}
                          </p>
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>Progress</span>
                              <span>5%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full progress-bar" style={{ width: '5%' }} />
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card-light p-12 text-center">
              <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-gray-500">No projects allocated yet</p>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsProjectDialogOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Create Project
                </button>
              )}
            </div>
          )}

          {/* Recent Activity */}
          {recentTasks.length > 0 && (
            <div className="space-y-3 mt-6">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                Recent Activity
              </h2>
              <div className="card-light divide-y divide-gray-100">
                {recentTasks.map((task, idx) => (
                  <div key={task._id || idx} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        task.status === 'completed' ? 'bg-green-100' :
                        task.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <ClipboardList className={`w-3.5 h-3.5 ${
                          task.status === 'completed' ? 'text-green-600' :
                          task.status === 'in-progress' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {task.assignedTo?.name || 'Unassigned'}
                          {task.createdAt && ` · ${formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}`}
                        </p>
                      </div>
                    </div>
                    {statusBadge(task.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* My Tasks */}
          <div className="card-light">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-gray-400" /> My Tasks
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {stats.inProgressTasks ?? 0}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {recentTasks.slice(0, 3).map((task, idx) => (
                <Link key={idx} to={`/tasks/${task._id}`} className="block group">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors truncate">
                    {task.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 uppercase font-medium">
                    {task.projectId?.title || 'Task'} · {task.priority?.toUpperCase() || 'LOW'} Priority
                  </p>
                </Link>
              ))}
              {recentTasks.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No tasks assigned</p>
              )}
            </div>
          </div>

          {/* Overdue */}
          <div className="card-light">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" /> Overdue
              </h3>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                {stats.overdueTasks ?? 0}
              </span>
            </div>
            <div className="p-4">
              {(stats.overdueTasks ?? 0) === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No overdue</p>
              ) : (
                <p className="text-xs text-gray-500">
                  {stats.overdueTasks} task{stats.overdueTasks !== 1 ? 's' : ''} past due date
                </p>
              )}
            </div>
          </div>

          {/* Notifications placeholder */}
          <div className="card-light">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-400" /> Notifications
              </h3>
              <span className="text-xs text-blue-600 font-medium hover:underline cursor-pointer">View all</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Welcome to TaskFlow! Start by creating a project and assigning tasks to your team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      {user?.role === 'admin' && (
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl rounded-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">Create New Project</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Set up a new workspace project for your team.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Project Title</Label>
                <Input required value={projectFormData.title}
                  onChange={e => setProjectFormData({ ...projectFormData, title: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  className="text-sm rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Description</Label>
                <Textarea rows={3} value={projectFormData.description}
                  onChange={e => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  placeholder="Project goals and overview..."
                  className="text-sm rounded-lg border-gray-200 focus:border-blue-500 resize-none" />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsProjectDialogOpen(false)}
                  className="text-xs rounded-lg border-gray-200">Cancel</Button>
                <Button type="submit" disabled={projectSubmitting}
                  className="text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-0">
                  {projectSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
