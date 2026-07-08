import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border text-[12px] font-medium uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:
          'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
        outline:
          'border-neutral-200 bg-transparent text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900',
        ghost:
          'border-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900',
      },
      size: {
        default: 'h-8 px-4',
        sm: 'h-7 px-3 text-[11px]',
        lg: 'h-9 px-5',
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
