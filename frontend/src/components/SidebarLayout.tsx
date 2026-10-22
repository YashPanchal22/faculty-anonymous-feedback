import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  Bell,
  CheckCircle,
  HelpCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { useState, ReactNode, useEffect } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface SidebarLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle: string;
}

export default function SidebarLayout({ children, navItems, title, subtitle }: SidebarLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enterprise Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Institutional Branding */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-indigo-600/25">
              🎓
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                Apex University
              </h1>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                {title}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Academic Session Ribbon */}
        <div className="mx-4 mt-3 px-3 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold">
            <Calendar size={13} />
            <span>AY 2024–25</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Term
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Identity & Utility Bar */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
            >
              {dark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
              <span>{dark ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Execution View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Global Institutional Topbar */}
        <header className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={18} />
            </button>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                {title}
              </h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {subtitle} • {currentDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
              <ShieldCheck size={12} />
              <span>Identity Protection: Active</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
              >
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900"></span>
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Institutional Notices</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">Live Feed</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 space-y-0.5">
                      <p className="font-bold">Term-End Course Evaluations</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">All submissions are strictly confidential under university anti-identity policies.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 space-y-0.5">
                      <p className="font-bold">IQAC Quality Audit</p>
                      <p className="text-[11px] text-slate-400">NAAC benchmark reporting active for current academic term.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 dark:bg-slate-950/60">
          {children}
        </main>
      </div>

    </div>
  );
}
