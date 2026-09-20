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
    orderBy: [
      { spentOn: "desc" },
      { createdAt: "desc" },
    ],
  });
}

export async function createExpense(params: {
  userId: string;
  spentOn: Date;
  category: ExpenseCategory;
  amountMinor: number;
  note?: string | null;
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

export async function updateExpense(params: {
  id: string;
  userId: string;
  spentOn: Date;
  category: ExpenseCategory;
  amountMinor: number;
  note?: string | null;
}) {
  return prisma.expense.updateMany({
    where: {
      id: params.id,
      userId: params.userId,
    },
    data: {
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

  if (current) {
    return { ...current, isInherited: false };
  }

  // Fallback: prefill from most recent earlier week
  const previous = await prisma.weeklyAllowance.findFirst({
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

  if (previous) {
    return {
      ...previous,
      id: "inherited",
      weekStart: params.weekStart,
      isInherited: true,
    };
  }

  return null;
}

export async function upsertWeeklyAllowance(params: {
  userId: string;
  weekStart: Date;
  amountMinor: number;
}) {
  return prisma.weeklyAllowance.upsert({
    where: {
      userId_weekStart: {
        userId: params.userId,
        weekStart: params.weekStart,
      },
    },
    update: {
      amountMinor: params.amountMinor,
    },
    create: {
      userId: params.userId,
      weekStart: params.weekStart,
      amountMinor: params.amountMinor,
    },
  });
}
