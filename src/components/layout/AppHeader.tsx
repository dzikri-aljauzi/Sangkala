import type { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Page-level heading block: title + optional subtitle and primary actions.
 * Rendered at the top of the content area by AppShell.
 */
export default function AppHeader({ title, subtitle, actions }: AppHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}