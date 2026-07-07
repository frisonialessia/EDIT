import { LayoutDashboard, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function AppShell({
  children,
  isDark,
  onToggleTheme,
}: AppShellProps): React.JSX.Element {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="flex min-h-screen bg-[#FCFCFC] dark:bg-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r border-neutral-200/70 bg-[#FAFAFA] dark:border-neutral-800/70 dark:bg-neutral-950">
        <div className="flex h-16 items-center px-6">
          <Link to="/" className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            EDIT-OS
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          <Link
            to="/dashboard"
            className={cn(
              'flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors',
              isDashboard
                ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100'
                : 'font-normal text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-neutral-100',
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 opacity-70" />
            Events
          </Link>
        </nav>

        <div className="border-t border-neutral-200/70 p-4 dark:border-neutral-800/70">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-normal text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 opacity-70" /> : <Moon className="h-4 w-4 opacity-70" />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      <div className="min-h-screen flex-1 pl-[220px]">{children}</div>
    </div>
  );
}
