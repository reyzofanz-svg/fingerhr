# Halaman Devices - FingerHR

## Overview

Halaman Devices adalah interface untuk mengelola dan mengontrol mesin absensi Fingerspot yang terhubung dengan sistem FingerHR.

## URL
`/dashboard/devices`

## Fitur Utama

### 1. Dashboard Statistics
Menampilkan 3 card statistik:
- **Total Perangkat**: Jumlah mesin yang terdaftar
- **Online**: Jumlah mesin yang sedang aktif
- **Total Scan Hari Ini**: Total transaksi absensi hari ini

### 2. Device Cards
Menampilkan daftar mesin absensi dalam bentuk card yang menampilkan:
- Cloud ID
- Nama Mesin
- Tipe Mesin (REVO Series)
- IP Address
- Status (Online/Offline)
- Last Sync
- Timezone

**Interaksi:**
- Klik card untuk memilih mesin
- Mesin yang dipilih akan di-highlight dan Quick Actions akan muncul

### 3. Quick Actions
Panel kontrol cepat untuk menjalankan command ke mesin yang dipilih.

#### Get Device
- **Fungsi**: Mengambil informasi detail device dari Fingerspot
- **API**: `POST /api/get_device`
- **Parameter**: 
  - `trans_id`: ID transaksi (default: "1")
  - `cloud_id`: Serial Number mesin (C269248053121C21)
- **Response**: Menampilkan modal dengan info:
  - Cloud ID
  - Device Name
  - Webhook URL
  - Last Activity
  - Created At

#### Get Attlog
- **Fungsi**: Download log absensi dari mesin
- **Batasan**: Maksimal 2 hari, data 60 hari terakhir
- **Otomatis**: Data akan tersimpan ke database

#### Get Userinfo
- **Fungsi**: Ambil info user dari mesin berdasarkan PIN
- **Response**: Via webhook

#### Get All PIN
- **Fungsi**: Ambil semua PIN yang terdaftar di mesin
- **Response**: Via webhook

#### Set Time
- **Fungsi**: Sinkronisasi waktu mesin dengan server
- **API**: `POST /api/set_time`
- **Parameter**:
  - `trans_id`: ID transaksi
  - `cloud_id`: Serial Number mesin
  - `timezone`: "Asia/Jakarta"
- **Konfirmasi**: Langsung execute
- **Response**: Via webhook

#### Restart
- **Fungsi**: Restart mesin absensi
- **API**: `POST /api/restart`
- **Parameter**:
  - `cloud_id`: Serial Number mesin
- **Konfirmasi**: Alert konfirmasi sebelum execute
- **Warning**: Mesin akan offline sementara saat restart

### 4. Command History
Panel yang menampilkan riwayat command yang telah dijalankan:
- Device yang ditarget
- Tipe command
- Status (Success/Failed/Pending)
- Request Time & Completed Time
- Duration
- Error Message (jika ada)

### 5. Live Webhook Stream
Panel real-time yang menampilkan webhook yang masuk dari mesin:
- Time
- Method (POST)
- Path (/webhook)
- Status Code
- Message Type

**Auto-refresh**: Setiap 30 detik

## Konfigurasi Mesin

Untuk mesin REVO Series dengan SN: **C269248053121C21**

### Environment Variables
```env
FINGERSPOT_API_URL="https://developer.fingerspot.io/api"
FINGERSPOT_API_KEY="TPDBEYV5O51USU8U"
FINGERSPOT_CLOUD_ID="C269248053121C21"
```

### Device Type Support
- ✅ REVO Series (Fingerprint + Cloud)
- ✅ VIDA Series (Face Recognition)
- ✅ VEGA Series (Fingerprint + Face)
- ✅ VIVO Series (Fingerprint Standard)
- ✅ DS/DT Series (Door Access)
- ✅ Mesin Absensi Lain (Generic)

## Dokumentasi API Fingerspot

Dokumentasi lengkap tersedia di:
- File: `dokumentasi/Dokumentasi_API_Webhook_Fingerspot.xlsx`
- Folder: `dokumentasi/`

### API Endpoints yang Digunakan

1. **Get Device**
   - URL: `https://developer.fingerspot.io/api/get_device`
   - Method: POST
   - Auth: Bearer Token
   - Body:
     ```json
     {
       "trans_id": "1",
       "cloud_id": "C269248053121C21"
     }
     ```

2. **Restart Mesin**
   - URL: `https://developer.fingerspot.io/api/restart`
   - Method: POST
   - Auth: Bearer Token
   - Body:
     ```json
     {
       "cloud_id": "C269248053121C21"
     }
     ```

3. **Set Time**
   - URL: `https://developer.fingerspot.io/api/set_time`
   - Method: POST
   - Auth: Bearer Token
   - Body:
     ```json
     {
       "trans_id": "1",
       "cloud_id": "C269248053121C21",
       "timezone": "Asia/Jakarta"
     }
     ```

## Response Format

### Success Response
```json
{
  "success": true,
  "trans_id": "1",
  "data": {
    "cloud_id": "xxxxx",
    "device_name": "device 1",
    "webhook_url": "https://xxxxx.com/device1",
    "created_at": "2025-01-01 13:00:00",
    "last_activity": "N/A"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Logging

Semua command yang dijalankan akan tercatat di:
- **Database**: Tabel `ApiLog`
- **Fields**:
  - command: Nama command
  - deviceCloudId: Cloud ID mesin
  - status: SUCCESS/FAILED/PENDING
  - requestPayload: Request yang dikirim
  - responsePayload: Response dari API
  - errorMessage: Pesan error jika gagal
  - duration: Waktu eksekusi (ms)
  - createdAt: Timestamp

## UI Components

### Design System
- **Style**: Glassmorphic-Modern
- **Color Scheme**: Dark mode dengan primary Indigo (#6366f1)
- **Animation**: Smooth transitions & hover effects
- **Layout**: Responsive grid system

### Component Structure
```
DevicesPage
├── Breadcrumbs
├── Page Header
├── Stats Cards (3 cards)
├── Main Content
│   ├── Device Cards Grid
│   ├── Quick Actions Panel
│   └── Command History Panel
└── Live Webhook Stream (Sidebar)
```

## Best Practices

1. **Sebelum Restart**: Pastikan tidak ada proses absensi yang sedang berlangsung
2. **Set Time**: Jalankan secara berkala (misal setiap minggu) untuk menjaga akurasi
3. **Get Attlog**: Download setiap hari untuk backup data
4. **Get Device**: Gunakan untuk verifikasi koneksi mesin
5. **Monitor Webhook**: Perhatikan live stream untuk memastikan mesin responsive

## Troubleshooting

### Mesin Offline
1. Cek koneksi internet mesin
2. Cek IP address mesin
3. Restart mesin via Quick Actions
4. Cek webhook URL di developer.fingerspot.io

### Command Failed
1. Cek API logs untuk detail error
2. Verifikasi API token masih valid
3. Pastikan Cloud ID benar
4. Cek koneksi mesin ke cloud

### Data Tidak Masuk
1. Cek webhook logs
2. Verifikasi webhook URL di Fingerspot
3. Test dengan Get Device
4. Manual trigger Get Attlog

## Future Enhancements

- [ ] Bulk command untuk multiple devices
- [ ] Device grouping
- [ ] Advanced filtering & search
- [ ] Export command history
- [ ] Real-time device status monitoring
- [ ] Push notification untuk device offline
- [ ] Device health metrics
- [ ] Automated backup scheduling
