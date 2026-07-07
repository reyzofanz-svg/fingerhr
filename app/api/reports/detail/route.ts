import { NextRequest, NextResponse } from "next/server";
import { buildEmployeeReport } from "@/lib/reports/attendance";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const employeeId = searchParams.get("employeeId");

    if (!startDate || !endDate || !employeeId) {
      return NextResponse.json(
        { error: "startDate, endDate, and employeeId are required" },
        { status: 400 }
      );
    }

    const report = await buildEmployeeReport(employeeId, startDate, endDate);
    return NextResponse.json(report);
  } catch (error) {
    console.error("[API] Detail report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
