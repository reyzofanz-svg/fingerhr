import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/employees/sync/test-webhook
 * Simulate webhook response untuk testing lokal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Find device
    const device = await prisma.device.findFirst();
    if (!device) {
      return NextResponse.json(
        { error: "No devices registered" },
        { status: 400 }
      );
    }

    // Update device status
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSync: new Date(), status: "ONLINE" },
    });

    switch (type) {
      case "get_all_pin": {
        // Simulate get_all_pin webhook response
        const pins = data?.pins || ["1", "2", "3", "4", "5", "6", "7", "8"];
        
        console.log("[Test Webhook] Simulating get_all_pin with pins:", pins);
        
        // Auto-trigger getUserinfo for each pin
        for (const pin of pins) {
          const existing = await prisma.employee.findUnique({
            where: { pin: String(pin) },
          });

          if (!existing) {
            await prisma.employee.create({
              data: {
                pin: String(pin),
                name: `Employee PIN ${pin}`,
                isActive: true,
              },
            });
            console.log(`[Test Webhook] Created employee for PIN ${pin}`);
          }
        }

        // Log webhook
        await prisma.webhookLog.create({
          data: {
            type: "get_all_pin",
            deviceCloudId: device.cloudId,
            status: "SUCCESS",
            payload: { type: "get_all_pin", pins } as any,
          },
        });

        return NextResponse.json({
          success: true,
          message: `${pins.length} employees synchronized successfully`,
          pins,
        });
      }

      case "userinfo": {
        // Simulate userinfo webhook response
        const { pin, name } = data || {};
        
        if (!pin || !name) {
          return NextResponse.json(
            { error: "PIN and Name are required" },
            { status: 400 }
          );
        }

        const employee = await prisma.employee.upsert({
          where: { pin: String(pin) },
          update: { name: String(name), isActive: true },
          create: {
            pin: String(pin),
            name: String(name),
            isActive: true,
          },
        });

        await prisma.webhookLog.create({
          data: {
            type: "userinfo",
            deviceCloudId: device.cloudId,
            status: "SUCCESS",
            payload: { type: "userinfo", pin, name } as any,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Employee ${name} synchronized successfully`,
          employee,
        });
      }

      default:
        return NextResponse.json(
          { error: "Unknown type. Use 'get_all_pin' or 'userinfo'" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Test Webhook] Error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
