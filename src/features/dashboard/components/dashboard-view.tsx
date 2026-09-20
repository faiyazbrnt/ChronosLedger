import React from "react";

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to DTR &amp; Budget Tracker.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">This Week Hours</h2>
          <p className="mt-2 text-2xl font-bold text-primary">0h 00m</p>
          <p className="text-xs text-muted-foreground mt-1">DTR metrics will connect in Phase 5</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Remaining Budget</h2>
          <p className="mt-2 text-2xl font-bold text-primary">₱0.00</p>
          <p className="text-xs text-muted-foreground mt-1">Budget tracking will connect in Phase 6</p>
        </div>
      </div>
    </div>
  );
}
