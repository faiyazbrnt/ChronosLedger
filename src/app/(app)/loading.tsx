import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div
      className="space-y-8 animate-in fade-in duration-150"
      role="status"
      aria-live="polite"
      aria-label="Loading module content"
    >
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Primary KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4 sm:col-span-2 lg:col-span-1">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Main Content Area Card Skeleton */}
      <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
