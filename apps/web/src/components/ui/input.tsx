import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>): React.JSX.Element {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-neutral-200/80 bg-white px-3 text-[13px] text-neutral-900 shadow-sm transition-colors placeholder:font-normal placeholder:text-neutral-400 focus-visible:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800/80 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus-visible:border-neutral-700 dark:focus-visible:ring-white/5',
        className,
      )}
      {...props}
    />
  );
}
