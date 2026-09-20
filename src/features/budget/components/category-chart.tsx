"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatMinorUnits } from "@/lib/money";
import type { ExpenseCategory } from "../types";

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; color: string }
> = {
  FOOD: { label: "Food", color: "#f97316" },
  TRANSPORT: { label: "Transport", color: "#3b82f6" },
  BILLS: { label: "Bills", color: "#ef4444" },
  SHOPPING: { label: "Shopping", color: "#ec4899" },
  HEALTH: { label: "Health", color: "#10b981" },
  ENTERTAINMENT: { label: "Entertainment", color: "#8b5cf6" },
  OTHER: { label: "Other", color: "#6b7280" },
};

interface CategoryChartProps {
  categoryTotals: Record<string, number>;
  totalSpentMinor: number;
  currency: string;
}

export function CategoryChart({
  categoryTotals,
  totalSpentMinor,
  currency,
}: CategoryChartProps) {
  if (totalSpentMinor <= 0) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
        No expenses recorded yet to generate category distribution.
      </div>
    );
  }

  // Transform data for Recharts & breakdown meters
  const data = (Object.keys(CATEGORY_META) as ExpenseCategory[])
    .map((cat) => {
      const amount = categoryTotals[cat] ?? 0;
      const percent = totalSpentMinor > 0 ? (amount / totalSpentMinor) * 100 : 0;
      return {
        category: cat,
        label: CATEGORY_META[cat].label,
        amount,
        amountMajor: amount / 100,
        percent,
        color: CATEGORY_META[cat].color,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Recharts Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              width={100}
              tick={{ fill: "currentColor", fontSize: 12 }}
            />
            <Tooltip
              formatter={(val) => [
                formatMinorUnits(Math.round(Number(val ?? 0) * 100), currency),
                "Spent",
              ]}
              contentStyle={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderRadius: "0.75rem",
                color: "var(--foreground)",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="amountMajor" radius={[0, 8, 8, 0]}>
              {data.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Progress Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {data.map((item) => (
          <div
            key={item.category}
            className="p-3 rounded-xl border border-border bg-card/60 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
              <span className="font-mono font-bold text-foreground">
                {formatMinorUnits(item.amount, currency)}
              </span>
            </div>

            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, item.percent)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>{item.percent.toFixed(1)}% of spending</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
