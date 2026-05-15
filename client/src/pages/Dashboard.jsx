import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tasks', value: stats?.stats?.totalTasks || 0, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Completed', value: stats?.stats?.completedTasks || 0, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'In Progress', value: stats?.stats?.inProgressTasks || 0, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Overdue', value: stats?.stats?.overdueTasks || 0, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:bg-muted/50 transition-colors shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-6 py-3 font-medium">Task Name</TableHead>
                  <TableHead className="px-6 py-3 font-medium">Project</TableHead>
                  <TableHead className="px-6 py-3 font-medium">Status</TableHead>
                  <TableHead className="px-6 py-3 font-medium text-right">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentTasks?.length > 0 ? (
                  stats.recentTasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell className="px-6 py-4 font-medium">{task.title}</TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">{task.projectId?.title}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in-progress' ? 'secondary' : 'outline'
                        } className={
                          task.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
                        }>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground text-right">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No recent tasks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Task Breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {Object.entries(stats?.tasksByStatus || {}).map(([status, count]) => {
                const total = stats?.stats?.totalTasks || 1;
                const percentage = Math.round((count / total) * 100);
                const colorClass = 
                  status === 'completed' ? 'bg-emerald-500' :
                  status === 'in-progress' ? 'bg-amber-500' : 'bg-muted-foreground/50';
                
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground capitalize font-medium">{status.replace('-', ' ')}</span>
                      <span className="font-semibold">{count} <span className="text-muted-foreground font-normal">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
