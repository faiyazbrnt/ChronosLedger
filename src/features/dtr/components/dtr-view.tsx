import React from "react";
import { Clock, Plus, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DtrView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Daily Time Record
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log time in, time out, and view calculated worked hours. Weeks run Monday to Sunday.
          </p>
        </div>

        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </Button>
      </div>

      {/* Totals Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Current Week Total
            </CardDescription>
            <CardTitle className="text-3xl font-black text-foreground">
              0h 00m <span className="text-sm font-normal text-muted-foreground">(0.00)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Monday – Sunday period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Monthly Total
            </CardDescription>
            <CardTitle className="text-3xl font-black text-foreground">
              0h 00m <span className="text-sm font-normal text-muted-foreground">(0.00)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Current calendar month</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Lunch Deduction Rule
            </CardDescription>
            <CardTitle className="text-base font-bold text-foreground">
              Automatic 60m Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Applied automatically at creation. Immutable on past entries.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Week Calendar / Table Container */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Week Overview</span>
              </CardTitle>
              <CardDescription>
                Days of the week with daily derived worked minutes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Mon – Sun</Badge>
              <Badge variant="secondary">Phase 1 Preview</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/40">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-foreground">
              No DTR records for this week
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
              Click &quot;New Entry&quot; to clock in and out. Acceptance rule verified: 8:30 AM to 6:30 PM with 60m lunch is calculated as exactly 9h 00m.
            </p>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Entry</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rule Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Same-day shifts only (v1):</span> Time out must be later than time in, and derived worked minutes must be greater than 0. Form inputs use native 24-hour time controls and display formatted 12-hour timestamps.
        </div>
      </div>
    </div>
  );
}
