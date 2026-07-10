import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAllPin, getUserInfo, setUserInfo, deleteUserInfo, registerOnline } from "@/lib/fingerspot";

/**
 * POST /api/employees/sync
 * Trigger sync dari device: GetAllPin → GetUserinfo untuk setiap PIN → save ke database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, employeeId, pin, name, password, card, privilege, transId, deviceCloudId } = body;

    // Find device by cloudId (multi-device support)
    const device = deviceCloudId
      ? await prisma.device.findUnique({ where: { cloudId: deviceCloudId } })
      : await prisma.device.findFirst();

    if (!device) {
      return NextResponse.json(
        { error: "No devices registered" },
        { status: 400 }
      );
    }

    const targetCloudId = device.cloudId;

    switch (action) {
      case "sync-from-device": {
        // Trigger GetAllPin - response via webhook
        const result = await getAllPin(transId || "1", targetCloudId);
        
        if (!result.success) {
          return NextResponse.json(
            { error: "Failed to retrieve PIN data from device", details: result.error },
            { status: 500 }
          );
        }

        // Log the command
        await prisma.apiLog.create({
          data: {
            command: "GET_ALL_PIN",
            deviceCloudId: targetCloudId,
            status: "SUCCESS",
            requestPayload: { action: "sync-from-device" },
            responsePayload: result.data,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Sync from device is being processed. Data will appear automatically.",
          data: result.data,
        });
      }

      case "get-userinfo": {
        // Get user info untuk PIN tertentu
        if (!pin) {
          return NextResponse.json(
            { error: "PIN is required" },
            { status: 400 }
          );
        }

        const result = await getUserInfo(pin, "1", targetCloudId);
        
        await prisma.apiLog.create({
          data: {
            command: "GET_USERINFO",
            deviceCloudId: targetCloudId,
            status: result.success ? "SUCCESS" : "FAILED",
            requestPayload: { pin },
            responsePayload: result.data,
            errorMessage: result.success ? null : result.error,
          },
        });

        return NextResponse.json({
          success: result.success,
          data: result.data,
          error: result.error,
        });
      }

      case "set-userinfo": {
        // Set user info ke device
        if (!pin || !name) {
          return NextResponse.json(
            { error: "PIN and Name are required" },
            { status: 400 }
          );
        }

        const result = await setUserInfo({
          pin,
          name,
          password: password || "",
          card: card || "",
          privilege: privilege || "1", // 1 = user, 2 = admin, 3 = subadmin
          cloudId: targetCloudId,
        });

        await prisma.apiLog.create({
          data: {
            command: "SET_USERINFO",
            deviceCloudId: targetCloudId,
            status: result.success ? "SUCCESS" : "FAILED",
            requestPayload: { pin, name, privilege },
            responsePayload: result.data,
            errorMessage: result.success ? null : result.error,
          },
        });

        return NextResponse.json({
          success: result.success,
          data: result.data,
          error: result.error,
        });
      }

      case "register-online": {
        // Register online untuk PIN tertentu
        if (!pin) {
          return NextResponse.json(
            { error: "PIN is required" },
            { status: 400 }
          );
        }

        const result = await registerOnline(pin, "0", targetCloudId);
        
        await prisma.apiLog.create({
          data: {
            command: "REG_ONLINE",
            deviceCloudId: targetCloudId,
            status: result.success ? "SUCCESS" : "FAILED",
            requestPayload: { pin },
            responsePayload: result.data,
            errorMessage: result.success ? null : result.error,
          },
        });

        return NextResponse.json({
          success: result.success,
          data: result.data,
          error: result.error,
        });
      }

      case "delete-from-device": {
        // Hapus user dari mesin
        if (!pin) {
          return NextResponse.json(
            { error: "PIN is required" },
            { status: 400 }
          );
        }

        const result = await deleteUserInfo(pin, targetCloudId);
        
        await prisma.apiLog.create({
          data: {
            command: "DELETE_USERINFO",
            deviceCloudId: targetCloudId,
            status: result.success ? "SUCCESS" : "FAILED",
            requestPayload: { pin },
            responsePayload: result.data,
            errorMessage: result.success ? null : result.error,
          },
        });

        return NextResponse.json({
          success: result.success,
          data: result.data,
          error: result.error,
        });
      }

      case "add-to-device": {
        // Tambah karyawan baru ke device + database
        if (!pin || !name) {
          return NextResponse.json(
            { error: "PIN and Name are required" },
            { status: 400 }
          );
        }

        // Check if PIN already exists in database
        const existing = await prisma.employee.findUnique({
          where: { pin },
        });

        if (existing) {
          return NextResponse.json(
            { error: "PIN is already used by another employee" },
            { status: 400 }
          );
        }

        // Set user info ke device (with optional face photo)
        const setResult = await setUserInfo({
          pin,
          name,
          password: password || "",
          card: card || "",
          privilege: privilege || "1", // 1 = user, 2 = admin, 3 = subadmin
          face: body.face || undefined,
          cloudId: targetCloudId,
        });

        await prisma.apiLog.create({
          data: {
            command: "SET_USERINFO",
            deviceCloudId: targetCloudId,
            status: setResult.success ? "SUCCESS" : "FAILED",
            requestPayload: { pin, name, privilege, hasFace: !!body.face },
            responsePayload: setResult.data,
            errorMessage: setResult.success ? null : setResult.error,
          },
        });

        if (!setResult.success) {
          return NextResponse.json(
            { error: "Failed to send data to device", details: setResult.error },
            { status: 500 }
          );
        }

        // Register online (verification: 0 = fingerprint)
        // Skip for VIVO/VIDA/DS/DT series (they don't support reg_online)
        const regResult = await registerOnline(pin, "0", targetCloudId);
        
        await prisma.apiLog.create({
          data: {
            command: "REG_ONLINE",
            deviceCloudId: targetCloudId,
            status: regResult.success ? "SUCCESS" : "FAILED",
            requestPayload: { pin },
            responsePayload: regResult.data,
            errorMessage: regResult.success ? null : regResult.error,
          },
        });

        // Save to database
        const employee = await prisma.employee.create({
          data: {
            pin,
            name,
            email: body.email || null,
            phone: body.phone || null,
            department: body.department || null,
            position: body.position || null,
            facePhoto: body.face || null,
            isActive: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully added ${name} to device and database`,
          employee,
          deviceResult: setResult.data,
          registerResult: regResult.data,
        });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Sync employee error:", error);
    return NextResponse.json(
      { error: "Failed to sync employees" },
      { status: 500 }
    );
  }
}
