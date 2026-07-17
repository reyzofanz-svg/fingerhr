import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// PUT approve/reject attendance
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approvedBy, note } = body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const log = await prisma.attendanceLog.update({
      where: { id },
      data: {
        approvalStatus: status,
        approvedBy,
        approvalNote: note,
      },
      include: {
        employee: { select: { name: true, pin: true } },
        spot: { select: { name: true } },
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("[API] Approve attendance error:", error);
    return NextResponse.json(
      { error: "Failed to approve attendance" },
      { status: 500 }
    );
  }
}
