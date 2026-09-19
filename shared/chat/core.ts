import { Pinecone } from "@pinecone-database/pinecone";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatEnv {
  NVIDIA_API_KEY?: string;
  NVIDIA_EMBEDDING_API_KEY?: string;
  PINECONE_API_KEY?: string;
  PINECONE_INDEX_NAME?: string;
  PINECONE_INDEX_HOST?: string;
  NVIDIA_CHAT_URL?: string;
  NVIDIA_EMBEDDING_URL?: string;
  CHAT_MODEL?: string;
}

export interface ChatResult {
  reasoning: string;
  content: string;
}

export const DEFAULT_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
export const DEFAULT_EMBEDDING_URL = "https://integrate.api.nvidia.com/v1/embeddings";
export const DEFAULT_CHAT_MODEL = "deepseek-ai/deepseek-v4-flash-0731";
export const DEFAULT_EMBEDDING_MODEL = "nvidia/nemotron-3-embed-1b";
export const DEFAULT_PINECONE_INDEX = "rag-systems";
export const DEFAULT_PINECONE_HOST = "https://rag-systems-x3bxlpw.svc.aped-4627-b74a.pinecone.io";

export const encodeNdjson = (event: Record<string, string>): string =>
  JSON.stringify(event) + "\n";

export async function generateEmbedding(
  env: ChatEnv,
  text: string,
  inputType: "query" | "passage" = "query"
): Promise<number[]> {
  const apiKey = env.NVIDIA_EMBEDDING_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_EMBEDDING_API_KEY is not set.");
  }

  const response = await fetch(env.NVIDIA_EMBEDDING_URL ?? DEFAULT_EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: [text],
      model: DEFAULT_EMBEDDING_MODEL,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} - ${errorBody}`);
  }

  const data = (await response.json()) as { data?: { embedding?: number[] }[] };
  const embedding = data.data?.[0]?.embedding ?? [];

  return embedding.length > 1024 ? embedding.slice(0, 1024) : embedding;
}

export async function retrieveContext(env: ChatEnv, query: string): Promise<string> {
  if (!env.PINECONE_API_KEY || !env.PINECONE_INDEX_HOST) {
    return "";
  }

  const embedding = await generateEmbedding(env, query, "query");
  const pc = new Pinecone({ apiKey: env.PINECONE_API_KEY });
  const index = pc.index(
    env.PINECONE_INDEX_NAME ?? DEFAULT_PINECONE_INDEX,
    env.PINECONE_INDEX_HOST
  );

  const results = await index.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  });

  const contexts = (results.matches ?? [])
    .map((match) => match.metadata?.text as string | undefined)
    .filter((text): text is string => Boolean(text));

  return contexts.length > 0
    ? "- " + contexts.join("\n- ")
    : "No specific context retrieved for this query.";
}

const SYSTEM_PROMPT = [
  "You are Victory's AI assistant on his portfolio website. You are helpful, concise, and friendly.",
  "Answer questions about Victory using ONLY the context provided below.",
  "Format your answer as clean Markdown: short paragraphs, bullet lists, **bold** for key terms, and headings only when they help.",
  "If the user asks something NOT related to the context or Victory's portfolio, politely decline to answer.",
  "",
  "Context about Victory:",
].join("\n");

export async function runChat(env: ChatEnv, messages: ChatMessage[]): Promise<ChatResult> {
  const lastMessage = messages[messages.length - 1];
  let contextStr = "";

  if (lastMessage && lastMessage.role === "user") {
    try {
      contextStr = await retrieveContext(env, lastMessage.content);
    } catch (err) {
      console.error("RAG retrieve error:", err);
    }
  }

  const apiMessages: ChatMessage[] = [
    { role: "system", content: `${SYSTEM_PROMPT}\n${contextStr}` },
    ...messages,
  ];

  const apiKey = env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not set.");
  }

  const response = await fetch(env.NVIDIA_CHAT_URL ?? DEFAULT_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.CHAT_MODEL ?? DEFAULT_CHAT_MODEL,
      messages: apiMessages,
      temperature: 1,
      top_p: 0.95,
      max_tokens: 16384,
      stream: false,
      chat_template_kwargs: {
        thinking: true,
        reasoning_effort: "high",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.text()).slice(0, 400);
    throw new Error(`NVIDIA API error: ${response.status} - ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string; reasoning_content?: string; reasoning?: string } }[];
  };

  const message = data.choices?.[0]?.message;

  const reasoning =
    message?.reasoning_content || message?.reasoning || "";

  return {
    reasoning,
    content: message?.content || reasoning,
  };
}