import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Search, ListFilter, SlidersHorizontal, CheckCircle2, Clock, Calendar, ArrowUpRight, LayoutGrid, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, todo, in-progress, completed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, low, medium, high
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // table, grid

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

  // Filter tasks by search query and priority
  const filteredTasks = tasks.filter(t => {
    const matchQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchQuery && matchPriority;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="w-8 h-8 text-emerald-600 stroke-[2.5]" /> Workspace Tasks
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === 'admin' ? 'Review all active tasks across projects.' : 'Track, update, and manage your assigned deliverables.'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shadow-inner self-start sm:self-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('table')} 
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg gap-1.5 ${viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <List className="w-3.5 h-3.5" /> Table
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('grid')} 
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg gap-1.5 ${viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </Button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-100/60 p-4 rounded-2xl border border-slate-200/80">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search tasks by title or specification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white text-xs rounded-xl border-slate-200 shadow-xs focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Select */}
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Priority:</span>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-7 w-[100px] border-0 shadow-none text-xs font-bold text-slate-800 p-0 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Tabs */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl border border-slate-200/80 shadow-inner">
            {['all', 'todo', 'in-progress', 'completed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg capitalize transition-all ${
                  statusFilter === st ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
              >
                {st.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Task List Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 rounded-2xl bg-white shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
            <ClipboardList className="w-8 h-8 text-emerald-600 stroke-[2]" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">No matching tasks found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">Try relaxing your search terms or switch filter criteria to view tasks.</p>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">
                  <TableHead className="px-6 py-4">Task Specification</TableHead>
                  <TableHead className="px-6 py-4">Project</TableHead>
                  <TableHead className="px-6 py-4">Priority</TableHead>
                  <TableHead className="px-6 py-4">Status</TableHead>
                  <TableHead className="px-6 py-4 text-right">Target Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <TableRow key={task._id} className="hover:bg-slate-50/70 transition-colors group">
                    <TableCell className="px-6 py-4 max-w-sm">
                      <p className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{task.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description || 'No additional details.'}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Link to={`/projects/${task.projectId?._id}`} className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-emerald-600 text-xs bg-slate-100 py-1 px-2.5 rounded-lg border border-slate-200/80">
                        {task.projectId?.title || 'Unknown Project'} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className={`text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-2.5 rounded-md ${
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                        task.priority === 'low' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700 border border-red-200 shadow-xs'
                      }`}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task._id, value)}
                        >
                          <SelectTrigger className={`h-8 w-[125px] text-xs font-semibold rounded-lg shadow-xs ${
                            task.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-extrabold' :
                            task.status === 'in-progress' ? 'bg-amber-50 border-amber-200 text-amber-800 font-extrabold' : 'bg-white border-slate-200 text-slate-700'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl">
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={`text-[10px] uppercase font-extrabold tracking-wider py-1 px-3 rounded-full ${
                          task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          task.status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <Card key={task._id} className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 bg-white overflow-hidden relative flex flex-col group">
              <div className={`absolute top-0 left-0 w-full h-1 ${
                task.status === 'completed' ? 'bg-emerald-500' :
                task.status === 'in-progress' ? 'bg-amber-500' : 'bg-slate-300 group-hover:bg-emerald-500 transition-colors'
              }`} />
              <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-start justify-between gap-4">
                <div className="space-y-1 flex-1 pr-2">
                  <Link to={`/projects/${task.projectId?._id}`} className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-emerald-600 text-[11px]">
                    {task.projectId?.title || 'Project'} <ArrowUpRight className="w-3 h-3" />
                  </Link>
                  <CardTitle className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {task.title}
                  </CardTitle>
                </div>
                <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className={`text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-2.5 rounded-md ${
                  task.priority === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                  task.priority === 'low' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700 border border-red-200 shadow-xs'
                }`}>
                  {task.priority}
                </Badge>
              </CardHeader>
              <CardContent className="p-6 flex-1 space-y-4">
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description || 'No detailed specification provided.'}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Due: <span className="text-slate-800 font-bold">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                </div>
              </CardContent>
              <div className="p-6 pt-4 border-t border-slate-100 bg-white flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Workflow Status</span>
                {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                  <Select value={task.status} onValueChange={(value) => handleStatusChange(task._id, value)}>
                    <SelectTrigger className={`h-8 w-[125px] text-xs font-semibold rounded-lg shadow-xs ${
                      task.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-extrabold' :
                      task.status === 'in-progress' ? 'bg-amber-50 border-amber-200 text-amber-800 font-extrabold' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-xs rounded-xl shadow-xl">
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className={`text-[10px] uppercase font-extrabold tracking-wider py-1 px-3 rounded-full ${
                    task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    task.status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {task.status.replace('-', ' ')}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
