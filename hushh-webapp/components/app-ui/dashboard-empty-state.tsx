"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/lib/morphy-ux/ui";
import { cn } from "@/lib/utils";

export function DashboardEmptyState({
  icon,
  title,
  description,
  actions,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Empty
      className={cn(
        "min-h-[13rem] rounded-[var(--app-card-radius-standard)] border border-dashed border-border/70 bg-[color:var(--app-card-surface-compact)] px-4 py-8 sm:px-6 sm:py-10",
        compact && "min-h-[9rem] py-6 sm:py-7",
        className
      )}
    >
      <EmptyMedia
        variant="icon"
        className="mb-0 size-12 rounded-[var(--app-card-radius-feature)] bg-background/76 text-muted-foreground shadow-[var(--shadow-xs)]"
      >
        <Icon icon={icon} size="md" aria-hidden="true" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-base font-semibold">{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {actions ? <EmptyContent>{actions}</EmptyContent> : null}
    </Empty>
  );
}
