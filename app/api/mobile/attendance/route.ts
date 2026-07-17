import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Utility to get WIB time
function getWIBTime(): Date {
  const now = new Date();
  // Create proper WIB time by adding 7 hours to UTC
  const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return wibTime;
}

// Calculate distance between two GPS coordinates (Haversine formula)
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// POST submit mobile attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      employeeId, 
      facePhotoUrl,
      surroundingPhotoUrl,
      // Legacy field support
      selfieUrl, 
      backgroundUrl,
      attachmentUrl,
      notes,
      latitude, 
      longitude, 
      type // "IN" or "OUT"
    } = body;

    if (!employeeId || !latitude || !longitude || !type) {
      return NextResponse.json(
        { error: "employeeId, latitude, longitude, and type are required" },
        { status: 400 }
      );
    }

    // Use new field names or fallback to legacy
    const finalFacePhoto = facePhotoUrl || selfieUrl;
    const finalSurroundingPhoto = surroundingPhotoUrl || backgroundUrl;

    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Check if employee is within any attendance spot
    const spots = await prisma.attendanceSpot.findMany({
      where: { isActive: true },
    });

    let nearestSpot = null;
    let minDistance = Infinity;
    let isInSpot = false;

    for (const spot of spots) {
      const distance = calculateDistance(
        latitude, longitude,
        spot.latitude, spot.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestSpot = spot;
      }
      
      if (distance <= spot.radius) {
        isInSpot = true;
        nearestSpot = spot;
        break;
      }
    }

    // Determine approval status
    const approvalStatus = isInSpot ? "APPROVED" : "PENDING";

    // Create attendance log with WIB timezone
    const wibTime = getWIBTime();
    
    const log = await prisma.attendanceLog.create({
      data: {
        employeeId,
        deviceId: null, // Mobile attendance
        scanTime: wibTime,
        verifyMethod: "FACE",
        status: type,
        type: "mobile",
        selfieUrl: finalFacePhoto,
        backgroundUrl: finalSurroundingPhoto,
        attachmentUrl,
        notes,
        latitude,
        longitude,
        spotId: nearestSpot?.id || null,
        isInSpot,
        approvalStatus,
        rawPayload: {
          distance: minDistance,
          nearestSpot: nearestSpot?.name,
          timestamp: wibTime.toISOString(),
        },
      },
      include: {
        employee: { select: { name: true, pin: true } },
        spot: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: log,
      message: isInSpot 
        ? "Absensi berhasil" 
        : "Absensi berhasil (menunggu approval admin - di luar area)",
      distance: Math.round(minDistance),
      nearestSpot: nearestSpot?.name,
      isInSpot,
    }, { status: 201 });
  } catch (error) {
    console.error("[API] Mobile attendance error:", error);
    return NextResponse.json(
      { error: "Failed to submit attendance" },
      { status: 500 }
    );
  }
}
