import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'error';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((input: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...input, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-5 top-5 z-[100] flex w-full max-w-[360px] flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 shadow-md backdrop-blur-sm',
              item.variant === 'error' &&
                'border-red-200/80 bg-white/95 text-red-900 dark:border-red-900/50 dark:bg-neutral-950/95 dark:text-red-200',
              item.variant === 'success' &&
                'border-emerald-200/80 bg-white/95 text-emerald-900 dark:border-emerald-900/50 dark:bg-neutral-950/95 dark:text-emerald-200',
              item.variant === 'default' &&
                'border-neutral-200/80 bg-white/95 text-neutral-900 dark:border-neutral-800/80 dark:bg-neutral-950/95 dark:text-neutral-100',
            )}
          >
            {item.variant === 'error' ? (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-5">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-[12px] font-normal leading-4 opacity-70">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="rounded-md p-0.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
