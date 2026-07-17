import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FINGERSPOT_API_URL = Deno.env.get("FINGERSPOT_API_URL") || "https://developer.fingerspot.io/api";
const FINGERSPOT_API_KEY = Deno.env.get("FINGERSPOT_API_KEY") || "";
const FINGERSPOT_CLOUD_ID = Deno.env.get("FINGERSPOT_CLOUD_ID") || "";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "ok", message: "Fingerspot webhook endpoint is running" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { type, cloud_id, data } = body;

    console.log("[Webhook] Received:", type, cloud_id, JSON.stringify(data));

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id")
      .eq("cloud_id", cloud_id)
      .single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ status: "error", message: "Device not found", detail: deviceError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("devices")
      .update({ last_sync: new Date().toISOString(), status: "ONLINE" })
      .eq("id", device.id);

    switch (type) {
      case "attlog":
        await handleAttlog(supabase, device.id, data);
        break;
      case "userinfo":
      case "get_userinfo":
        await handleUserinfo(supabase, data);
        break;
      case "get_all_pin":
      case "get_userid_list":
        await handleGetAllPin(supabase, data, body.trans_id);
        break;
      default:
        console.log("[Webhook] Unhandled type:", type);
    }

    const { error: logErr } = await supabase.from("webhook_logs").insert({
      id: crypto.randomUUID(),
      type,
      device_cloud_id: cloud_id,
      status: "SUCCESS",
      payload: body,
    });
    if (logErr) console.error("[Webhook] log insert error:", logErr.message);

    return new Response(
      JSON.stringify({ status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return new Response(
      JSON.stringify({ status: "error", message: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleAttlog(supabase: any, deviceId: string, data: Record<string, unknown>) {
  const pin = String(data.pin || "");
  const scan = data.scan;
  if (!pin || !scan) return;

  const { data: employee } = await supabase
    .from("employees")
    .select("id, name, telegram_chat_id")
    .eq("pin", pin)
    .single();
  if (!employee) {
    console.log("[Webhook] SKIP attlog: employee not found for PIN:", pin);
    return;
  }

  // Parse scan time - device sends local time in WIB (Asia/Jakarta, UTC+7)
  const scanTimeStr = String(scan).replace(" ", "T") + "+07:00";
  const scanTime = new Date(scanTimeStr);

  // Count existing logs for this employee today (in WIB timezone)
  const wibDate = new Date(scanTime.getTime() + 7 * 60 * 60 * 1000);
  const wibYear = wibDate.getUTCFullYear();
  const wibMonth = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
  const wibDay = String(wibDate.getUTCDate()).padStart(2, "0");
  const wibDateStr = `${wibYear}-${wibMonth}-${wibDay}`;

  const startOfDay = new Date(`${wibDateStr}T00:00:00+07:00`);
  const endOfDay = new Date(`${wibDateStr}T23:59:59.999+07:00`);

  const { count: todayLogCount } = await supabase
    .from("attendance_logs")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employee.id)
    .gte("scan_time", startOfDay.toISOString())
    .lte("scan_time", endOfDay.toISOString());

  // First scan of the day = IN, second = OUT, third = IN, etc.
  const status = (todayLogCount || 0) % 2 === 0 ? "IN" : "OUT";

  await supabase.from("attendance_logs").insert({
    employee_id: employee.id,
    device_id: deviceId,
    scan_time: scanTime.toISOString(),
    verify_method: String(data.verify || "1"),
    status,
    type: "realtime",
    raw_payload: data,
  });

  // Telegram notification (fire-and-forget)
  sendTelegramNotification(supabase, employee, status, scanTime).catch((e: any) =>
    console.error("[Telegram] send failed:", e)
  );
}

async function sendTelegramNotification(
  supabase: any,
  employee: { id: string; name: string; telegram_chat_id: string | null },
  status: string,
  scanTime: Date
) {
  try {
    if (!employee.telegram_chat_id) return;

    // Check if telegram is enabled
    const { data: enabledSetting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "telegram_enabled")
      .single();
    if (enabledSetting?.value !== "true") return;

    // Get bot token
    const { data: tokenSetting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "telegram_bot_token")
      .single();
    const botToken = tokenSetting?.value;
    if (!botToken) return;

    // Get template
    const { data: templateSetting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "telegram_message_template")
      .single();
    const template = templateSetting?.value || "Halo <b>{name}</b>,\nAbsensi tercatat: <b>{status}</b> pukul <b>{time}</b>";

    const statusLabel = status === "IN" ? "MASUK" : "KELUAR";
    const time = scanTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" });
    const date = scanTime.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

    const message = template
      .replace(/{name}/g, employee.name)
      .replace(/{status}/g, statusLabel)
      .replace(/{time}/g, time)
      .replace(/{date}/g, date);

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: employee.telegram_chat_id,
        text: message,
        parse_mode: "HTML",
      }),
    });
    const result = await res.json();
    console.log("[Telegram] Sent to", employee.name, ":", result.ok ? "success" : result.description);
  } catch (err) {
    console.error("[Telegram] Error:", err);
  }
}

async function handleUserinfo(supabase: any, data: Record<string, unknown>) {
  const pin = String(data.pin || "");
  const name = String(data.name || "");
  if (!pin || !name) {
    console.log("[handleUserinfo] SKIP: empty pin or name", JSON.stringify(data));
    return;
  }

  const { data: existing, error: selErr } = await supabase
    .from("employees").select("id").eq("pin", pin).limit(1).maybeSingle();

  if (selErr) {
    console.error("[handleUserinfo] select error:", selErr.message);
    return;
  }

  if (existing) {
    const { error: updErr } = await supabase.from("employees").update({ name, is_active: true }).eq("pin", pin);
    if (updErr) console.error("[handleUserinfo] update error:", updErr.message);
    else console.log("[handleUserinfo] updated pin:", pin);
  } else {
    const id = crypto.randomUUID();
    const { error: insErr } = await supabase.from("employees").insert({ id, pin, name, is_active: true });
    if (insErr) console.error("[handleUserinfo] insert error:", insErr.message);
    else console.log("[handleUserinfo] inserted pin:", pin, "name:", name);
  }
}

async function handleGetAllPin(supabase: any, data: Record<string, unknown>, transId?: string) {
  const pins = data.pin_arr || data.pins;
  const tid = String(transId || data.trans_id || "1");
  if (!Array.isArray(pins)) return;

  console.log(`[Webhook] Received ${pins.length} PINs:`, pins);

  for (const pin of pins) {
    try {
      const pinStr = String(pin);
      const response = await fetch(`${FINGERSPOT_API_URL}/get_userinfo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FINGERSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cloud_id: FINGERSPOT_CLOUD_ID, pin: pinStr, trans_id: tid }),
      });
      console.log(`[Webhook] GetUserinfo for PIN ${pinStr}: ${response.status}`);
    } catch (err) {
      console.error(`[Webhook] Error PIN ${pin}:`, err);
    }
  }
}
