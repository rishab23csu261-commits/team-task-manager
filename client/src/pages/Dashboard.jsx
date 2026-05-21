import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  FolderKanban, CheckCircle2, Clock, AlertCircle,
  ArrowUpRight, Activity, Calendar, UserCheck, Plus,
  TrendingUp, Target, Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STYLES = {
  completed: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'in-progress': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  todo: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, projRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/projects'),
        ]);
        setDashboardData(dashRes.data);
        setProjects(projRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = dashboardData?.stats || {};
  const statusCounts = dashboardData?.tasksByStatus || {};
  const recentTasks = dashboardData?.recentTasks || [];

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects ?? 0,
      icon: FolderKanban,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accent: 'from-emerald-500 to-teal-500',
      trend: '+12% this month',
      trendIcon: TrendingUp,
      trendColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks ?? 0,
      icon: CheckCircle2,
      iconBg: 'bg-teal-100 dark:bg-teal-950/40',
      iconColor: 'text-teal-600 dark:text-teal-400',
      accent: 'from-teal-500 to-cyan-500',
      trend: '89% completion',
      trendIcon: Target,
      trendColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      label: 'In Progress',
      value: stats.inProgressTasks ?? 0,
      icon: Clock,
      iconBg: 'bg-amber-100 dark:bg-amber-950/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accent: 'from-amber-500 to-orange-500',
      trend: 'Active workflow',
      trendIcon: Zap,
      trendColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdueTasks ?? 0,
      icon: AlertCircle,
      iconBg: 'bg-red-100 dark:bg-red-950/40',
      iconColor: 'text-red-500 dark:text-red-400',
      accent: 'from-red-500 to-rose-500',
      trend: 'Needs attention',
      trendIcon: AlertCircle,
      trendColor: 'text-red-500 dark:text-red-400',
    },
  ];

  const chartData = [
    { name: 'Completed', value: statusCounts.completed || 0, color: '#10b981' },
    { name: 'In Progress', value: statusCounts['in-progress'] || 0, color: '#f59e0b' },
    { name: 'To Do', value: statusCounts.todo || 0, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const totalChartTasks = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pct = totalChartTasks > 0 ? Math.round((payload[0].value / totalChartTasks) * 100) : 0;
      return (
        <div className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-2xl border border-slate-700/80 backdrop-blur-md">
          <p className="font-bold mb-0.5">{payload[0].name}</p>
          <p style={{ color: payload[0].payload.color }} className="font-extrabold">
            {payload[0].value} tasks · {pct}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-56 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}
            <span className="animate-bounce inline-block select-none">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Here&apos;s a live snapshot of your team workspace.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {user?.role === 'admin' && (
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 text-xs gap-1.5 h-9 px-4">
              <Link to="/projects">
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create Project
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;
          return (
            <Card
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mt-0.5 text-right leading-tight max-w-[80px]">
                    {stat.label}
                  </span>
                </div>

                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                  {stat.value}
                </div>

                <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-semibold ${stat.trendColor}`}>
                  <TrendIcon className="w-3 h-3 shrink-0" />
                  <span>{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Projects Table */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/20 shrink-0">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Projects</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active projects across your workspace</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1 rounded-lg h-8">
              <Link to="/projects">View All <ArrowUpRight className="w-3.5 h-3.5" /></Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-slate-800 bg-transparent hover:bg-transparent">
                  <TableHead className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Project</TableHead>
                  <TableHead className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Lead</TableHead>
                  <TableHead className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Team</TableHead>
                  <TableHead className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length > 0 ? (
                  projects.map((proj) => (
                    <TableRow
                      key={proj._id}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <TableCell className="px-6 py-3.5">
                        <Link
                          to={`/projects/${proj._id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm transition-colors"
                        >
                          {proj.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">{proj.description || 'No description'}</p>
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">
                            {proj.createdBy?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                            {proj.createdBy?.name || 'Admin'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100">
                          {proj.members?.length || 1} {proj.members?.length === 1 ? 'member' : 'members'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-right">
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px] px-2.5 py-0.5 rounded-full hover:bg-emerald-50">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <FolderKanban className="w-10 h-10 text-slate-200 dark:text-slate-700 stroke-[1.5]" />
                        <p className="text-sm font-medium">No active projects yet</p>
                        <p className="text-xs text-slate-300 dark:text-slate-600">Create your first project to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Task Overview Donut */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/20 shrink-0">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Task Overview</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution by workflow status</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col items-center justify-center p-5">
            {chartData.length > 0 ? (
              <>
                <div className="relative w-full" style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums">{totalChartTasks}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mt-1">Tasks Total</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">{item.name}</span>
                      </div>
                      <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No tasks yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tasks will appear here once created</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Activity Timeline ───────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/20">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Activity Timeline</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recent task updates across your workspace</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 py-1 px-3 rounded-full border border-emerald-100 dark:border-emerald-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {recentTasks.length > 0 ? (
            <div className="relative space-y-6 pl-7
              before:absolute before:left-[10px] before:top-3 before:bottom-3
              before:w-px before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent
              dark:before:from-slate-700 dark:before:via-slate-700 dark:before:to-transparent">
              {recentTasks.map((task, idx) => {
                const isCompleted = task.status === 'completed';
                const statusKey = task.status || 'todo';
                return (
                  <div key={task._id || idx} className="relative flex gap-4 items-start group">
                    {/* Node */}
                    <div className={`absolute -left-7 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 transition-transform group-hover:scale-125 duration-200 shadow-md ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : task.status === 'in-progress'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-300 dark:bg-slate-600 text-white'
                    }`}>
                      {isCompleted
                        ? <CheckCircle2 className="w-3 h-3" />
                        : <Clock className="w-3 h-3" />
                      }
                    </div>

                    {/* Card */}
                    <div className="flex-1 min-w-0 bg-slate-50/80 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700 group-hover:shadow-sm transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <Link
                          to={`/projects/${task.projectId?._id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm transition-colors truncate"
                        >
                          {task.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                          {task.createdAt ? `${formatDistanceToNow(new Date(task.createdAt))} ago` : 'Recently'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {task.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-bold">{task.assignedTo?.name || 'Team Member'}</span>
                        </span>
                        <Badge className={`text-[10px] uppercase font-bold tracking-wider py-0.5 px-2.5 rounded-full border ${STATUS_STYLES[statusKey] || STATUS_STYLES.todo}`}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-14 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No recent activity</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Activity will show up as your team works on tasks</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
