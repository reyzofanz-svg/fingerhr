import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import ExcelJS from "exceljs";
import { buildEmployeeReport, EmployeeReport } from "@/lib/reports/attendance";

const THIN = { style: "thin" as const, color: { argb: "FF999999" } };
const ALL_BORDERS = { top: THIN, left: THIN, bottom: THIN, right: THIN };

function ddmmyyyy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function renderSheet(ws: ExcelJS.Worksheet, report: EmployeeReport) {
  const { employee, periode, rows, recap } = report;
  const LAST_COL = 18; // R

  // Column widths
  const widths = [12, 9, 7, 8, 8, 13, 10, 13, 11, 8, 8, 8, 8, 8, 12, 11, 7, 30];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  let r = 1;

  // Title
  ws.mergeCells(r, 1, r, LAST_COL);
  const title = ws.getCell(r, 1);
  title.value = "DAILY DETAIL REPORT";
  title.font = { bold: true, size: 14 };
  title.alignment = { horizontal: "center" };
  r++;

  ws.mergeCells(r, 1, r, LAST_COL);
  const per = ws.getCell(r, 1);
  per.value = `Period: ${ddmmyyyy(periode.start)} to ${ddmmyyyy(periode.end)}`;
  per.font = { italic: true };
  per.alignment = { horizontal: "center" };
  r += 2;

  // Identity
  ws.getCell(r, 1).value = `Name: ${employee.name}`;
  ws.getCell(r, 1).font = { bold: true };
  r++;
  ws.getCell(r, 1).value = `ID: ${employee.pin} | Department: ${employee.department || "-"} | Position: ${employee.position || "-"}`;
  r += 2;

  // Recap box
  ws.getCell(r, 1).value = "Employee Attendance Recap";
  ws.getCell(r, 1).font = { bold: true };
  r++;
  const recapRows: [string, string | number][][] = [
    [
      ["Attendance", recap.kehadiran],
      ["Work Duration", recap.durasiKerja],
      ["Early Departure", recap.pulangAwal],
      ["No Clock In", recap.tidakAbsenMasuk],
      ["Absent", recap.alpha],
    ],
    [
      ["Attendance Percentage", recap.presentase],
      ["Total Duration", recap.totalDurasi],
      ["Extended Break", recap.istirahatLebih],
      ["No Clock Out", recap.tidakAbsenKeluar],
      ["Number of Leaves", recap.jumlahIzin],
    ],
    [["Late Arrival", recap.datangTerlambat]],
  ];
  for (const line of recapRows) {
    let col = 1;
    for (const [label, value] of line) {
      const labelCell = ws.getCell(r, col);
      labelCell.value = label;
      labelCell.font = { size: 9 };
      const valCell = ws.getCell(r, col + 1);
      valCell.value = `: ${value}`;
      valCell.font = { size: 9, bold: true };
      col += 3;
    }
    r++;
  }
  r++;

  // ---- Table header (two rows, grouped) ----
  const h1 = r;
  const h2 = r + 1;

  const vmerge = (col: number, label: string) => {
    ws.mergeCells(h1, col, h2, col);
    ws.getCell(h1, col).value = label;
  };
  const gmerge = (c1: number, c2: number, label: string) => {
    ws.mergeCells(h1, c1, h1, c2);
    ws.getCell(h1, c1).value = label;
  };

  vmerge(1, "Date");
  vmerge(2, "Day");
  gmerge(3, 5, "Schedule");
  gmerge(6, 9, "Attendance");
  gmerge(10, 11, "Break");
  gmerge(12, 14, "Overtime");
  vmerge(15, "Work Duration");
  vmerge(16, "Clock In");
  vmerge(17, "Holiday");
  vmerge(18, "Notes");

  const sub = ["Shift", "Masuk", "Pulang", "Absensi Masuk", "Terlambat", "Absensi Pulang", "Pulang Cepat", "Durasi", "Lebih", "Awal", "Akhir", "Shift"];
  sub.forEach((label, i) => {
    ws.getCell(h2, 3 + i).value = label;
  });

  for (let row = h1; row <= h2; row++) {
    for (let c = 1; c <= LAST_COL; c++) {
      const cell = ws.getCell(row, c);
      cell.font = { bold: true, size: 9 };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
      cell.border = ALL_BORDERS;
    }
  }
  r = h2 + 1;

  // ---- Data rows ----
  for (const row of rows) {
    const values = [
      row.tanggal, row.hari, row.shiftName, row.jadwalMasuk, row.jadwalPulang,
      row.absensiMasuk, row.terlambat, row.absensiPulang, row.pulangCepat,
      row.istirahatDurasi, row.istirahatLebih, row.lemburAwal, row.lemburAkhir, row.lemburShift,
      row.durasiKerja, row.masukKerja, row.libur, row.keterangan,
    ];
    values.forEach((v, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = v as any;
      cell.font = { size: 9 };
      cell.border = ALL_BORDERS;
      // Center everything except Tanggal(1)/Keterangan(18)
      if (i !== 0 && i !== 17) cell.alignment = { horizontal: "center" };
    });
    if (row.libur === 1) {
      for (let c = 1; c <= LAST_COL; c++) {
        ws.getCell(r, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F7F7" } };
      }
    }
    r++;
  }

  // Freeze header
  ws.views = [{ state: "frozen", ySplit: h2 }];
}

function safeSheetName(name: string, pin: string): string {
  // Excel sheet names: max 31 chars, no []:*?/\
  const base = `${name}`.replace(/[\[\]:*?/\\]/g, " ").slice(0, 26).trim();
  return `${base} ${pin}`.slice(0, 31) || pin;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const employeeId = searchParams.get("employeeId");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    // Resolve employee list
    let employeeIds: string[];
    if (employeeId) {
      employeeIds = [employeeId];
    } else {
      const all = await prisma.employee.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true },
      });
      employeeIds = all.map((e) => e.id);
    }

    if (employeeIds.length === 0) {
      return NextResponse.json({ error: "No employees found" }, { status: 404 });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "FingerHR";
    workbook.created = new Date();

    const usedNames = new Set<string>();
    for (const id of employeeIds) {
      const report = await buildEmployeeReport(id, startDate, endDate);
      let name = safeSheetName(report.employee.name, report.employee.pin);
      let n = name;
      let i = 2;
      while (usedNames.has(n)) n = `${name.slice(0, 28)} ${i++}`;
      usedNames.add(n);
      const ws = workbook.addWorksheet(n, { properties: { defaultRowHeight: 15 } });
      renderSheet(ws, report);
    }

    const buffer = await workbook.xlsx.writeBuffer();
      const fname = employeeId
      ? `detail-report-${startDate}.xlsx`
      : `detail-report-all-${startDate}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${fname}`,
      },
    });
  } catch (error) {
    console.error("[API] Detail excel error:", error);
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 });
  }
}
