import { NextResponse } from "next/server";

export const runtime = "edge";

async function generateSignature(params: Record<string, string>, apiSecret: string) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "sx1dtsdq";
    const apiKey = process.env.CLOUDINARY_API_KEY || "546785572487365";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "swAFUl-Co-4ySXvbqViz-gFIMa0";

    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Set up signature parameters
    const paramsToSign = {
      timestamp: timestamp,
    };
    const signature = await generateSignature(paramsToSign, apiSecret);

    // Send to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp);
    cloudinaryFormData.append("signature", signature);

    // Determine resource_type based on file type
    const isImage = file.type.startsWith("image/");
    const resourceType = isImage ? "image" : "auto";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const cloudinaryRes = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    if (!cloudinaryRes.ok) {
      const errorText = await cloudinaryRes.text();
      console.error("Cloudinary upload failed:", errorText);
      return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 500 });
    }

    const cloudinaryData = await cloudinaryRes.json() as { secure_url: string };

    return NextResponse.json({ url: cloudinaryData.secure_url, text: "" });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}