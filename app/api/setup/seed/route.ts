import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/setup/seed
 * Seed initial data - device REVO 208
 */
export async function POST() {
  try {
    // Seed device
    const existing = await prisma.device.findUnique({
      where: { cloudId: "C269248053121C21" },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Device already exists",
        device: existing,
      });
    }

    const device = await prisma.device.create({
      data: {
        cloudId: "C269248053121C21",
        name: "REVO 208",
        type: "REVO",
        status: "OFFLINE",
        timezone: "Asia/Jakarta",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Device created successfully",
      device,
    });
  } catch (error) {
    console.error("[Setup] Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}
