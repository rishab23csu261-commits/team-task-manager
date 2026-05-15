import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, AlertCircle, Loader2, UserCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signup(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8 relative overflow-hidden">
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4 shadow-lg shadow-primary/20">
            <Layers className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
        </div>

        {/* Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Get started</CardTitle>
            <CardDescription className="text-center">
              Join your team and start collaborating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={formData.role === 'member' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, role: 'member' })}
                    className="h-auto py-3 px-4 flex flex-col items-center gap-2"
                  >
                    <UserCircle className="w-5 h-5" />
                    Member
                  </Button>
                  <Button
                    type="button"
                    variant={formData.role === 'admin' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className="h-auto py-3 px-4 flex flex-col items-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    Admin
                  </Button>
                </div>
              </div>

              <Button
                id="signup-submit-btn"
                type="submit"
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t p-6 pb-6 mt-4">
            <p className="text-center text-sm text-muted-foreground w-full">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/90 font-medium underline-offset-4 hover:underline transition-colors">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
