import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import { Search, ClipboardList, Calendar, ArrowUpRight, List, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';

const StatusBadge = ({ status }) => {
  const map = {
    completed:     { cls: 'badge-done',       label: 'DONE'        },
    'in-progress': { cls: 'badge-inprogress', label: 'IN PROGRESS' },
    todo:          { cls: 'badge-todo',        label: 'TODO'        },
  };
  const cfg = map[status] || map.todo;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const map = {
    high:   'badge-high',
    medium: 'badge-medium',
    low:    'badge-low',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${map[priority] || 'badge-low'}`}>
      {priority || 'low'}
    </span>
  );
};

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => { fetchTasks(); }, [statusFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const { data } = await API.get(`/tasks${query}`);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tasks.filter(t => {
    const matchQ = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchP = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchQ && matchP;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32 rounded" />
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-gray-400" /> Tasks
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.role === 'admin' ? 'All workspace tasks' : 'Your assigned tasks'}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 gap-1">
          <button onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'table' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <List className="w-3.5 h-3.5" /> Table
          </button>
          <button onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-600 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 gap-0.5">
            {['all', 'todo', 'in-progress', 'completed'].map(st => (
              <button key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                  statusFilter === st ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {st === 'all' ? 'All' : st.replace('-', ' ')}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400">
            <strong className="text-gray-600">{filtered.length}</strong> of {tasks.length}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="card-light p-16 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-sm font-medium text-gray-500">No tasks found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters.</p>
        </div>
      ) : viewMode === 'table' ? (

        /* TABLE VIEW */
        <div className="card-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(task => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5 max-w-xs">
                      <Link to={`/tasks/${task._id}`}
                        className="font-semibold text-gray-800 hover:text-blue-600 transition-colors truncate block">
                        {task.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/projects/${task.projectId?._id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 bg-gray-100 px-2.5 py-1 rounded-md transition-colors">
                        {task.projectId?.title || 'Unknown'} <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                        <Select value={task.status} onValueChange={v => handleStatusChange(task._id, v)}>
                          <SelectTrigger className="h-7 w-[130px] text-xs font-semibold rounded-lg border-gray-200 bg-white focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 text-xs rounded-lg shadow-lg">
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <StatusBadge status={task.status} />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-gray-400 flex items-center justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(task => (
            <div key={task._id} className="card-light p-5 hover:border-blue-300 hover:shadow-sm transition-all duration-150 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Link to={`/projects/${task.projectId?._id}`}
                  className="text-xs text-gray-400 hover:text-blue-500 font-medium flex items-center gap-1">
                  {task.projectId?.title || 'Project'} <ArrowUpRight className="w-3 h-3" />
                </Link>
                <PriorityBadge priority={task.priority} />
              </div>

              <Link to={`/tasks/${task._id}`}>
                <h4 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {task.title}
                </h4>
              </Link>

              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
                {task.description || 'No description provided.'}
              </p>

              {task.dueDate && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">{task.assignedTo?.name || 'Unassigned'}</span>
                {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                  <Select value={task.status} onValueChange={v => handleStatusChange(task._id, v)}>
                    <SelectTrigger className="h-7 w-[120px] text-xs rounded-lg border-gray-200 bg-white focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-xs rounded-lg shadow-lg">
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={task.status} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
