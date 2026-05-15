import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
          <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage tasks assigned to you</p>
        </div>
        
        {/* Filters */}
        <div className="flex bg-muted rounded-lg p-1 border">
          {['all', 'todo', 'in-progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No tasks found matching your filter.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-6 py-3 font-medium">Task</TableHead>
                  <TableHead className="px-6 py-3 font-medium">Project</TableHead>
                  <TableHead className="px-6 py-3 font-medium">Priority</TableHead>
                  <TableHead className="px-6 py-3 font-medium">Status</TableHead>
                  <TableHead className="px-6 py-3 font-medium text-right">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell className="px-6 py-4">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Link to={`/projects/${task.projectId?._id}`} className="text-primary hover:underline font-medium">
                        {task.projectId?.title}
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant={
                        task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'secondary' : 'outline'
                      } className={task.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' : ''}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task._id, value)}
                        >
                          <SelectTrigger className="h-8 w-[130px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm capitalize">{task.status.replace('-', ' ')}</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground text-right whitespace-nowrap">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
