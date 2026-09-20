"use client";

import React, { useState } from "react";
import { Utensils, Coins, Save, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SettingsForm() {
  const [lunchEnabled, setLunchEnabled] = useState(true);
  const [lunchMinutes, setLunchMinutes] = useState(60);
  const [currency, setCurrency] = useState("PHP");

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Settings
          </h1>
          <Badge variant="secondary" className="text-[10px] font-mono">
            Phase 1 Preview
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configure global preferences for lunch deductions and currency display.
        </p>
      </div>

      <div className="space-y-6">
        {/* Lunch Deduction Setting Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Lunch Break Deduction</CardTitle>
                <CardDescription>
                  Automatically deduct meal time from all newly logged daily shifts.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60">
              <div>
                <p className="text-sm font-semibold text-foreground">Enable Lunch Deduction</p>
                <p className="text-xs text-muted-foreground">
                  When active, lunch minutes are deducted automatically on shift creation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLunchEnabled(!lunchEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  lunchEnabled ? "bg-primary" : "bg-muted"
                }`}
                role="switch"
                aria-checked={lunchEnabled}
                aria-label="Toggle lunch deduction"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-lg ring-0 transition-transform ${
                    lunchEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {lunchEnabled && (
              <div className="space-y-2">
                <label
                  htmlFor="lunch-minutes"
                  className="block text-xs font-semibold text-foreground"
                >
                  Lunch Duration (Minutes)
                </label>
                <input
                  id="lunch-minutes"
                  type="number"
                  min={0}
                  max={240}
                  value={lunchMinutes}
                  onChange={(e) => setLunchMinutes(Number(e.target.value))}
                  className="w-full sm:w-48 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  Default: 60 minutes. Snapshotted per entry at creation time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currency Setting Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Currency &amp; Formatting</CardTitle>
                <CardDescription>
                  ISO 4217 standard currency code used for formatting all monetary values.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="space-y-2">
              <label
                htmlFor="currency-code"
                className="block text-xs font-semibold text-foreground"
              >
                Currency Code
              </label>
              <input
                id="currency-code"
                type="text"
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="w-full sm:w-48 rounded-lg border border-input bg-card px-3 py-2 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Default: PHP (Philippine Peso). Formatted with Intl.NumberFormat.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Immutability Snapshot Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Snapshot Guarantee:</span> Changing settings never rewrites past DTR entries. Each entry captures its lunch deduction when created, ensuring audited historical accuracy.
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
