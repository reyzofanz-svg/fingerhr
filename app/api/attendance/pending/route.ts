import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET pending approvals
export async function GET() {
  try {
    const pendingLogs = await prisma.attendanceLog.findMany({
      where: {
        approvalStatus: "PENDING",
        type: "mobile",
      },
      include: {
        employee: { select: { id: true, name: true, pin: true, department: true } },
        spot: { select: { name: true } },
      },
      orderBy: { scanTime: "desc" },
    });

    return NextResponse.json(pendingLogs);
  } catch (error) {
    console.error("[API] Get pending approvals error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve pending approvals" },
      { status: 500 }
    );
  }
}
