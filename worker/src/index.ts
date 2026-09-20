import {
  runChat,
  encodeNdjson,
  type ChatMessage,
  type ChatEnv,
} from "../../shared/chat/core";

const worker = {
  async fetch(request: Request, env: ChatEnv): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, service: "victory-chatbot" });
    }

    if (request.method !== "POST" || url.pathname !== "/chat") {
      return new Response("Not found", { status: 404 });
    }

    let messages: ChatMessage[];
    let additionalContext: string | undefined;
    try {
      const body = (await request.json()) as {
        messages?: unknown;
        context?: unknown;
      };
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        throw new Error("invalid payload");
      }
      messages = body.messages as ChatMessage[];
      if (typeof body.context === "string" && body.context.trim()) {
        additionalContext = body.context;
      }
    } catch {
      return Response.json({ error: "Messages array is required." }, { status: 400 });
    }

    if (!env.NVIDIA_API_KEY) {
      return Response.json({ error: "Server configuration error." }, { status: 500 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const { reasoning, content } = await runChat(env, messages, {
            additionalContext,
          });

          if (reasoning) {
            controller.enqueue(encoder.encode(encodeNdjson({ r: "\n\n" + reasoning })));
          }
          if (content) {
            controller.enqueue(encoder.encode(encodeNdjson({ c: content })));
          }
        } catch (err) {
          console.error("Chat error:", err);
          controller.enqueue(
            encoder.encode(
              encodeNdjson({ c: "\n\nSorry, I encountered an error connecting to the AI." })
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  },
};

export default worker;