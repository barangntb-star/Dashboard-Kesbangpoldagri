import React from 'react';
import { Sun, Moon, RefreshCw, Database, CloudLightning, ShieldAlert, Calendar } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  userRole: UserRole;
  userName: string;
  useMock: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

export default function Navbar({ userRole, userName, useMock, onSync, isSyncing }: NavbarProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    // Set theme on mount from system preference or localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Dynamic clock formatted as WITA (UTC+8) or standard local time for NTB
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      // For Indonesia, standard Indonesian locale is id-ID
      setCurrentTime(new Date().toLocaleDateString('id-ID', options));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Title / Info (hidden on extreme small screen, padded on mobile because of absolute sidebar button) */}
      <div className="flex items-center gap-2 pl-12 lg:pl-0">
        <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400 hidden sm:block" />
        <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block truncate">
          {currentTime || 'Memuat waktu...'}
        </span>
      </div>

      {/* Database connection indicators & Profile control */}
      <div className="flex items-center gap-3">
        {/* Connection status badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          useMock 
            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40' 
            : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
        }`}>
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Mode Database:</span>
          <span className="font-bold uppercase tracking-wider">{useMock ? 'Mock Lokal' : 'Google Sheets'}</span>
        </div>

        {/* Sync trigger button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className={`flex items-center justify-center p-2 rounded-xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:text-teal-600 dark:hover:text-teal-400 border border-gray-100 dark:border-slate-700/60 transition-all ${
            isSyncing ? 'animate-spin text-teal-600' : ''
          }`}
          title="Sinkronisasi Data"
          id="btn-sync"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>

        {/* Theme mode button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 rounded-xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 border border-gray-100 dark:border-slate-700/60 transition-all"
          title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
          id="btn-theme-toggle"
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Vertical divider */}
        <div className="h-8 w-px bg-gray-100 dark:bg-slate-800 mx-1"></div>

        {/* User Identity Display */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
              {userName}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Bidang: {userRole === 'Administrator' ? 'Kesbangpol NTB' : 'Operator Ormas'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
