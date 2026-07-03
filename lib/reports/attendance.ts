import { prisma } from "@/lib/db/prisma";

// ============================================
// Laporan Rincian Harian — perhitungan per hari
// Mengikuti format dokumentasi/contohlaporan.png
// ============================================

export interface DailyRow {
  tanggal: string; // dd/mm/yyyy
  hari: string; // Senin, Selasa, ...
  shiftName: string; // Ketentuan: Shift
  jadwalMasuk: string; // Ketentuan: Masuk (HH.MM)
  jadwalPulang: string; // Ketentuan: Pulang (HH.MM)
  absensiMasuk: string; // Kehadiran: jam scan masuk (HH.MM)
  terlambat: string; // durasi telat (HH.MM) atau "-"
  absensiPulang: string; // jam scan pulang (HH.MM)
  pulangCepat: string; // durasi pulang cepat (HH.MM) atau "-"
  istirahatDurasi: string;
  istirahatLebih: string;
  lemburAwal: string;
  lemburAkhir: string;
  lemburShift: string;
  durasiKerja: string; // HH.MM
  masukKerja: number; // 1/0
  libur: number; // 1/0
  keterangan: string;
}

export interface ReportRecap {
  kehadiran: number;
  durasiKerja: string; // total H:MM
  pulangAwal: string; // total H:MM
  tidakAbsenMasuk: number;
  alpha: number;
  presentase: string; // "100%"
  totalDurasi: string; // total lembur H:MM
  istirahatLebih: string;
  tidakAbsenKeluar: number;
  jumlahIzin: number;
  datangTerlambat: string; // total telat H:MM
}

export interface EmployeeReport {
  employee: {
    id: string;
    name: string;
    pin: string;
    department: string | null;
    position: string | null;
  };
  periode: { start: string; end: string };
  rows: DailyRow[];
  recap: ReportRecap;
}

const TZ = "Asia/Jakarta";
const DASH = "-";

const clockFmt = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

/** Format a Date instant to WIB clock "HH.MM". */
function fmtClock(d: Date): string {
  // id-ID already yields "HH.MM"; normalise just in case
  return clockFmt.format(d).replace(":", ".");
}

/** "08:30" or "08.30" -> minutes since midnight. */
function timeToMinutes(t: string | null | undefined): number | null {
  if (!t) return null;
  const m = t.replace(".", ":").match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
}

/** minutes -> "HH.MM" (clock-like, zero padded). */
function minutesToClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

/** total minutes -> "H:MM" (hours may exceed 24, for recap durations). */
function minutesToDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** WIB clock minutes from an instant. */
function wibMinutes(d: Date): number {
  const parts = fmtClock(d).split(".");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/** List of YYYY-MM-DD strings from start..end inclusive. */
function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  let guard = 0;
  while (cur <= last && guard < 400) {
    out.push(cur.toISOString().slice(0, 10));
    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
    guard++;
  }
  return out;
}

const hariFmt = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" });

function dayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}
function hariName(dateStr: string): string {
  return hariFmt.format(new Date(`${dateStr}T12:00:00Z`));
}
function ddmmyyyy(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

interface ResolvedDay {
  isDayOff: boolean;
  shift: {
    name: string;
    startTime: string;
    endTime: string;
    breakStart: string | null;
    breakEnd: string | null;
    overtimeStart: string | null;
    graceMinutes: number;
  } | null;
}

/** Net scheduled minutes for a shift (end - start - break). */
function scheduledMinutes(shift: ResolvedDay["shift"]): number {
  if (!shift) return 0;
  const s = timeToMinutes(shift.startTime);
  const e = timeToMinutes(shift.endTime);
  if (s == null || e == null) return 0;
  let dur = e - s;
  const bs = timeToMinutes(shift.breakStart);
  const be = timeToMinutes(shift.breakEnd);
  if (bs != null && be != null && be > bs) dur -= be - bs;
  return Math.max(0, dur);
}

/**
 * Build a full per-employee daily report for a date range.
 * Uses the employee's assigned WorkSchedule (jadwal) to determine the shift
 * (or day-off) for each weekday.
 */
export async function buildEmployeeReport(
  employeeId: string,
  start: string,
  end: string
): Promise<EmployeeReport> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, name: true, pin: true, department: true, position: true },
  });
  if (!employee) throw new Error("Karyawan tidak ditemukan");

  const startInstant = new Date(`${start}T00:00:00+07:00`);
  const endInstant = new Date(`${end}T23:59:59.999+07:00`);

  // Attendance logs in range
  const logs = await prisma.attendanceLog.findMany({
    where: { employeeId, scanTime: { gte: startInstant, lte: endInstant } },
    orderBy: { scanTime: "asc" },
    select: { scanTime: true, status: true },
  });

  // Approved permissions overlapping range
  const permissions = await prisma.permission.findMany({
    where: {
      employeeId,
      status: "APPROVED",
      startDate: { lte: endInstant },
      endDate: { gte: startInstant },
    },
    select: { startDate: true, endDate: true, type: true },
  });

  // Resolve the active work schedule (jadwal) for this employee in the period
  const assignment = await prisma.employeeSchedule.findFirst({
    where: {
      employeeId,
      effectiveFrom: { lte: endInstant },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: startInstant } }],
    },
    orderBy: { effectiveFrom: "desc" },
    include: { workSchedule: { include: { days: { include: { shift: true } } } } },
  });

  const dowMap = new Map<number, ResolvedDay>();
  if (assignment?.workSchedule) {
    for (const d of assignment.workSchedule.days) {
      dowMap.set(d.dayOfWeek, {
        isDayOff: d.isDayOff,
        shift: d.shift
          ? {
              name: d.shift.name,
              startTime: d.shift.startTime,
              endTime: d.shift.endTime,
              breakStart: d.shift.breakStart,
              breakEnd: d.shift.breakEnd,
              overtimeStart: d.shift.overtimeStart,
              graceMinutes: d.shift.graceMinutes,
            }
          : null,
      });
    }
  }

  // Group logs by WIB date
  const logsByDate = new Map<string, Date[]>();
  const outByDate = new Map<string, Date[]>();
  for (const log of logs) {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(log.scanTime); // YYYY-MM-DD
    if (log.status === "IN") {
      if (!logsByDate.has(key)) logsByDate.set(key, []);
      logsByDate.get(key)!.push(log.scanTime);
    } else {
      if (!outByDate.has(key)) outByDate.set(key, []);
      outByDate.get(key)!.push(log.scanTime);
    }
  }

  const isOnLeave = (dateStr: string) => {
    const day = new Date(`${dateStr}T12:00:00+07:00`);
    return permissions.some((p) => p.startDate <= day && p.endDate >= day);
  };

  const rows: DailyRow[] = [];
  let kehadiran = 0;
  let totalWorkMin = 0;
  let totalLateMin = 0;
  let totalEarlyMin = 0;
  let totalOvertimeMin = 0;
  let tidakAbsenMasuk = 0;
  let tidakAbsenKeluar = 0;
  let alpha = 0;
  let jumlahIzin = 0;
  let workingDays = 0;

  for (const dateStr of dateRange(start, end)) {
    const dow = dayOfWeek(dateStr);
    const resolved = dowMap.get(dow) ?? { isDayOff: dow === 0, shift: null };
    const onLeave = isOnLeave(dateStr);

    // Day off
    if (resolved.isDayOff) {
      rows.push(blankRow(dateStr, {
        libur: 1,
        keterangan: "Libur Rutin",
      }));
      continue;
    }

    workingDays++;
    const shift = resolved.shift;
    const inScans = logsByDate.get(dateStr) || [];
    const outScans = outByDate.get(dateStr) || [];
    const clockIn = inScans.length ? inScans[0] : null;
    const clockOut = outScans.length ? outScans[outScans.length - 1] : null;

    if (onLeave) {
      const permType = permissions.find((p) => {
        const day = new Date(`${dateStr}T12:00:00+07:00`);
        return p.startDate <= day && p.endDate >= day;
      })?.type;
      jumlahIzin++;
      rows.push(blankRow(dateStr, {
        shiftName: shift?.name ?? DASH,
        jadwalMasuk: shift ? fmtHM(shift.startTime) : DASH,
        jadwalPulang: shift ? fmtHM(shift.endTime) : DASH,
        keterangan: permType === "SICK" ? "Sakit" : permType === "CUTI" ? "Cuti" : "Izin",
      }));
      continue;
    }

    const row = blankRow(dateStr, {
      shiftName: shift?.name ?? DASH,
      jadwalMasuk: shift ? fmtHM(shift.startTime) : DASH,
      jadwalPulang: shift ? fmtHM(shift.endTime) : DASH,
    });

    if (clockIn) {
      kehadiran++;
      row.masukKerja = 1;
      row.absensiMasuk = fmtClock(clockIn);

      // Late
      if (shift) {
        const startMin = timeToMinutes(shift.startTime)!;
        const inMin = wibMinutes(clockIn);
        if (inMin > startMin + shift.graceMinutes) {
          const late = inMin - startMin;
          row.terlambat = minutesToClock(late);
          totalLateMin += late;
        }
      }

      // Clock out / early leave / overtime
      if (clockOut) {
        row.absensiPulang = fmtClock(clockOut);
        if (shift) {
          const endMin = timeToMinutes(shift.endTime)!;
          const outMin = wibMinutes(clockOut);
          if (outMin < endMin) {
            const early = endMin - outMin;
            row.pulangCepat = minutesToClock(early);
            totalEarlyMin += early;
          }
          const otStart = timeToMinutes(shift.overtimeStart);
          if (otStart != null && outMin > otStart) {
            const ot = outMin - otStart;
            row.lemburAkhir = minutesToClock(ot);
            totalOvertimeMin += ot;
          }
        }
      } else {
        tidakAbsenKeluar++;
      }

      // Counted work duration = scheduled net shift minutes
      const sched = scheduledMinutes(shift);
      row.durasiKerja = minutesToClock(sched);
      totalWorkMin += sched;
    } else {
      // no clock-in on a working day
      tidakAbsenMasuk++;
      alpha++;
      row.keterangan = "Alpha";
    }

    rows.push(row);
  }

  const presentase = workingDays > 0 ? Math.round((kehadiran / workingDays) * 100) : 0;

  const recap: ReportRecap = {
    kehadiran,
    durasiKerja: minutesToDuration(totalWorkMin),
    pulangAwal: minutesToDuration(totalEarlyMin),
    tidakAbsenMasuk,
    alpha,
    presentase: `${presentase}%`,
    totalDurasi: minutesToDuration(totalOvertimeMin),
    istirahatLebih: "0:00",
    tidakAbsenKeluar,
    jumlahIzin,
    datangTerlambat: minutesToDuration(totalLateMin),
  };

  return {
    employee,
    periode: { start, end },
    rows,
    recap,
  };
}

function fmtHM(t: string): string {
  return t.replace(":", ".");
}

function blankRow(dateStr: string, overrides: Partial<DailyRow> = {}): DailyRow {
  return {
    tanggal: ddmmyyyy(dateStr),
    hari: hariName(dateStr),
    shiftName: DASH,
    jadwalMasuk: DASH,
    jadwalPulang: DASH,
    absensiMasuk: DASH,
    terlambat: DASH,
    absensiPulang: DASH,
    pulangCepat: DASH,
    istirahatDurasi: DASH,
    istirahatLebih: DASH,
    lemburAwal: DASH,
    lemburAkhir: DASH,
    lemburShift: DASH,
    durasiKerja: DASH,
    masukKerja: 0,
    libur: 0,
    keterangan: "",
    ...overrides,
  };
}
