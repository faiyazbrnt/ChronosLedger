"use client";

import React, { useState } from "react";
import {
  Wallet,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BudgetView() {
  const [activeTab, setActiveTab] = useState<"this-week" | "monthly">("this-week");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Budget Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage weekly allowances, track daily expenses, and view monthly category spending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            Set Allowance
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex p-1 space-x-1 rounded-xl bg-card border border-border max-w-sm" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "this-week"}
          onClick={() => setActiveTab("this-week")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${
            activeTab === "this-week"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>This Week</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "monthly"}
          onClick={() => setActiveTab("monthly")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${
            activeTab === "monthly"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>Monthly</span>
        </button>
      </div>

      {/* Tab 1: This Week */}
      {activeTab === "this-week" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">
                  Weekly Allowance
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">
                  ₱5,000.00
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Monday – Sunday cycle</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">
                  Total Spent
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">
                  ₱1,500.00
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">3 expenses logged</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">
                  Remaining
                </CardDescription>
                <CardTitle className="text-2xl font-black text-primary">
                  ₱3,500.00
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Safe to spend: ₱700.00 / day</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Health & Progress Bar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-bold">Budget Status: On Track</CardTitle>
                </div>
                <Badge variant="outline">30% Used</Badge>
              </div>
              <CardDescription>
                Status is indicated by clear text and icons, never by color alone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: "30%" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Spent: ₱1,500.00</span>
                <span>Remaining: ₱3,500.00 of ₱5,000.00</span>
              </div>
            </CardContent>
          </Card>

          {/* Daily Grouped Expenses Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">This Week&apos;s Expenses</CardTitle>
              <CardDescription>Grouped by day with per-day subtotals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/40">
                <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-base font-semibold text-foreground">
                  No expenses recorded for this week
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                  Add expenses with categories: Food, Transport, Bills, Shopping, Health, Entertainment, Other.
                </p>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Expense</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Monthly */}
      {activeTab === "monthly" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">
                  Monthly Total Spent
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">
                  ₱0.00
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Current month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">
                  Daily Average
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">
                  ₱0.00
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Days inside month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">
                  Top Category
                </CardDescription>
                <CardTitle className="text-xl font-bold text-foreground">
                  None yet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  vs previous month: —
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Category Breakdown</CardTitle>
              <CardDescription>Visual chart powered by Recharts (Phase 6)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 rounded-xl border border-dashed border-border flex items-center justify-center bg-card/40 text-xs text-muted-foreground">
                Category distribution chart will render in Phase 6
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Near-Limit / Over-Budget Demo Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
        <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Over-budget &amp; Near-limit handling:</span> Status is always communicated through explicit text, icons, and progress meters. Integers in minor units ensure zero floating-point rounding errors.
        </div>
      </div>
    </div>
  );
}
