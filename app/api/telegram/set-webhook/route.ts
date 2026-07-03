import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const TELEGRAM_API = "https://api.telegram.org";

/**
 * POST /api/telegram/set-webhook
 * Sets the Telegram bot webhook to the given URL.
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
    }

    // Get bot token
    const tokenSetting = await prisma.systemSettings.findUnique({
      where: { key: "telegram_bot_token" },
    });
    const token = tokenSetting?.value || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "Bot token belum diatur" }, { status: 400 });
    }

    const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        allowed_updates: ["message"],
      }),
    });

    const data = await res.json();
    console.log("[Telegram] setWebhook result:", JSON.stringify(data));

    if (data.ok) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ ok: false, error: data.description || "Unknown error" }, { status: 500 });
    }
  } catch (error) {
    console.error("[Telegram] setWebhook error:", error);
    return NextResponse.json({ error: "Gagal mengatur webhook" }, { status: 500 });
  }
}
