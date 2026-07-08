import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps): React.JSX.Element {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-sm border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 transition-colors placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus-visible:border-neutral-600 dark:focus-visible:ring-neutral-700',
        className,
      )}
      {...props}
    />
  );
}
