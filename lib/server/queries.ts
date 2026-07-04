import { prisma } from "@/lib/db/prisma";

// Server-side data access for dashboard pages. These run on the server so the
// initial paint already has data (no client-side fetch waterfall / spinner).
// The existing /api routes are kept for client-side refresh-after-mutation.

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

/**
 * Dashboard overview. Uses count() for stats instead of downloading full
 * lists, and fetches everything in parallel.
 */
export async function getDashboardData() {
  const today = isoDate(new Date());
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekStart = isoDate(weekAgo);

  // Match the boundaries used by /api/attendance/logs exactly.
  const todayStart = new Date(today);
  const todayEnd = new Date(today + "T23:59:59");
  const weekStartDate = new Date(weekStart);

  const [
    totalEmployees,
    activeEmployees,
    totalDevices,
    onlineDevices,
    todayAttendance,
    pendingPermissions,
    recentAttendanceRaw,
    recentPermsRaw,
    weekLogs,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.device.count(),
    prisma.device.count({ where: { status: "ONLINE" } }),
    prisma.attendanceLog.count({
      where: { scanTime: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.permission.count({ where: { status: "PENDING" } }),
    prisma.attendanceLog.findMany({
      where: { scanTime: { gte: todayStart, lte: todayEnd } },
      include: {
        employee: { select: { name: true, department: true } },
        device: { select: { name: true } },
      },
      orderBy: { scanTime: "desc" },
      take: 10,
    }),
    prisma.permission.findMany({
      include: { employee: { select: { name: true, department: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.attendanceLog.findMany({
      where: { scanTime: { gte: weekStartDate, lte: todayEnd } },
      select: { scanTime: true, status: true },
    }),
  ]);

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const now = new Date();
  const weeklyData = days.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dateStr = isoDate(d);
    const dayAtt = weekLogs.filter((a) =>
      a.scanTime.toISOString().startsWith(dateStr)
    );
    return {
      day,
      masuk: dayAtt.filter((a) => a.status === "IN").length,
      keluar: dayAtt.filter((a) => a.status === "OUT").length,
    };
  });

  return {
    stats: {
      totalEmployees,
      activeEmployees,
      totalDevices,
      onlineDevices,
      todayAttendance,
      pendingPermissions,
    },
    recentAttendance: recentAttendanceRaw.map((log) => ({
      id: log.id,
      scanTime: log.scanTime.toISOString(),
      status: log.status,
      employee: {
        name: log.employee.name,
        department: log.employee.department,
      },
      device: { name: log.device.name },
    })),
    recentPermissions: recentPermsRaw.map((p) => ({
      id: p.id,
      type: p.type,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      employee: {
        name: p.employee.name,
        department: p.employee.department,
      },
    })),
    weeklyData,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

/**
 * Employee list for the Karyawan page — same shape as GET /api/employees
 * ({ employees: [...] }), used to seed the initial render.
 */
export async function getEmployeesData() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      attendanceLogs: {
        take: 1,
        orderBy: { scanTime: "desc" },
        select: { scanTime: true },
      },
    },
  });

  return employees.map((emp) => ({
    id: emp.id,
    pin: emp.pin,
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    department: emp.department,
    position: emp.position,
    isActive: emp.isActive,
    telegramChatId: emp.telegramChatId || null,
    telegramUsername: emp.telegramUsername || null,
    lastAttendance: emp.attendanceLogs[0]?.scanTime?.toISOString() || null,
    createdAt: emp.createdAt.toISOString(),
  }));
}

export type EmployeeData = Awaited<ReturnType<typeof getEmployeesData>>;

/**
 * Personal attendance for the logged-in employee (by email). Mirrors
 * GET /api/employees/me/attendance. Returns null if no matching employee.
 */
export async function getMyAttendanceData(
  email: string,
  startDate: string,
  endDate: string
) {
  const employee = await prisma.employee.findFirst({ where: { email } });
  if (!employee) return null;

  const where: any = { employeeId: employee.id };
  if (startDate && endDate) {
    where.scanTime = {
      gte: new Date(startDate),
      lte: new Date(endDate + "T23:59:59"),
    };
  }

  const logs = await prisma.attendanceLog.findMany({
    where,
    include: { device: { select: { name: true, ip: true } } },
    orderBy: { scanTime: "desc" },
    take: 200,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayLogs = logs.filter((log) => {
    const scanDate = new Date(log.scanTime);
    return scanDate >= today && scanDate <= todayEnd;
  });

  const totalIn = logs.filter((l) => l.status === "IN").length;
  const totalOut = logs.filter((l) => l.status === "OUT").length;

  let avgWorkHours = 0;
  const dayPairs: { in: Date; out: Date }[] = [];
  const logsByDate = new Map<string, typeof logs>();
  for (const log of logs) {
    const dateKey = new Date(log.scanTime).toISOString().split("T")[0];
    if (!logsByDate.has(dateKey)) logsByDate.set(dateKey, []);
    logsByDate.get(dateKey)!.push(log);
  }
  for (const dayLogs of logsByDate.values()) {
    const inLog = dayLogs.find((l) => l.status === "IN");
    const outLog = dayLogs.find((l) => l.status === "OUT");
    if (inLog && outLog) {
      dayPairs.push({ in: new Date(inLog.scanTime), out: new Date(outLog.scanTime) });
    }
  }
  if (dayPairs.length > 0) {
    const totalMinutes = dayPairs.reduce(
      (sum, p) => sum + (p.out.getTime() - p.in.getTime()) / 60000,
      0
    );
    avgWorkHours = totalMinutes / dayPairs.length / 60;
  }

  const latestLog = logs[0] || null;

  return {
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
    },
    logs: logs.map((log) => ({
      id: log.id,
      scanTime: log.scanTime.toISOString(),
      status: log.status,
      verifyMethod: log.verifyMethod,
      type: log.type,
      device: log.device,
    })),
    todayLogs: todayLogs.map((log) => ({
      id: log.id,
      scanTime: log.scanTime.toISOString(),
      status: log.status,
      device: log.device,
    })),
    summary: {
      totalIn,
      totalOut,
      avgWorkHours: Math.round(avgWorkHours * 10) / 10,
      latestAttendance: latestLog
        ? { scanTime: latestLog.scanTime.toISOString(), status: latestLog.status }
        : null,
    },
  };
}

/**
 * Permissions page — permissions list + employees for the dropdown.
 * Mirrors GET /api/permissions (unfiltered) and the employees dropdown.
 */
export async function getPermissionsData() {
  const [permissions, employees] = await Promise.all([
    prisma.permission.findMany({
      include: {
        employee: {
          select: { id: true, name: true, pin: true, department: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, pin: true },
    }),
  ]);

  return {
    permissions: permissions.map((p) => ({
      id: p.id,
      employeeId: p.employeeId,
      type: p.type,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      reason: p.reason,
      notes: p.notes,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      employee: p.employee,
    })),
    employees,
  };
}

export type PermissionsData = Awaited<ReturnType<typeof getPermissionsData>>;

/**
 * Schedule page — shifts, work schedules, employees, assignments.
 * Mirrors the four GETs the page fetches on mount. The JSON round-trip
 * produces the exact same plain-object/ISO-string shape the API returns.
 */
export async function getScheduleData() {
  const [shifts, workSchedules, employees, assignments] = await Promise.all([
    prisma.schedule.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { workScheduleDays: true } } },
    }),
    prisma.workSchedule.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        days: {
          include: {
            shift: {
              select: { id: true, name: true, startTime: true, endTime: true },
            },
          },
          orderBy: { dayOfWeek: "asc" },
        },
        _count: { select: { employees: true } },
      },
    }),
    prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, pin: true },
    }),
    prisma.employeeSchedule.findMany({
      include: {
        employee: { select: { id: true, name: true, pin: true } },
        workSchedule: {
          include: {
            days: { include: { shift: true }, orderBy: { dayOfWeek: "asc" } },
          },
        },
      },
      orderBy: { effectiveFrom: "desc" },
    }),
  ]);

  return JSON.parse(
    JSON.stringify({ shifts, workSchedules, employees, assignments })
  ) as {
    shifts: any[];
    workSchedules: any[];
    employees: { id: string; name: string; pin: string }[];
    assignments: any[];
  };
}

export type ScheduleData = Awaited<ReturnType<typeof getScheduleData>>;
