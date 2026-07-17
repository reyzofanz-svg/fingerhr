# 📊 REQUEST: Laporan Absensi GPS + Fitur Ajukan Izin Mobile

## 🎯 TUJUAN:
Buat 2 fitur baru:
1. **Admin Dashboard**: Menu "Laporan Absensi GPS" untuk monitoring absensi mobile
2. **Mobile App**: Fitur "Ajukan Izin" untuk karyawan

---

## 📋 FITUR 1: LAPORAN ABSENSI GPS (Admin Dashboard)

### 📍 Lokasi Menu:
- Posisi: Di bawah "Laporan Absensi Perangkat" di sidebar admin
- Path: `/admin/reports/gps-attendance` 
- Icon: 📱 atau GPS icon

### 🔍 Fitur Monitoring yang Diperlukan:

#### 1. Filter & Pencarian:
- Filter tanggal (range picker)
- Filter karyawan (dropdown/search)
- Filter status approval (APPROVED/PENDING/REJECTED)
- Filter lokasi absen (dalam area/luar area)

#### 2. Tabel Data Absensi:
**Kolom yang ditampilkan:**
- Nama Karyawan
- Tanggal & Waktu (WIB timezone)
- Status (Masuk/Pulang)
- **Titik Lokasi**: Koordinat GPS + nama area terdekat + jarak
- **Foto Depan**: Thumbnail clickable untuk view fullsize
- **Foto Belakang**: Thumbnail clickable untuk view fullsize  
- Status Approval (badge: hijau/kuning/merah)
- Aksi (Approve/Reject untuk PENDING)

#### 3. Detail View Modal:
Ketika klik row, tampilkan:
- **Info Karyawan**: Nama, PIN, divisi
- **Detail Waktu**: Tanggal, jam masuk, jam keluar, durasi kerja
- **Lokasi GPS**: 
  - Koordinat latitude/longitude
  - Map view dengan pin lokasi
  - Jarak dari area kerja resmi
  - Status dalam/luar area
- **Foto Dokumentasi**:
  - Foto identifikasi wajah (fullsize)
  - Foto sekitar/background (fullsize)
  - Download option untuk kedua foto
- **Catatan**: Notes yang diisi karyawan (jika ada)
- **Aksi Admin**: Approve/Reject dengan reason

#### 4. Bulk Actions:
- Bulk approve attendance yang pending
- Export data ke Excel/PDF
- Print laporan periode tertentu

#### 5. Dashboard Summary Cards:
- Total absensi hari ini
- Pending approval count
- Absensi luar area count  
- Trend absensi mobile vs device

---

## 📱 FITUR 2: AJUKAN IZIN (Mobile App)

### 📍 Lokasi Menu:
- Tambahkan button/tab "Ajukan Izin" di mobile app
- Posisi: Di bawah tombol "Riwayat Absensi" 
- Path: `/mobile/leave-request`

### 📝 Form Ajukan Izin:

#### 1. Jenis Izin (Dropdown):
- Sakit
- Izin Pribadi  
- Cuti Tahunan
- Dinas Luar
- Lainnya

#### 2. Input Fields:
- **Tanggal Mulai**: Date picker
- **Tanggal Selesai**: Date picker (optional untuk izin 1 hari)
- **Durasi**: Otomatis calculate atau manual (setengah hari/full day)
- **Alasan**: Textarea untuk keterangan detail
- **Dokumen Pendukung**: Upload foto (untuk surat dokter, dll)

#### 3. Preview & Submit:
- Summary izin sebelum submit
- Estimasi sisa cuti (jika cuti tahunan)
- Konfirmasi submit

### 📋 Riwayat Izin (Mobile):
- List semua izin yang pernah diajukan
- Status: Pending/Approved/Rejected
- Detail izin dengan reason approval/rejection
- Cancel izin yang masih pending

---

## 🔗 INTEGRASI YANG DIPERLUKAN:

### Database Schema Baru:
```sql
-- Tabel untuk leave requests
CREATE TABLE leave_requests (
  id VARCHAR(255) PRIMARY KEY,
  employeeId VARCHAR(255) NOT NULL,
  type ENUM('SICK', 'PERSONAL', 'ANNUAL', 'BUSINESS', 'OTHER'),
  startDate DATE NOT NULL,
  endDate DATE,
  duration DECIMAL(3,1), -- 0.5 untuk setengah hari
  reason TEXT,
  documentUrl VARCHAR(500),
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  approvedBy VARCHAR(255),
  approvedAt TIMESTAMP,
  rejectionReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints Baru:
```
// Mobile Leave Request
POST /api/mobile/leave-request (submit izin)
GET /api/mobile/leave-request/history (riwayat izin)
PUT /api/mobile/leave-request/cancel/:id (cancel izin)

// Admin GPS Reports  
GET /api/admin/reports/gps-attendance (data laporan)
PUT /api/admin/attendance/approve/:id (approve absensi)
PUT /api/admin/attendance/reject/:id (reject absensi)

// Admin Leave Management
GET /api/admin/leave-requests (semua izin)
PUT /api/admin/leave-requests/approve/:id (approve izin)
PUT /api/admin/leave-requests/reject/:id (reject izin)
```

---

## 🎨 DESIGN REQUIREMENTS:

### Admin Dashboard:
- Consistent dengan design system yang ada
- Responsive table dengan mobile view
- Interactive map untuk detail lokasi
- Photo gallery/lightbox untuk view foto
- Modern filter controls dengan real-time search

### Mobile App:
- Consistent dengan design mobile attendance yang baru
- Easy-to-use form dengan clear navigation
- Photo upload dengan preview
- Status tracking dengan progress indicators
- Push notification untuk status update izin

---

## ⚡ PRIORITY FEATURES:
1. **HIGH**: GPS Attendance Report dengan map view
2. **HIGH**: Mobile Leave Request form  
3. **MEDIUM**: Bulk actions untuk admin
4. **MEDIUM**: Push notifications
5. **LOW**: Advanced analytics & charts

---

## 🚀 DELIVERABLES:
- Admin menu "Laporan Absensi GPS" fully functional
- Mobile "Ajukan Izin" feature dengan form & history
- Database schema & API endpoints
- Proper timezone handling (WIB)
- Responsive design untuk semua device
- Testing & error handling

---

## 📋 TECHNICAL NOTES:

### File Structure yang Diharapkan:
```
app/
├── admin/
│   └── reports/
│       └── gps-attendance/
│           ├── page.tsx (main report page)
│           ├── components/
│           │   ├── AttendanceTable.tsx
│           │   ├── FilterControls.tsx
│           │   ├── DetailModal.tsx
│           │   └── LocationMap.tsx
│           └── loading.tsx
├── mobile/
│   ├── leave-request/
│   │   ├── page.tsx (form page)
│   │   ├── history/
│   │   │   └── page.tsx (riwayat izin)
│   │   └── components/
│   │       ├── LeaveForm.tsx
│   │       └── LeaveHistory.tsx
│   └── page.tsx (update with leave button)
└── api/
    ├── admin/
    │   ├── reports/
    │   │   └── gps-attendance/
    │   │       └── route.ts
    │   └── leave-requests/
    │       ├── route.ts
    │       ├── approve/
    │       │   └── [id]/
    │       │       └── route.ts
    │       └── reject/
    │           └── [id]/
    │               └── route.ts
    └── mobile/
        └── leave-request/
            ├── route.ts
            ├── history/
            │   └── route.ts
            └── cancel/
                └── [id]/
                    └── route.ts
```

### Database Integration:
- Update Prisma schema untuk leave_requests table
- Migration files untuk database changes
- Seed data untuk testing

### Authentication & Authorization:
- Admin routes protected dengan role-based access
- Mobile routes protected dengan employee authentication
- API endpoints dengan proper permission checks

---

*Created: $(date)  
Status: Ready for Development  
Priority: High*