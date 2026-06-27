# Webhook Quick Test - Copy Paste Ready

## 🎯 Test 1: Health Check

```bash
# cURL
curl https://[your-app].railway.app/api/webhook/test

# Expected
{"status":"ok","message":"Webhook test endpoint is working"}
```

## 🎯 Test 2: Simple Webhook Test

```bash
# Postman
POST https://[your-app].railway.app/api/webhook/test
Content-Type: application/json

{
  "message": "hello"
}

# Expected Response
{
  "status": "ok",
  "message": "Webhook test received successfully",
  "timestamp": "...",
  "received": {
    "message": "hello"
  }
}

# Expected in Railway Logs
=== WEBHOOK TEST RECEIVED ===
Body: { "message": "hello" }
```

## 🎯 Test 3: Fingerspot Userinfo

```bash
# Postman
POST https://[your-app].railway.app/api/webhook/fingerspot
Content-Type: application/json

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

# Expected Response
{
  "status": "ok",
  "duration": 156,
  "timestamp": "..."
}

# Expected in Railway Logs
=== FINGERSPOT WEBHOOK RECEIVED ===
[Webhook] Type: userinfo
[Webhook] Cloud ID: C269248053121C21
[Webhook] Userinfo received: { pin: '6', name: 'Test User' }
```

## 🎯 Test 4: Fingerspot Attlog

```bash
# Postman
POST https://[your-app].railway.app/api/webhook/fingerspot
Content-Type: application/json

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

# Expected Response
{
  "status": "ok",
  "duration": 234,
  "timestamp": "..."
}

# Expected in Railway Logs
[Webhook] Attlog saved: { employee: '...', status: 'IN', scan: '...' }
```

## 🎯 Test 5: Fingerspot Set Time

```bash
# Postman
POST https://[your-app].railway.app/api/webhook/fingerspot
Content-Type: application/json

{
  "type": "set_time",
  "cloud_id": "C269248053121C21",
  "data": {
    "status": "success",
    "timezone": "Asia/Jakarta"
  }
}

# Expected Response
{
  "status": "ok",
  "duration": 123,
  "timestamp": "..."
}

# Expected in Railway Logs
[Webhook] Set time response: { status: 'success', timezone: 'Asia/Jakarta' }
```

## 🎯 Test 6: Real Command to Fingerspot

```bash
# Postman
POST https://developer.fingerspot.io/api/get_userinfo
Authorization: Bearer TPDBEYV5O51USU8U
Content-Type: application/json

{
  "trans_id": "1",
  "cloud_id": "C269248053121C21",
  "pin": "6"
}

# Expected Immediate Response
{
  "success": true,
  "trans_id": "1"
}

# Expected in Railway Logs (after 5-30 seconds)
=== FINGERSPOT WEBHOOK RECEIVED ===
[Webhook] Type: userinfo
[Webhook] Cloud ID: C269248053121C21
```

## 📊 Results Interpretation

| Test | Logs Muncul | Meaning |
|------|-------------|---------|
| Test 1 | ✅ Yes | Railway app running |
| Test 2 | ✅ Yes | Webhook endpoint working |
| Test 3 | ✅ Yes | Fingerspot handler working |
| Test 3 | ❌ No | Check database (device exists?) |
| Test 6 | ✅ Yes (delayed) | Everything working! |
| Test 6 | ❌ No | Check Fingerspot setup |

## 🔧 Quick Fixes

### Logs Not Showing
```bash
# Terminal
railway logs --follow

# Or Railway Dashboard
→ Deployment → Logs → Filter: Last 1 hour
```

### Device Not Found
```bash
npm run seed:device
```

### Database Check
```sql
SELECT * FROM Device WHERE cloudId = 'C269248053121C21';
SELECT * FROM WebhookLog ORDER BY createdAt DESC LIMIT 5;
SELECT * FROM Employee WHERE pin = '6';
```

## ⚡ Speed Test

Run all tests in order:
1. Test 1 → Should take < 1s
2. Test 2 → Should take < 2s, logs instant
3. Test 3 → Should take < 2s, logs instant
4. Test 4 → Should take < 2s, logs instant
5. Test 5 → Should take < 2s, logs instant
6. Test 6 → Response instant, logs after 5-30s

**If Test 1-5 all pass but Test 6 fails:**
→ Problem is NOT your code, it's Fingerspot/device setup

## 📱 Monitor Railway Logs Real-time

```bash
# Option 1: Railway CLI
railway logs --follow

# Option 2: Railway Dashboard
https://railway.app/project/[project-id]/[env]/logs

# Option 3: Browser Auto-refresh
Set Railway logs page to auto-refresh every 5 seconds
```

## 🎬 Expected Timeline

```
T+0s:   Send Postman request to Fingerspot API
T+0s:   Get 200 OK {"success":true} ✅
T+0-5s: Fingerspot queue command to device
T+5-15s: Device process command (if online)
T+15-20s: Device send response to Fingerspot
T+20-30s: Fingerspot POST webhook to Railway ← LOGS HERE
```

**If no logs after 60 seconds:**
- Device is offline, or
- Webhook URL not saved, or
- Cloud ID mismatch

## 🚨 Troubleshooting Flow

```
1. Test Health Check (Test 1)
   ↓ Failed
   → Railway app not running
   
2. Test Simple Webhook (Test 2)
   ↓ Failed
   → Endpoint issue, check code
   
3. Test Fingerspot Format (Test 3)
   ↓ Failed
   → Check device in database
   
4. All manual tests pass, Test 6 fails
   ↓
   → Problem: Fingerspot setup
   → Check: Webhook URL saved?
   → Check: Device online?
   → Check: Wait longer (60s)?
```

## 💡 Pro Tips

1. **Always test manual first** (Test 2-5) before real command (Test 6)
2. **Monitor logs real-time** during Test 6
3. **Use webhook.site** if still confused
4. **Check last_activity** of device in Fingerspot dashboard
5. **Refresh Railway logs** every 10 seconds during wait

## 📞 Quick Support

**If all manual tests work but real webhook not coming:**

Contact Fingerspot Support:
- Email: support@fingerspot.io  
- Question: "I set webhook URL but not receiving webhooks. Device C269248053121C21. Can you check your logs?"

**Include in support email:**
- Your webhook URL
- Cloud ID
- Command sent (get_userinfo)
- Time sent
- Screenshot of Railway logs (showing no incoming request)
