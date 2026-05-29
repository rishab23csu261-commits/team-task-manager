import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Layers, LogOut, ChevronRight,
  PanelLeftClose, PanelLeft, Shield, UserCircle, Settings,
  MessageSquare, ChevronDown
} from 'lucide-react';
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
    icon: <LayoutDashboard className="w-4 h-4 transition-transform group-hover:scale-105 duration-200" />,
  },
  {
    path: '/projects',
    label: 'Projects',
    icon: <FolderKanban className="w-4 h-4 transition-transform group-hover:scale-105 duration-200" />,
  },
  {
    path: '/tasks',
    label: 'Tasks',
    icon: <CheckSquare className="w-4 h-4 transition-transform group-hover:scale-105 duration-200" />,
  },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <TooltipProvider delay={100}>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-35 lg:hidden transition-opacity duration-300 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#0B1120]/95 backdrop-blur-md text-slate-200 border-r border-white/[0.04] transform transition-[width,transform] duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: 'var(--sidebar-width)' }}
      >
        {/* Workspace Switcher & Brand Header (Linear Style) */}
        <div className={`flex items-center border-b border-white/[0.04] shrink-0 ${isCollapsed ? 'justify-center px-0 h-16' : 'justify-between px-4 h-16'}`}>
          {isCollapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-white/[0.03] transition-all duration-200 focus:outline-none"
              title="Expand Sidebar"
            >
              <PanelLeft className="w-5 h-5 text-teal-400 animate-pulse" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Switcher trigger */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 text-left p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-white/[0.04] transition-all max-w-[190px] focus:outline-none group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/10 shrink-0">
                      <Layers className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h2 className="text-xs font-black text-white tracking-tight truncate leading-tight group-hover:text-teal-400 transition-colors">
                        TaskFlow Workspace
                      </h2>
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block truncate">
                        SaaS Team
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 group-hover:text-slate-350 transition-colors ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52 bg-slate-950 border border-white/[0.08] text-slate-200 shadow-2xl rounded-2xl p-1.5 z-50">
                    <DropdownMenuLabel className="text-[10px] uppercase font-extrabold text-slate-500 tracking-widest px-2.5 py-1.5">
                      Switch Workspaces
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2 px-2.5 text-xs text-slate-200 focus:bg-slate-900 focus:text-white cursor-pointer font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> TaskFlow Workspace
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2 px-2.5 text-xs text-slate-400 focus:bg-slate-900 focus:text-white cursor-pointer font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Engineering Lab
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2 px-2.5 text-xs text-slate-400 focus:bg-slate-900 focus:text-white cursor-pointer font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Design Sprint
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Toggle Button */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center w-7.5 h-7.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent hover:border-white/[0.04] transition-colors focus:outline-none shrink-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4.5 h-4.5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Routes Section */}
        <nav className="px-3 py-6 flex-1 space-y-7 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="space-y-1">
            {!isCollapsed ? (
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold px-3 shrink-0 animate-fade-in mb-3">
                Workspace
              </p>
            ) : (
              <div className="h-px border-b border-white/[0.04] w-6 mx-auto mb-4 shrink-0" />
            )}

            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);

                const linkContent = (
                  <NavLink
                    to={item.path}
                    onClick={() => { if (isOpen) onClose(); }}
                    className={`group flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs font-bold transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? 'bg-slate-900 text-teal-400 border border-white/[0.04] shadow-md translate-x-0.5'
                        : 'text-slate-400 hover:text-white hover:bg-slate-950'
                    } ${isCollapsed ? 'justify-center px-0 translate-x-0 hover:translate-x-0' : ''}`}
                  >
                    {/* Active accent bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-teal-500" />
                    )}
                    <span className="relative z-10 shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="flex-1 truncate relative z-10 font-semibold">{item.label}</span>}
                    {isActive && !isCollapsed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping absolute right-3" />
                    )}
                  </NavLink>
                );

                if (isCollapsed) {
                  return (
                    <li key={item.path}>
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12} className="bg-slate-950 border border-white/[0.08] text-white font-black text-[10px] py-1.5 px-3.5 rounded-xl shadow-2xl z-50 tracking-wide uppercase">
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

          {/* Secondary Quick Access Links (Linear Look) */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold px-3 shrink-0 animate-fade-in mb-3">
                Team Access
              </p>
            ) : (
              <div className="h-px border-b border-white/[0.04] w-6 mx-auto mb-4 shrink-0" />
            )}

            <ul className="space-y-1">
              <li>
                <Link
                  to="/profile"
                  className={`group flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-950 ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Settings className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-white transition-colors" />
                  {!isCollapsed && <span className="flex-1 truncate">Workspace Settings</span>}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className={`group flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-950 ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-white transition-colors" />
                  {!isCollapsed && <span className="flex-1 truncate">Workspace Chat</span>}
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* User Account / Profile Section (Minimalist & Modern) */}
        <div className="p-3 border-t border-white/[0.04] bg-slate-950/20 shrink-0 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`w-full flex items-center p-2 rounded-2xl hover:bg-slate-900 border border-transparent hover:border-white/[0.04] transition-all duration-200 focus:outline-none group ${
                isCollapsed ? 'justify-center' : 'gap-3.5'
              }`}
            >
              <Avatar className="h-9 w-9 border border-white/[0.08] shadow-md shrink-0">
                <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black text-sm uppercase">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left animate-fade-in transition-opacity duration-200">
                    <p className="text-xs font-black truncate text-white tracking-tight">{user?.name || 'Workspace Lead'}</p>
                    <p className="text-[10px] truncate text-slate-500 font-semibold">{user?.email || 'team@workspace.com'}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56 bg-slate-950 border border-white/[0.08] text-slate-200 shadow-2xl rounded-2xl p-1.5 z-50"
              align="end"
              side="right"
              sideOffset={16}
            >
              <DropdownMenuLabel className="font-normal border-b border-white/[0.04] pb-3 mb-1 px-2.5 pt-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-xs font-black text-white leading-none tracking-tight">{user?.name || 'Workspace Lead'}</p>
                  <p className="text-[10px] text-slate-500 leading-none">{user?.email || 'team@workspace.com'}</p>
                </div>
              </DropdownMenuLabel>
              <div className="py-2 px-2.5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 uppercase tracking-wide">
                  <Shield className="w-3.5 h-3.5 text-teal-400" /> Account Role
                </span>
                <Badge variant="outline" className="border-teal-500/20 bg-teal-500/10 text-teal-400 text-[8px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider">
                  {user?.role || 'Member'}
                </Badge>
              </div>
              <div className="border-t border-white/[0.04] mt-1.5 pt-1.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors font-bold"
                >
                  <UserCircle className="w-4 h-4 text-teal-400" />
                  Profile Configuration
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clean Logout Button */}
          <button
            type="button"
            onClick={logout}
            className={`mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 border border-transparent hover:border-rose-550/10 transition-all duration-200 font-bold text-xs ${
              isCollapsed ? 'justify-center font-normal' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout of Workspace</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
