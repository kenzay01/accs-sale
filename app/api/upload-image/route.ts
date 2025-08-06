import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Create uploads directory
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "No image file uploaded" },
        { status: 400 }
      );
    }

    // Generate unique filename with lowercase extension
    const extension = path.extname(imageFile.name).toLowerCase() || ".jpg";
    const newFilename = `${randomUUID()}${extension}`;
    const newPath = path.join(uploadDir, newFilename);

    // Convert File to Buffer and save
    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(newPath, fileBuffer);

    // Return path for frontend
    return NextResponse.json({
      success: true,
      imageUrl: `/api/images/${newFilename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: `Upload failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
