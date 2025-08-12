import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROUP_ID = process.env.TELEGRAM_GROUP_ID;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Missing message content" },
        { status: 400 }
      );
    }

    const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const response = await fetch(TELEGRAM_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: GROUP_ID,
        text: message,
        parse_mode: "MarkdownV2",
      }),
    });

    const telegramResponseText = await response.text();
    // console.log("Telegram response text:", telegramResponseText);

    if (!response.ok) {
      console.error("Telegram API error:", telegramResponseText);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    const data = JSON.parse(telegramResponseText);
    // console.log("Telegram data:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
