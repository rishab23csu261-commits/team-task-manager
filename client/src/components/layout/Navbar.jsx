import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Menu, LogOut, Bell, Search, Sun, Moon, UserCog, Sparkles, Command, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    <header className="sticky top-0 z-20 h-16 glass-nav border-b border-white/[0.04]">
      <div className="flex items-center justify-between h-full px-4 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Left: Mobile Menu Trigger & Title / Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden text-slate-350 hover:text-white hover:bg-slate-900 border border-white/[0.04] rounded-xl h-9.5 w-9.5"
          >
            <Menu className="h-4.5 w-4.5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="hidden sm:block space-y-0.5">
            <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> {getPageTitle()}
            </h2>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
              TaskFlow Workspace
            </p>
          </div>
        </div>

        {/* Center: Linear-style Search Input with Cmd+K indicator */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-hover:text-slate-400 transition-colors" />
            <input
              type="text"
              placeholder="Search workspaces, sprints, backlog..."
              className="w-full pl-10 pr-12 py-2 bg-slate-950/60 hover:bg-slate-950 border border-white/[0.05] focus:border-teal-500/50 focus:bg-slate-950 text-xs rounded-2xl focus:outline-none shadow-inner text-slate-200 placeholder-slate-550 transition-all duration-200"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 text-[9px] font-black text-slate-500 bg-slate-900 border border-white/[0.05] px-1.5 py-0.5 rounded-md pointer-events-none">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
        </div>
        <div className="flex-1 md:hidden" />

        {/* Right: Actions (Theme, Notifications, Profile) */}
        <div className="flex items-center gap-2 relative z-50">
          
          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-white/[0.04] rounded-2xl h-9.5 w-9.5 transition-all duration-300 relative overflow-hidden cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Sun className="h-4 w-4 absolute transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="h-4 w-4 absolute transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-teal-400" />
            </div>
          </Button>

          {/* Notifications Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-white/[0.04] rounded-2xl h-9.5 w-9.5"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full focus:outline-none ring-2 ring-white/[0.04] hover:ring-teal-500/40 transition-all duration-200 cursor-pointer">
              <Avatar className="h-9 w-9 border border-white/[0.05] shadow-md">
                <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black text-xs uppercase">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-slate-950 border border-white/[0.08] text-slate-200 shadow-2xl rounded-2xl p-1.5 z-50 mt-1"
              align="end"
            >
              <DropdownMenuLabel className="font-normal px-2.5 py-2.5">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-xs font-black text-white leading-none tracking-tight">{user?.name || 'Workspace Lead'}</p>
                  <p className="text-[10px] text-slate-500 leading-none">{user?.email || 'team@workspace.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.04]" />
              <div className="py-2 px-2.5 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-black flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Account Type
                </span>
                <Badge variant="outline" className="border-teal-500/20 bg-teal-500/10 text-teal-400 text-[8px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider">
                  {user?.role || 'Member'}
                </Badge>
              </div>
              <DropdownMenuSeparator className="bg-white/[0.04]" />
              <Link
                to="/profile"
                className="w-full flex items-center gap-2.5 text-slate-300 hover:bg-slate-900 hover:text-white cursor-pointer font-bold rounded-xl px-2.5 py-2.5 my-0.5 transition-colors text-xs"
              >
                <UserCog className="h-4 w-4 text-teal-400" />
                <span>Profile Settings</span>
              </Link>
              <DropdownMenuSeparator className="bg-white/[0.04]" />
              {/* Clean Logout Trigger */}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2.5 text-rose-450 hover:bg-rose-500/10 hover:text-rose-350 cursor-pointer font-bold rounded-xl px-2.5 py-2.5 my-0.5 transition-colors text-xs"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out of Space</span>
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
