import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const daySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isDayOff: z.boolean(),
  shiftId: z.string().nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  days: z.array(daySchema).length(7).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ws = await prisma.workSchedule.findUnique({
      where: { id },
      include: {
        days: { include: { shift: true }, orderBy: { dayOfWeek: "asc" } },
        employees: { include: { employee: { select: { id: true, name: true, pin: true } } } },
      },
    });
    if (!ws) return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    return NextResponse.json(ws);
  } catch (error) {
    console.error("[API] Get work schedule error:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const existing = await prisma.workSchedule.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });

    if (validated.days) {
      for (const d of validated.days) {
        if (!d.isDayOff && !d.shiftId) {
          return NextResponse.json(
            { error: `Hari kerja harus memilih shift (day ${d.dayOfWeek})` },
            { status: 400 }
          );
        }
      }
    }

    // Update name/isActive, and if days provided, replace them wholesale
    const ws = await prisma.$transaction(async (tx) => {
      await tx.workSchedule.update({
        where: { id },
        data: {
          name: validated.name,
          isActive: validated.isActive,
        },
      });

      if (validated.days) {
        await tx.workScheduleDay.deleteMany({ where: { workScheduleId: id } });
        await tx.workScheduleDay.createMany({
          data: validated.days.map((d) => ({
            workScheduleId: id,
            dayOfWeek: d.dayOfWeek,
            isDayOff: d.isDayOff,
            shiftId: d.isDayOff ? null : d.shiftId ?? null,
          })),
        });
      }

      return tx.workSchedule.findUnique({
        where: { id },
        include: { days: { include: { shift: true }, orderBy: { dayOfWeek: "asc" } } },
      });
    });

    return NextResponse.json(ws);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.issues }, { status: 400 });
    }
    console.error("[API] Update work schedule error:", error);
    return NextResponse.json({ error: "Gagal mengupdate jadwal" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.workSchedule.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });
    if (!existing) return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });

    if (existing._count.employees > 0) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus jadwal yang masih ditugaskan ke karyawan" },
        { status: 400 }
      );
    }

    await prisma.workSchedule.delete({ where: { id } });
    return NextResponse.json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    console.error("[API] Delete work schedule error:", error);
    return NextResponse.json({ error: "Gagal menghapus jadwal" }, { status: 500 });
  }
}
