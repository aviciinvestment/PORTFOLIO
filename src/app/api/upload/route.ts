import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

async function extractText(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  const name = (fileName || "").toLowerCase();

  if (mimeType === "application/pdf" || name.endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return (result.text || "")
        .split(/\r?\n/)
        .filter((line) => !/^--\s*\d+\s+of\s+\d+\s*--$/.test(line.trim()))
        .join("\n");
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  // Fall back to the raw text for unsupported plain-text formats
  return buffer.toString("utf8");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Store the file as a base64 data URL (bypasses cloud storage / PDF delivery blocks)
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Extract text so the CV can be embedded into the RAG vector index
    let text = "";
    try {
      text = (await extractText(buffer, file.type || "", file.name || "")).trim();
    } catch (err) {
      console.error("CV text extraction failed (uploading anyway):", err);
    }

    return NextResponse.json({ url: base64String, text });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}