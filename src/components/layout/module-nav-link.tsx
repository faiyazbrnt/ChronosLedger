"use client";

import { useEffect, useState } from "react";
import Link, { useLinkStatus } from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";

interface ModuleNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  compact?: boolean;
}

const PENDING_DELAY_MS = 150;

function PendingIcon({ Icon, showPending }: { Icon: LucideIcon; showPending: boolean }) {
  return showPending ? (
    <Loader2
      className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none"
      aria-hidden="true"
    />
  ) : (
    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
  );
}

function NavLinkContent({
  label,
  icon,
  compact,
  isActive,
}: Pick<ModuleNavLinkProps, "label" | "icon" | "compact" | "isActive">) {
  const { pending } = useLinkStatus();
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    if (!pending) {
      setShowPending(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setShowPending(true), PENDING_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [pending]);

  if (compact) {
    return (
      <span
        role="status"
        aria-live="polite"
        aria-busy={showPending}
        className="flex flex-col items-center"
      >
        <span
          className={`p-1 rounded-lg transition-colors ${
            isActive ? "bg-primary/15 text-primary" : ""
          }`}
        >
          <PendingIcon Icon={icon} showPending={showPending} />
        </span>
        <span className="mt-0.5 text-[11px] leading-none">{label}</span>
        {showPending && <span className="sr-only">Loading {label}</span>}
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy={showPending}
      className="flex items-center gap-3.5"
    >
      <PendingIcon Icon={icon} showPending={showPending} />
      <span>{label}</span>
      {showPending && <span className="sr-only">Loading {label}</span>}
    </span>
  );
}

export function ModuleNavLink({
  href,
  label,
  icon,
  isActive,
  compact = false,
}: ModuleNavLinkProps) {
  const activeClasses = compact
    ? "text-primary"
    : "bg-primary text-primary-foreground shadow-sm";
  const inactiveClasses = compact
    ? "text-muted-foreground hover:text-foreground"
    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground active:scale-[0.99]";
  const className = compact
    ? `flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isActive ? activeClasses : inactiveClasses
      }`
    : `group flex items-center gap-3.5 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isActive ? activeClasses : inactiveClasses
      }`;

  return (
    <Link
      href={href}
      prefetch
      aria-current={isActive ? "page" : undefined}
      className={className}
    >
      <NavLinkContent
        label={label}
        icon={icon}
        compact={compact}
        isActive={isActive}
      />
    </Link>
  );
}
