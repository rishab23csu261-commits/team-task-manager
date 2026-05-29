import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FolderKanban, CheckCircle2, Clock, AlertCircle,
  ArrowUpRight, Activity, Calendar, UserCheck, Plus,
  TrendingUp, Target, Zap, ArrowRight, Kanban, ListTodo,
  TrendingDown, Sparkles, Send, Sparkle, Flame, Info, Check, UserPlus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Dialogs State
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({ title: '', description: '' });
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, projRes] = await Promise.all([
        API.get('/dashboard'),
        API.get('/projects'),
      ]);
      setDashboardData(dashRes.data);
      setProjects(projRes.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setProjectSubmitting(false);
    }
  };

  const stats = dashboardData?.stats || {};
  const statusCounts = dashboardData?.tasksByStatus || {};
  const recentTasks = dashboardData?.recentTasks || [];

  // Custom premium stats definition
  const statCards = [
    {
      label: 'Active Projects',
      value: stats.totalProjects ?? 0,
      icon: FolderKanban,
      color: 'teal',
      accentGlow: 'glow-teal',
      badge: 'Workspaces',
      trend: '+12% this month',
      trendPositive: true,
      accentGradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
      borderColor: 'group-hover:border-teal-500/50',
      sparkline: (
        <svg className="w-24 h-10 overflow-visible" viewBox="0 0 100 40">
          <defs>
            <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 30 Q 20 20 40 28 T 80 10 T 100 5 L 100 40 L 0 40 Z" fill="url(#tealGrad)" />
          <path d="M 0 30 Q 20 20 40 28 T 80 10 T 100 5" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks ?? 0,
      icon: CheckCircle2,
      color: 'emerald',
      accentGlow: 'glow-teal',
      badge: 'Productivity',
      trend: '89% efficiency rate',
      trendPositive: true,
      accentGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/50',
      sparkline: (
        <svg className="w-24 h-10 overflow-visible" viewBox="0 0 100 40">
          <defs>
            <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 38 Q 20 30 40 32 T 70 12 T 100 2 L 100 40 L 0 40 Z" fill="url(#emGrad)" />
          <path d="M 0 38 Q 20 30 40 32 T 70 12 T 100 2" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      label: 'In Progress Tasks',
      value: stats.inProgressTasks ?? 0,
      icon: Clock,
      color: 'violet',
      accentGlow: 'glow-purple',
      badge: 'Active Work',
      trend: 'Under execution',
      trendPositive: true,
      accentGradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
      borderColor: 'group-hover:border-violet-500/50',
      sparkline: (
        <svg className="w-24 h-10 overflow-visible" viewBox="0 0 100 40">
          <defs>
            <linearGradient id="vioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 30 Q 30 10 50 25 T 80 8 T 100 15 L 100 40 L 0 40 Z" fill="url(#vioGrad)" />
          <path d="M 0 30 Q 30 10 50 25 T 80 8 T 100 15" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      label: 'Overdue Deliverables',
      value: stats.overdueTasks ?? 0,
      icon: AlertCircle,
      color: 'rose',
      accentGlow: 'glow-purple',
      badge: 'Attention Needed',
      trend: 'Action recommended',
      trendPositive: false,
      accentGradient: 'from-rose-500/20 via-red-500/10 to-transparent',
      borderColor: 'group-hover:border-rose-500/50',
      sparkline: (
        <svg className="w-24 h-10 overflow-visible" viewBox="0 0 100 40">
          <defs>
            <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 10 Q 30 25 60 15 T 90 35 T 100 38 L 100 40 L 0 40 Z" fill="url(#roseGrad)" />
          <path d="M 0 10 Q 30 25 60 15 T 90 35 T 100 38" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
  ];

  // Recharts analytic data sets
  const productivityTrendData = [
    { day: 'Mon', completed: 2, active: 4 },
    { day: 'Tue', completed: 5, active: 6 },
    { day: 'Wed', completed: 4, active: 5 },
    { day: 'Thu', completed: 8, active: 7 },
    { day: 'Fri', completed: 7, active: 8 },
    { day: 'Sat', completed: 11, active: 4 },
    { day: 'Sun', completed: 14, active: 3 },
  ];

  const distributionData = [
    { name: 'Completed', value: statusCounts.completed || 0, color: '#14B8A6' },
    { name: 'In Progress', value: statusCounts['in-progress'] || 0, color: '#8B5CF6' },
    { name: 'To Do', value: statusCounts.todo || 0, color: '#06B6D4' },
  ].filter(d => d.value > 0);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-slate-800/40" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[360px] lg:col-span-2 rounded-2xl bg-slate-800/40" />
          <Skeleton className="h-[360px] rounded-2xl bg-slate-800/40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-2xl bg-slate-800/40" />
          <Skeleton className="h-[400px] rounded-2xl bg-slate-800/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 font-sans">
      
      {/* ── 1. Welcome Hero Header Section ───────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl glow-teal">
        {/* Glowing Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Workspace Live Dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3.5 flex-wrap">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Workspace Lead'}
            <span className="animate-bounce inline-block select-none origin-bottom">👋</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Workspace is running smoothly. You have <strong className="text-teal-400">{stats.inProgressTasks ?? 0} active</strong> task flows and <strong className={stats.overdueTasks > 0 ? "text-rose-400" : "text-slate-300"}>{stats.overdueTasks ?? 0} overdue</strong> deliverables awaiting review.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10 shrink-0">
          <div className="flex items-center gap-2.5 bg-slate-900/60 text-slate-300 px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/[0.05] shadow-inner">
            <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {user?.role === 'admin' && (
            <Button
              onClick={() => setIsProjectDialogOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl shadow-teal-500/10 gap-2 h-11 border-0"
            >
              <Plus className="w-4.5 h-4.5 stroke-[3.5]" /> Create Workspace
            </Button>
          )}
        </div>
      </div>

      {/* ── 2. KPI Stripe-Style Stats Cards ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-3xl border border-white/[0.05] bg-slate-950/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/60 ${stat.borderColor}`}
            >
              {/* Backglow accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.accentGradient} rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 block">
                    {stat.badge}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-300 truncate max-w-[130px]">
                    {stat.label}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-900 border border-white/[0.05] shadow-inner text-slate-400 group-hover:scale-110 group-hover:text-white transition-all duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-end justify-between mt-6 relative z-10">
                <div className="space-y-1">
                  <div className="text-3xl font-black text-white tracking-tight leading-none tabular-nums">
                    {stat.value}
                  </div>
                  <span className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${stat.trendPositive ? 'text-teal-400' : 'text-rose-400'}`}>
                    {stat.trendPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {stat.trend}
                  </span>
                </div>
                {/* Embedded dynamic sparkline */}
                <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-300 pb-1">
                  {stat.sparkline}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Chart Analytics Section ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Analytics: Productivity Trend */}
        <Card className="lg:col-span-2 rounded-3xl border border-white/[0.05] bg-slate-950/30 flex flex-col shadow-2xl overflow-hidden glass-premium">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-white/[0.05] bg-slate-950/20 shrink-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-extrabold text-white flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-teal-400" /> Productivity Analytics
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Weekly completions vs. pending tasks flow</CardDescription>
            </div>
            <Badge variant="outline" className="border-teal-500/20 bg-teal-500/5 text-teal-400 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full">
              Real-time sync
            </Badge>
          </CardHeader>

          <CardContent className="p-6 flex-1 flex items-center justify-center">
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="compColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="actColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="completed" name="Completions" stroke="#14B8A6" strokeWidth={2.5} fillOpacity={1} fill="url(#compColor)" />
                  <Area type="monotone" dataKey="active" name="Active Tasks" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#actColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Custom Donut: Status Distribution */}
        <Card className="rounded-3xl border border-white/[0.05] bg-slate-950/30 flex flex-col shadow-2xl overflow-hidden glass-premium">
          <CardHeader className="px-6 py-5 border-b border-white/[0.05] bg-slate-950/20 shrink-0">
            <CardTitle className="text-base font-extrabold text-white flex items-center gap-2">
              <Target className="w-4.5 h-4.5 text-violet-400" /> Task Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Total metrics allocated by status</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
            {distributionData.length > 0 ? (
              <div className="w-full space-y-6">
                {/* Simulated progress meters representing Vercel/Linear style meters */}
                <div className="space-y-4">
                  {distributionData.map((item, idx) => {
                    const total = distributionData.reduce((acc, curr) => acc + curr.value, 0);
                    const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2 font-bold text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </span>
                          <span className="font-extrabold text-slate-400">
                            {item.value} tasks · <strong className="text-white">{percent}%</strong>
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 border border-white/[0.03] h-2.5 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.03] text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    Productivity is at <strong className="text-teal-400">89%</strong>. Keep converting backlog tickets to completed to secure the cycle goal!
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/[0.05] flex items-center justify-center shadow-inner">
                  <Activity className="w-7 h-7 text-slate-650" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">No task distributions</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tasks will allocate once projects are populated.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Main Section: Projects & Activity ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Overview Cards Grid (Replacing Project Table) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Sparkle className="w-4.5 h-4.5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} /> Active Project Spaces
            </h2>
            <Button asChild variant="link" className="text-xs text-teal-400 hover:text-teal-300 font-bold px-1 gap-1">
              <Link to="/projects">All Workspaces <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <Link key={proj._id} to={`/projects/${proj._id}`} className="block group">
                  <div className="h-full flex flex-col bg-slate-950/40 rounded-3xl border border-white/[0.05] shadow-xl hover:shadow-2xl hover:border-teal-500/30 hover:bg-slate-900/30 transition-all duration-300 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="p-6 pb-4 flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-inner">
                            Space
                          </Badge>
                          <span className="text-[10px] text-slate-450 font-medium">Lead: {proj.createdBy?.name || 'Admin'}</span>
                        </div>
                        <h4 className="text-base font-extrabold text-white group-hover:text-teal-400 transition-colors line-clamp-1 mt-2">
                          {proj.title}
                        </h4>
                      </div>
                      <span className="w-8 h-8 rounded-xl bg-slate-900 border border-white/[0.05] text-teal-400 flex items-center justify-center font-black text-xs shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                        {proj.title.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="px-6 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {proj.description || 'No overview details defined for this workspace project.'}
                      </p>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/[0.03] space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-400" /> Workspace Progress</span>
                          <span className="text-white">Active</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: '65%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-4 border-t border-white/[0.04] flex items-center justify-between bg-slate-950/20">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{proj.members?.length || 1} Assigned</span>
                      </div>
                      <span className="text-[11px] font-black text-teal-400 group-hover:translate-x-1 transition-all flex items-center gap-1">
                        Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="sm:col-span-2 rounded-3xl border border-white/[0.05] border-dashed bg-slate-950/20 p-16 text-center flex flex-col items-center justify-center">
                <FolderKanban className="w-12 h-12 text-slate-650 stroke-[1.5] mb-3" />
                <h3 className="text-base font-bold text-white">No active workspaces</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Create a workspace project space to start organizing team tasks and progress metrics.</p>
                {user?.role === 'admin' && (
                  <Button onClick={() => setIsProjectDialogOpen(true)} className="mt-5 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-2xl text-xs font-bold gap-2">
                    <Plus className="w-4 h-4 stroke-[3]" /> Create Project
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* GitHub-Style Activity Feed */}
        <Card className="rounded-3xl border border-white/[0.05] bg-slate-950/30 flex flex-col shadow-2xl overflow-hidden glass-premium">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-white/[0.05] bg-slate-950/20 shrink-0">
            <div>
              <CardTitle className="text-base font-extrabold text-white flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-cyan-400 animate-pulse" /> Activity Stream
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Live workplace update timeline</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-black text-teal-400 bg-teal-500/10 border border-teal-500/20 py-1 px-3 rounded-full tracking-widest shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              Live
            </div>
          </CardHeader>

          <CardContent className="p-5 flex-1 overflow-y-auto max-h-[440px] scrollbar-thin">
            {recentTasks.length > 0 ? (
              <div className="relative space-y-4 pl-6
                before:absolute before:left-[8px] before:top-2 before:bottom-2
                before:w-px before:bg-gradient-to-b before:from-white/10 before:via-white/10 before:to-transparent">
                {recentTasks.map((task, idx) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div key={task._id || idx} className="relative flex gap-3.5 items-start group">
                      {/* Circle Dot */}
                      <div className={`absolute -left-6.5 top-1.5 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0B1120] shadow-md transition-transform group-hover:scale-125 duration-200 ${
                        isCompleted
                          ? 'bg-teal-500 text-slate-950'
                          : task.status === 'in-progress'
                            ? 'bg-violet-500 text-white'
                            : 'bg-slate-700 text-slate-200'
                      }`}>
                        {isCompleted
                          ? <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                          : <Clock className="w-2.5 h-2.5" />
                        }
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 min-w-0 bg-slate-900/35 border border-white/[0.03] p-4 rounded-2xl hover:bg-slate-900/60 hover:border-white/[0.06] transition-all duration-300">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <Link
                            to={`/projects/${task.projectId?._id}`}
                            className="font-extrabold text-white hover:text-teal-400 text-xs transition-colors truncate"
                          >
                            {task.title}
                          </Link>
                          <span className="text-[9px] text-slate-500 font-bold shrink-0">
                            {task.createdAt ? `${formatDistanceToNow(new Date(task.createdAt))} ago` : 'now'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                          {task.description || 'Task backlog item has been initiated.'}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-2.5 border-t border-white/[0.03]">
                          <span className="flex items-center gap-1 text-[10px] text-slate-350 font-bold">
                            <span className="w-4 h-4 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-[9px]">
                              {task.assignedTo?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                            <span>{task.assignedTo?.name || 'Lead Member'}</span>
                          </span>
                          <Badge variant="outline" className={`text-[8px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                              : task.status === 'in-progress'
                                ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                : 'bg-slate-800 text-slate-400'
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
              <div className="py-14 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/[0.05] flex items-center justify-center shadow-inner">
                  <Activity className="w-7 h-7 text-slate-650" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">No activity logged</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tasks lifecycle updates will render in real-time.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 5. Quick Create Project Dialog ─────────────────────────── */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
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
                value={projectFormData.title}
                onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                placeholder="e.g. NextGen Web App Redesign"
                className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] p-3.5 focus:border-teal-500 focus:ring-teal-500/20 shadow-inner text-white placeholder-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-black text-slate-300">Goal Scope & Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={projectFormData.description}
                onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                placeholder="Core parameters and milestones of this workspace..."
                className="text-xs rounded-xl bg-slate-900 border border-white/[0.06] p-3.5 focus:border-teal-500 focus:ring-teal-500/20 shadow-inner resize-none text-white placeholder-slate-500"
              />
            </div>
            <DialogFooter className="pt-4 border-t border-white/[0.05] flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProjectDialogOpen(false)}
                className="rounded-xl text-xs font-semibold bg-transparent border-white/[0.06] text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={projectSubmitting}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black rounded-xl text-xs px-5 shadow-lg shadow-teal-500/10 border-0"
              >
                {projectSubmitting ? 'Creating workspace...' : 'Initialize Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
