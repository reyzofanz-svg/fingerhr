import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET all attendance spots
export async function GET() {
  try {
    const spots = await prisma.attendanceSpot.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(spots);
  } catch (error) {
    console.error("[API] Get attendance spots error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve attendance spots" },
      { status: 500 }
    );
  }
}

// POST create new attendance spot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, latitude, longitude, radius } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "name, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    const spot = await prisma.attendanceSpot.create({
      data: {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: radius ? parseInt(radius) : 100,
      },
    });

    return NextResponse.json(spot, { status: 201 });
  } catch (error) {
    console.error("[API] Create attendance spot error:", error);
    return NextResponse.json(
      { error: "Failed to create attendance spot" },
      { status: 500 }
    );
  }
}

// PUT update attendance spot
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, latitude, longitude, radius, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const spot = await prisma.attendanceSpot.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(radius !== undefined && { radius: parseInt(radius) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(spot);
  } catch (error) {
    console.error("[API] Update attendance spot error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance spot" },
      { status: 500 }
    );
  }
}

// DELETE attendance spot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    await prisma.attendanceSpot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Delete attendance spot error:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance spot" },
      { status: 500 }
    );
  }
}
