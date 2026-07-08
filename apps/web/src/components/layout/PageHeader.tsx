import { SectionLabel } from '@/components/layout/SectionLabel';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps): React.JSX.Element {
  return (
    <header className="flex items-start justify-between gap-8 border-b border-neutral-200 px-10 py-10 dark:border-neutral-800">
      <div className="min-w-0">
        {eyebrow ? <SectionLabel>{eyebrow}</SectionLabel> : null}
        <h1 className="mt-2 text-[22px] font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[13px] text-neutral-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
