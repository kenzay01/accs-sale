import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { unlink } from "fs/promises";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("imageUrl");

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "No image URL provided" },
        { status: 400 }
      );
    }

    // Extract filename from URL
    const filename = imageUrl.split("/").pop();

    if (!filename) {
      return NextResponse.json(
        { success: false, message: "Invalid image URL" },
        { status: 400 }
      );
    }

    // Path to file
    const filePath = path.join(process.cwd(), "uploads", filename);

    // Check if file exists and delete
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
      return NextResponse.json({
        success: true,
        message: "Image file deleted successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Image file not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { success: false, message: `Delete failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
