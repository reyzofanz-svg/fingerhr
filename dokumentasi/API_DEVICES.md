# API Devices Documentation

## Endpoints yang Tersedia

### 1. Get All Devices
**GET** `/api/devices`

Mengambil daftar semua perangkat yang terdaftar.

**Response:**
```json
[
  {
    "id": "uuid",
    "cloudId": "C269248053121C21",
    "name": "Mesin Absensi Lantai 1",
    "type": "REVO",
    "ip": "192.168.1.100",
    "status": "ONLINE",
    "timezone": "Asia/Jakarta",
    "lastSync": "2026-06-27T10:30:00Z",
    "totalScans": 150,
    "createdAt": "2026-01-01T00:00:00Z"
  }
]
```

### 2. Create Device
**POST** `/api/devices`

Menambahkan perangkat baru.

**Body:**
```json
{
  "name": "Mesin Absensi Lantai 2",
  "cloudId": "C269248053121C21",
  "type": "REVO",
  "ip": "192.168.1.101"
}
```

### 3. Execute Device Command
**POST** `/api/devices/[id]/commands`

Menjalankan command ke perangkat Fingerspot.

**Commands yang Tersedia:**

#### GET_DEVICE
Mengambil informasi detail device dari Fingerspot.

**Body:**
```json
{
  "command": "GET_DEVICE",
  "transId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "trans_id": "1",
  "data": {
    "cloud_id": "C269248053121C21",
    "device_name": "Mesin Absensi Revo",
    "webhook_url": "https://yourapp.com/api/webhook/fingerspot",
    "created_at": "2025-01-01 13:00:00",
    "last_activity": "N/A"
  }
}
```

#### RESTART
Restart mesin absensi.

**Body:**
```json
{
  "command": "RESTART"
}
```

**Response:**
```json
{
  "success": true,
  "command": "RESTART",
  "duration": 1234
}
```

#### SET_TIME
Set waktu pada mesin sesuai timezone.

**Body:**
```json
{
  "command": "SET_TIME",
  "timezone": "Asia/Jakarta"
}
```

**Response:**
```json
{
  "success": true,
  "command": "SET_TIME",
  "duration": 1234
}
```

#### GET_ATTLOG
Download log absensi dari mesin.

**Body:**
```json
{
  "command": "GET_ATTLOG",
  "startDate": "2026-06-26",
  "endDate": "2026-06-27"
}
```

**Response:**
```json
{
  "success": true,
  "command": "GET_ATTLOG",
  "duration": 2345,
  "data": {
    "attlog": [
      {
        "pin": "001",
        "scan": "2026-06-27 08:30:00",
        "status_scan": "1",
        "verify": "1"
      }
    ]
  }
}
```

#### GET_ALL_PIN
Mengambil semua PIN yang terdaftar di mesin.

**Body:**
```json
{
  "command": "GET_ALL_PIN"
}
```

#### GET_USERINFO
Mengambil info user berdasarkan PIN.

**Body:**
```json
{
  "command": "GET_USERINFO",
  "pin": "001"
}
```

### 4. Get Device Info
**GET** `/api/devices/[id]/info`

Shortcut untuk mendapatkan info device langsung.

**Response:**
```json
{
  "success": true,
  "data": {
    "cloud_id": "C269248053121C21",
    "device_name": "Mesin Absensi Revo",
    "webhook_url": "https://yourapp.com/api/webhook/fingerspot",
    "created_at": "2025-01-01 13:00:00",
    "last_activity": "N/A"
  },
  "duration": 1234
}
```

## Fingerspot API Configuration

Konfigurasi di `.env`:
```env
FINGERSPOT_API_URL="https://developer.fingerspot.io/api"
FINGERSPOT_API_KEY="TPDBEYV5O51USU8U"
FINGERSPOT_CLOUD_ID="C269248053121C21"
```

## Device Series

- **REVO Series**: Mesin fingerprint modern dengan cloud connectivity
- **VIDA Series**: Mesin face recognition
- **VEGA Series**: Mesin fingerprint + face recognition
- **VIVO Series**: Mesin fingerprint standar
- **DS/DT Series**: Mesin dengan fitur door access

## Status Device

- `ONLINE`: Mesin aktif dan terhubung
- `OFFLINE`: Mesin tidak terhubung
- `ERROR`: Mesin mengalami error
- `MAINTENANCE`: Mesin dalam pemeliharaan

## Notes

1. Semua command yang dikirim ke mesin akan dicatat di `ApiLog`
2. Response dari beberapa command (GET_USERINFO, SET_TIME, dll) akan dikirim via webhook
3. Command RESTART akan merestart mesin, pastikan tidak ada proses penting yang berjalan
4. Command GET_ATTLOG maksimal download 2 hari, dan maksimal data 60 hari terakhir
5. Timezone default adalah "Asia/Jakarta"
