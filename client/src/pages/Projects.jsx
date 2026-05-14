import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/projects', formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-surface-400 text-sm mt-1">Manage your team's workspaces</p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-surface-700/50">
          <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">No projects found</h3>
          <p className="text-surface-400 mt-1">Get started by creating a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div key={project._id} className="glass rounded-2xl p-5 border border-surface-700/50 hover:bg-surface-800/40 transition-colors flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
                  {project.title}
                </h3>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-1.5 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete project"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
              
              <p className="text-surface-400 text-sm line-clamp-2 mb-6 flex-1">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-700/50">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member) => (
                    <div 
                      key={member._id} 
                      className="w-7 h-7 rounded-full bg-primary-600 border-2 border-surface-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                      title={member.name}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-surface-700 border-2 border-surface-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                
                <Link
                  to={`/projects/${project._id}`}
                  className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                  View details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-surface-300 mb-1.5">Project Title</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-surface-300 mb-1.5">Description (Optional)</label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none"
              placeholder="Brief description of the project..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-700/50">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-surface-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
