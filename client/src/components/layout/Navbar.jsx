import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, Bell, Search, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar({ onMenuToggle, theme, onThemeToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Helper to format page title from path
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass-nav shadow-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left: Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="hidden sm:block">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{getPageTitle()}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team Task Manager Workspace</p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, projects..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs rounded-full border border-transparent focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>
        <div className="flex-1 md:hidden" />

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-9 w-9 transition-all duration-300 ease-in-out cursor-pointer relative overflow-hidden"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Sun className="h-4.5 w-4.5 absolute transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="h-4.5 w-4.5 absolute transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-emerald-400" />
            </div>
          </Button>

          <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f172a]" />
          </Button>

          {/* Profile dropdown — logout is a plain button OUTSIDE the portal */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ring-2 ring-slate-200 dark:ring-slate-800 hover:ring-emerald-500 transition-all duration-200">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-emerald-600 text-white font-semibold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-1 text-slate-800 dark:text-slate-200" align="end">
              <DropdownMenuLabel className="font-normal px-2.5 py-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">{user?.name || 'Workspace User'}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{user?.email || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              {/* Logout as a standalone plain button — avoids Base-UI DropdownMenuItem portal crash */}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 cursor-pointer font-medium rounded-lg px-2.5 py-2 my-0.5 transition-colors text-sm"
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
