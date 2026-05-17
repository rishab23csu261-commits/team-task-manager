import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Layers, LogOut, ChevronRight, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />,
  },
  {
    path: '/projects',
    label: 'Projects',
    icon: <FolderKanban className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />,
  },
  {
    path: '/tasks',
    label: 'Tasks',
    icon: <CheckSquare className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-[#022c22] via-[#043e31] to-[#022c22] text-slate-100 border-r border-[#065f46] transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[#065f46]/70 bg-black/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#34d399] flex items-center justify-center shadow-lg shadow-[#10b981]/20">
            <Layers className="w-5 h-5 text-[#022c22] stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-[#6ee7b7] bg-clip-text text-transparent tracking-tight">TaskFlow</h1>
            <span className="text-[10px] uppercase font-semibold text-[#6ee7b7]/80 tracking-widest block -mt-1">Workspace</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-6 flex-1 space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-[#6ee7b7]/60 font-semibold px-3 mb-3">Core Navigation</p>
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-lg shadow-[#059669]/30 font-semibold translate-x-1'
                        : 'text-slate-300 hover:text-white hover:bg-[#065f46]/50 hover:translate-x-0.5'
                    }`
                  }
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info at bottom with dropdown */}
        <div className="p-4 border-t border-[#065f46]/70 bg-black/15 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#065f46]/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#10b981]">
              <Avatar className="h-10 w-10 ring-2 ring-[#10b981]/30">
                <AvatarFallback className="bg-gradient-to-tr from-[#10b981] to-[#34d399] text-[#022c22] font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                <p className="text-xs truncate text-[#6ee7b7]/80">{user?.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6ee7b7]/60 ml-auto" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#043e31] border-[#065f46] text-slate-100 shadow-2xl" align="end" side="right" sideOffset={12}>
              <DropdownMenuLabel className="font-normal border-b border-[#065f46] pb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-white leading-none">{user?.name}</p>
                  <p className="text-xs text-[#6ee7b7]/80 leading-none">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <div className="py-1">
                <div className="px-2 py-1.5 flex items-center gap-2 text-xs text-[#6ee7b7]">
                  <Badge variant="outline" className="border-[#10b981] text-[#10b981] text-[10px] uppercase font-bold tracking-wider">
                    {user?.role || 'Member'}
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-[#065f46]" />
              <DropdownMenuItem onClick={logout} className="text-red-400 focus:bg-red-500/20 focus:text-red-300 cursor-pointer font-medium rounded-lg m-1">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
