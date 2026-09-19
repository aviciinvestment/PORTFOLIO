import { Pinecone } from "@pinecone-database/pinecone";
import { DEFAULT_PINECONE_INDEX, DEFAULT_PINECONE_HOST } from "@shared/chat/core";

export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? DEFAULT_PINECONE_INDEX;
export const PINECONE_INDEX_HOST = process.env.PINECONE_INDEX_HOST ?? DEFAULT_PINECONE_HOST;

export function getPineconeIndex() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing PINECONE_API_KEY in environment variables.");
  }

  const pc = new Pinecone({ apiKey });
  return pc.index(PINECONE_INDEX_NAME, PINECONE_INDEX_HOST);
}