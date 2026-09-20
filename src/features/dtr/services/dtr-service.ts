import "server-only";
import { prisma } from "@/lib/prisma";

export async function getDtrEntriesForWeek(params: {
  userId: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.dtrEntry.findMany({
    where: {
      userId: params.userId,
      workDate: {
        gte: params.startDate,
        lte: params.endDate,
      },
    },
    orderBy: {
      workDate: "asc",
    },
  });
}

export async function upsertDtrEntry(params: {
  userId: string;
  workDate: Date;
  timeInMinutes: number;
  timeOutMinutes: number;
  lunchMinutesApplied: number;
  note?: string;
}) {
  return prisma.dtrEntry.upsert({
    where: {
      userId_workDate: {
        userId: params.userId,
        workDate: params.workDate,
      },
    },
    update: {
      timeInMinutes: params.timeInMinutes,
      timeOutMinutes: params.timeOutMinutes,
      note: params.note,
    },
    create: {
      userId: params.userId,
      workDate: params.workDate,
      timeInMinutes: params.timeInMinutes,
      timeOutMinutes: params.timeOutMinutes,
      lunchMinutesApplied: params.lunchMinutesApplied,
      note: params.note,
    },
  });
}

export async function deleteDtrEntry(params: {
  id: string;
  userId: string;
}) {
  return prisma.dtrEntry.deleteMany({
    where: {
      id: params.id,
      userId: params.userId,
    },
  });
}
