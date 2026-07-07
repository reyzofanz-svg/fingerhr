"use client";

import dynamic from "next/dynamic";

const ScheduleClient = dynamic(
  () => import("./ScheduleClient").then((m) => m.ScheduleClient),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-32 animate-pulse rounded-xl bg-white/5" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0f0f15]" />
          ))}
        </div>
      </div>
    ),
  }
);

export default function SchedulePage() {
  return (
    <ScheduleClient
      initialShifts={[]}
      initialWorkSchedules={[]}
      initialEmployees={[]}
      initialAssignments={[]}
    />
  );
}
