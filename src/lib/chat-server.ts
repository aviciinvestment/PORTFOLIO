import {
  runChat,
  encodeNdjson,
  type ChatMessage,
  type ChatEnv,
} from "@shared/chat/core";

export function buildChatEnv(): ChatEnv {
  return {
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY ?? "",
    NVIDIA_EMBEDDING_API_KEY: process.env.NVIDIA_EMBEDDING_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME ?? "rag-systems",
    PINECONE_INDEX_HOST:
      process.env.PINECONE_INDEX_HOST ??
      "https://rag-systems-x3bxlpw.svc.aped-4627-b74a.pinecone.io",
  };
}

export function localChatStream(messages: ChatMessage[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let keepAlive: ReturnType<typeof setInterval> | null = null;

      try {
        keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(encodeNdjson({ r: "." })));
        }, 5000);

        const { reasoning, content } = await runChat(buildChatEnv(), messages);

        if (keepAlive) {
          clearInterval(keepAlive);
          keepAlive = null;
        }

        if (reasoning) {
          controller.enqueue(encoder.encode(encodeNdjson({ r: "\n\n" + reasoning })));
        }
        if (content) {
          controller.enqueue(encoder.encode(encodeNdjson({ c: content })));
        }
      } catch (err) {
        if (keepAlive) {
          clearInterval(keepAlive);
        }
        console.error("Chat streaming error:", err);
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
}