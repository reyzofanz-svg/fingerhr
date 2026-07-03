/**
 * Migration: Shift scan-windows + WorkSchedule (Jadwal) + Telegram fields.
 *
 * Applies raw DDL over the Supabase pooler (Prisma's migration engine does not
 * work through pgBouncer transaction mode, but plain DDL does).
 *
 * Idempotent — safe to run more than once.
 * Run: npx tsx scripts/migrate-shift-jadwal-telegram.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Each entry is ONE statement (DO-blocks kept whole; do not split on ';').
const statements: string[] = [
  // 1) Shift scan windows
  `ALTER TABLE "schedules" ADD COLUMN IF NOT EXISTS "scan_in_start" TEXT`,
  `ALTER TABLE "schedules" ADD COLUMN IF NOT EXISTS "scan_in_end" TEXT`,
  `ALTER TABLE "schedules" ADD COLUMN IF NOT EXISTS "scan_out_start" TEXT`,
  `ALTER TABLE "schedules" ADD COLUMN IF NOT EXISTS "scan_out_end" TEXT`,

  // 2) Employee Telegram fields
  `ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "telegram_chat_id" TEXT`,
  `ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "telegram_username" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "employees_telegram_chat_id_key" ON "employees"("telegram_chat_id")`,

  // 3) work_schedules
  `CREATE TABLE IF NOT EXISTS "work_schedules" (
     "id" TEXT NOT NULL,
     "name" TEXT NOT NULL,
     "is_active" BOOLEAN NOT NULL DEFAULT true,
     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updated_at" TIMESTAMP(3) NOT NULL,
     CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
   )`,

  // 4) work_schedule_days
  `CREATE TABLE IF NOT EXISTS "work_schedule_days" (
     "id" TEXT NOT NULL,
     "work_schedule_id" TEXT NOT NULL,
     "day_of_week" INTEGER NOT NULL,
     "is_day_off" BOOLEAN NOT NULL DEFAULT false,
     "shift_id" TEXT,
     CONSTRAINT "work_schedule_days_pkey" PRIMARY KEY ("id")
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "work_schedule_days_work_schedule_id_day_of_week_key" ON "work_schedule_days"("work_schedule_id","day_of_week")`,
  `CREATE INDEX IF NOT EXISTS "work_schedule_days_work_schedule_id_idx" ON "work_schedule_days"("work_schedule_id")`,
  `DO $$ BEGIN
     ALTER TABLE "work_schedule_days" ADD CONSTRAINT "work_schedule_days_work_schedule_id_fkey"
       FOREIGN KEY ("work_schedule_id") REFERENCES "work_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     ALTER TABLE "work_schedule_days" ADD CONSTRAINT "work_schedule_days_shift_id_fkey"
       FOREIGN KEY ("shift_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 5) Repurpose employee_schedules: schedule_id (shift) -> work_schedule_id (jadwal).
  //    Guarded so it only runs once; clears old (now-invalid) assignments.
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name='employee_schedules' AND column_name='schedule_id'
     ) THEN
       DELETE FROM "employee_schedules";
       ALTER TABLE "employee_schedules" DROP CONSTRAINT IF EXISTS "employee_schedules_schedule_id_fkey";
       ALTER TABLE "employee_schedules" DROP COLUMN "schedule_id";
       ALTER TABLE "employee_schedules" ADD COLUMN "work_schedule_id" TEXT NOT NULL;
       ALTER TABLE "employee_schedules" ADD CONSTRAINT "employee_schedules_work_schedule_id_fkey"
         FOREIGN KEY ("work_schedule_id") REFERENCES "work_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
     END IF;
   END $$`,
];

async function main() {
  console.log("🚀 Applying migration (shift windows + jadwal + telegram)...");
  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    const preview = sql.replace(/\s+/g, " ").slice(0, 70);
    process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}... `);
    await prisma.$executeRawUnsafe(sql);
    console.log("ok");
  }
  console.log("✅ Migration complete.");
}

main()
  .catch((e) => {
    console.error("\n❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
