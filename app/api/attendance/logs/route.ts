import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const employeeId = searchParams.get("employeeId");
    const deviceId = searchParams.get("deviceId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};

    if (startDate && endDate) {
      where.scanTime = {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59"),
      };
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (deviceId) {
      where.deviceId = deviceId;
    }

    const logs = await prisma.attendanceLog.findMany({
      where,
      include: {
        employee: { select: { name: true, pin: true, department: true } },
        device: { select: { name: true } },
      },
      orderBy: { scanTime: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[API] Get attendance logs error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data log absensi" },
      { status: 500 }
    );
  }
}
