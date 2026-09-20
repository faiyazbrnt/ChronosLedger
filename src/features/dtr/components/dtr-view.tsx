import React from "react";

export function DtrView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Daily Time Record
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your daily shifts and worked hours.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          DTR entry views, week calendar, and totals will be active in Phase 5.
        </p>
      </div>
    </div>
  );
}
