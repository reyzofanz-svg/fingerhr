import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  try {
    // Check if default schedule already exists
    const existing = await prisma.schedule.findFirst({
      where: { name: "SM1" },
    });

    if (existing) {
      return NextResponse.json({
        message: "Default SM1 schedule already exists",
        schedule: existing,
      });
    }

    // Create default SM1 schedule
    const schedule = await prisma.schedule.create({
      data: {
        name: "SM1",
        startTime: "08:30",
        endTime: "16:30",
        graceMinutes: 15,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Default SM1 schedule created successfully",
      schedule,
    }, { status: 201 });
  } catch (error) {
    console.error("[API] Seed schedule error:", error);
    return NextResponse.json(
      { error: "Failed to create default schedule" },
      { status: 500 }
    );
  }
}
