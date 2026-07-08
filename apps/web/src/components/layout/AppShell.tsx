import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  Clock3,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Sun,
  User,
  Zap,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { getAvatarGradient, getInitials } from '@/lib/avatar';
import { cn } from '@/lib/utils';

interface AppShellProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/dashboard/timeline', label: 'Timeline', icon: Clock3 },
  { to: '/dashboard/orchestration', label: 'Orchestration', icon: Zap },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: 2 },
  { to: '/profile', label: 'Profile', icon: User },
];

export function AppShell({ isDark, onToggleTheme }: AppShellProps): React.JSX.Element {
  const location = useLocation();

  function isActive(path: string, end?: boolean): boolean {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }

  return (
    <div className="flex min-h-screen bg-[#F4F4F5] dark:bg-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-neutral-200/80 bg-[#FAFAFA] dark:border-neutral-800/80 dark:bg-neutral-950">
        <div className="border-b border-neutral-200/70 px-5 py-5 dark:border-neutral-800/70">
          <Link to="/" className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            EDIT-OS
          </Link>
          <p className="mt-1 text-[11px] text-neutral-500">Casa Convivium · Lago di Como</p>
        </div>

        <div className="border-b border-neutral-200/70 px-5 py-4 dark:border-neutral-800/70">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white',
                getAvatarGradient('alessia'),
              )}
            >
              {getInitials('Alessia Rossi')}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                Alessia Rossi
              </p>
              <p className="truncate text-[11px] text-neutral-500">Event Architect</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
            Workspace
          </p>
          {navItems.map(({ to, label, icon: Icon, end, badge }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex h-9 items-center justify-between rounded-xl px-3 text-[13px] transition-colors',
                isActive(to, end)
                  ? 'bg-white font-medium text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100'
                  : 'font-normal text-neutral-500 hover:bg-white/70 hover:text-neutral-900 dark:hover:bg-neutral-900/50 dark:hover:text-neutral-100',
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                {label}
              </span>
              {badge ? (
                <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="border-t border-neutral-200/70 p-3 dark:border-neutral-800/70">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-[13px] font-normal text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 opacity-70" /> : <Moon className="h-4 w-4 opacity-70" />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      <div className="min-h-screen flex-1 pl-[260px]">
        <Outlet />
      </div>
    </div>
  );
}
