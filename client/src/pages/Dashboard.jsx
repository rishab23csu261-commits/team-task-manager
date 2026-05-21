import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FolderKanban, CheckCircle2, Clock, AlertCircle, ArrowUpRight, Activity, Calendar, UserCheck, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

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
        setProjects(projRes.data.slice(0, 5)); // top 5 recent projects
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

  // Stat Cards Configuration
  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects || 0, icon: FolderKanban, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30', trend: '+12% this month' },
    { label: 'Completed Tasks', value: stats.completedTasks || 0, icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/30', trend: '89% completion' },
    { label: 'In Progress', value: stats.inProgressTasks || 0, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30', trend: 'Active workflow' },
    { label: 'Overdue Tasks', value: stats.overdueTasks || 0, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30', trend: 'Needs attention' },
  ];

  // Recharts Donut Data
  const chartData = [
    { name: 'Completed', value: statusCounts.completed || 0, color: '#10b981' },
    { name: 'In Progress', value: statusCounts['in-progress'] || 0, color: '#f59e0b' },
    { name: 'To Do', value: statusCounts.todo || 0, color: '#64748b' },
  ].filter(d => d.value > 0);

  const totalChartTasks = chartData.reduce((acc, curr) => acc + curr.value, 0);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-emerald-400 font-bold">{payload[0].value} tasks ({Math.round((payload[0].value / totalChartTasks) * 100)}%)</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card dark:bg-slate-900/60 p-6 rounded-2xl border border-border shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'} <span className="animate-bounce inline-block">👋</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here is the latest snapshot of your team workspace & active projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary dark:bg-slate-800 text-secondary-foreground dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {user?.role === 'admin' && (
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 text-xs gap-1.5 px-4 py-2">
              <Link to="/projects">
                <Plus className="w-4 h-4 stroke-[3]" /> Create Project
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <Card key={i} className="group hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 rounded-2xl border-border bg-card dark:bg-slate-900/40 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-emerald-500 transition-colors duration-300" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pl-6">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.label}
                </CardTitle>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 duration-300 ${stat.bg}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pl-6 pb-5">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">●</span> {stat.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Projects Table & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card className="lg:col-span-2 rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col bg-card dark:bg-slate-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Recent Projects</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Active projects across your workspace</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1 rounded-lg">
              <Link to="/projects">View All <ArrowUpRight className="w-3.5 h-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 dark:bg-slate-950/10 border-b border-border text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <TableHead className="px-6 py-3.5">Project Name</TableHead>
                  <TableHead className="px-6 py-3.5">Lead</TableHead>
                  <TableHead className="px-6 py-3.5">Team</TableHead>
                  <TableHead className="px-6 py-3.5 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {projects.length > 0 ? (
                  projects.map((proj) => (
                    <TableRow key={proj._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors border-b border-border">
                      <TableCell className="px-6 py-4">
                        <Link to={`/projects/${proj._id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm block">
                          {proj.title}
                        </Link>
                        <span className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{proj.description || 'No description'}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                            {proj.createdBy?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                          {proj.createdBy?.name || 'Admin'}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs py-0.5 px-2.5 rounded-full border border-slate-200 dark:border-slate-700">
                          {proj.members?.length || 1} {proj.members?.length === 1 ? 'member' : 'members'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-400 text-sm font-medium">
                      No active projects found. Get started by creating one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Task Donut Chart */}
        <Card className="rounded-2xl border border-border shadow-sm flex flex-col bg-card dark:bg-slate-900/40">
          <CardHeader className="pb-2 border-b border-border bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Task Overview</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Distribution by workflow status</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-6 flex-1 flex flex-col items-center justify-center">
            {chartData.length > 0 ? (
              <>
                <div className="w-full h-64 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Label */}
                  <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalChartTasks}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Total Tasks</span>
                  </div>
                </div>

                {/* Status Legend */}
                <div className="grid grid-cols-3 gap-3 w-full mt-4 pt-4 border-t border-border">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-950/10 p-2.5 rounded-xl border border-border text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{item.name}</span>
                      </div>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
                <Activity className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                <p>No active tasks to visualize</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline Section */}
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card dark:bg-slate-900/40">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Activity Timeline</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Real-time updates and task updates</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/20 py-1 px-3 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {recentTasks.length > 0 ? (
            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
              {recentTasks.map((task, idx) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div key={task._id || idx} className="relative flex gap-5 items-start group">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[25px] top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-sm transition-transform group-hover:scale-125 duration-200 ${
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-slate-50/80 dark:bg-slate-950/10 group-hover:bg-slate-50 dark:group-hover:bg-slate-850/20 p-4 rounded-xl border border-border group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-all duration-200 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <Link to={`/projects/${task.projectId?._id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm">
                          {task.title}
                        </Link>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {task.createdAt ? `${formatDistanceToNow(new Date(task.createdAt))} ago` : 'Recently'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description || 'No description provided for this task.'}</p>
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 
                          Assigned to <span className="text-slate-900 dark:text-slate-200 font-bold">{task.assignedTo?.name || 'Team Member'}</span>
                        </span>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider py-0.5 px-2.5 rounded-full ${
                          isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                        }`}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
              <p>No recent activity in your workspace</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
