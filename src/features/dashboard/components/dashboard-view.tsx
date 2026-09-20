import React from "react";
import Link from "next/link";
import { Clock, Wallet, ArrowUpRight, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DashboardView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Dashboard
            </h1>
            <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
              <Sparkles className="h-3 w-3 text-primary" />
              Phase 1 Preview
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your daily work hours and budget tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dtr">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Log Shift</span>
            </Button>
          </Link>
          <Link href="/budget">
            <Button size="sm" className="gap-1.5">
              <Wallet className="h-4 w-4" />
              <span>Log Expense</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Weekly Hours Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              This Week Hours
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground">
              0h 00m
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Target: 40h standard week
            </p>
          </CardContent>
        </Card>

        {/* Remaining Allowance Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Remaining Budget
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-primary">
              ₱0.00
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Safe to spend: ₱0.00 / day
            </p>
          </CardContent>
        </Card>

        {/* Active Week Interval Card */}
        <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Allowance Cycle
            </CardTitle>
            <Badge variant="outline">Mon – Sun</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground">
              Current Week
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Connects to live Supabase database in Phase 2 &amp; 3.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Showcase / Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Recent DTR Entries</CardTitle>
              <Link href="/dtr" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CardDescription>Daily work records with snapshotted lunch deductions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border/80 bg-background/50 p-6 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No shifts recorded yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your entries will be listed here with calculated hours once Phase 5 is active.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Expenses</CardTitle>
              <Link href="/budget" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CardDescription>Tracked spending grouped by day and category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border/80 bg-background/50 p-6 text-center">
              <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No expenses logged yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your expenses, category breakdown, and safe spending rates will appear in Phase 6.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
