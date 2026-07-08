import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PublicNavProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const links = [
  { to: '/', label: 'Product' },
  { to: '/contact', label: 'Plans' },
  { to: '/contact#inquiry', label: 'Contact' },
] as const;

export function PublicNav({ isDark, onToggleTheme }: PublicNavProps): React.JSX.Element {
  const location = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-[#FAFAFA] dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-[12px] font-medium uppercase tracking-[0.18em] text-neutral-900 dark:text-neutral-100">
            EDIT-OS
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'text-[12px] uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100',
                  location.pathname === to && 'text-neutral-900 dark:text-neutral-100',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="h-8 px-3 text-[11px] uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm">Open console</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
