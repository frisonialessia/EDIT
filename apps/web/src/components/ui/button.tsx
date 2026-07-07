import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-40 dark:focus-visible:ring-offset-neutral-950',
  {
    variants: {
      variant: {
        default:
          'rounded-md bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 active:bg-neutral-950 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
        outline:
          'rounded-md border border-neutral-200/80 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-800/80 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900',
        ghost:
          'rounded-md text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:active:bg-neutral-800',
      },
      size: {
        default: 'h-8 px-3',
        sm: 'h-7 rounded-md px-2.5 text-xs',
        lg: 'h-9 rounded-md px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps): React.JSX.Element {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
