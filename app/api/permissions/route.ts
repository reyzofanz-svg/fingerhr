import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const permissionSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  type: z.enum(["SICK", "CUTI", "IZIN"], { message: "Invalid permission type" }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const employeeId = searchParams.get("employeeId") || "";

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const permissions = await prisma.permission.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, pin: true, department: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("[API] Get permissions error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve permission data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = permissionSchema.parse(body);

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: validated.employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        employeeId: validated.employeeId,
        type: validated.type,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        reason: validated.reason,
        status: "PENDING",
      },
      include: {
        employee: { select: { name: true } },
      },
    });

    return NextResponse.json(permission, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[API] Create permission error:", error);
    return NextResponse.json(
      { error: "Failed to submit permission" },
      { status: 500 }
    );
  }
}
