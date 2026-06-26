import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { setUserInfo, getAllPin, setDeviceTime, restartDevice } from "@/lib/fingerspot";

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { attendanceLogs: true },
        },
      },
    });

    const formatted = devices.map((device) => ({
      id: device.id,
      cloudId: device.cloudId,
      name: device.name,
      type: device.type,
      ip: device.ip,
      status: device.status,
      timezone: device.timezone,
      lastSync: device.lastSync?.toISOString() || null,
      totalScans: device._count.attendanceLogs,
      createdAt: device.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[API] Get devices error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data perangkat" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cloudId, type, ip } = body;

    if (!name || !cloudId) {
      return NextResponse.json(
        { error: "Nama dan Cloud ID wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.device.findUnique({
      where: { cloudId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cloud ID sudah terdaftar" },
        { status: 400 }
      );
    }

    const device = await prisma.device.create({
      data: {
        name,
        cloudId,
        type: type || "FINGERPRINT",
        ip,
        status: "OFFLINE",
      },
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    console.error("[API] Create device error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan perangkat" },
      { status: 500 }
    );
  }
}
