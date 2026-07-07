import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const HHMM = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
const optTime = z.string().regex(HHMM).optional().nullable();

const scheduleUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  startTime: z.string().regex(HHMM).optional(),
  endTime: z.string().regex(HHMM).optional(),
  breakStart: optTime,
  breakEnd: optTime,
  overtimeStart: optTime,
  overtimeRate: z.number().min(1).max(5).optional(),
  graceMinutes: z.number().min(0).max(120).optional(),
  scanInStart: optTime,
  scanInEnd: optTime,
  scanOutStart: optTime,
  scanOutEnd: optTime,
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        workScheduleDays: {
          include: {
            workSchedule: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("[API] Get schedule error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve schedule data" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = scheduleUpdateSchema.parse(body);

    const existing = await prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[API] Update schedule error:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.schedule.findUnique({
      where: { id },
      include: { _count: { select: { workScheduleDays: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }

    if (existing._count.workScheduleDays > 0) {
      return NextResponse.json(
        { error: "Cannot delete shift that is still in use by a schedule" },
        { status: 400 }
      );
    }

    await prisma.schedule.delete({ where: { id } });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("[API] Delete schedule error:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
