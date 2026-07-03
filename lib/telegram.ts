import { prisma } from "@/lib/db/prisma";

const TELEGRAM_API = "https://api.telegram.org";

/**
 * Send a message via Telegram Bot API.
 * Reads bot token from SystemSettings or env TELEGRAM_BOT_TOKEN.
 */
export async function sendMessage(chatId: string, text: string): Promise<boolean> {
  const token = await getBotToken();
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.warn("[Telegram] sendMessage failed:", data.description);
    }
    return data.ok;
  } catch (err) {
    console.error("[Telegram] sendMessage error:", err);
    return false;
  }
}

/**
 * Set the bot webhook URL.
 */
export async function setWebhook(url: string): Promise<boolean> {
  const token = await getBotToken();
  if (!token) return false;

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, allowed_updates: ["message"] }),
    });
    const data = await res.json();
    console.log("[Telegram] setWebhook:", data.ok ? "success" : data.description);
    return data.ok;
  } catch (err) {
    console.error("[Telegram] setWebhook error:", err);
    return false;
  }
}

/**
 * Get bot token from SystemSettings, falling back to env var.
 */
export async function getBotToken(): Promise<string | null> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "telegram_bot_token" },
    });
    if (setting?.value) return setting.value;
  } catch {
    // fallback to env
  }
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

/**
 * Check if Telegram notifications are enabled.
 */
export async function isEnabled(): Promise<boolean> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "telegram_enabled" },
    });
    return setting?.value === "true";
  } catch {
    return false;
  }
}

/**
 * Get the notification message template from settings.
 * Placeholders: {name}, {status}, {time}, {date}
 */
export async function getTemplate(): Promise<string> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "telegram_message_template" },
    });
    if (setting?.value) return setting.value;
  } catch {
    // fallback
  }
  return "Halo <b>{name}</b>,\nAbsensi tercatat: <b>{status}</b> pukul <b>{time}</b>";
}
