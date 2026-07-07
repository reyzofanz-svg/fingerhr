import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const assignSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  workScheduleId: z.string().min(1, "Schedule is required"),
  effectiveFrom: z.string().min(1, "Effective date is required"),
  effectiveTo: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const where: any = {};
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const assignments = await prisma.employeeSchedule.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, pin: true } },
        workSchedule: {
          include: { days: { include: { shift: true }, orderBy: { dayOfWeek: "asc" } } },
        },
      },
      orderBy: { effectiveFrom: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("[API] Get assignments error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve assignment data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = assignSchema.parse(body);

    const employee = await prisma.employee.findUnique({
      where: { id: validated.employeeId },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const workSchedule = await prisma.workSchedule.findUnique({
      where: { id: validated.workScheduleId },
    });
    if (!workSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const existing = await prisma.employeeSchedule.findFirst({
      where: {
        employeeId: validated.employeeId,
        effectiveFrom: new Date(validated.effectiveFrom),
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Employee already has an assignment on that date" },
        { status: 400 }
      );
    }

    const assignment = await prisma.employeeSchedule.create({
      data: {
        employeeId: validated.employeeId,
        workScheduleId: validated.workScheduleId,
        effectiveFrom: new Date(validated.effectiveFrom),
        effectiveTo: validated.effectiveTo ? new Date(validated.effectiveTo) : null,
      },
      include: {
        employee: { select: { name: true } },
        workSchedule: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[API] Assign schedule error:", error);
    return NextResponse.json({ error: "Failed to assign schedule" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await prisma.employeeSchedule.delete({ where: { id } });
    return NextResponse.json({ message: "Assignment deleted" });
  } catch (error) {
    console.error("[API] Delete assignment error:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
