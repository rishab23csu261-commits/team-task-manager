import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-surface-700/50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Menu button (mobile) */}
        <button
          id="menu-toggle-btn"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="user-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-surface-800/60 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-surface-300">
              {user?.name}
            </span>
            <svg
              className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl glass-light shadow-2xl shadow-black/30 py-2 animate-scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-surface-700/50">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">{user?.email}</p>
              </div>
              <button
                id="logout-btn"
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
