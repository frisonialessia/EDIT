import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  Clock3,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  User,
  Zap,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SectionLabel } from '@/components/layout/SectionLabel';
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

const primaryNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/orchestration', label: 'Orchestration', icon: Zap },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/dashboard/timeline', label: 'Timeline', icon: Clock3 },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: 2 },
];

const secondaryNav: NavItem[] = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/contact', label: 'Plans & billing', icon: CreditCard },
];

export function AppShell({ isDark, onToggleTheme }: AppShellProps): React.JSX.Element {
  const location = useLocation();

  function isActive(path: string, end?: boolean): boolean {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }

  function renderNavItem({ to, label, icon: Icon, end, badge }: NavItem): React.JSX.Element {
    return (
      <Link
        key={to}
        to={to}
        className={cn(
          'flex h-8 items-center justify-between border-l-2 px-4 text-[12px] transition-colors',
          isActive(to, end)
            ? 'border-neutral-900 font-medium text-neutral-900 dark:border-white dark:text-neutral-100'
            : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300',
        )}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
          {label}
        </span>
        {badge ? <span className="text-[10px] tabular-nums text-neutral-400">{badge}</span> : null}
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-neutral-200 bg-[#FAFAFA] dark:border-neutral-800 dark:bg-neutral-950">
        <div className="border-b border-neutral-200 px-5 py-5 dark:border-neutral-800">
          <Link to="/" className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900 dark:text-neutral-100">
            EDIT-OS
          </Link>
          <p className="mt-2 text-[11px] text-neutral-500">Casa Convivium</p>
        </div>

        <nav className="flex-1 space-y-6 px-0 py-6">
          <div>
            <div className="px-5 pb-2">
              <SectionLabel>Operations</SectionLabel>
            </div>
            <div className="space-y-0.5">{primaryNav.map(renderNavItem)}</div>
          </div>

          <div>
            <div className="px-5 pb-2">
              <SectionLabel>Account</SectionLabel>
            </div>
            <div className="space-y-0.5">{secondaryNav.map(renderNavItem)}</div>
          </div>
        </nav>

        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="mb-3 px-1">
            <p className="text-[12px] text-neutral-700 dark:text-neutral-300">Alessia Rossi</p>
            <p className="text-[11px] text-neutral-500">Event Architect</p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 border border-neutral-200 text-[10px] uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-neutral-100"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              Theme
            </button>
            <Link
              to="/profile"
              className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-neutral-500 hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-neutral-100"
            >
              <Settings className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-h-screen flex-1 pl-[240px]">
        <Outlet />
      </div>
    </div>
  );
}
