import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Utility to handle WIB timezone
function toWIBString(date: Date): string {
  // Add 7 hours for WIB timezone if date is in UTC
  const wibTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  return wibTime.toISOString();
}

// GET attendance history for mobile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId is required" },
        { status: 400 }
      );
    }

    const where: any = { employeeId };

    if (startDate && endDate) {
      // Parse dates in WIB timezone (UTC+7)
      const start = new Date(startDate + "T00:00:00+07:00");
      const end = new Date(endDate + "T23:59:59.999+07:00");
      where.scanTime = {
        gte: start,
        lte: end,
      };
    }

    const logs = await prisma.attendanceLog.findMany({
      where,
      include: {
        spot: { select: { name: true } },
      },
      orderBy: { scanTime: "desc" },
    });

    // Group by date
    const groupedByDate: Record<string, any[]> = {};
    
    for (const log of logs) {
      // Convert to WIB for grouping by date
      const wibTime = new Date(log.scanTime.getTime() + 7 * 60 * 60 * 1000);
      const dateStr = wibTime.toISOString().split("T")[0];
      
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = [];
      }
      groupedByDate[dateStr].push({
        ...log,
        scanTimeWIB: toWIBString(log.scanTime),
      });
    }

    // Calculate summary for each day
    const summary = Object.entries(groupedByDate).map(([date, dayLogs]) => {
      const clockIn = dayLogs.find((l) => l.status === "IN" && l.approvalStatus === "APPROVED");
      const clockOut = dayLogs
        .filter((l) => l.status === "OUT" && l.approvalStatus === "APPROVED")
        .pop(); // Get the latest clock out
      
      const hasPending = dayLogs.some((l) => l.approvalStatus === "PENDING");
      const hasRejected = dayLogs.some((l) => l.approvalStatus === "REJECTED");

      return {
        date,
        clockIn: clockIn ? {
          time: clockIn.scanTimeWIB,
          spot: clockIn.spot?.name,
          isInSpot: clockIn.isInSpot,
        } : null,
        clockOut: clockOut ? {
          time: clockOut.scanTimeWIB,
          spot: clockOut.spot?.name,
          isInSpot: clockOut.isInSpot,
        } : null,
        status: hasPending ? "PENDING" : hasRejected ? "REJECTED" : "APPROVED",
        logs: dayLogs,
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[API] Get attendance history error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve attendance history" },
      { status: 500 }
    );
  }
}
