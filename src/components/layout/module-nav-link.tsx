"use client";

import { type MouseEventHandler, useEffect, useState } from "react";
import Link, { useLinkStatus } from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";

interface ModuleNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  compact?: boolean;
  collapsed?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
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
  collapsed,
  isActive,
}: Pick<ModuleNavLinkProps, "label" | "icon" | "compact" | "collapsed" | "isActive">) {
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

  if (collapsed) {
    return (
      <span
        role="status"
        aria-live="polite"
        aria-busy={showPending}
        className="flex items-center justify-center"
      >
        <PendingIcon Icon={icon} showPending={showPending} />
        <span className="sr-only">{showPending ? `Loading ${label}` : label}</span>
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
  collapsed = false,
  onClick,
}: ModuleNavLinkProps) {
  let className = "";
  if (compact) {
    className = `flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
      isActive ? "text-emerald-400" : "text-slate-400 hover:text-white"
    }`;
  } else if (collapsed) {
    className = `group flex items-center justify-center h-11 w-11 mx-auto rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
      isActive
        ? "bg-white/[0.12] text-white font-semibold shadow-xs border border-white/15 [&_svg]:text-emerald-400"
        : "text-slate-400 hover:text-white hover:bg-white/[0.07] active:scale-[0.95]"
    }`;
  } else {
    className = `group flex items-center gap-3.5 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
      isActive
        ? "bg-white/[0.12] text-white font-semibold shadow-xs border border-white/15 backdrop-blur-xs [&_svg]:text-emerald-400"
        : "text-slate-400 hover:text-white hover:bg-white/[0.07] active:scale-[0.99]"
    }`;
  }

  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={className}
    >
      <NavLinkContent
        label={label}
        icon={icon}
        compact={compact}
        collapsed={collapsed}
        isActive={isActive}
      />
    </Link>
  );
}
