import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>): React.JSX.Element {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-[12px] font-medium leading-none text-neutral-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-40 dark:text-neutral-300',
        className,
      )}
      {...props}
    />
  );
}
