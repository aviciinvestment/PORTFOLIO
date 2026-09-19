import { NextResponse } from "next/server";
import { localChatStream } from "@/lib/chat-server";
import type { ChatMessage } from "@shared/chat/core";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let messages: ChatMessage[];

  try {
    const body = (await req.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      throw new Error("invalid payload");
    }
    messages = body.messages as ChatMessage[];
  } catch {
    return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
  }

  const workerUrl = (process.env.CHAT_WORKER_URL ?? "").trim();

  if (workerUrl) {
    try {
      const upstream = await fetch(new URL("/chat", workerUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!upstream.ok || !upstream.body) {
        return NextResponse.json({ error: "Chat worker is unavailable." }, { status: 502 });
      }

      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": "application/x-ndjson",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } catch (error) {
      console.error("Chat worker proxy error:", error);
      return NextResponse.json({ error: "Chat worker is unavailable." }, { status: 502 });
    }
  }

  if (!process.env.NVIDIA_API_KEY) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  return new NextResponse(localChatStream(messages), {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}