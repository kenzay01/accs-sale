import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Define the type for the params - note that params is a Promise
interface RouteParams {
  params: Promise<{
    filename: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Await the params since it's a Promise in App Router
    const { filename } = await context.params;
    const filePath = path.join(process.cwd(), "uploads", filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("Image not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    // Set content type based on file extension
    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
