import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { LayoutDashboard, FolderKanban, CheckSquare, Layers, LogOut, ChevronRight, PanelLeftClose, PanelLeft, Shield, UserCircle } from 'lucide-react';
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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

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

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <TooltipProvider delay={100}>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-[#022c22] via-[#043e31] to-[#022c22] text-slate-100 border-r border-[#065f46] transform transition-[width,transform] duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: 'var(--sidebar-width)' }}
      >
        {/* Branding & Collapse Toggle Section */}
        <div className={`flex items-center border-b border-[#065f46]/70 bg-black/15 shrink-0 ${isCollapsed ? 'justify-center px-0 h-16' : 'justify-between px-5 h-16'}`}>
          {isCollapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-white hover:bg-[#065f46]/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Expand Sidebar"
            >
              <PanelLeft className="w-5.5 h-5.5 text-emerald-400 animate-pulse" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                  <Layers className="w-5 h-5 text-[#022c22] stroke-[2.5]" />
                </div>
                <div className="min-w-0 animate-fade-in transition-opacity duration-200">
                  <h1 className="text-xl font-black bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent tracking-tight truncate">
                    TaskFlow<span className="text-emerald-400">.</span>
                  </h1>
                  <span className="text-[10px] uppercase font-extrabold text-emerald-400/80 tracking-widest block -mt-1 truncate">
                    SaaS Workspace
                  </span>
                </div>
              </div>

              {/* Desktop Expand/Collapse Button */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-[#065f46]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0 ml-1"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="px-3.5 py-6 flex-1 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="space-y-2">
            {!isCollapsed ? (
              <p className="text-[11px] uppercase tracking-wider text-emerald-400/70 font-extrabold px-3 shrink-0 animate-fade-in">
                Core Workspace
              </p>
            ) : (
              <div className="h-4 border-b border-emerald-500/20 w-8 mx-auto mb-4 shrink-0" />
            )}

            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);

                const linkContent = (
                  <NavLink
                    to={item.path}
                    onClick={() => { if (isOpen) onClose(); }}
                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20 translate-x-1 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-[#065f46]/50 hover:translate-x-0.5'
                    } ${isCollapsed ? 'justify-center px-0 translate-x-0 hover:translate-x-0' : ''}`}
                  >
                    <span className="relative z-10 shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="flex-1 truncate relative z-10">{item.label}</span>}
                    {isActive && !isCollapsed && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-emerald-300 animate-pulse" />
                    )}
                  </NavLink>
                );

                if (isCollapsed) {
                  return (
                    <li key={item.path}>
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12} className="bg-slate-900 border-slate-800 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-2xl z-50">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }

                return <li key={item.path}>{linkContent}</li>;
              })}
            </ul>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-3 border-t border-[#065f46]/70 bg-black/20 shrink-0 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`w-full flex items-center p-2 rounded-2xl hover:bg-[#065f46]/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 group ${
                isCollapsed ? 'justify-center' : 'gap-3'
              }`}
            >
              <Avatar className="h-10 w-10 ring-2 ring-emerald-500/40 group-hover:ring-emerald-400 transition-all shadow-md shrink-0">
                <AvatarFallback className="bg-gradient-to-tr from-emerald-400 to-teal-600 text-[#022c22] font-black text-sm uppercase">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left animate-fade-in transition-opacity duration-200">
                    <p className="text-sm font-extrabold truncate text-white">{user?.name || 'Workspace User'}</p>
                    <p className="text-[11px] truncate text-emerald-400/80 font-medium">{user?.email || 'team@workspace.com'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400/60 shrink-0 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-60 bg-[#043e31] border-[#065f46] text-slate-100 shadow-2xl rounded-2xl p-2 z-50"
              align="end"
              side="right"
              sideOffset={16}
            >
              <DropdownMenuLabel className="font-normal border-b border-[#065f46] pb-3 mb-1 px-2 pt-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black text-white leading-none">{user?.name || 'Workspace User'}</p>
                  <p className="text-xs text-emerald-300/80 leading-none">{user?.email || 'team@workspace.com'}</p>
                </div>
              </DropdownMenuLabel>
              <div className="py-1.5 px-2 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Role
                </span>
                <Badge variant="outline" className="border-emerald-500 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider">
                  {user?.role || 'Member'}
                </Badge>
              </div>
              <div className="border-t border-[#065f46] mt-1 pt-1">
                <Link
                  to="/profile"
                  onClick={() => { if (isOpen) onClose(); }}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#065f46]/60 transition-colors font-bold"
                >
                  <UserCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Profile Settings
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout button lives OUTSIDE the dropdown portal to avoid Base-UI portal crash */}
          <button
            type="button"
            onClick={logout}
            className={`mt-1.5 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-all duration-200 font-bold text-xs ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign out of Workspace</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
