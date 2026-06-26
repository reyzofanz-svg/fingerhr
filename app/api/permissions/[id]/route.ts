import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      return NextResponse.json(
        { error: "Izin tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.permission.update({
      where: { id },
      data: { status },
      include: {
        employee: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API] Update permission error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate izin" },
      { status: 500 }
    );
  }
}
