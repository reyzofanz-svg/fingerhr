# FingerHR - Plan & Dokumentasi Lengkap

> **Project**: FingerHR - HRIS dengan Integrasi Fingerspot Absensi
> **Tech Stack**: Next.js 16, Prisma 7, MySQL, Tailwind CSS, NextAuth v5
> **Status**: Planning & Architecture

---

## Table of Contents

1. [Ringkasan Project](#1-ringkasan-project)
2. [Struktur Menu Aplikasi](#2-struktur-menu-aplikasi)
3. [Database Schema & ERD](#3-database-schema--erd)
4. [Alur Kerja API & Webhook](#4-alur-kerja-api--webhook)
5. [Konfigurasi Fingerspot](#5-konfigurasi-fingerspot)
6. [File Structure](#6-file-structure)
7. [Urutan Pengerjaan](#7-urutan-pengerjaan)
8. [Spesifikasi Halaman](#8-spesifikasi-halaman)
9. [Deployment Railway](#9-deployment-railway)
10. [Prompt Lanjutan](#10-prompt-lanjutan)

---

## 1. Ringkasan Project

FingerHR adalah aplikasi HRIS (tanpa payroll) yang mengintegrasikan mesin absensi Fingerspot via developer.fingerspot.io. Fitur utama:

- **Dashboard**: Stats real-time dari database
- **Karyawan**: CRUD data karyawan + sync ke mesin absensi
- **Perangkat**: Status mesin, quick actions, command history
- **Absensi**: Jadwal kerja (regular 08.30-16.30) + Kelola izin (Sakit/CUTI/Izin)
- **Laporan**: Data mentah dari mesin + Laporan detail kehadiran + Export Excel
- **Riwayat**: API Logs & Webhook Logs

### Konfigurasi Existing

| Item | Nilai |
|------|-------|
| API Token | `TPDBEYV5O51USU8U` |
| Cloud ID | `C269248053121C21` |
| Jumlah Mesin | 1 |
| Tipe Jadwal | Regular (08.30-16.30) |
| Jenis Izin | Sakit, CUTI, Izin |
| Multi-tenant | Tidak (single company) |
| Deploy | Railway |

---

## 2. Struktur Menu Aplikasi

```
Landing Page (/)
├── Login (/login)
├── Register (/register)
│
└── Dashboard (/dashboard) [Sidebar Layout]
    ├── Dashboard (overview stats)
    │
    ├── Karyawan (/dashboard/employees)
    │   ├── Daftar Karyawan
    │   ├── Tambah/Edit Karyawan
    │   └── Sync ke Mesin (Set Userinfo API)
    │
    ├── Perangkat (/dashboard/devices)
    │   ├── Status Mesin
    │   ├── Quick Actions (Get Attlog, Get Userinfo, Restart, dll)
    │   ├── Command History
    │   └── Live Webhook Stream
    │
    ├── Absensi (/dashboard/attendance)
    │   ├── Jadwal Kerja (/dashboard/attendance/schedule)
    │   │   ├── Daftar Jadwal (SM1: 08.30-16.30, dll)
    │   │   └── Assign Jadwal ke Karyawan
    │   │
    │   └── Izin (/dashboard/attendance/permissions)
    │       ├── Daftar Izin (Sakit/CUTI/Izin)
    │       └── Ajukan Izin Baru
    │
    ├── Laporan (/dashboard/reports)
    │   ├── Laporan Absensi Perangkat (/dashboard/reports/raw)
    │   │   └── Data mentah dari GET ATTLOG (realtime + manual download)
    │   │
    │   └── Laporan Detail Kehadiran (/dashboard/reports/detail)
    │       └──Processed berdasarkan jadwal + export Excel
    │
    ├── Riwayat (/dashboard/logs)
    │   ├── API Logs (/dashboard/logs/api)
    │   └── Webhook Logs (/dashboard/logs/webhook)
    │
    └── Pengaturan (/dashboard/settings)
        ├── Profil Perusahaan
        └── Konfigurasi Fingerspot API
```

### Sidebar Navigation (diupdate)

```typescript
const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Karyawan", href: "/dashboard/employees" },
  { label: "Perangkat", href: "/dashboard/devices" },
  { label: "Absensi", href: "/dashboard/attendance", children: [
    { label: "Jadwal Kerja", href: "/dashboard/attendance/schedule" },
    { label: "Izin", href: "/dashboard/attendance/permissions" },
  ]},
  { label: "Laporan", href: "/dashboard/reports", children: [
    { label: "Absensi Perangkat", href: "/dashboard/reports/raw" },
    { label: "Detail Kehadiran", href: "/dashboard/reports/detail" },
  ]},
  { label: "Riwayat", href: "/dashboard/logs", children: [
    { label: "API Logs", href: "/dashboard/logs/api" },
    { label: "Webhook Logs", href: "/dashboard/logs/webhook" },
  ]},
  { label: "Pengaturan", href: "/dashboard/settings" },
];
```

---

## 3. Database Schema & ERD

### Prisma Schema (Update)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER AUTH (NextAuth)
// ============================================

enum UserRole {
  ADMIN
  MANAGER
  VIEWER
}

model User {
  id                 String    @id @default(cuid())
  name               String
  email              String    @unique
  password           String
  role               UserRole  @default(VIEWER)
  image              String?
  emailVerified      DateTime? @map("email_verified")
  twoFactorEnabled   Boolean   @default(false) @map("two_factor_enabled")
  twoFactorSecret    String?   @map("two_factor_secret")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@map("users")
}

// ============================================
// EMPLOYEE (Data Karyawan)
// ============================================

model Employee {
  id           String   @id @default(cuid())
  pin          String   @unique  // PIN di mesin absensi
  name         String
  email        String?  @unique
  phone        String?
  department   String?
  position     String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  attendanceLogs  AttendanceLog[]
  schedules       EmployeeSchedule[]
  permissions     Permission[]

  @@map("employees")
}

// ============================================
// DEVICE (Mesin Absensi)
// ============================================

model Device {
  id        String    @id @default(cuid())
  cloudId   String    @unique @map("cloud_id")
  name      String
  type      String    @default("FINGERPRINT")
  ip        String?
  status    String    @default("OFFLINE")
  timezone  String    @default("Asia/Jakarta")
  lastSync  DateTime? @map("last_sync")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  attendanceLogs AttendanceLog[]

  @@map("devices")
}

// ============================================
// ATTENDANCE LOG (Data Absensi dari Mesin)
// ============================================

model AttendanceLog {
  id           String   @id @default(cuid())
  employeeId   String   @map("employee_id")
  deviceId     String   @map("device_id")
  scanTime     DateTime @map("scan_time")
  verifyMethod String?  @map("verify_method") // 1=Password, 2=Fingerprint, 3=Card
  status       String   // "IN" atau "OUT"
  type         String   @default("manual") // "realtime" atau "manual"
  rawPayload   Json?    @map("raw_payload")
  createdAt    DateTime @default(now()) @map("created_at")

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  device   Device   @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@index([deviceId])
  @@index([scanTime])
  @@map("attendance_logs")
}

// ============================================
// SCHEDULE (Jadwal Kerja)
// ============================================

model Schedule {
  id           String   @id @default(cuid())
  name         String   // "SM1", "SM2", "Reguler"
  startTime    String   // "08:30"
  endTime      String   // "16:30"
  graceMinutes Int      @default(15) // toleransi terlambat (menit)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  employees EmployeeSchedule[]

  @@map("schedules")
}

// ============================================
// EMPLOYEE SCHEDULE (Relasi Karyawan + Jadwal)
// ============================================

model EmployeeSchedule {
  id            String    @id @default(cuid())
  employeeId    String    @map("employee_id")
  scheduleId    String    @map("schedule_id")
  effectiveFrom DateTime  @map("effective_from")
  effectiveTo   DateTime? @map("effective_to")
  createdAt     DateTime  @default(now()) @map("created_at")

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  schedule Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@unique([employeeId, effectiveFrom])
  @@index([employeeId])
  @@map("employee_schedules")
}

// ============================================
// PERMISSION (Izin: Sakit/CUTI/Izin)
// ============================================

model Permission {
  id          String   @id @default(cuid())
  employeeId  String   @map("employee_id")
  type        String   // "SICK", "CUTI", "IZIN"
  startDate   DateTime @map("start_date")
  endDate     DateTime @map("end_date")
  reason      String?
  status      String   @default("PENDING") // "PENDING", "APPROVED", "REJECTED"
  approvedBy  String?  @map("approved_by")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@index([startDate, endDate])
  @@map("permissions")
}

// ============================================
// API LOG (Riwayat Request API ke Fingerspot)
// ============================================

model ApiLog {
  id              String    @id @default(cuid())
  command         String    // "GET_ATTLOG", "SET_USERINFO", "GET_USERINFO", dll
  deviceCloudId   String    @map("device_cloud_id")
  transId         String?   @map("trans_id")
  status          String    @default("PENDING") // "PENDING", "SUCCESS", "FAILED"
  requestPayload  Json?     @map("request_payload")
  responsePayload Json?     @map("response_payload")
  errorMessage    String?   @map("error_message")
  duration        Int?      // dalam milidetik
  createdAt       DateTime  @default(now()) @map("created_at")

  @@index([command])
  @@index([status])
  @@index([createdAt])
  @@map("api_logs")
}

// ============================================
// WEBHOOK LOG (Riwayat Response Webhook)
// ============================================

model WebhookLog {
  id            String   @id @default(cuid())
  type          String   // "REALTIME_ATTLOG", "GET_USERINFO", "SET_USERINFO", dll
  deviceCloudId String   @map("device_cloud_id")
  status        String   @default("SUCCESS") // "SUCCESS", "FAILED"
  payload       Json?
  processedAt   DateTime @default(now()) @map("processed_at")
  createdAt     DateTime @default(now()) @map("created_at")

  @@index([type])
  @@index([deviceCloudId])
  @@index([createdAt])
  @@map("webhook_logs")
}
```

### ERD (Entity Relationship Diagram)

```
┌──────────────────────┐
│        User          │
├──────────────────────┤
│ id (PK)             │
│ name                │
│ email (unique)      │
│ password            │
│ role (ADMIN/MANAGER │
│       /VIEWER)      │
│ image?              │
│ createdAt           │
│ updatedAt           │
└──────────────────────┘
        (Auth only, tidak relasi ke employee)

┌──────────────────────┐         ┌──────────────────────┐
│      Employee        │         │       Device          │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)             │         │ id (PK)              │
│ pin (unique) ◄──────┼────┐    │ cloudId (unique)     │
│ name                │    │    │ name                 │
│ email?              │    │    │ type                 │
│ phone?              │    │    │ ip?                  │
│ department?         │    │    │ status               │
│ position?           │    │    │ timezone             │
│ isActive            │    │    │ lastSync?            │
│ createdAt           │    │    │ createdAt            │
│ updatedAt           │    │    │ updatedAt            │
└─────────┬───────────┘    │    └──────────┬───────────┘
          │                │               │
          │ 1:N            │               │ 1:N
          ▼                │               ▼
┌─────────────────────────┐│    ┌─────────────────────────┐
│    AttendanceLog         ││    │                          │
├─────────────────────────┤│    │                          │
│ id (PK)                 ││    │                          │
│ employeeId (FK) ◄───────┤│    │                          │
│ deviceId (FK) ◄─────────┼┼────┘                          │
│ scanTime                ││                               │
│ verifyMethod?           ││                               │
│ status (IN/OUT)         ││                               │
│ type (realtime/manual)  ││                               │
│ rawPayload? (JSON)      ││                               │
│ createdAt               ││                               │
└─────────────────────────┘│
          │                │
          │ 1:N            │
          ▼                │
┌─────────────────────────┐│    ┌──────────────────────┐
│   EmployeeSchedule       ││    │     Schedule          │
├─────────────────────────┤│    ├──────────────────────┤
│ id (PK)                 ││    │ id (PK)              │
│ employeeId (FK) ◄───────┤│    │ name ("SM1")         │
│ scheduleId (FK) ────────┼┼───►│ startTime ("08:30")  │
│ effectiveFrom           ││    │ endTime ("16:30")    │
│ effectiveTo?            ││    │ graceMinutes (15)    │
│ createdAt               ││    │ isActive             │
└─────────────────────────┘│    │ createdAt            │
                           │    │ updatedAt            │
┌─────────────────────────┐│    └──────────────────────┘
│      Permission          │
├─────────────────────────┤
│ id (PK)                 │
│ employeeId (FK) ◄───────┤
│ type (SICK/CUTI/IZIN)   │
│ startDate               │
│ endDate                 │
│ reason?                 │
│ status (PENDING/APPROVED│
│         /REJECTED)      │
│ approvedBy?             │
│ createdAt               │
│ updatedAt               │
└─────────────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│      ApiLog          │    │     WebhookLog       │
├──────────────────────┤    ├──────────────────────┤
│ id (PK)             │    │ id (PK)              │
│ command             │    │ type                 │
│ deviceCloudId       │    │ deviceCloudId        │
│ transId?            │    │ status               │
│ status              │    │ payload? (JSON)      │
│ requestPayload?     │    │ processedAt          │
│ responsePayload?    │    │ createdAt            │
│ errorMessage?       │    └──────────────────────┘
│ duration? (ms)      │
│ createdAt           │
└──────────────────────┘
```

---

## 4. Alur Kerja API & Webhook

### Flow 1: Get Attlog (Download Data Absensi dari Mesin)

```
┌─────────┐     ┌──────────────┐     ┌─────────────────────┐     ┌─────────┐
│  Apps   │────►│ Fingerspot   │────►│    Mesin Absensi    │     │         │
│ (Next.js)│    │ API Server   │     │   (Cloud ID:        │     │         │
│         │◄────│              │◄────│   C269248053121C21) │     │         │
└─────────┘     └──────────────┘     └─────────────────────┘     └─────────┘
     │                                                            │
     │ 1. POST /api/fingerspot/get-attlog                         │
     │    Header: Authorization: Bearer TPDBEYV5O51USU8U         │
     │    Body: { cloud_id, start_date, end_date }                │
     │                                                            │
     │ 2. Fingerspot server forward ke mesin                      │
     │                                                            │
     │ 3. Mesin kirim data attlog balik ke Fingerspot             │
     │                                                            │
     │ 4. Response ke apps: { status, data: [...] }               │
     │                                                            │
     │ 5. Apps simpan ke database AttendanceLog                   │
     └────────────────────────────────────────────────────────────┘
```

**Endpoint Fingerspot API:**
```
POST https://developer.fingerspot.io/api/get_attlog
Headers:
  Authorization: Bearer TPDBEYV5O51USU8U
  Content-Type: application/json
Body:
  {
    "cloud_id": "C269248053121C21",
    "start_date": "2026-06-20",
    "end_date": "2026-06-25"
  }
```

### Flow 2: Realtime Scan (Webhook)

```
┌─────────┐     ┌──────────────┐     ┌─────────────────────┐
│ Mesin   │────►│ Fingerspot   │────►│   Apps (Next.js)    │
│ Absensi │     │ Server       │     │   /api/webhook/     │
│         │     │              │     │   fingerspot        │
└─────────┘     └──────────────┘     └─────────────────────┘
     │                                                            │
     │ 1. Karyawan scan jari di mesin                             │
     │                                                            │
     │ 2. Mesin kirim data ke Fingerspot server                   │
     │                                                            │
     │ 3. Fingerspot forward ke endpoint webhook yang terdaftar   │
     │    POST https://nama-app.up.railway.app/api/webhook/fingerspot
     │    Body: {                                                 │
     │      "type": "attlog",                                     │
     │      "cloud_id": "C269248053121C21",                      │
     │      "data": {                                             │
     │        "pin": "1001",                                      │
     │        "scan": "2026-06-25 08:30",                        │
     │        "verify": "1",                                      │
     │        "status_scan": "1"                                  │
     │      }                                                     │
     │    }                                                       │
     │                                                            │
     │ 4. Apps proses dan simpan ke AttendanceLog                 │
     │    - Cari employee berdasarkan pin                         │
     │    - Tentukan status IN/OUT berdasarkan scan time          │
     │    - Simpan dengan type: "realtime"                        │
     └────────────────────────────────────────────────────────────┘
```

### Flow 3: Set Userinfo (Tambah/Kirim User ke Mesin)

```
┌─────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Apps   │────►│ Fingerspot   │────►│    Mesin Absensi    │
│         │     │ API Server   │     │                     │
│         │◄────│              │◄────│                     │
│         │     └──────────────┘     └─────────────────────┘
│         │                                    │
│         │  ┌─────────────────────────────────┘
│         │  │ Webhook response (status berhasil/gagal)
│         ▼  ▼
│   POST /api/webhook/fingerspot
│   Body: {
│     "type": "set_userinfo",
│     "cloud_id": "C269248053121C21",
│     "data": { "pin": "1001", "name": "Budi", ... }
│   }
└─────────┘
```

### Flow 4: Webhook Payload Types

```typescript
// Realtime Attlog
{
  type: "attlog",
  cloud_id: "C269248053121C21",
  data: {
    pin: "1001",
    scan: "2026-06-25 08:30:00",
    verify: "1",        // 1=Password, 2=Fingerprint, 3=Card
    status_scan: "1"    // 1=IN, 0=OUT
  }
}

// Get Userinfo Response
{
  type: "userinfo",
  cloud_id: "C269248053121C21",
  data: {
    pin: "1001",
    name: "Budi Santoso",
    card: "1234567890",
    privilege: "0"
  }
}

// Set Userinfo Response
{
  type: "set_userinfo",
  cloud_id: "C269248053121C21",
  data: {
    pin: "1001",
    status: "success"  // atau "failed"
  }
}

// Delete Userinfo Response
{
  type: "delete_userinfo",
  cloud_id: "C269248053121C21",
  data: {
    pin: "1001",
    status: "success"
  }
}

// Get All PIN Response
{
  type: "get_all_pin",
  cloud_id: "C269248053121C21",
  data: {
    pins: ["1001", "1002", "1003", ...]
  }
}

// Set Time Response
{
  type: "set_time",
  cloud_id: "C269248053121C21",
  data: {
    status: "success",
    timezone: "Asia/Jakarta"
  }
}

// Register Online Response
{
  type: "reg_online",
  cloud_id: "C269248053121C21",
  data: {
    pin: "1001",
    status: "success"
  }
}
```

---

## 5. Konfigurasi Fingerspot

### .env

```env
# Database (XAMPP MySQL)
DATABASE_URL="mysql://root:@localhost:3306/fingerhr"

# NextAuth
AUTH_SECRET="fingerhr-development-secret-change-in-production"
AUTH_URL="http://localhost:3000"

# Fingerspot API
FINGERSPOT_API_URL="https://developer.fingerspot.io/api"
FINGERSPOT_API_KEY="TPDBEYV5O51USU8U"
FINGERSPOT_CLOUD_ID="C269248053121C21"

# Webhook
WEBHOOK_SECRET=""  # Opsional, untuk verifikasi payload
```

### API Endpoints Fingerspot

| Command | Method | Endpoint | Keterangan |
|---------|--------|----------|------------|
| Get Attlog | POST | `/api/get_attlog` | Ambil data absensi (max 2 hari, 60 hari terakhir) |
| Get Userinfo | POST | `/api/get_userinfo` | Ambil data user (response via webhook) |
| Set Userinfo | POST | `/api/set_userinfo` | Kirim data user ke mesin (response via webhook) |
| Delete Userinfo | POST | `/api/delete_userinfo` | Hapus user dari mesin (response via webhook) |
| Get All PIN | POST | `/api/get_all_pin` | Ambil semua PIN dari mesin (response via webhook) |
| Set Time | POST | `/api/set_time` | Ubah waktu mesin (response via webhook) |
| Register Online | POST | `/api/reg_online` | Registrasi user ke mesin (response via webhook) |
| Restart | POST | `/api/restart` | Restart mesin |

---

## 6. File Structure

### Yang Sudah Ada (Existing)

```
app/
├── layout.tsx                    # Root layout
├── globals.css                   # Tailwind + custom tokens
├── (public)/
│   ├── layout.tsx               # Public navbar + footer
│   └── page.tsx                 # Landing page
├── (auth)/
│   ├── layout.tsx               # Auth layout
│   └── login/page.tsx           # Login form
└── dashboard/
    ├── layout.tsx               # Sidebar + header
    ├── page.tsx                 # Dashboard (mock data)
    ├── employees/page.tsx       # Employee list (mock data)
    └── devices/page.tsx         # Devices (mock data)

components/
├── ui/                          # Button, Card, Badge, Input
├── layout/                      # Sidebar, Header, Breadcrumbs
├── landing/                     # Hero, Features, Pricing
├── devices/                     # DeviceCard, QuickActions, dll
└── api/                         # ApiKeyCard, ApiConnectionStatus

lib/
├── utils/cn.ts                  # clsx + tailwind-merge
├── db/prisma.ts                 # Singleton Prisma
├── validations/auth.ts          # Zod login/register
└── mock/devices.ts              # Mock data

prisma/schema.prisma             # Schema (Company, User, Device)
types/device.ts                  # Device types
types/command.ts                 # Command types
```

### Yang Perlu Dibuat/Diupdate

```
app/
├── (auth)/
│   └── register/page.tsx              # NEW: Register page
├── dashboard/
│   ├── page.tsx                        # UPDATE: Real data dari DB
│   ├── employees/page.tsx             # UPDATE: Real data + CRUD
│   ├── devices/page.tsx               # UPDATE: Real data + API calls
│   ├── attendance/
│   │   ├── schedule/page.tsx          # NEW: Jadwal kerja
│   │   └── permissions/page.tsx       # NEW: Kelola izin
│   ├── reports/
│   │   ├── raw/page.tsx               # NEW: Laporan absensi perangkat
│   │   └── detail/page.tsx            # NEW: Laporan detail kehadiran
│   ├── logs/
│   │   ├── api/page.tsx               # NEW: API logs
│   │   └── webhook/page.tsx           # NEW: Webhook logs
│   └── settings/page.tsx              # NEW: Settings
├── api/
│   ├── auth/[...nextauth]/route.ts    # NEW: NextAuth handler
│   ├── register/route.ts              # NEW: Register API
│   ├── webhook/fingerspot/route.ts    # NEW: Webhook handler
│   ├── employees/
│   │   ├── route.ts                   # NEW: GET all, POST create
│   │   └── [id]/route.ts              # NEW: GET one, PUT update, DELETE
│   ├── devices/route.ts               # NEW: GET all devices
│   ├── devices/[id]/commands/route.ts # NEW: Send command to device
│   ├── attendance/
│   │   ├── schedule/route.ts          # NEW: CRUD schedules
│   │   ├── logs/route.ts             # NEW: GET attendance logs
│   │   └── assign/route.ts           # NEW: Assign schedule to employee
│   ├── permissions/route.ts           # NEW: CRUD permissions
│   ├── reports/
│   │   ├── raw/route.ts              # NEW: GET raw attlog
│   │   └── detail/route.ts           # NEW: GET processed report
│   └── export/excel/route.ts         # NEW: Export to Excel

lib/
├── fingerspot.ts                      # NEW: Fingerspot API client
├── validations/
│   ├── employee.ts                    # NEW: Employee Zod schema
│   └── schedule.ts                    # NEW: Schedule Zod schema

components/
├── employees/
│   ├── EmployeeTable.tsx              # NEW
│   ├── EmployeeForm.tsx               # NEW
│   └── EmployeeSync.tsx               # NEW
├── attendance/
│   ├── ScheduleTable.tsx              # NEW
│   ├── ScheduleForm.tsx               # NEW
│   ├── PermissionTable.tsx            # NEW
│   └── PermissionForm.tsx             # NEW
├── reports/
│   ├── RawAttlogTable.tsx             # NEW
│   ├── DetailReportTable.tsx          # NEW
│   └── ExportExcelButton.tsx          # NEW
└── logs/
    ├── ApiLogTable.tsx                # NEW
    └── WebhookLogTable.tsx            # NEW
```

---

## 7. Urutan Pengerjaan

### Phase 1: Foundation (Hari 1-3)

1. **Update Prisma Schema**
   - Hapus model Company (single company)
   - Tambah model: Employee, AttendanceLog, Schedule, EmployeeSchedule, Permission, ApiLog, WebhookLog
   - Jalankan `npx prisma db push` atau `npx prisma migrate dev`

2. **Setup NextAuth**
   - Buat `app/api/auth/[...nextauth]/route.ts`
   - Buat `lib/auth.ts` (NextAuth config)
   - Update login page untuk wire ke NextAuth
   - Buat register page + API

3. **Buat Fingerspot API Service**
   - Buat `lib/fingerspot.ts`
   - Function: `getAttlog(cloudId, startDate, endDate)`
   - Function: `getUserinfo(cloudId, pin)`
   - Function: `setUserinfo(cloudId, userData)`
   - Function: `deleteUserinfo(cloudId, pin)`
   - Function: `getAllPin(cloudId)`
   - Function: `setTime(cloudId, timezone)`
   - Function: `registerOnline(cloudId, pin)`
   - Function: `restartDevice(cloudId)`

4. **Update Sidebar Navigation**
   - Update `components/layout/Sidebar.tsx`
   - Tambah menu: Absensi, Laporan, Riwayat, Pengaturan

### Phase 2: Core Integration (Hari 4-7)

5. **Webhook Handler**
   - Buat `app/api/webhook/fingerspot/route.ts`
   - Handle semua type: attlog, userinfo, set_userinfo, delete_userinfo, get_all_pin, set_time, reg_online
   - Simpan ke database + log

6. **Employee Management**
   - Buat API routes: `/api/employees`
   - Update employees page dengan real data
   - Tambah form tambah/edit karyawan
   - Fitur sync ke mesin (Set Userinfo API)

7. **Device Management**
   - Buat API routes: `/api/devices`
   - Update devices page dengan real data dari database
   - Quick actions yang benar-benar manggil API
   - Command history dari ApiLog

### Phase 3: Attendance (Hari 8-10)

8. **Schedule Management**
   - CRUD jadwal kerja
   - Assign jadwal ke karyawan
   - Default schedule: SM1 (08.30-16.30)

9. **Permission Management**
   - Form ajukan izin (Sakit/CUTI/Izin)
   - Daftar izin dengan filter
   - Approve/reject izin

### Phase 4: Reports (Hari 11-12)

10. **Laporan Absensi Perangkat**
    - Tabel data mentah dari AttendanceLog
    - Filter tanggal + karyawan
    - Tombol download dari mesin (Get Attlog API)
    - Realtime indicator

11. **Laporan Detail Kehadiran**
    - Proses data berdasarkan jadwal
    - Hitung: Hadir, Terlambat, Pulang Cepat, Lembur, Alpha, Izin
    - Format mirip contohlaporan.png
    - Export ke Excel

### Phase 5: Polish (Hari 13-14)

12. **API Logs & Webhook Logs**
    - Tabel logs dengan filter
    - Detail payload view

13. **Settings**
    - Profil perusahaan
    - Konfigurasi Fingerspot API

14. **Testing & Bug Fixes**

15. **Deployment Railway**

---

## 8. Spesifikasi Halaman

### Dashboard (`/dashboard`)

**Stats Cards:**
- Total Karyawan (dari Employee table)
- Karyawan Hadir Hari Ini (dari AttendanceLog)
- Total Perangkat (dari Device table)
- Izin Pending (dari Permission where status=PENDING)

**Components:**
- Attendance chart (7 hari terakhir)
- Live clock-in feed (realtime dari AttendanceLog)
- Device status summary

### Karyawan (`/dashboard/employees`)

**Fitur:**
- Tabel daftar karyawan (pin, nama, email, departemen, posisi, status)
- Search + filter departemen/status
- Tambah karyawan baru (form modal)
- Edit karyawan
- Hapus karyawan
- Sync ke mesin (tombol → Set Userinfo API)
- Lihat status di mesin

### Perangkat (`/dashboard/devices`)

**Fitur:**
- Device card dengan status (online/offline/error)
- Quick actions:
  - Get Attlog → panggil API, simpan data ke AttendanceLog
  - Get Userinfo → panggil API, response via webhook
  - Get All PIN → panggil API, response via webhook
  - Set Time → panggil API
  - Restart → panggil API
- Command history (dari ApiLog table)
- Live webhook stream (dari WebhookLog table, auto-refresh)

### Jadwal Kerja (`/dashboard/attendance/schedule`)

**Fitur:**
- Tabel daftar jadwal (nama, jam mulai, jam selesai, toleransi)
- Tambah/edit jadwal
- Assign jadwal ke karyawan (dengan effective date)
- Default: SM1 (08.30-16.30, grace 15 menit)

### Izin (`/dashboard/attendance/permissions`)

**Fitur:**
- Tabel daftar izin (karyawan, jenis, tanggal, alasan, status)
- Ajukan izin baru (form: pilih karyawan, jenis, tanggal, alasan)
- Approve/reject izin
- Filter: status, jenis, tanggal

### Laporan Absensi Perangkat (`/dashboard/reports/raw`)

**Fitur:**
- Tabel data mentah AttendanceLog
- Kolom: Tanggal, Jam, PIN, Nama, Status (IN/OUT), Metode Verifikasi
- Filter: tanggal range, karyawan, device
- Tombol "Download dari Mesin" → Get Attlog API
- Realtime: auto-refresh setiap 30 detik

### Laporan Detail Kehadiran (`/dashboard/reports/detail`)

**Fitur:**
- Pilih karyawan + periode
- Tampilan mirip contohlaporan.png:
  - Header: Nama, ID, Departemen, Posisi
  - Rekap: Total hadir, terlambat, pulang cepat, alpha, izin
  - Tabel harian: Tanggal, Hari, Shift, Masuk, Pulang, Absensi Masuk, Absensi Pulang, Terlambat, Durasi Kerja, Keterangan
- Export ke Excel

### API Logs (`/dashboard/logs/api`)

**Fitur:**
- Tabel: Waktu, Command, Device, Status, Durasi
- Filter: command type, status, tanggal
- Klik baris → detail payload (request + response)

### Webhook Logs (`/dashboard/logs/webhook`)

**Fitur:**
- Tabel: Waktu, Type, Device, Status
- Filter: type, status, tanggal
- Klik baris → detail payload

---

## 9. Deployment Railway

### Langkah Deploy

1. **Buat akun Railway** (railway.app)
2. **New Project** → Deploy from GitHub repo
3. **Tambah MySQL** di Railway:
   - New → Database → MySQL
   - Copy connection string
4. **Set Environment Variables:**
   ```
   DATABASE_URL=mysql://username:password@host:3306/fingerhr
   AUTH_SECRET=random-secret-string
   AUTH_URL=https://nama-app.up.railway.app
   FINGERSPOT_API_URL=https://developer.fingerspot.io/api
   FINGERSPOT_API_KEY=TPDBEYV5O51USU8U
   FINGERSPOT_CLOUD_ID=C269248053121C21
   ```
5. **Set Build Command:**
   ```
   npx prisma generate && next build
   ```
6. **Set Start Command:**
   ```
   npx prisma db push && next start
   ```
7. **Deploy**
8. **Set Webhook URL** di dashboard developer.fingerspot.io:
   ```
   https://nama-app.up.railway.app/api/webhook/fingerspot
   ```

### Webhook URL

Setelah deploy, webhook URL akan jadi:
```
https://[your-app-name].up.railway.app/api/webhook/fingerspot
```

URL ini dimasukkan ke dashboard developer.fingerspot.io → Menu Webhook Endpoint.

---

## 10. Prompt Lanjutan

Gunakan prompt di bawah ini untuk melanjutkan project besok:

---

### PROMPT UNTUK MELANJUTKAN PROJECT

```
Halo, aku mau melanjutkan project FingerHR yang sudah aku buat.

Project ini ada di folder: C:\xampp\htdocs\fingerhr
Tech stack: Next.js 16, Prisma 7, MySQL, Tailwind CSS, NextAuth v5

Dokumentasi lengkap ada di: dokumentasi/PLAN.md

Yang sudah ada:
- Landing page (UI)
- Login page (UI, belum di-wire)
- Dashboard (mock data)
- Employees page (mock data)
- Devices page (mock data)
- Prisma schema (Company, User, Device - belum diupdate)
- UI components (Button, Card, Badge, Input)
- Layout components (Sidebar, Header)

Yang perlu dikerjakan (sesuai dokumentasi/PLAN.md):

PHASE 1 - FOUNDATION:
1. Update Prisma schema (tambah Employee, AttendanceLog, Schedule, EmployeeSchedule, Permission, ApiLog, WebhookLog - lihat PLAN.md section 3)
2. Setup NextAuth (login/register yang berfungsi)
3. Buat lib/fingerspot.ts (API client untuk developer.fingerspot.io)
4. Update Sidebar navigation

PHASE 2 - CORE INTEGRATION:
5. Buat webhook handler POST /api/webhook/fingerspot
6. Employee Management (CRUD + sync ke mesin)
7. Device Management (real data + quick actions)

PHASE 3 - ATTENDANCE:
8. Schedule Management (jadwal kerja + assign)
9. Permission Management (Sakit/CUTI/Izin)

PHASE 4 - REPORTS:
10. Laporan Absensi Perangkat (raw data)
11. Laporan Detail Kehadiran (processed + export Excel)

PHASE 5 - POLISH:
12. API Logs & Webhook Logs
13. Settings page
14. Deploy ke Railway

Config Fingerspot:
- API Token: TPDBEYV5O51USU8U
- Cloud ID: C269248053121C21
- API URL: https://developer.fingerspot.io/api
- Webhook URL (setelah deploy): https://[app-name].up.railway.app/api/webhook/fingerspot

Tolong mulai dari PHASE 1 dulu ya. Baca dokumentasi/PLAN.md untuk detail lengkapnya.

Design system: Glassmorphic-Modern (lihat stitch_fingerhr_modern_hris_platform/lumina_hr/DESIGN.md)
Bahasa UI: Indonesia
Warna: Dark mode dengan primary Indigo (#6366f1)
```

---

## Catatan Tambahan

### Webhook Payload Format (dari GitHub Example)

```json
{
  "type": "attlog",
  "cloud_id": "C269248053121C21",
  "data": {
    "pin": "1",
    "scan": "2020-07-21 10:11",
    "verify": "1",
    "status_scan": "1"
  }
}
```

### Status Scan Mapping

| status_scan | Keterangan |
|-------------|------------|
| 0 | OUT (Pulang) |
| 1 | IN (Masuk) |

### Verify Method Mapping

| verify | Keterangan |
|--------|------------|
| 1 | Password |
| 2 | Fingerprint |
| 3 | Card |

### Command Types

| Command | Keterangan | Response |
|---------|------------|----------|
| GET_ATTLOG | Ambil data absensi | Langsung di response |
| GET_USERINFO | Ambil data user | Via webhook |
| SET_USERINFO | Kirim user ke mesin | Via webhook |
| DELETE_USERINFO | Hapus user dari mesin | Via webhook |
| GET_ALL_PIN | Ambil semua PIN | Via webhook |
| SET_TIME | Ubah waktu mesin | Via webhook |
| REG_ONLINE | Registrasi online | Via webhook |
| RESTART | Restart mesin | Via response |

---

> **Terakhir diupdate**: 25 Juni 2026
> **Dibuat oleh**: AI Assistant (opencode)
> **Project**: FingerHR - HRIS Fingerspot Integration
