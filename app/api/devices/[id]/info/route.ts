import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDevice } from "@/lib/fingerspot";

/**
 * GET /api/devices/[id]/info
 * Get device info dari Fingerspot API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find device
    const device = await prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    const startTime = Date.now();

    // Call Fingerspot API
    const result = await getDevice("1");

    const duration = Date.now() - startTime;

    // Log to API logs
    await prisma.apiLog.create({
      data: {
        command: "GET_DEVICE",
        deviceCloudId: device.cloudId,
        status: result.success ? "SUCCESS" : "FAILED",
        requestPayload: { trans_id: "1" },
        responsePayload: result as any,
        errorMessage: result.success ? null : result.error,
        duration,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to retrieve device info" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      duration,
    });
  } catch (error) {
    console.error("[API] Get device info error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve device info" },
      { status: 500 }
    );
  }
}
