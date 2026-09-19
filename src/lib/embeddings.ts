import {
  generateEmbedding as sharedGenerateEmbedding,
  type ChatEnv,
} from "@shared/chat/core";

export async function generateEmbedding(
  text: string,
  inputType: "query" | "passage" = "query"
): Promise<number[]> {
  const env: ChatEnv = {
    NVIDIA_EMBEDDING_API_KEY: process.env.NVIDIA_EMBEDDING_API_KEY,
  };

  return sharedGenerateEmbedding(env, text, inputType);
}