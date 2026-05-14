import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await API.get('/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tasks', value: stats?.stats?.totalTasks || 0, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Completed', value: stats?.stats?.completedTasks || 0, color: 'text-success', bg: 'bg-emerald-500/10' },
    { label: 'In Progress', value: stats?.stats?.inProgressTasks || 0, color: 'text-warning', bg: 'bg-amber-500/10' },
    { label: 'Overdue', value: stats?.stats?.overdueTasks || 0, color: 'text-danger', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-surface-400 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass p-5 rounded-2xl border border-surface-700/50 hover:bg-surface-800/40 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-400">{stat.label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-4">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 glass rounded-2xl border border-surface-700/50 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-surface-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Tasks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-surface-400 uppercase bg-surface-800/40 border-b border-surface-700/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Task Name</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {stats?.recentTasks?.length > 0 ? (
                  stats.recentTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-white">{task.title}</td>
                      <td className="px-5 py-4 text-surface-300">{task.projectId?.title}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          task.status === 'completed' ? 'bg-emerald-500/10 text-success border-emerald-500/20' :
                          task.status === 'in-progress' ? 'bg-amber-500/10 text-warning border-amber-500/20' :
                          'bg-surface-700/50 text-surface-300 border-surface-600/50'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-surface-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-surface-500">
                      No recent tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="glass rounded-2xl border border-surface-700/50 p-5">
          <h2 className="text-lg font-semibold text-white mb-6">Task Status</h2>
          
          <div className="space-y-4">
            {Object.entries(stats?.tasksByStatus || {}).map(([status, count]) => {
              const total = stats?.stats?.totalTasks || 1;
              const percentage = Math.round((count / total) * 100);
              const colorClass = 
                status === 'completed' ? 'bg-emerald-500' :
                status === 'in-progress' ? 'bg-amber-500' : 'bg-surface-500';
              
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-surface-300 capitalize">{status.replace('-', ' ')}</span>
                    <span className="text-white font-medium">{count} <span className="text-surface-500 font-normal">({percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${colorClass} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
