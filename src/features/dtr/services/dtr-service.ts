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

export async function getDtrEntriesForMonth(params: {
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

export async function getDtrEntryByDate(params: {
  userId: string;
  workDate: Date;
}) {
  return prisma.dtrEntry.findUnique({
    where: {
      userId_workDate: {
        userId: params.userId,
        workDate: params.workDate,
      },
    },
  });
}

export async function saveDtrEntryWithSnapshot(params: {
  userId: string;
  workDate: Date;
  timeInMinutes: number;
  timeOutMinutes: number;
  note?: string | null;
}) {
  const existing = await prisma.dtrEntry.findUnique({
    where: {
      userId_workDate: {
        userId: params.userId,
        workDate: params.workDate,
      },
    },
  });

  if (existing) {
    const entry = await prisma.dtrEntry.update({
      where: { id: existing.id },
      data: {
        timeInMinutes: params.timeInMinutes,
        timeOutMinutes: params.timeOutMinutes,
        note: params.note,
      },
    });
    return { entry, wasCreated: false };
  }

  // Snapshot current settings for newly created entry
  const settings = await prisma.settings.findUnique({
    where: { userId: params.userId },
  });

  const lunchMinutesApplied =
    settings && settings.lunchDeductionEnabled ? settings.lunchBreakMinutes : 0;

  const entry = await prisma.dtrEntry.create({
    data: {
      userId: params.userId,
      workDate: params.workDate,
      timeInMinutes: params.timeInMinutes,
      timeOutMinutes: params.timeOutMinutes,
      lunchMinutesApplied,
      note: params.note,
    },
  });
  return { entry, wasCreated: true };
}

export async function upsertDtrEntry(params: {
  userId: string;
  workDate: Date;
  timeInMinutes: number;
  timeOutMinutes: number;
  lunchMinutesApplied: number;
  note?: string | null;
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
