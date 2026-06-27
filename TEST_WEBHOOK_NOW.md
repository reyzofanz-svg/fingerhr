# 🚀 Test Webhook Sekarang - Langkah Pasti

## Step 1: Buka Postman

## Step 2: Test Endpoint Railway Langsung

### Request 1: Health Check
```
Method: GET
URL: https://[your-app].railway.app/api/webhook/test
```

Klik Send.

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Webhook test endpoint is working"
}
```

✅ **Jika dapat response ini** → Railway app running OK!

---

### Request 2: Test Webhook
```
Method: POST
URL: https://[your-app].railway.app/api/webhook/test

Headers:
Content-Type: application/json

Body (JSON):
{
  "message": "test dari postman"
}
```

Klik Send.

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Webhook test received successfully",
  "received": {
    "message": "test dari postman"
  }
}
```

**SEGERA CEK RAILWAY LOGS:**
```
=== WEBHOOK TEST RECEIVED ===
Body: { "message": "test dari postman" }
```

✅ **Jika logs muncul** → Webhook endpoint working perfect!

---

### Request 3: Test Format Fingerspot
```
Method: POST
URL: https://[your-app].railway.app/api/webhook/fingerspot

Headers:
Content-Type: application/json

Body (JSON):
{
  "type": "userinfo",
  "cloud_id": "C269248053121C21",
  "data": {
    "pin": "6",
    "name": "Test dari Postman",
    "card": "",
    "privilege": "0"
  }
}
```

Klik Send.

**Expected Response:**
```json
{
  "status": "ok",
  "duration": 156
}
```

**SEGERA CEK RAILWAY LOGS:**
```
=== FINGERSPOT WEBHOOK RECEIVED ===
[Webhook] Type: userinfo
[Webhook] Cloud ID: C269248053121C21
[Webhook] Userinfo received: { pin: '6', name: 'Test dari Postman' }
```

✅ **Jika logs muncul** → Webhook handler working!

---

## Step 3: Interpretasi Hasil

### Skenario A: Request 1-3 Semua Berhasil ✅

**Artinya:**
- Railway app running OK
- Webhook endpoint working
- Handler processing OK
- **MASALAH BUKAN DI KODE KAMU!**

**Next Action:**
1. Cek webhook URL di developer.fingerspot.io
2. Pastikan sudah klik "Simpan"
3. Cek status mesin (online?)
4. Test real command, tunggu 60 detik
5. Jika masih tidak muncul → Problem di Fingerspot side

### Skenario B: Request 1 Gagal ❌

**Artinya:**
- Railway app tidak running
- URL salah
- Deploy gagal

**Fix:**
```bash
# Check deployment di Railway dashboard
# Re-deploy jika perlu
```

### Skenario C: Request 1 OK, Request 2-3 Gagal ❌

**Artinya:**
- App running tapi endpoint error
- Database issue
- Code error

**Fix:**
```bash
# Check Railway logs untuk error detail
# Check DATABASE_URL
# Run migration
npx prisma migrate deploy
```

### Skenario D: Request 3 Response 404 "Device not found"

**Artinya:**
- Device C269248053121C21 tidak ada di database

**Fix:**
```bash
npm run seed:device
```

---

## Step 4: Jika Manual Test Berhasil

Sekarang test **real command** dari Fingerspot:

```
Method: POST
URL: https://developer.fingerspot.io/api/get_userinfo

Headers:
Authorization: Bearer TPDBEYV5O51USU8U
Content-Type: application/json

Body:
{
  "trans_id": "1",
  "cloud_id": "C269248053121C21",
  "pin": "6"
}
```

Klik Send.

**Response Immediate:**
```json
{
  "success": true,
  "trans_id": "1"
}
```

**TUNGGU 30-60 DETIK**

**Refresh Railway Logs**

**Expected Logs:**
```
=== FINGERSPOT WEBHOOK RECEIVED ===
[Webhook] Type: userinfo
[Webhook] Cloud ID: C269248053121C21
```

---

## Troubleshooting Real Command

### Jika Logs Tidak Muncul Setelah 60 Detik:

#### Check 1: Webhook URL Saved?
1. Login developer.fingerspot.io
2. Pilih device C269248053121C21
3. Scroll ke "End Point Webhook"
4. Cek apakah URL masih ada setelah refresh page
5. Jika hilang → Belum tersimpan, input lagi dan klik "Simpan"

#### Check 2: Device Online?
1. Di dashboard developer.fingerspot.io
2. Cek status device
3. Cek "Last Activity"
4. Jika > 5 menit → Device offline atau tidak connected

#### Check 3: Cloud ID Match?
```sql
-- Cek di database
SELECT * FROM Device WHERE cloudId = 'C269248053121C21';
```

Jika tidak ada → Run seed:
```bash
npm run seed:device
```

#### Check 4: Use webhook.site
1. Buka https://webhook.site
2. Copy URL
3. Set di developer.fingerspot.io (ganti Railway URL sementara)
4. Test command get_userinfo
5. Cek di webhook.site apakah ada incoming request

**Jika muncul di webhook.site:**
→ Fingerspot kirim webhook, masalah di Railway endpoint

**Jika tidak muncul di webhook.site:**
→ Fingerspot tidak kirim, masalah di:
- Webhook URL tidak tersimpan
- Mesin offline
- Command tidak sampai

---

## Quick Decision Tree

```
1. Test manual ke Railway webhook
   ├─ Berhasil → Masalah di Fingerspot setup
   └─ Gagal → Masalah di Railway endpoint

2. Jika manual berhasil:
   ├─ Test real command
   ├─ Tunggu 60 detik
   ├─ Cek logs
   ├─ Jika tidak muncul → Cek webhook URL saved?
   └─ Jika tidak muncul → Cek device online?

3. Jika device online dan webhook URL saved:
   └─ Contact Fingerspot support
```

---

## Summary

**JANGAN langsung test ke Fingerspot API!**

**HARUS test manual dulu:**
1. ✅ Test health check
2. ✅ Test webhook endpoint
3. ✅ Test Fingerspot format
4. ✅ Pastikan logs muncul

**Setelah manual test OK, baru test real command**

**Kalau manual OK tapi real gagal:**
→ **100% masalah bukan di kode kamu!**
→ Check Fingerspot setup (webhook URL, device status)

---

## Contact Info

Jika sudah test semua tapi masih stuck:

**Screenshot yang perlu:**
1. Postman request manual ke Railway (dengan response)
2. Railway logs (setelah manual test)
3. Developer.fingerspot.io webhook URL setting
4. Developer.fingerspot.io device status

Kirim ke saya atau Fingerspot support.
