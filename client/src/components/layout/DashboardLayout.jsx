import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  QrCode,
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ title, subtitle, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, end: false },
    { to: '/generator', label: 'Create QR Code', icon: PlusCircle, end: false },
    { to: '/dashboard/settings', label: 'Profile Settings', icon: Settings, end: false },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
    }`;

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <Link to="/" className="mb-6 flex items-center gap-2.5 px-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white">
            <QrCode className="h-5 w-5" />
          </span>
          <span className="text-slate-900 dark:text-white">
            QR <span className="text-brand-600 dark:text-brand-400">Studio</span>
          </span>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={linkClass}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Dynamic Engine
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Update destinations anytime without reprinting your QR codes.
          </p>
          <Link
            to="/generator?mode=dynamic"
            onClick={() => setSidebarOpen(false)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Launch Dynamic Builder <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user?.name || 'QR Studio User'}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 h-full w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">{title}</h1>
              {subtitle && <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
