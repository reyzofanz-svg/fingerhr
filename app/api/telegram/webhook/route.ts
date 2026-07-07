import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getBotToken } from "@/lib/telegram";

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
  };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

/**
 * POST /api/telegram/webhook
 *
 * Telegram sends updates here. Handles /start <PIN> enrollment.
 * Set webhook: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<THIS_URL>
 */
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    const msg = update.message;

    if (!msg?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(msg.chat.id);
    const text = msg.text.trim();

    // Handle /start command
    if (text.startsWith("/start")) {
      const parts = text.split(/\s+/);
      const pin = parts[1]?.trim();

      if (!pin) {
        await reply(chatId,
          "Use: <b>/start &lt;PIN&gt;</b>\n\n" +
          "Example: <b>/start 12345</b>\n\n" +
          "PIN is your identification number on the attendance device."
        );
        return NextResponse.json({ ok: true });
      }

      // Find employee by PIN
      const employee = await prisma.employee.findUnique({
        where: { pin },
        select: { id: true, name: true, telegramChatId: true },
      });

      if (!employee) {
        await reply(chatId, `PIN <b>${pin}</b> not found. Contact admin.`);
        return NextResponse.json({ ok: true });
      }

      if (employee.telegramChatId && employee.telegramChatId !== chatId) {
        // Already linked to another account
        await reply(chatId,
          `PIN <b>${pin}</b> is already linked to another Telegram account.\n\n` +
          "Contact admin if you want to change it."
        );
        return NextResponse.json({ ok: true });
      }

      // Link chatId to employee
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          telegramChatId: chatId,
          telegramUsername: msg.from.username || null,
        },
      });

      await reply(chatId,
        `Connected successfully! \n\n` +
        `<b>Name:</b> ${employee.name}\n` +
        `<b>PIN:</b> ${pin}\n\n` +
        "Attendance notifications will be sent to this Telegram."
      );

      console.log("[Telegram] Enrollment:", { name: employee.name, pin, chatId });
      return NextResponse.json({ ok: true });
    }

    // Unknown command
    await reply(chatId,
      "Command not recognized.\n\nUse <b>/start &lt;PIN&gt;</b> to register for notifications."
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram] Webhook error:", error);
    return NextResponse.json({ ok: true }); // Return 200 to Telegram to prevent retries
  }
}

/**
 * GET /api/telegram/webhook — for health checks
 */
export async function GET() {
  return NextResponse.json({ status: "ok", service: "telegram-webhook" });
}

async function reply(chatId: string, text: string) {
  const token = await getBotToken();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.error("[Telegram] reply error:", err);
  }
}
