import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type SystemLogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_MAP: Record<SystemLogoSize, { px: number; rounded: string; shadow: string }> = {
  xs: { px: 20, rounded: "rounded-md", shadow: "shadow-xs" },
  sm: { px: 28, rounded: "rounded-lg", shadow: "shadow-sm" },
  md: { px: 36, rounded: "rounded-xl", shadow: "shadow-sm" },
  lg: { px: 40, rounded: "rounded-xl", shadow: "shadow-md" },
  xl: { px: 64, rounded: "rounded-2xl", shadow: "shadow-lg" },
  "2xl": { px: 96, rounded: "rounded-3xl", shadow: "shadow-xl" },
};

export interface SystemLogoProps {
  size?: SystemLogoSize | number;
  format?: "png" | "svg";
  priority?: boolean;
  className?: string;
  interactive?: boolean;
}

export function SystemLogo({
  size = "md",
  format = "png",
  priority = true,
  className,
  interactive = true,
}: SystemLogoProps) {
  const dimension = typeof size === "number" ? size : SIZE_MAP[size].px;
  const roundedClass = typeof size === "number" ? "rounded-xl" : SIZE_MAP[size].rounded;
  const shadowClass = typeof size === "number" ? "shadow-sm" : SIZE_MAP[size].shadow;

  let src = "/brand/logo.png";
  if (format === "svg") {
    src = "/brand/logo.svg";
  } else if (dimension <= 32) {
    src = "/brand/logo-32.png";
  } else if (dimension <= 64) {
    src = "/brand/logo-64.png";
  } else if (dimension <= 192) {
    src = "/brand/logo-192.png";
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden select-none transition-all duration-200",
        roundedClass,
        shadowClass,
        interactive && "hover:scale-105 active:scale-95",
        className
      )}
      style={{ width: dimension, height: dimension }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt="ChronosLedger logo"
        width={dimension}
        height={dimension}
        priority={priority}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export interface BrandProps {
  size?: SystemLogoSize | number;
  subtitle?: string;
  href?: string;
  className?: string;
  titleClassName?: string;
  priority?: boolean;
}

export function Brand({
  size = "md",
  subtitle,
  href,
  className,
  titleClassName,
  priority = true,
}: BrandProps) {
  const content = (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      <SystemLogo size={size} priority={priority} />
      <div
        className={cn(
          "min-w-0 flex",
          subtitle ? "flex-col justify-center" : "items-center"
        )}
      >
        <span
          className={cn(
            "font-bold text-lg tracking-tight text-foreground group-hover:text-link transition-colors leading-normal pb-px overflow-visible",
            titleClassName
          )}
        >
          ChronosLedger
        </span>
        {subtitle && (
          <span className="text-xs text-muted-foreground font-medium block leading-tight mt-1 truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        aria-label={subtitle ? `ChronosLedger — ${subtitle}` : "ChronosLedger Home"}
      >
        {content}
      </Link>
    );
  }

  return content;
}
