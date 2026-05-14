import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, todo, in-progress, completed

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const query = filter !== 'all' ? `?status=${filter}` : '';
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
      fetchTasks(); // Refresh
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Tasks</h1>
          <p className="text-surface-400 text-sm mt-1">View and manage tasks assigned to you</p>
        </div>
        
        {/* Filters */}
        <div className="flex bg-surface-900 border border-surface-700/50 rounded-lg p-1">
          {['all', 'todo', 'in-progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                filter === f ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-surface-700/50">
          <p className="text-surface-400">No tasks found matching your filter.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-surface-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-surface-400 uppercase bg-surface-800/40 border-b border-surface-700/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Task</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="text-xs text-surface-400 mt-0.5 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/projects/${task.projectId?._id}`} className="text-primary-400 hover:underline">
                        {task.projectId?.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        task.priority === 'high' ? 'bg-red-500/10 text-danger border border-red-500/20' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-warning border border-amber-500/20' :
                        'bg-emerald-500/10 text-success border border-emerald-500/20'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="bg-surface-800 text-surface-200 text-xs rounded border border-surface-700 px-2 py-1 focus:outline-none focus:border-primary-500"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className="text-xs text-surface-300 capitalize">{task.status.replace('-', ' ')}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-surface-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
