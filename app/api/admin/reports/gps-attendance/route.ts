import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const employeeId = searchParams.get("employeeId");
    const approvalStatus = searchParams.get("approvalStatus");
    const inOutArea = searchParams.get("inOutArea");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const where: any = {
      type: "mobile",
      scanTime: {
        gte: start,
        lte: end,
      },
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    }

    if (inOutArea === "IN_AREA") {
      where.isInSpot = true;
    } else if (inOutArea === "OUT_AREA") {
      where.isInSpot = false;
    }

    const records = await prisma.attendanceLog.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            pin: true,
            department: true,
          },
        },
        spot: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        scanTime: "desc",
      },
    });

    const formattedRecords = records.map((record) => ({
      id: record.id,
      employeeId: record.employeeId,
      employeeName: record.employee.name,
      employeePin: record.employee.pin,
      department: record.employee.department,
      scanTime: record.scanTime.toISOString(),
      status: record.status,
      type: record.type,
      selfieUrl: record.selfieUrl,
      backgroundUrl: record.backgroundUrl,
      notes: record.notes,
      latitude: record.latitude,
      longitude: record.longitude,
      spotName: record.spot?.name || null,
      distance: record.rawPayload ? (record.rawPayload as any).distance : null,
      isInSpot: record.isInSpot,
      approvalStatus: record.approvalStatus,
      approvedBy: record.approvedBy,
      approvalNote: record.approvalNote,
    }));

    return NextResponse.json({ records: formattedRecords });
  } catch (error) {
    console.error("Failed to fetch GPS attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
