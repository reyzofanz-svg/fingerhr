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

  try {
    const body = await req.json();
    const { type, cloud_id, data } = body;

    console.log("[Webhook] Received:", type, cloud_id);

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
        await handleUserinfo(supabase, data);
        break;
      case "get_all_pin":
        await handleGetAllPin(supabase, data);
        break;
      default:
        console.log("[Webhook] Unhandled type:", type);
    }

    await supabase.from("webhook_logs").insert({
      type,
      device_cloud_id: cloud_id,
      status: "SUCCESS",
      payload: body,
    });

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

  const { data: employee } = await supabase.from("employees").select("id").eq("pin", pin).single();
  if (!employee) return;

  const status = data.status_scan === "1" || data.status_scan === 1 ? "IN" : "OUT";
  const scanTime = new Date(scan as string);

  await supabase.from("attendance_logs").insert({
    employee_id: employee.id,
    device_id: deviceId,
    scan_time: scanTime.toISOString(),
    verify_method: String(data.verify || "1"),
    status,
    type: "realtime",
    raw_payload: data,
  });
}

async function handleUserinfo(supabase: any, data: Record<string, unknown>) {
  const pin = String(data.pin || "");
  const name = String(data.name || "");
  if (!pin || !name) return;

  const { data: existing } = await supabase
    .from("employees").select("id").eq("pin", pin).limit(1).maybeSingle();

  if (existing) {
    await supabase.from("employees").update({ name, is_active: true }).eq("pin", pin);
  } else {
    await supabase.from("employees").insert({ pin, name, is_active: true });
  }
}

async function handleGetAllPin(supabase: any, data: Record<string, unknown>) {
  const pins = data.pins;
  const transId = String(data.trans_id || "1");
  if (!Array.isArray(pins)) return;

  for (const pin of pins) {
    try {
      const pinStr = String(pin);
      const response = await fetch(`${FINGERSPOT_API_URL}/get_userinfo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FINGERSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cloud_id: FINGERSPOT_CLOUD_ID, pin: pinStr, trans_id: transId }),
      });
      console.log(`[Webhook] GetUserinfo for PIN ${pinStr}: ${response.status}`);
    } catch (err) {
      console.error(`[Webhook] Error PIN ${pin}:`, err);
    }
  }
}
