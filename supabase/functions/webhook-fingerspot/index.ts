import "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FINGERSPOT_API_URL = Deno.env.get("FINGERSPOT_API_URL") || "https://developer.fingerspot.io/api";
const FINGERSPOT_API_KEY = Deno.env.get("FINGERSPOT_API_KEY") || "";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface WebhookPayload {
  type: string;
  cloud_id: string;
  data: Record<string, unknown>;
}

async function callFingerspotAPI(
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const response = await fetch(`${FINGERSPOT_API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FINGERSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: `Non-JSON response (${response.status}): ${text.substring(0, 200)}` };
    }

    if (!response.ok) {
      return { success: false, error: (data as Record<string, unknown>)?.message as string || `API error ${response.status}` };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body: WebhookPayload = await req.json();
    const { type, cloud_id, data } = body;

    console.log("[Webhook] Received:", type, cloud_id);

    // Find device
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id")
      .eq("cloud_id", cloud_id)
      .single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ status: "error", message: "Device not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update device last sync
    await supabase
      .from("devices")
      .update({ last_sync: new Date().toISOString(), status: "ONLINE" })
      .eq("id", device.id);

    // Process based on type
    switch (type) {
      case "attlog":
        await handleAttlog(supabase, device.id, data);
        break;
      case "userinfo":
        await handleUserinfo(supabase, data);
        break;
      case "set_userinfo":
        await handleSetUserinfo(data);
        break;
      case "delete_userinfo":
        await handleDeleteUserinfo(data);
        break;
      case "get_all_pin":
        await handleGetAllPin(supabase, data);
        break;
      case "set_time":
        await handleSetTime(data);
        break;
      case "reg_online":
        await handleRegOnline(data);
        break;
      default:
        console.log("[Webhook] Unknown type:", type);
    }

    // Log webhook
    await supabase.from("webhook_logs").insert({
      type,
      device_cloud_id: cloud_id,
      status: "SUCCESS",
      payload: body,
    });

    const duration = Date.now() - startTime;
    console.log("[Webhook] Done in", duration, "ms");

    return new Response(
      JSON.stringify({ status: "ok", duration }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleAttlog(
  supabase: ReturnType<typeof createClient>,
  deviceId: string,
  data: Record<string, unknown>
) {
  const pin = String(data.pin || "");
  const scan = data.scan;
  const verify = data.verify;
  const status_scan = data.status_scan;

  if (!pin || !scan) return;

  // Find employee by pin
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("pin", pin)
    .single();

  if (!employee) return;

  const status = status_scan === "1" || status_scan === 1 ? "IN" : "OUT";
  const scanTime = new Date(scan as string);

  // Check duplicate
  const { data: existing } = await supabase
    .from("attendance_logs")
    .select("id")
    .eq("employee_id", employee.id)
    .eq("device_id", deviceId)
    .eq("scan_time", scanTime.toISOString())
    .limit(1)
    .maybeSingle();

  if (existing) return;

  await supabase.from("attendance_logs").insert({
    employee_id: employee.id,
    device_id: deviceId,
    scan_time: scanTime.toISOString(),
    verify_method: String(verify || "1"),
    status,
    type: "realtime",
    raw_payload: data,
  });
}

async function handleUserinfo(
  supabase: ReturnType<typeof createClient>,
  data: Record<string, unknown>
) {
  const pin = String(data.pin || "");
  const name = String(data.name || "");

  if (!pin || !name) return;

  // Upsert employee
  const { data: existing } = await supabase
    .from("employees")
    .select("id")
    .eq("pin", pin)
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("employees")
      .update({ name, is_active: true })
      .eq("pin", pin);
  } else {
    await supabase.from("employees").insert({
      pin,
      name,
      is_active: true,
    });
  }
}

async function handleSetUserinfo(data: Record<string, unknown>) {
  console.log("[Webhook] Set userinfo response:", data);
}

async function handleDeleteUserinfo(data: Record<string, unknown>) {
  console.log("[Webhook] Delete userinfo response:", data);
}

async function handleGetAllPin(
  supabase: ReturnType<typeof createClient>,
  data: Record<string, unknown>
) {
  const pins = data.pins;
  const transId = String(data.trans_id || "1");
  console.log("[Webhook] All PINs received:", pins);

  if (!Array.isArray(pins)) return;

  console.log(`[Webhook] Auto-triggering GetUserinfo for ${pins.length} PINs`);

  for (const pin of pins) {
    try {
      const pinStr = String(pin);
      const result = await callFingerspotAPI("get_userinfo", {
        cloud_id: Deno.env.get("FINGERSPOT_CLOUD_ID") || "",
        pin: pinStr,
        trans_id: transId,
      });

      if (result.success && result.data) {
        console.log(`[Webhook] Userinfo received for PIN ${pinStr}`);
      } else {
        console.warn(`[Webhook] Failed to get userinfo for PIN ${pinStr}:`, result.error);
      }
    } catch (error) {
      console.error(`[Webhook] Error getting userinfo for PIN ${pin}:`, error);
    }
  }
}

async function handleSetTime(data: Record<string, unknown>) {
  console.log("[Webhook] Set time response:", data);
}

async function handleRegOnline(data: Record<string, unknown>) {
  console.log("[Webhook] Register online response:", data);
}
