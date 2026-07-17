import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// PUT reset device binding for employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find employee
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Karyawan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Deactivate all device bindings for this employee
    await prisma.mobileDeviceBinding.updateMany({
      where: { employeeId: id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: `Device binding untuk ${employee.name} berhasil direset. Karyawan bisa login di device baru.`,
    });
  } catch (error) {
    console.error("[API] Reset device error:", error);
    return NextResponse.json(
      { error: "Gagal reset device" },
      { status: 500 }
    );
  }
}
