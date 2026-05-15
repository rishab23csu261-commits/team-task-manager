import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Layers } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    path: '/projects',
    label: 'Projects',
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    path: '/tasks',
    label: 'Tasks',
    icon: <CheckSquare className="w-5 h-5" />,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">TaskFlow</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 mb-3">Menu</p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info at bottom */}
        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider py-0 px-1.5 h-4">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
