import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import {
  ClipboardList, Search, SlidersHorizontal, CheckCircle2,
  Clock, Calendar, ArrowUpRight, LayoutGrid, List, Sparkles,
  AlertCircle, Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '@/components/ui/table';

const statusConfig = {
  completed:    { label: 'Completed',   color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',    dot: 'bg-teal-400'    },
  'in-progress':{ label: 'In Progress', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', dot: 'bg-violet-400' },
  todo:         { label: 'To Do',       color: 'bg-slate-800 text-slate-400 border-white/[0.06]',     dot: 'bg-slate-500'   },
};

const priorityConfig = {
  high:   { label: 'High',   color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'    },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low:    { label: 'Low',    color: 'bg-slate-800 text-slate-400 border-white/[0.06]'    },
};

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const { data } = await API.get(`/tasks${query}`);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchQuery && matchPriority;
  });

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
        <Skeleton className="h-12 w-full rounded-2xl bg-slate-800/40" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-800/40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 font-sans">

      {/* ── 1. Hero Header ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl glow-teal">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Workspace Tasks
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-violet-400 stroke-[2] shrink-0" /> Tasks
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            {user?.role === 'admin'
              ? 'Monitor and manage all active deliverables across workspace projects.'
              : 'Track, update, and manage your assigned deliverables and sprint targets.'}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/[0.05] shadow-inner self-start sm:self-center gap-1 shrink-0 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-slate-800 text-teal-400 shadow-md border border-white/[0.05]'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Table
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-teal-400 shadow-md border border-white/[0.05]'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </Button>
        </div>
      </div>

      {/* ── 2. Filter Toolbar ─────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-3xl border border-white/[0.04] backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/[0.05] focus:border-teal-500/50 focus:bg-slate-950 text-xs rounded-2xl text-slate-200 placeholder-slate-500 shadow-inner focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-white/[0.05] shadow-inner">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold text-slate-500">Priority:</span>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-7 w-[110px] border-0 shadow-none text-xs font-bold text-slate-200 p-0 focus:ring-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border border-white/[0.08] text-xs rounded-2xl shadow-2xl text-slate-200">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status tab pills */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-white/[0.05] shadow-inner">
            {['all', 'todo', 'in-progress', 'completed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-slate-800 text-teal-400 shadow-md border border-white/[0.05]'
                    : 'text-slate-500 hover:text-slate-200 font-semibold'
                }`}
              >
                {st === 'all' ? 'All' : st.replace('-', ' ')}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 font-bold px-1 hidden lg:block">
            <strong className="text-white">{filteredTasks.length}</strong> of <strong className="text-slate-400">{tasks.length}</strong> tasks
          </span>
        </div>
      </div>

      {/* ── 3. Main Task List ─────────────────────────────────────── */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/[0.06] bg-slate-950/20">
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <ClipboardList className="w-8 h-8 text-violet-400 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-white">No matching tasks found</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            Try relaxing your search terms or adjusting your filter criteria.
          </p>
        </div>
      ) : viewMode === 'table' ? (

        /* ── TABLE VIEW ── */
        <div className="rounded-3xl border border-white/[0.05] overflow-hidden shadow-2xl glass-premium">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-950/60 border-b border-white/[0.05] hover:bg-transparent">
                  <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate-500">Task</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate-500">Project</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate-500">Priority</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate-500">Status</TableHead>
                  <TableHead className="px-6 py-4 text-right text-[10px] uppercase tracking-widest font-extrabold text-slate-500">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task, idx) => {
                  const sc = statusConfig[task.status] || statusConfig.todo;
                  const pc = priorityConfig[task.priority] || priorityConfig.low;
                  return (
                    <TableRow
                      key={task._id}
                      className={`border-b border-white/[0.03] hover:bg-slate-900/40 transition-colors group ${
                        idx % 2 === 0 ? 'bg-slate-950/20' : 'bg-slate-950/10'
                      }`}
                    >
                      <TableCell className="px-6 py-4 max-w-xs">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="font-extrabold text-white text-sm group-hover:text-teal-400 transition-colors hover:underline underline-offset-2 line-clamp-1"
                        >
                          {task.title}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{task.description || 'No additional details.'}</p>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <Link
                          to={`/projects/${task.projectId?._id}`}
                          className="inline-flex items-center gap-1 font-bold text-slate-400 hover:text-teal-400 text-[11px] bg-slate-900/60 py-1 px-2.5 rounded-lg border border-white/[0.04] transition-colors"
                        >
                          {task.projectId?.title || 'Unknown'} <ArrowUpRight className="w-3 h-3 text-slate-600" />
                        </Link>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${pc.color}`}>
                          {task.priority || 'low'}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                          <Select value={task.status} onValueChange={(value) => handleStatusChange(task._id, value)}>
                            <SelectTrigger className={`h-8 w-[130px] text-[11px] font-bold rounded-xl border shadow-inner focus:ring-0 ${sc.color}`}>
                              <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                <SelectValue />
                              </span>
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border border-white/[0.08] text-xs rounded-2xl shadow-2xl text-slate-200">
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className={`text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full ${sc.color}`}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'No due date'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

      ) : (

        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map(task => {
            const sc = statusConfig[task.status] || statusConfig.todo;
            const pc = priorityConfig[task.priority] || priorityConfig.low;
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in-progress';

            return (
              <div
                key={task._id}
                className="group relative flex flex-col bg-slate-950/40 rounded-3xl border border-white/[0.05] shadow-xl hover:shadow-2xl hover:border-teal-500/30 hover:bg-slate-900/30 transition-all duration-300 overflow-hidden"
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 w-full h-[3px] ${
                  isCompleted ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
                    : isInProgress ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                    : 'bg-gradient-to-r from-slate-700 to-slate-600 group-hover:from-teal-500 group-hover:to-cyan-500 transition-all duration-300'
                }`} />

                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/[0.04] bg-slate-950/20 flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 pr-2">
                    <Link
                      to={`/projects/${task.projectId?._id}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-teal-400 transition-colors"
                    >
                      {task.projectId?.title || 'Project'} <ArrowUpRight className="w-3 h-3" />
                    </Link>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                      <Link to={`/tasks/${task._id}`} className="hover:underline underline-offset-2">
                        {task.title}
                      </Link>
                    </h4>
                  </div>
                  <Badge variant="outline" className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full shrink-0 ${pc.color}`}>
                    {task.priority || 'low'}
                  </Badge>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 space-y-4">
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {task.description || 'No detailed specification provided.'}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-950 p-2.5 rounded-xl border border-white/[0.03]">
                    <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                    Due: <span className="text-slate-300 font-extrabold">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                    </span>
                  </div>

                  {task.assignedTo?.name && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                      <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-[10px] border border-teal-500/20 shrink-0">
                        {task.assignedTo.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-slate-400">{task.assignedTo.name}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-white/[0.04] bg-slate-950/20 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status</span>
                  {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                    <Select value={task.status} onValueChange={(value) => handleStatusChange(task._id, value)}>
                      <SelectTrigger className={`h-8 w-[130px] text-[11px] font-bold rounded-xl border shadow-inner focus:ring-0 ${sc.color}`}>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          <SelectValue />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border border-white/[0.08] text-xs rounded-2xl shadow-2xl text-slate-200">
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className={`text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1.5 inline-block`} />
                      {task.status.replace('-', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
