/**
 * Fingerspot API Client
 * Dokumentasi: https://developer.fingerspot.io
 */

const FINGERSPOT_API_URL = process.env.FINGERSPOT_API_URL || "https://developer.fingerspot.io/api";
const FINGERSPOT_API_KEY = process.env.FINGERSPOT_API_KEY || "";
const FINGERSPOT_CLOUD_ID = process.env.FINGERSPOT_CLOUD_ID || "";

interface FingerspotResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorCode?: string;
}

/**
 * Base API call function
 */
async function callFingerspotAPI(
  endpoint: string,
  body: Record<string, any>,
  cloudId?: string
): Promise<FingerspotResponse> {
  try {
    const response = await fetch(`${FINGERSPOT_API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FINGERSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cloud_id: cloudId || FINGERSPOT_CLOUD_ID,
        ...body,
      }),
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: `API returned non-JSON (${response.status}): ${text.substring(0, 200)}`,
      };
    }
    
    // Fingerspot API returns HTTP 200 even on business errors (ERR_02)
    // Check the body-level "success" field too
    if (!response.ok || data.success === false) {
      return {
        success: false,
        error: data.message || data.error || `API error ${response.status}`,
        errorCode: data.error_code,
        data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`Fingerspot API Error (${endpoint}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get Attendance Log (Max 2 days, last 60 days)
 */
export async function getAttendanceLog(
  startDate: string, // Format: YYYY-MM-DD
  endDate: string     // Format: YYYY-MM-DD
) {
  return callFingerspotAPI("get_attlog", {
    start_date: startDate,
    end_date: endDate,
  });
}

/**
 * Get User Info (Response via webhook)
 */
export async function getUserInfo(pin: string, transId: string = "1", cloudId?: string) {
  return callFingerspotAPI("get_userinfo", {
    pin,
    trans_id: transId,
  }, cloudId);
}

/**
 * Set User Info (Send user to device, response via webhook)
 */
export async function setUserInfo(userData: {
  pin: string;
  name: string;
  password?: string;
  card?: string;
  privilege?: string; // "1" = user, "2" = admin, "3" = subadmin
  face?: string; // Base64 face photo for VIVO/VIDA/DS/DT series
  cloudId?: string; // Target device cloud ID (multi-device support)
}) {
  const dataBody: Record<string, any> = {
    pin: userData.pin,
    name: userData.name,
    password: userData.password || "",
    rfid: userData.card || "",
    privilege: userData.privilege || "1", // Default: 1 = user
    template: "",
  };

  // For VIVO/VIDA/DS/DT series, include face photo in template
  if (userData.face) {
    // Strip data URL prefix (data:image/jpeg;base64,...) → raw base64 only
    const base64Data = userData.face.replace(/^data:image\/\w+;base64,/, "");
    // Format: {"face":"<base64-jpeg>"} then encode again to base64
    const faceJson = JSON.stringify({ face: base64Data });
    const templateBase64 = Buffer.from(faceJson).toString("base64");
    dataBody.template = templateBase64;
  }

  // Fingerspot API requires user data wrapped in "data" object + trans_id
  return callFingerspotAPI("set_userinfo", { trans_id: "1", data: dataBody }, userData.cloudId);
}

/**
 * Delete User Info (Response via webhook)
 */
export async function deleteUserInfo(pin: string, cloudId?: string) {
  return callFingerspotAPI("delete_userinfo", {
    trans_id: "1",
    pin,
  }, cloudId);
}

/**
 * Get All PIN from device (Response via webhook)
 */
export async function getAllPin(transId: string = "1", cloudId?: string) {
  return callFingerspotAPI("get_all_pin", {
    trans_id: transId,
  }, cloudId);
}

/**
 * Set Time on device (Response via webhook)
 */
export async function setDeviceTime(timezone: string = "Asia/Jakarta", cloudId?: string) {
  return callFingerspotAPI("set_time", {
    timezone,
  }, cloudId);
}

/**
 * Register Online (Response via webhook)
 * verification: 0-9 = Jari, 12 = Wajah, 13 = Vein
 * Note: Only supported on REVO, VEGA, and "Mesin Absensi Lain" series.
 *       VIDA/VIVO/DS/DT series do NOT support reg_online.
 */
export async function registerOnline(pin: string, verification: string = "0", cloudId?: string) {
  return callFingerspotAPI("reg_online", {
    trans_id: "1",
    pin,
    verification,
  }, cloudId);
}

/**
 * Restart Device
 */
export async function restartDevice(transId: string = "1", cloudId?: string) {
  return callFingerspotAPI("restart_device", {
    trans_id: transId,
  }, cloudId);
}

/**
 * Get Device Info
 */
export async function getDevice(transId: string = "1", cloudId?: string) {
  return callFingerspotAPI("get_device", {
    trans_id: transId,
  }, cloudId);
}

/**
 * Helper: Format date untuk API
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Helper: Get date range untuk download attlog
 */
export function getAttlogDateRange(daysAgo: number = 1) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);
  
  return {
    start: formatDateForAPI(startDate),
    end: formatDateForAPI(endDate),
  };
}
