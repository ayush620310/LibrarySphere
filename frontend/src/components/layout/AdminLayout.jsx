import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Armchair, Clock, BookOpen, Bell,
  Settings, LogOut, Menu, X, Sun, Moon, Monitor, ChevronRight,
  IndianRupee, Library, ExternalLink, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
  { to: '/admin/members', icon: Users, label: 'Members', badge: null },
  { to: '/admin/seats', icon: Armchair, label: 'Seats & Layout', badge: null },
  { to: '/admin/slots', icon: Clock, label: 'Time Shifts', badge: null },
  { to: '/admin/fees', icon: IndianRupee, label: 'Fee Collection', badge: null },
  { to: '/admin/notices', icon: Bell, label: 'Announcements', badge: null },
  { to: '/admin/library', icon: Library, label: 'Library Profile', badge: null },
];

const ThemeToggle = ({ theme, setTheme }) => {
  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-surface-800/90 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={`Switch to ${label} mode`}
          className={`p-1.5 rounded-lg transition-all duration-150 ${
            theme === value
              ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const currentRouteName = navItems.find(i => i.to === location.pathname)?.label || 
    (location.pathname.includes('/admin/settings') ? 'Account Settings' : 'Admin Portal');

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-surface-900 border-r border-slate-200/80 dark:border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-primary-500 flex items-center justify-center shadow-glow-sm shadow-primary-500/20 text-white">
              <BookOpen size={20} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-900" title="Online" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                LibraryOS
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-md border border-primary-200/60 dark:border-primary-800/60">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] font-medium">
              {admin?.name || "Library Owner"}
            </p>
          </div>
        </div>
        {sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-3">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Management
        </p>
        <nav className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/10 to-indigo-500/5 text-primary-600 dark:text-primary-400 border border-primary-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-surface-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 shadow-glow" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Secondary & Account Navigation */}
      <div className="mt-auto px-3 py-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        <NavLink
          to="/admin/settings"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-surface-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`
          }
        >
          <Settings size={18} className="text-slate-400 dark:text-slate-500" />
          <span>Account Settings</span>
        </NavLink>

        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-surface-850/80 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {admin?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {admin?.email || 'admin@library.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50/80 dark:bg-surface-950 overflow-hidden font-sans">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)} 
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Floating App Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-surface-700 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 dark:text-slate-500">
                Workspace
              </span>
              <ChevronRight size={14} className="hidden sm:inline-block text-slate-300 dark:text-slate-600" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">
                {currentRouteName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-surface-800 hover:bg-slate-200/80 dark:hover:bg-surface-700 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
            >
              <ExternalLink size={13} />
              <span>View Public Site</span>
            </a>

            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
