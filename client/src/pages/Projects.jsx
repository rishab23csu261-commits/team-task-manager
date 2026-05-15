import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      setIsDialogOpen(false);
      setFormData({ title: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your team's workspaces</p>
        </div>
        
        {user?.role === 'admin' && (
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">Get started by creating a new project to organize your team's work.</p>
          {user?.role === 'admin' && (
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} className="block group">
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors shadow-sm group-hover:shadow-md">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative">
                  <div>
                    <CardTitle className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                  </div>
                  {user?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(project._id, e)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 -mt-2 -mr-2 absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 border-t flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member) => (
                      <Avatar key={member._id} className="w-7 h-7 border-2 border-background">
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium z-10">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-primary group-hover:underline underline-offset-4">
                    View details &rarr;
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to organize tasks and collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Website Redesign"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the project..."
                className="resize-none"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
