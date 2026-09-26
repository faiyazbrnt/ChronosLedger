import "server-only";
import { prisma } from "@/lib/prisma";

export interface SaveShiftParams {
  userId: string;
  workDate: Date;
  timeInMinutes: number;
  timeOutMinutes?: number | null;
  breaks?: Array<{ category: string; durationMinutes: number }>;
  note?: string | null;
  activity?: string | null;
  activityDescription?: string | null;
  remarks?: string | null;
}

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
    include: {
      breaks: {
        orderBy: { createdAt: "asc" },
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
    include: {
      breaks: {
        orderBy: { createdAt: "asc" },
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
    include: {
      breaks: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getAllDtrEntries(userId: string) {
  return prisma.dtrEntry.findMany({
    where: { userId },
    include: {
      breaks: true,
    },
    orderBy: {
      workDate: "asc",
    },
  });
}

export async function saveDtrEntryWithSnapshot(params: SaveShiftParams) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.dtrEntry.findUnique({
      where: {
        userId_workDate: {
          userId: params.userId,
          workDate: params.workDate,
        },
      },
      include: {
        breaks: true,
      },
    });

    let entry;
    let wasCreated = false;

    if (existing) {
      entry = await tx.dtrEntry.update({
        where: { id: existing.id },
        data: {
          timeInMinutes: params.timeInMinutes,
          timeOutMinutes: params.timeOutMinutes ?? existing.timeOutMinutes,
          note: params.note !== undefined ? params.note : existing.note,
          activity: params.activity !== undefined ? params.activity : existing.activity,
          activityDescription:
            params.activityDescription !== undefined
              ? params.activityDescription
              : existing.activityDescription,
          remarks: params.remarks !== undefined ? params.remarks : existing.remarks,
        },
      });
    } else {
      // Hard Gate (Task 5): Verify rendered-hours target is set before creating new shifts
      const userSettings = await tx.settings.findUnique({
        where: { userId: params.userId },
      });
      if (!userSettings?.renderedHoursTarget || userSettings.renderedHoursTarget <= 0) {
        throw new Error(
          "You must set your rendered-hours target on the Dashboard before logging shifts."
        );
      }

      wasCreated = true;
      entry = await tx.dtrEntry.create({
        data: {
          userId: params.userId,
          workDate: params.workDate,
          timeInMinutes: params.timeInMinutes,
          timeOutMinutes: params.timeOutMinutes ?? null,
          lunchMinutesApplied: 0, // Phase 2: zero default deduction for new entries
          note: params.note ?? null,
          activity: params.activity ?? null,
          activityDescription: params.activityDescription ?? null,
          remarks: params.remarks ?? null,
        },
      });
    }

    // If break entries are provided, sync them only if modified
    if (params.breaks !== undefined) {
      const existingBreaks = existing?.breaks ?? [];
      const hasChanged =
        existingBreaks.length !== params.breaks.length ||
        params.breaks.some(
          (b, i) =>
            !existingBreaks[i] ||
            existingBreaks[i].category !== b.category ||
            existingBreaks[i].durationMinutes !== b.durationMinutes
        );

      if (hasChanged) {
        if (existingBreaks.length > 0) {
          await tx.dtrBreakEntry.deleteMany({
            where: { dtrEntryId: entry.id },
          });
        }

        if (params.breaks.length > 0) {
          await tx.dtrBreakEntry.createMany({
            data: params.breaks.map((b) => ({
              dtrEntryId: entry.id,
              userId: params.userId,
              category: b.category,
              durationMinutes: b.durationMinutes,
            })),
          });
        }
      }
    }

    const fullEntry = await tx.dtrEntry.findUniqueOrThrow({
      where: { id: entry.id },
      include: {
        breaks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return { entry: fullEntry, wasCreated };
  });
}

export async function saveActivityReport(params: {
  id: string;
  userId: string;
  activity?: string | null;
  activityDescription?: string | null;
  remarks?: string | null;
}) {
  return prisma.dtrEntry.updateMany({
    where: {
      id: params.id,
      userId: params.userId,
    },
    data: {
      activity: params.activity,
      activityDescription: params.activityDescription,
      remarks: params.remarks,
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
