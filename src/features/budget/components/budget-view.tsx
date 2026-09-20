import React from "react";

export function BudgetView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Budget Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Track expenses, weekly allowances, and monthly trends.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Budget tabs (&ldquo;This Week&rdquo; and &ldquo;Monthly&rdquo;) will be active in Phase 6.
        </p>
      </div>
    </div>
  );
}
