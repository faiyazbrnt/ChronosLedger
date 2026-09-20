import "server-only";
import { prisma } from "@/lib/prisma";
import type { ExpenseCategory } from "../types";

export async function getExpensesForRange(params: {
  userId: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.expense.findMany({
    where: {
      userId: params.userId,
      spentOn: {
        gte: params.startDate,
        lte: params.endDate,
      },
    },
    orderBy: {
      spentOn: "desc",
    },
  });
}

export async function createExpense(params: {
  userId: string;
  spentOn: Date;
  category: ExpenseCategory;
  amountMinor: number;
  note?: string;
}) {
  return prisma.expense.create({
    data: {
      userId: params.userId,
      spentOn: params.spentOn,
      category: params.category,
      amountMinor: params.amountMinor,
      note: params.note,
    },
  });
}

export async function deleteExpense(params: {
  id: string;
  userId: string;
}) {
  return prisma.expense.deleteMany({
    where: {
      id: params.id,
      userId: params.userId,
    },
  });
}

export async function getWeeklyAllowance(params: {
  userId: string;
  weekStart: Date;
}) {
  const current = await prisma.weeklyAllowance.findUnique({
    where: {
      userId_weekStart: {
        userId: params.userId,
        weekStart: params.weekStart,
      },
    },
  });

  if (current) return current;

  // Fallback: prefill from most recent earlier week
  return prisma.weeklyAllowance.findFirst({
    where: {
      userId: params.userId,
      weekStart: {
        lt: params.weekStart,
      },
    },
    orderBy: {
      weekStart: "desc",
    },
  });
}
