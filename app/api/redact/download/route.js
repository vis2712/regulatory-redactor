import { NextResponse } from "next/server";
import { readFile, unlink, access } from "fs/promises";
import path from "path";

export async function GET(request) {
  let filePath = null;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !/^[a-f0-9-]+$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid download ID" },
        { status: 400 }
      );
    }

    filePath = path.join("/tmp", `redactor-result-${id}.pdf`);

    // Verify the file exists before attempting to read
    try {
      await access(filePath);
    } catch {
      return NextResponse.json(
        { error: "File not found or already downloaded. Please redact again." },
        { status: 404 }
      );
    }

    // Read the file into a Node Buffer
    const fileBuffer = await readFile(filePath);

    // Validate we got actual data
    if (!fileBuffer || fileBuffer.length === 0) {
      console.error("Download route: file is empty", filePath);
      return NextResponse.json(
        { error: "The redacted file is empty. Please try redacting again." },
        { status: 500 }
      );
    }

    // Convert Node Buffer to standard Web Uint8Array for Next.js Response streaming
    const uint8Array = new Uint8Array(
      fileBuffer.buffer,
      fileBuffer.byteOffset,
      fileBuffer.byteLength
    );

    // Schedule deletion after serving (zero retention)
    // Delay by 30 seconds to ensure the browser successfully finishes downloading
    // and to handle any immediate browser pre-fetch or double-request.
    setTimeout(() => {
      unlink(filePath).catch(() => {});
    }, 30000);

    // Return as a proper Response with correct headers
    return new Response(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="redacted-document.pdf"',
        "Content-Length": String(uint8Array.byteLength),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Download route error:", err);
    return NextResponse.json(
      { error: "Download failed due to a server error. Please try again." },
      { status: 500 }
    );
  }
}

