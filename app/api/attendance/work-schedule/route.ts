import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const daySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isDayOff: z.boolean(),
  shiftId: z.string().nullable().optional(),
});

const workScheduleSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  isActive: z.boolean().optional().default(true),
  days: z.array(daySchema).length(7, "Harus 7 hari (Minggu-Sabtu)"),
});

export async function GET() {
  try {
    const workSchedules = await prisma.workSchedule.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        days: {
          include: { shift: { select: { id: true, name: true, startTime: true, endTime: true } } },
          orderBy: { dayOfWeek: "asc" },
        },
        _count: { select: { employees: true } },
      },
    });

    return NextResponse.json(workSchedules);
  } catch (error) {
    console.error("[API] Get work schedules error:", error);
    return NextResponse.json({ error: "Failed to retrieve schedule data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = workScheduleSchema.parse(body);

    // A working day (not day-off) must have a shift
    for (const d of validated.days) {
      if (!d.isDayOff && !d.shiftId) {
        return NextResponse.json(
          { error: `Working days must have a shift selected (day ${d.dayOfWeek})` },
          { status: 400 }
        );
      }
    }

    const workSchedule = await prisma.workSchedule.create({
      data: {
        name: validated.name,
        isActive: validated.isActive ?? true,
        days: {
          create: validated.days.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            isDayOff: d.isDayOff,
            shiftId: d.isDayOff ? null : d.shiftId ?? null,
          })),
        },
      },
      include: { days: { include: { shift: true }, orderBy: { dayOfWeek: "asc" } } },
    });

    return NextResponse.json(workSchedule, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("[API] Create work schedule error:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
