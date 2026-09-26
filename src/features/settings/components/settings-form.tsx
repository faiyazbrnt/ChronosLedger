"use client";

import React, { useState, useTransition } from "react";
import { Coins, Sparkles, CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinorUnits } from "@/lib/money";
import { updateSettingsAction } from "../actions/settings-actions";
import type { UserSettingsData } from "../types";

const CURRENCY_PRESETS = [
  { code: "PHP", label: "PHP (₱)", symbol: "₱" },
  { code: "USD", label: "USD ($)", symbol: "$" },
  { code: "EUR", label: "EUR (€)", symbol: "€" },
  { code: "GBP", label: "GBP (£)", symbol: "£" },
  { code: "JPY", label: "JPY (¥)", symbol: "¥" },
  { code: "SGD", label: "SGD (S$)", symbol: "S$" },
  { code: "AUD", label: "AUD (A$)", symbol: "A$" },
  { code: "CAD", label: "CAD (CA$)", symbol: "CA$" },
];

interface SettingsFormProps {
  initialSettings?: Partial<UserSettingsData> | null;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [currency, setCurrency] = useState(
    initialSettings?.currency?.toUpperCase() ?? "PHP"
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Safely format preview values with Intl.NumberFormat
  let previewDaily = "₱1,500.00";
  let previewWeekly = "₱10,500.00";
  let currencyCodeValid = true;

  try {
    const code = currency.trim().toUpperCase();
    if (code.length === 3) {
      previewDaily = formatMinorUnits(150000, code);
      previewWeekly = formatMinorUnits(1050000, code);
    } else {
      currencyCodeValid = false;
    }
  } catch {
    currencyCodeValid = false;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const code = currency.trim().toUpperCase();
    if (code.length !== 3) {
      setErrorMessage("Currency must be a valid 3-letter ISO code (e.g. PHP, USD).");
      return;
    }

    startTransition(async () => {
      const response = await updateSettingsAction({
        currency: code,
      });

      if (!response.ok) {
        setErrorMessage(response.error);
        return;
      }

      setSuccessMessage("Settings saved successfully!");
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Settings
          </h1>
          <Badge variant="secondary" className="text-[10px] font-mono">
            Preferences
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Configure currency formatting for your budgets and expense calculations.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 bg-success/10 text-success border border-success/20"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 bg-destructive/10 text-destructive border border-destructive/20"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Currency Setting Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Coins className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Currency &amp; Formatting</CardTitle>
                <CardDescription>
                  Standard ISO 4217 currency code used to format expenses and budget totals.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {/* Quick Currency Presets */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-foreground">
                Popular Currencies
              </span>
              <div className="flex flex-wrap gap-2">
                {CURRENCY_PRESETS.map((item) => {
                  const isSelected = currency === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setCurrency(item.code);
                        setSuccessMessage(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Code Input */}
            <div className="space-y-2">
              <label
                htmlFor="currency-code"
                className="block text-xs font-semibold text-foreground"
              >
                Custom Currency Code
              </label>
              <div className="w-full sm:w-48">
                <Input
                  id="currency-code"
                  type="text"
                  maxLength={3}
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value.toUpperCase());
                    setSuccessMessage(null);
                  }}
                  className="font-mono uppercase tracking-widest text-sm"
                  placeholder="PHP"
                />
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Live Currency Preview</span>
              </div>
              {currencyCodeValid ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-background/70 border border-border/80">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Sample Daily Total
                    </span>
                    <span className="text-base font-bold text-foreground font-mono">
                      {previewDaily}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/70 border border-border/80">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Sample Weekly Allowance
                    </span>
                    <span className="text-base font-bold text-foreground font-mono">
                      {previewWeekly}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-destructive font-medium">
                  Enter a valid 3-letter currency code (e.g., PHP, USD, EUR) to see formatting.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending || !currencyCodeValid}
            className="min-w-[150px] gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
