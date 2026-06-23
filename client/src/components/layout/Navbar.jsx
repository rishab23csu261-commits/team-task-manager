import { useAuth } from '../../context/useAuth';
import { Menu, Search, Sun, Moon, LogOut, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onMenuToggle, theme, onThemeToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search bar — center */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-700 placeholder-gray-400 transition-all"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Username */}
        <Link
          to="/profile"
          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors hidden sm:block"
        >
          {user?.name || 'User'}
        </Link>

        {/* Logout button */}
        <button
          onClick={logout}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-all"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
