import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });

  // Member Modal state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?projectId=${id}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);

      if (user?.role === 'admin') {
        const usersRes = await API.get(`/projects/${id}/available-members`);
        setAvailableUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...taskForm, projectId: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;

      await API.post('/tasks', payload);
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      const updatedMembers = [...project.members.map(m => m._id), selectedUser];
      await API.put(`/projects/${id}`, { members: updatedMembers });
      setIsMemberModalOpen(false);
      setSelectedUser('');
      fetchData();
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-surface-400 text-center py-12">Project not found or access denied.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="glass rounded-2xl p-6 border border-surface-700/50">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link to="/projects" className="text-surface-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">{project.title}</h1>
            </div>
            <p className="text-surface-300 text-sm ml-8">{project.description || 'No description'}</p>
          </div>
          
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-white text-sm font-medium rounded-lg transition-colors border border-surface-600"
              >
                + Member
              </button>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Task
              </button>
            </div>
          )}
        </div>
        
        {/* Members List */}
        <div className="ml-8 mt-6">
          <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Team Members</h3>
          <div className="flex flex-wrap gap-2">
            {project.members.map(member => (
              <div key={member._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50">
                <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-surface-200">{member.name}</span>
              </div>
            ))}
            {project.members.length === 0 && <span className="text-sm text-surface-500">No members added yet.</span>}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <h2 className="text-lg font-semibold text-white mt-8 mb-4">Project Tasks</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanban Columns */}
        {['todo', 'in-progress', 'completed'].map(status => (
          <div key={status} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
                {status.replace('-', ' ')}
              </h3>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface-800 text-surface-400">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task._id} className="glass rounded-xl p-4 border border-surface-700/50 hover:border-surface-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white text-sm">{task.title}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    task.priority === 'high' ? 'bg-red-500/10 text-danger border border-red-500/20' :
                    task.priority === 'medium' ? 'bg-amber-500/10 text-warning border border-amber-500/20' :
                    'bg-emerald-500/10 text-success border border-emerald-500/20'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs text-surface-400 mb-4 line-clamp-2">{task.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignedTo.name}`}>
                        <div className="w-5 h-5 rounded-full bg-surface-700 flex items-center justify-center text-[9px] font-bold text-white">
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-surface-300 truncate max-w-[80px]">{task.assignedTo.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-surface-500 italic">Unassigned</span>
                    )}
                  </div>
                  
                  {/* Status update dropdown (if user can update) */}
                  {(user?.role === 'admin' || task.assignedTo?._id === user?._id) && (
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusUpdate(task._id, e.target.value)}
                      className="bg-surface-800 text-surface-200 text-xs rounded border border-surface-700 px-1 py-0.5 focus:outline-none focus:border-primary-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
            
            {tasks.filter(t => t.status === status).length === 0 && (
              <div className="glass-light rounded-xl p-4 border border-surface-700/30 border-dashed text-center">
                <p className="text-xs text-surface-500">No tasks in this column</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Title</label>
            <input required type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Description</label>
            <textarea rows={2} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Status</label>
              <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Assign To</label>
              <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm">
                <option value="">Unassigned</option>
                {project.members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-surface-700/50">
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-sm text-surface-300 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-500">Create Task</button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Select User</label>
            {availableUsers.length > 0 ? (
              <select required value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm">
                <option value="">-- Choose User --</option>
                {availableUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-surface-400">All users are already in this project.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-surface-700/50">
            <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 text-sm text-surface-300 hover:text-white">Cancel</button>
            <button type="submit" disabled={!selectedUser} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-500 disabled:opacity-50">Add Member</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
