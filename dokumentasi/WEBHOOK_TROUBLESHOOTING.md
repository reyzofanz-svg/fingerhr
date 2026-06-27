# Webhook Troubleshooting Guide

## Masalah: Webhook Tidak Muncul di Logs Railway

### Screenshot Analysis

Dari screenshot yang kamu berikan:
1. ✅ Postman request sukses (200 OK) ke `https://developer.fingerspot.io/api/get_userinfo`
2. ✅ Response: `{"success":true,"trans_id":"1"}`
3. ❌ Logs Railway kosong ("No logs in this time range")
4. ⚠️ Webhook endpoint di developer.fingerspot.io: `https://[app-name].up.railway.app/api/webhook/fingerspot`

### Kemungkinan Penyebab

#### 1. **Webhook Belum Dikonfigurasi dengan Benar di Fingerspot**

Command `get_userinfo` response-nya **asynchronous via webhook**, bukan instant response. Fingerspot akan mengirim response ke webhook URL yang kamu set.

**Solusi:**
- Pastikan webhook URL di developer.fingerspot.io sudah benar
- Format: `https://[your-app].up.railway.app/api/webhook/fingerspot`
- Jangan lupa **klik "Simpan"** setelah update webhook URL

#### 2. **Mesin Belum Terhubung ke Cloud**

Jika mesin REVO fisik belum online atau belum connect ke cloud Fingerspot, webhook tidak akan terkirim.

**Cara Cek:**
- Pastikan mesin REVO ada koneksi internet
- Cek status mesin di developer.fingerspot.io dashboard
- Lihat "Last Activity" di mesin

#### 3. **Database Cloud_ID Tidak Match**

Webhook hanya akan diproses jika `cloud_id` di database match dengan yang dikirim Fingerspot.

**Solusi:**
```bash
# Run seed untuk pastikan device ada di database
npm run seed:device
```

#### 4. **Railway Logs Delay**

Railway logs kadang ada delay 1-2 menit.

**Solusi:**
- Refresh logs page setelah beberapa saat
- Ubah filter time range ke "Last 1 hour"

## Testing Webhook Secara Manual

### Step 1: Test Endpoint Railway dengan Postman

Kirim POST request **langsung ke webhook endpoint Railway** untuk test apakah endpoint berfungsi:

**URL:**
```
POST https://[your-app].up.railway.app/api/webhook/fingerspot
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "type": "userinfo",
  "cloud_id": "C269248053121C21",
  "data": {
    "pin": "6",
    "name": "Test User",
    "card": "",
    "privilege": "0"
  }
}
```

**Expected Response:**
```json
{
  "status": "ok"
}
```

**Jika berhasil:**
- Response 200 OK
- Logs Railway akan muncul dengan console.log
- Data tersimpan di tabel `WebhookLog`

**Jika gagal:**
- Response 404: Device not found (cloud_id tidak ada di database)
- Response 500: Server error (cek logs untuk detail)

### Step 2: Test dengan Different Webhook Types

#### Test Attlog
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

#### Test Set Time Response
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

#### Test Get All PIN Response
```json
{
  "type": "get_all_pin",
  "cloud_id": "C269248053121C21",
  "data": {
    "pins": ["001", "002", "003", "006"]
  }
}
```

## Debug Webhook Handler

Untuk melihat detailed logs, tambahkan logging di webhook handler:

```typescript
// app/api/webhook/fingerspot/route.ts

export async function POST(request: NextRequest) {
  console.log("=== WEBHOOK RECEIVED ===");
  console.log("Time:", new Date().toISOString());
  console.log("Headers:", Object.fromEntries(request.headers.entries()));
  
  try {
    const body = await request.json();
    console.log("Body:", JSON.stringify(body, null, 2));
    
    // ... rest of the code
  } catch (error) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
  }
}
```

## Verifikasi Setup Railway

### 1. Cek Environment Variables

Di Railway dashboard → Variables:
```env
DATABASE_URL=mysql://...
FINGERSPOT_API_URL=https://developer.fingerspot.io/api
FINGERSPOT_API_KEY=TPDBEYV5O51USU8U
FINGERSPOT_CLOUD_ID=C269248053121C21
AUTH_SECRET=your-secret
AUTH_URL=https://[your-app].up.railway.app
```

### 2. Cek Database Connection

Di Railway logs, seharusnya ada:
```
✓ Database connected
✓ Prisma Client generated
```

Jika tidak ada, run migration:
```bash
# Di Railway
npx prisma migrate deploy
npx prisma generate
```

### 3. Cek Build Success

Pastikan build berhasil tanpa error:
```
✓ Compiled successfully
✓ Ready in Xms
```

## Flow Webhook dari Fingerspot

```
┌─────────────────┐
│  Postman        │
│  get_userinfo   │
│  to Fingerspot  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fingerspot API │ ← Response 200 OK
│  developer.     │   {"success":true}
│  fingerspot.io  │
└────────┬────────┘
         │
         │ (Async, bisa 1-5 detik)
         │
         ▼
┌─────────────────┐
│  Fingerspot     │
│  Cloud Server   │ ← Proses request ke mesin
└────────┬────────┘
         │
         │ (Mesin harus online)
         │
         ▼
┌─────────────────┐
│  REVO Machine   │ ← Get user data
│  (Physical)     │
└────────┬────────┘
         │
         │ (Send response back)
         │
         ▼
┌─────────────────┐
│  Fingerspot     │
│  Cloud Server   │ ← Prepare webhook
└────────┬────────┘
         │
         │ (POST request)
         │
         ▼
┌─────────────────┐
│  Your Webhook   │ ← https://[app].railway.app
│  Railway App    │   /api/webhook/fingerspot
└─────────────────┘
```

## Kenapa Logs Tidak Muncul?

### Skenario 1: Webhook Endpoint Salah
❌ `https://fingerhr.railway.app/webhook`
❌ `https://fingerhr.railway.app/api/fingerspot`
✅ `https://fingerhr.railway.app/api/webhook/fingerspot`

### Skenario 2: Mesin Offline
Jika mesin fisik tidak online atau tidak connect ke internet:
- Command `get_userinfo` diterima Fingerspot API (200 OK)
- Tapi mesin tidak bisa diakses
- Webhook tidak akan dikirim

**Cara Cek:**
```bash
# Test dengan command instant response
curl -X POST https://developer.fingerspot.io/api/restart \
  -H "Authorization: Bearer TPDBEYV5O51USU8U" \
  -H "Content-Type: application/json" \
  -d '{"cloud_id":"C269248053121C21"}'
```

### Skenario 3: Webhook URL Belum Di-save
Setelah input webhook URL di developer.fingerspot.io, **wajib klik "Simpan"**.

### Skenario 4: Cloud_ID Tidak Match
Database device punya `cloud_id` berbeda dengan yang digunakan di request.

**Fix:**
```sql
-- Cek di database
SELECT * FROM Device WHERE cloudId = 'C269248053121C21';

-- Update jika perlu
UPDATE Device SET cloudId = 'C269248053121C21' WHERE id = 'xxx';
```

## Testing Steps (Recommended Order)

### 1. Test Webhook Endpoint Directly
```bash
# Test dari Postman/curl ke Railway webhook
POST https://[your-app].railway.app/api/webhook/fingerspot
```

✅ **Jika sukses**: Endpoint oke, masalah di Fingerspot side
❌ **Jika gagal**: Fix endpoint dulu

### 2. Check Railway Logs Real-time
```bash
# Di terminal local
railway logs --follow
```

atau di Railway dashboard → Deployment → Logs

### 3. Check Database Logs
```sql
-- Cek webhook logs
SELECT * FROM WebhookLog ORDER BY createdAt DESC LIMIT 10;

-- Cek device
SELECT * FROM Device WHERE cloudId = 'C269248053121C21';
```

### 4. Test dari Fingerspot
Setelah webhook endpoint confirmed working:
1. Set webhook URL di developer.fingerspot.io
2. Klik Simpan
3. Test command dari Postman
4. Wait 5-10 detik
5. Check Railway logs

## Expected Logs di Railway

Ketika webhook diterima, Railway logs harus menampilkan:

```
[Webhook] Received: { type: 'userinfo', cloud_id: 'C269248053121C21', data: {...} }
[Webhook] Userinfo received: { pin: '6', name: 'Test User' }
✓ Webhook logged successfully
```

Jika tidak ada log sama sekali:
1. Webhook tidak sampai ke Railway
2. Cek webhook URL di Fingerspot
3. Cek mesin online status

## Quick Fix Checklist

- [ ] Device dengan cloud_id C269248053121C21 ada di database
- [ ] Railway app deployed dan running
- [ ] Environment variables lengkap
- [ ] Database connection working
- [ ] Webhook endpoint accessible (test dengan Postman)
- [ ] Webhook URL di developer.fingerspot.io sudah benar
- [ ] Webhook URL di Fingerspot sudah di-save
- [ ] Mesin REVO online dan connected to cloud
- [ ] Railway logs filter time range benar

## Alternative: Use Webhook Testing Service

Untuk test apakah Fingerspot mengirim webhook:

1. Buat endpoint test di **webhook.site**
2. Copy URL webhook.site
3. Set di developer.fingerspot.io
4. Test command
5. Cek di webhook.site apakah ada incoming request

Jika webhook muncul di webhook.site tapi tidak di Railway:
→ Masalah di Railway endpoint

Jika webhook tidak muncul di webhook.site:
→ Masalah di Fingerspot (mesin offline, webhook URL tidak tersimpan, dll)

## Contact Support

Jika semua sudah dicoba tapi masih gagal:

1. **Fingerspot Support**
   - Email: support@fingerspot.io
   - Tanyakan apakah webhook terkirim
   - Minta log webhook attempts

2. **Railway Support**
   - Discord: railway.app/discord
   - Tanyakan kenapa webhook tidak masuk logs

## Summary

Yang paling sering jadi masalah:
1. **Webhook URL salah atau belum di-save** di developer.fingerspot.io
2. **Mesin REVO offline** atau tidak connected ke cloud
3. **Cloud_ID tidak match** antara database dan request
4. **Railway logs delay** (tunggu 1-2 menit)

**Next Action:**
1. Test webhook endpoint langsung dengan Postman
2. Cek apakah muncul di Railway logs
3. Jika iya → Masalah di Fingerspot setup
4. Jika tidak → Fix endpoint Railway
