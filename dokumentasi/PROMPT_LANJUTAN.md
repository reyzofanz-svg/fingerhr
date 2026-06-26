# Prompt Lanjutan Project FingerHR

> Copy paste prompt di bawah ini ke AI assistant untuk melanjutkan project.

---

## PROMPT VERSION 1 (Mulai dari awal)

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

Design system: Glassmorphic-Modern (lihat stitch_fingerhr_modern_hris_platform/lumina_hr/DESIGN.md) dan apabila ada referensi lebih bagus bisa tambahkan saja ya aku tertarik dengan desain glassmorphism dan 3d model serta animasi animasi yang unik dan menarik
Bahasa UI: Indonesia
Warna: Dark mode dengan primary Indigo (#6366f1)
```

---

## PROMPT VERSION 2 (Lanjutkan dari Phase tertentu)

### Lanjut Phase 2 (sudah selesai Phase 1)

```
Project FingerHR di C:\xampp\htdocs\fingerhr sudah selesai PHASE 1.

Sekarang lanjut PHASE 2 - CORE INTEGRATION:
1. Buat webhook handler POST /api/webhook/fingerspot
   - Handle type: attlog, userinfo, set_userinfo, delete_userinfo, get_all_pin, set_time, reg_online
   - Simpan ke database + log

2. Employee Management
   - API routes: /api/employees (GET all, POST create, PUT update, DELETE)
   - Update employees page dengan real data dari Prisma
   - Form tambah/edit karyawan
   - Fitur sync ke mesin (panggil Set Userinfo API)

3. Device Management
   - API routes: /api/devices
   - Update devices page dengan real data
   - Quick actions yang benar-benar manggil Fingerspot API
   - Command history dari ApiLog

Baca dokumentasi/PLAN.md untuk detail.
Config: API Token TPDBEYV5O51USU8U, Cloud ID C269248053121C21
```

### Lanjut Phase 3

```
Project FingerHR di C:\xampp\htdocs\fingerhr sudah selesai PHASE 1 & 2.

Sekarang lanjut PHASE 3 - ATTENDANCE:
1. Schedule Management (CRUD jadwal kerja)
   - Default schedule: SM1 (08.30-16.30, grace 15 menit)
   - Assign jadwal ke karyawan dengan effective date
   - Halaman: /dashboard/attendance/schedule

2. Permission Management (Sakit/CUTI/Izin)
   - Form ajukan izin
   - Daftar izin dengan filter
   - Approve/reject izin
   - Halaman: /dashboard/attendance/permissions

Baca dokumentasi/PLAN.md untuk detail.
```

### Lanjut Phase 4

```
Project FingerHR di C:\xampp\htdocs\fingerhr sudah selesai PHASE 1-3.

Sekarang lanjut PHASE 4 - REPORTS:
1. Laporan Absensi Perangkat (/dashboard/reports/raw)
   - Tabel data mentah dari AttendanceLog
   - Filter tanggal + karyawan
   - Tombol "Download dari Mesin" (Get Attlog API)
   - Auto-refresh realtime

2. Laporan Detail Kehadiran (/dashboard/reports/detail)
   - Proses data berdasarkan jadwal
   - Hitung: Hadir, Terlambat, Pulang Cepat, Lembur, Alpha, Izin
   - Format mirip contoh laporan (lihat dokumentasi/contohlaporan.png)
   - Export ke Excel

Baca dokumentasi/PLAN.md untuk detail.
```

### Lanjut Phase 5

```
Project FingerHR di C:\xampp\htdocs\fingerhr sudah selesai PHASE 1-4.

Sekarang lanjut PHASE 5 - POLISH:
1. API Logs (/dashboard/logs/api)
   - Tabel logs dengan filter
   - Detail payload view

2. Webhook Logs (/dashboard/logs/webhook)
   - Tabel logs dengan filter
   - Detail payload view

3. Settings (/dashboard/settings)
   - Profil perusahaan
   - Konfigurasi Fingerspot API

4. Deploy ke Railway
   - Setup MySQL di Railway
   - Environment variables
   - Build & start commands
   - Set webhook URL di developer.fingerspot.io

Baca dokumentasi/PLAN.md untuk detail.
```

---

## PROMPT VERSION 3 (Fix Bug / Tambah Fitur)

### Fix tertentu

```
Project FingerHR di C:\xampp\htdocs\fingerhr ada bug di halaman [nama halaman].

Bug: [jelaskan bug-nya]

Tolong perbaiki. Baca dokumentasi/PLAN.md untuk referensi.
```

### Tambah fitur

```
Project FingerHR di C:\xampp\htdocs\fingerhr perlu tambah fitur [nama fitur].

Deskripsi fitur: [jelaskan fiturnya]

Tolong tambahkan. Baca dokumentasi/PLAN.md untuk referensi.
```

---

## Referensi Cepat

| Item | Nilai |
|------|-------|
| Project Path | `C:\xampp\htdocs\fingerhr` |
| Documentation | `dokumentasi/PLAN.md` |
| API Token | `TPDBEYV5O51USU8U` |
| Cloud ID | `C269248053121C21` |
| API URL | `https://developer.fingerspot.io/api` |
| Webhook URL | `https://[app-name].up.railway.app/api/webhook/fingerspot` |
| DB URL | `mysql://root:@localhost:3306/fingerhr` |
| Design System | `stitch_fingerhr_modern_hris_platform/lumina_hr/DESIGN.md` |
| Contoh Laporan | `dokumentasi/contohlaporan.png` |
| API Docs | `dokumentasi/Dokumentasi_API_Webhook_Fingerspot.xlsx` |
