import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const command = searchParams.get("command") || "";
    const status = searchParams.get("status") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (command) {
      where.command = command;
    }

    if (status) {
      where.status = status;
    }

    const logs = await prisma.apiLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[API] Get API logs error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve API logs data" },
      { status: 500 }
    );
  }
}
