# Cara Menggunakan Halaman Devices

## Prerequisites

1. **Database Setup**
   - Pastikan MySQL sudah running (XAMPP)
   - Pastikan sudah menjalankan `npx prisma migrate dev`
   - Pastikan sudah login ke aplikasi

2. **Environment Variables**
   File `.env` harus sudah dikonfigurasi:
   ```env
   FINGERSPOT_API_URL="https://developer.fingerspot.io/api"
   FINGERSPOT_API_KEY="TPDBEYV5O51USU8U"
   FINGERSPOT_CLOUD_ID="C269248053121C21"
   ```

3. **Seed Device**
   Jalankan command untuk menambahkan device REVO ke database:
   ```bash
   npm run seed:device
   ```

## Langkah-langkah Penggunaan

### 1. Akses Halaman Devices

1. Login ke aplikasi di `http://localhost:3000`
2. Klik menu **Perangkat** di sidebar
3. Atau akses langsung: `http://localhost:3000/dashboard/devices`

### 2. Lihat Daftar Device

Anda akan melihat:
- **Card Statistik** di bagian atas:
  - Total Perangkat
  - Device Online
  - Total Scan Hari Ini

- **Device Cards** menampilkan:
  - Cloud ID: C269248053121C21
  - Nama: Mesin Absensi REVO Lantai 1
  - Type: REVO Series
  - Status: ONLINE/OFFLINE
  - IP Address
  - Last Sync

### 3. Pilih Device

1. **Klik pada Device Card** yang ingin dikelola
2. Card akan di-highlight dengan border biru
3. Panel **Quick Actions** akan muncul di bawah

### 4. Gunakan Quick Actions

#### A. Get Device Info
**Tujuan**: Mengambil informasi detail device dari Fingerspot cloud

1. Klik tombol **"Get Device"**
2. Tunggu proses (biasanya 1-2 detik)
3. Modal akan muncul menampilkan:
   - Cloud ID
   - Device Name
   - Webhook URL
   - Last Activity
   - Created At
4. Klik **"Tutup"** untuk menutup modal

**Kapan digunakan?**
- Saat pertama kali setup device
- Untuk verifikasi koneksi device ke cloud
- Untuk mendapatkan info webhook URL

#### B. Set Time
**Tujuan**: Sinkronisasi waktu mesin dengan server

1. Klik tombol **"Set Time"**
2. Sistem akan langsung mengirim command
3. Tunggu notifikasi sukses
4. Response akan dikirim via webhook

**Kapan digunakan?**
- Setelah restart mesin
- Setiap minggu untuk menjaga akurasi
- Setelah perubahan daylight saving time
- Saat waktu mesin tidak akurat

**Catatan:**
- Timezone default: Asia/Jakarta
- Response tidak instant, via webhook
- Cek webhook logs untuk konfirmasi

#### C. Restart Device
**Tujuan**: Restart mesin absensi

1. Klik tombol **"Restart"**
2. Popup konfirmasi akan muncul:
   ```
   Yakin ingin restart mesin Mesin Absensi REVO Lantai 1?
   ```
3. Klik **OK** untuk lanjut atau **Cancel** untuk batal
4. Tunggu notifikasi sukses
5. Mesin akan restart (1-2 menit)

**Kapan digunakan?**
- Saat mesin hang atau tidak responsive
- Setelah update firmware
- Untuk clear cache mesin
- Saat troubleshooting masalah

**⚠️ PERINGATAN:**
- Mesin akan offline sementara (1-2 menit)
- Jangan restart saat jam absensi ramai
- Tunggu mesin fully booted sebelum command lain

#### D. Get Attlog
**Tujuan**: Download log absensi dari mesin

1. Klik tombol **"Get Attlog"**
2. Sistem akan download data 1 hari terakhir
3. Data akan otomatis tersimpan ke database
4. Notifikasi sukses akan muncul

**Kapan digunakan?**
- Setiap hari untuk backup data
- Saat data realtime via webhook bermasalah
- Untuk rekonsiliasi data

**Batasan:**
- Maksimal 2 hari data
- Data maksimal 60 hari terakhir
- Hindari terlalu sering (max 1x per jam)

#### E. Get Userinfo
**Tujuan**: Ambil info user dari mesin berdasarkan PIN

1. Klik tombol **"Get Userinfo"**
2. Response akan dikirim via webhook
3. Cek webhook logs untuk melihat data

**Kapan digunakan?**
- Untuk verifikasi user terdaftar di mesin
- Untuk debugging masalah user

#### F. Get All PIN
**Tujuan**: Ambil semua PIN yang terdaftar di mesin

1. Klik tombol **"Get All PIN"**
2. Response akan dikirim via webhook
3. Cek webhook logs untuk melihat daftar PIN

**Kapan digunakan?**
- Untuk sinkronisasi data user
- Untuk audit user yang terdaftar
- Setelah banyak perubahan user

### 5. Monitor Command History

Panel **Command History** menampilkan:
- Command yang baru dijalankan
- Status: Success/Failed/Pending
- Duration (waktu eksekusi)
- Error message (jika gagal)

**Cara membaca:**
- ✅ Success: Command berhasil
- ❌ Failed: Command gagal (lihat error message)
- ⏳ Pending: Command masih diproses

### 6. Monitor Live Webhook Stream

Panel **Live Webhook Stream** (di sidebar kanan) menampilkan:
- Webhook realtime dari mesin
- Status code response
- Message type (attlog, set_time, dll)

**Auto-refresh:** Setiap 30 detik

## Troubleshooting

### Device Tidak Muncul
```bash
# Jalankan seed device
npm run seed:device

# Atau manual via MySQL
INSERT INTO Device (id, cloudId, name, type, status, timezone, createdAt, updatedAt)
VALUES (UUID(), 'C269248053121C21', 'Mesin Absensi REVO Lantai 1', 'REVO', 'OFFLINE', 'Asia/Jakarta', NOW(), NOW());
```

### Command Gagal
1. Cek API logs di database tabel `ApiLog`
2. Cek console browser (F12) untuk error
3. Verifikasi API token masih valid
4. Cek koneksi internet server

### Response Tidak Masuk
1. Command seperti SET_TIME response-nya via webhook
2. Cek webhook logs: `/dashboard/logs/webhook`
3. Verifikasi webhook URL di developer.fingerspot.io
4. Test koneksi dengan Get Device

### Device Always Offline
1. Cek koneksi mesin ke internet
2. Cek konfigurasi cloud ID di mesin
3. Jalankan Get Device untuk update status
4. Restart mesin jika perlu

## Best Practices

### Daily Operations
1. **Pagi**: 
   - Cek status device (klik Refresh)
   - Set Time jika perlu
   - Download Attlog kemarin

2. **Sore**:
   - Cek Command History untuk errors
   - Review Webhook Stream
   - Download Attlog hari ini

### Weekly Maintenance
1. Set Time semua device
2. Get All PIN untuk audit
3. Review API Logs untuk pattern errors
4. Check device health metrics

### Monthly Maintenance
1. Backup database
2. Review device performance
3. Update firmware jika ada
4. Test disaster recovery

## Tips & Tricks

1. **Gunakan Get Device** untuk quick health check
2. **Bookmark halaman** untuk akses cepat
3. **Monitor webhook stream** untuk realtime insight
4. **Set Time secara berkala** untuk akurasi
5. **Download Attlog setiap hari** untuk backup
6. **Restart hanya jika perlu** (last resort)

## Command Reference Quick

| Command | Response Time | Via Webhook | Risk Level |
|---------|---------------|-------------|------------|
| Get Device | Instant | ❌ No | 🟢 Low |
| Get Attlog | 1-5s | ❌ No | 🟢 Low |
| Get Userinfo | 1-5s | ✅ Yes | 🟢 Low |
| Get All PIN | 1-5s | ✅ Yes | 🟡 Medium |
| Set Time | 1-2s | ✅ Yes | 🟡 Medium |
| Restart | 1-2s | ❌ No | 🔴 High |

## Video Tutorial

Coming soon...

## Support

Jika ada masalah:
1. Cek dokumentasi ini
2. Cek API Logs
3. Cek Webhook Logs
4. Contact support

## Next Steps

Setelah berhasil menggunakan halaman Devices:
1. Setup webhook handler: `/api/webhook/fingerspot`
2. Manage employees: `/dashboard/employees`
3. View attendance logs: `/dashboard/attendance`
4. Generate reports: `/dashboard/reports`
