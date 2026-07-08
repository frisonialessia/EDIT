import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>): React.JSX.Element {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-neutral-950/40', className)}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>): React.JSX.Element {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 border border-neutral-200 bg-white p-0 dark:border-neutral-800 dark:bg-neutral-950',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('border-b border-neutral-200 px-6 py-5 dark:border-neutral-800', className)} {...props} />;
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800', className)}
      {...props}
    />
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
