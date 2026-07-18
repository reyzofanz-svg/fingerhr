"use client";

import { motion } from "framer-motion";

interface AttendanceRecord {
  id: string;
  employeeName: string;
  scanTime: string;
  status: "IN" | "OUT";
  isInSpot: boolean | null;
  approvalStatus: string;
  approvedBy: string | null;
  approvalNote: string | null;
}

interface SummaryCardsProps {
  records: AttendanceRecord[];
  loading: boolean;
}

export function SummaryCards({ records, loading }: SummaryCardsProps) {
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter(r => r.scanTime.startsWith(today));
  
  const stats = {
    total: todayRecords.length,
    pending: todayRecords.filter(r => r.approvalStatus === "PENDING").length,
    approved: todayRecords.filter(r => r.approvalStatus === "APPROVED").length,
    rejected: todayRecords.filter(r => r.approvalStatus === "REJECTED").length,
    outOfArea: todayRecords.filter(r => r.isInSpot === false).length,
    uniqueEmployees: new Set(todayRecords.map(r => r.employeeName)).size,
  };

  const cards = [
    {
      label: "Total Absensi",
      value: stats.total,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Pending Approval",
      value: stats.pending,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Luar Area",
      value: stats.outOfArea,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Karyawan Unik",
      value: stats.uniqueEmployees,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">
                {loading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-surface-container" />
                ) : (
                  card.value
                )}
              </p>
              <p className="text-xs text-on-surface-variant">{card.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
