import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LayoutDashboard, FolderKanban, CheckSquare, LogOut,
  ChevronDown, Settings, UserCircle, ChevronRight,
  PanelLeftClose, PanelLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects',  label: 'Projects',  icon: FolderKanban    },
  { path: '/tasks',     label: 'Tasks',     icon: CheckSquare     },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col transform transition-[width,transform] duration-250 ease-in-out overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: isCollapsed ? '72px' : '240px' }}
      >
        {/* ── Logo / Workspace Header ── */}
        <div className={`flex items-center border-b border-gray-200 h-14 shrink-0 ${
          isCollapsed ? 'justify-center px-0' : 'justify-between px-4'
        }`}>
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Expand"
            >
              <PanelLeft className="w-4.5 h-4.5" />
            </button>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 min-w-0 flex-1 rounded-lg p-1.5 hover:bg-gray-50 transition-colors focus:outline-none group">
                  {/* Logo icon */}
                  <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="2" y="2" width="5" height="5" rx="1"/>
                      <rect x="9" y="2" width="5" height="5" rx="1"/>
                      <rect x="2" y="9" width="5" height="5" rx="1"/>
                      <rect x="9" y="9" width="5" height="5" rx="1"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-gray-900 truncate leading-tight">TaskFlow</p>
                    <p className="text-[10px] text-gray-400 font-medium">1 workspace</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-1 z-50">
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2 py-1.5">
                    Workspaces
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="text-xs font-semibold text-gray-700 flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> TaskFlow Workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                title="Collapse"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5 custom-scrollbar">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pb-2">
              Main Menu
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isOpen && onClose()}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}

          {!isCollapsed && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pt-5 pb-2">
              Account
            </p>
          )}

          <Link
            to="/profile"
            onClick={() => isOpen && onClose()}
            title={isCollapsed ? 'Settings' : undefined}
            className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            } ${location.pathname === '/profile' ? 'bg-blue-50 text-blue-700 font-semibold' : ''}`}
          >
            <Settings className={`w-4 h-4 shrink-0 ${location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-400'}`} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        {/* ── User / Logout ── */}
        <div className={`border-t border-gray-200 p-3 space-y-1 shrink-0 ${isCollapsed ? '' : ''}`}>
          {/* User info */}
          {!isCollapsed && (
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || ''}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
