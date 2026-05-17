import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Helper to format page title from path
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left: Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden text-slate-700 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="hidden sm:block">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">{getPageTitle()}</h2>
            <p className="text-xs text-slate-500 font-medium">Team Task Manager Workspace</p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, projects..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs rounded-full border border-transparent focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
        <div className="flex-1 md:hidden" />

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </Button>

          {/* Profile dropdown — logout is a plain button OUTSIDE the portal */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ring-2 ring-slate-200 hover:ring-emerald-500 transition-all duration-200">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-emerald-600 text-white font-semibold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border-slate-200 shadow-xl rounded-xl p-1 text-slate-800" align="end">
              <DropdownMenuLabel className="font-normal px-2.5 py-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold leading-none text-slate-900">{user?.name || 'Workspace User'}</p>
                  <p className="text-xs leading-none text-slate-500">{user?.email || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              {/* Logout as a standalone plain button — avoids Base-UI DropdownMenuItem portal crash */}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer font-medium rounded-lg px-2.5 py-2 my-0.5 transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
