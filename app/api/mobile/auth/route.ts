import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fingerhr-mobile-secret";

// POST login with PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin, deviceFingerprint, deviceName } = body;

    if (!pin || !deviceFingerprint) {
      return NextResponse.json(
        { error: "PIN dan device fingerprint wajib diisi" },
        { status: 400 }
      );
    }

    // Find employee by PIN
    const employee = await prisma.employee.findUnique({
      where: { pin },
      select: {
        id: true,
        pin: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "PIN salah" },
        { status: 401 }
      );
    }

    if (!employee.isActive) {
      return NextResponse.json(
        { error: "Akun tidak aktif" },
        { status: 403 }
      );
    }

    // Check existing device binding
    const existingBinding = await prisma.mobileDeviceBinding.findUnique({
      where: { deviceFingerprint },
    });

    if (existingBinding) {
      // Device already bound to someone
      if (existingBinding.employeeId !== employee.id) {
        return NextResponse.json(
          { error: "Device ini sudah terdaftar untuk karyawan lain" },
          { status: 403 }
        );
      }
      // Update last used
      await prisma.mobileDeviceBinding.update({
        where: { id: existingBinding.id },
        data: { lastUsedAt: new Date() },
      });
    } else {
      // Check if employee already has an active binding
      const employeeBinding = await prisma.mobileDeviceBinding.findFirst({
        where: {
          employeeId: employee.id,
          isActive: true,
        },
      });

      if (employeeBinding) {
        // Employee already has a different device bound
        return NextResponse.json(
          { 
            error: "Akun sudah terdaftar di device lain. Hubungi admin untuk reset.",
            needsReset: true,
            currentDevice: employeeBinding.deviceName || "Device tidak dikenal",
          },
          { status: 403 }
        );
      }

      // Create new binding
      await prisma.mobileDeviceBinding.create({
        data: {
          employeeId: employee.id,
          deviceFingerprint,
          deviceName: deviceName || "Unknown Device",
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        employeeId: employee.id,
        name: employee.name,
        pin: employee.pin,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      token,
      employee: {
        id: employee.id,
        name: employee.name,
        pin: employee.pin,
      },
    });
  } catch (error) {
    console.error("[API] Mobile PIN login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
