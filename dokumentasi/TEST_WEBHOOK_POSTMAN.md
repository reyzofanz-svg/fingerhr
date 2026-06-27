# Testing Webhook dengan Postman - Step by Step

## Problem yang Kamu Alami

✅ Postman request ke Fingerspot API → **Sukses (200 OK)**  
❌ Logs Railway → **Kosong (No logs in this time range)**

## Root Cause Analysis

Command `get_userinfo` yang kamu kirim via Postman itu **bukan webhook test**, tapi **request ke Fingerspot API** yang akan memicu webhook **nanti** (asynchronous).

### Flow yang Sebenarnya Terjadi:

```
1. Postman → Fingerspot API (get_userinfo)
   ✅ Response 200 OK {"success":true}
   
2. Fingerspot API → Queue command ke mesin REVO
   ⏳ (Butuh waktu 1-30 detik tergantung koneksi mesin)
   
3. Mesin REVO → Process command (ambil userinfo PIN 6)
   ⚠️ Mesin harus ONLINE dan CONNECTED
   
4. Mesin REVO → Send response ke Fingerspot Cloud
   ⏳ (Butuh waktu 1-10 detik)
   
5. Fingerspot Cloud → POST ke webhook Railway
   ✅ Baru ini yang muncul di Railway logs
```

**Jadi kenapa Railway logs kosong?**
Karena step 3-5 belum/tidak terjadi! Kemungkinan:
- Mesin REVO offline atau tidak connected
- Webhook URL belum di-save di Fingerspot
- Ada delay (tunggu beberapa menit)

## Solution: Test Langsung ke Railway Webhook

### Step 1: Test Health Check (GET)

Test apakah endpoint webhook hidup:

**Method:** `GET`  
**URL:** `https://[your-app].railway.app/api/webhook/test`

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Webhook test endpoint is working",
  "timestamp": "2026-06-27T10:30:00.000Z",
  "endpoints": {
    "test": "/api/webhook/test",
    "fingerspot": "/api/webhook/fingerspot"
  }
}
```

✅ **Jika dapat response ini** → Railway app running dengan baik

### Step 2: Test Webhook Endpoint (POST)

Kirim dummy webhook **langsung ke Railway**:

**Method:** `POST`  
**URL:** `https://[your-app].railway.app/api/webhook/test`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "message": "hello from postman",
  "timestamp": "2026-06-27T10:30:00Z"
}
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Webhook test received successfully",
  "timestamp": "2026-06-27T10:30:15.123Z",
  "received": {
    "message": "hello from postman",
    "timestamp": "2026-06-27T10:30:00Z"
  }
}
```

**Check Railway Logs:**
```
=== WEBHOOK TEST RECEIVED ===
Timestamp: 2026-06-27T10:30:15.123Z
Method: POST
URL: https://[your-app].railway.app/api/webhook/test
Headers: {
  "content-type": "application/json",
  ...
}
Body: {
  "message": "hello from postman",
  "timestamp": "2026-06-27T10:30:00Z"
}
```

✅ **Jika muncul logs** → Webhook endpoint working perfectly!

### Step 3: Test Fingerspot Webhook Format

Sekarang test dengan format yang sama seperti Fingerspot:

**Method:** `POST`  
**URL:** `https://[your-app].railway.app/api/webhook/fingerspot`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON) - Test Userinfo:**
```json
{
  "type": "userinfo",
  "cloud_id": "C269248053121C21",
  "data": {
    "pin": "6",
    "name": "Test User from Postman",
    "card": "",
    "privilege": "0"
  }
}
```

**Expected Response:**
```json
{
  "status": "ok",
  "duration": 156,
  "timestamp": "2026-06-27T10:30:15.123Z"
}
```

**Check Railway Logs:**
```
=== FINGERSPOT WEBHOOK RECEIVED ===
Timestamp: 2026-06-27T10:30:15.123Z
[Webhook] Type: userinfo
[Webhook] Cloud ID: C269248053121C21
[Webhook] Data: {
  "pin": "6",
  "name": "Test User from Postman",
  ...
}
[Webhook] Userinfo received: { pin: '6', name: 'Test User from Postman' }
✓ Webhook logged successfully
=== END WEBHOOK ===
```

**Check Database:**
```sql
-- Cek WebhookLog
SELECT * FROM WebhookLog ORDER BY createdAt DESC LIMIT 1;

-- Cek Employee (harusnya ada atau update)
SELECT * FROM Employee WHERE pin = '6';
```

✅ **Jika berhasil** → Webhook handler working! Masalah di Fingerspot side

### Step 4: Test Different Webhook Types

#### A. Test Attlog (Attendance Log)

**Body:**
```json
{
  "type": "attlog",
  "cloud_id": "C269248053121C21",
  "data": {
    "pin": "001",
    "scan": "2026-06-27 10:30:00",
    "verify": "1",
    "status_scan": "1"
  }
}
```

**Expected:**
- Response 200 OK
- Data masuk ke tabel `AttendanceLog`
- Device `lastSync` updated

**Note:** Employee dengan PIN "001" harus ada di database dulu!

#### B. Test Set Time Response

**Body:**
```json
{
  "type": "set_time",
  "cloud_id": "C269248053121C21",
  "data": {
    "status": "success",
    "timezone": "Asia/Jakarta"
  }
}
```

**Expected:**
- Response 200 OK
- Logs menampilkan "[Webhook] Set time response: ..."

#### C. Test Get All PIN Response

**Body:**
```json
{
  "type": "get_all_pin",
  "cloud_id": "C269248053121C21",
  "data": {
    "pins": ["001", "002", "003", "006"]
  }
}
```

**Expected:**
- Response 200 OK
- Logs menampilkan array PINs

## Common Issues & Solutions

### Issue 1: Response 404 "Device not found"

**Cause:** Cloud_ID tidak ada di database

**Solution:**
```bash
# Run seed device
npm run seed:device

# Or manual
INSERT INTO Device (id, cloudId, name, type, status, timezone, createdAt, updatedAt)
VALUES (UUID(), 'C269248053121C21', 'REVO 208', 'REVO', 'OFFLINE', 'Asia/Jakarta', NOW(), NOW());
```

### Issue 2: Response 500 Internal Server Error

**Cause:** Database connection issue atau missing fields

**Solution:**
1. Check Railway logs untuk detail error
2. Pastikan DATABASE_URL correct
3. Run migration: `npx prisma migrate deploy`

### Issue 3: Logs Tidak Muncul di Railway

**Cause:** Railway logs filter time range salah

**Solution:**
1. Refresh page
2. Ubah filter ke "Last 1 hour"
3. Atau gunakan: `railway logs --follow` di terminal

### Issue 4: Employee Not Found Warning

**Cause:** Employee dengan PIN tersebut belum ada

**Solution:**
```sql
-- Create employee dulu
INSERT INTO Employee (id, pin, name, createdAt, updatedAt)
VALUES (UUID(), '001', 'Test Employee', NOW(), NOW());
```

## Postman Collection

Buat collection baru dengan requests:

### 1. Health Check
```
GET https://[your-app].railway.app/api/webhook/test
```

### 2. Test Webhook
```
POST https://[your-app].railway.app/api/webhook/test
Body: {"message": "test"}
```

### 3. Test Userinfo
```
POST https://[your-app].railway.app/api/webhook/fingerspot
Body: {
  "type": "userinfo",
  "cloud_id": "C269248053121C21",
  "data": {"pin": "6", "name": "Test User"}
}
```

### 4. Test Attlog
```
POST https://[your-app].railway.app/api/webhook/fingerspot
Body: {
  "type": "attlog",
  "cloud_id": "C269248053121C21",
  "data": {
    "pin": "001",
    "scan": "2026-06-27 10:30:00",
    "verify": "1",
    "status_scan": "1"
  }
}
```

### 5. Test Set Time
```
POST https://[your-app].railway.app/api/webhook/fingerspot
Body: {
  "type": "set_time",
  "cloud_id": "C269248053121C21",
  "data": {"status": "success", "timezone": "Asia/Jakarta"}
}
```

## Testing Real Webhook dari Fingerspot

Setelah yakin webhook endpoint working (test manual sukses):

### Step 1: Set Webhook URL di Developer Fingerspot

1. Login ke https://developer.fingerspot.io
2. Pilih device dengan Cloud ID: C269248053121C21
3. Di section "End Point Webhook", isi:
   ```
   https://[your-app].railway.app/api/webhook/fingerspot
   ```
4. **PENTING:** Klik tombol **"Simpan"**
5. Verify URL tersimpan (refresh page, URL masih ada)

### Step 2: Pastikan Mesin Online

1. Cek di developer.fingerspot.io apakah mesin ada status
2. Cek "Last Activity" → Harus recent (< 5 menit)
3. Jika offline:
   - Cek koneksi internet mesin
   - Restart mesin
   - Tunggu 1-2 menit sampai connected

### Step 3: Kirim Command dari Postman

**URL:** `https://developer.fingerspot.io/api/get_userinfo`

**Headers:**
```
Authorization: Bearer TPDBEYV5O51USU8U
Content-Type: application/json
```

**Body:**
```json
{
  "trans_id": "1",
  "cloud_id": "C269248053121C21",
  "pin": "6"
}
```

**Response:**
```json
{
  "success": true,
  "trans_id": "1"
}
```

### Step 4: Wait & Monitor

1. **Tunggu 5-30 detik** (tergantung koneksi mesin)
2. **Refresh Railway logs**
3. **Expected logs:**
   ```
   === FINGERSPOT WEBHOOK RECEIVED ===
   [Webhook] Type: userinfo
   [Webhook] Cloud ID: C269248053121C21
   ```

### Step 5: Verify Database

```sql
-- Cek webhook log
SELECT * FROM WebhookLog 
WHERE type = 'userinfo' 
ORDER BY createdAt DESC 
LIMIT 1;

-- Cek employee
SELECT * FROM Employee WHERE pin = '6';
```

## Debugging Checklist

Jika real webhook dari Fingerspot masih tidak muncul:

- [ ] Webhook endpoint tested manually via Postman → **Working**
- [ ] Railway logs showing manual tests → **Confirmed**
- [ ] Device C269248053121C21 exists in database → **Confirmed**
- [ ] Webhook URL set di developer.fingerspot.io → **Correct URL**
- [ ] Webhook URL **saved** (klik Simpan) → **Confirmed**
- [ ] Mesin REVO status → **Online/Connected**
- [ ] Mesin last activity → **< 5 minutes**
- [ ] Railway logs filter → **Last 1 hour**
- [ ] Wait time after command → **At least 30 seconds**

## Alternative: Use Webhook.site

Jika masih bingung apakah Fingerspot kirim webhook atau tidak:

1. Buka https://webhook.site/
2. Copy "Your unique URL"
3. Set URL itu di developer.fingerspot.io
4. Kirim command get_userinfo
5. Refresh webhook.site
6. Lihat apakah ada incoming request

**Jika muncul di webhook.site:**
→ Fingerspot mengirim webhook, masalah di Railway endpoint

**Jika tidak muncul di webhook.site:**
→ Fingerspot tidak mengirim, kemungkinan:
  - Mesin offline
  - Webhook URL tidak tersimpan
  - Command tidak sampai ke mesin

## Summary

**Yang harus kamu lakukan sekarang:**

1. ✅ Test endpoint Railway langsung dengan Postman
2. ✅ Pastikan logs muncul di Railway
3. ✅ Verifikasi webhook handler working
4. ⚠️ Double-check webhook URL di Fingerspot
5. ⚠️ Pastikan mesin REVO online
6. ⏳ Test real command dan tunggu 30-60 detik
7. 🔍 Monitor Railway logs secara real-time

**Expected Result:**
- Manual test → Logs muncul instant
- Real command → Logs muncul after delay (5-30s)

Jika manual test berhasil tapi real command tidak:
→ **Masalah bukan di kode Railway, tapi di Fingerspot setup**
