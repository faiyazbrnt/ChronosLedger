"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { formatMinorUnits } from "@/lib/money";
import type { ExpenseCategory } from "../types";

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; color: string }
> = {
  FOOD: { label: "Food", color: "var(--chart-food)" },
  TRANSPORT: { label: "Transport", color: "var(--chart-transport)" },
  BILLS: { label: "Bills", color: "var(--chart-bills)" },
  SHOPPING: { label: "Shopping", color: "var(--chart-shopping)" },
  HEALTH: { label: "Health", color: "var(--chart-health)" },
  ENTERTAINMENT: { label: "Entertainment", color: "var(--chart-entertainment)" },
  OTHER: { label: "Other", color: "var(--chart-other)" },
};

interface CategoryChartDatum {
  category: ExpenseCategory;
  label: string;
  amount: number;
  percent: number;
  color: string;
}

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
        percent,
        color: CATEGORY_META[cat].color,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                const item = payload?.[0]?.payload as CategoryChartDatum | undefined;

                if (!active || !item) return null;

                return (
                  <div className="rounded-xl border border-border bg-card p-3 text-xs text-foreground shadow-lg">
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 font-mono font-bold">
                      {formatMinorUnits(item.amount, currency)}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {item.percent.toFixed(1)}% of spending
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs font-medium text-foreground">{value}</span>
              )}
            />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="label"
              cx="50%"
              cy="46%"
              innerRadius="45%"
              outerRadius="72%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
