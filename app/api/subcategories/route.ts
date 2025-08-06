import { NextResponse } from "next/server";
import { Subcategory } from "@/types/categories"; // Assuming you have a type definition for Subcategory
import DatabaseManager from "@/database"; // Use default import for the class
let dbInstance: DatabaseManager | null = null;

async function getDb(): Promise<DatabaseManager> {
  if (!dbInstance) {
    const { default: Database } = await import("@/database");
    dbInstance = new Database();
  }
  return dbInstance;
}

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }
    const subcategories = await db.getSubcategories(categoryId);
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const formData = await request.formData();
    const imgFile = formData.get("img") as File | null;
    if (!imgFile) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    // Upload image
    const uploadFormData = new FormData();
    uploadFormData.append("image", imgFile);
    const uploadResponse = await fetch(`${baseUrl}/api/upload-image`, {
      method: "POST",
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
    }
    const uploadData = await uploadResponse.json();
    if (!uploadData.success) {
      throw new Error("Failed to upload image");
    }
    const imgPath = uploadData.imageUrl;

    const subcategory = {
      id: (formData.get("id") as string) || `sub_${Date.now()}`,
      label_ru: (formData.get("label_ru") as string) || "",
      label_en: (formData.get("label_en") as string) || "",
      img: imgPath,
    };
    await db.createSubcategory(subcategory);
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const db = await getDb();
    const formData = await request.formData();
    const id = formData.get("id") as string;
    if (!id) {
      return NextResponse.json(
        { error: "Subcategory ID is required" },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    const imgFile = formData.get("img") as File | null;
    let imgPath = formData.get("img") as string | null;
    if (imgFile) {
      // Upload new image
      const uploadFormData = new FormData();
      uploadFormData.append("image", imgFile);
      const uploadResponse = await fetch(`${baseUrl}/api/upload-image`, {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
      }
      const uploadData = await uploadResponse.json();
      if (!uploadData.success) {
        throw new Error("Failed to upload image");
      }
      imgPath = uploadData.imageUrl;

      // Delete old image if exists
      const oldSubcategory = (await db.getSubcategoryById(
        id
      )) as Subcategory | null;
      if (oldSubcategory?.img && oldSubcategory.img !== imgPath) {
        await fetch(
          `${baseUrl}/api/delete-image?imageUrl=${encodeURIComponent(
            oldSubcategory.img
          )}`,
          {
            method: "DELETE",
          }
        );
      }
    }

    if (!imgPath) {
      return NextResponse.json(
        { error: "Image path or file is required" },
        { status: 400 }
      );
    }

    const updatedSubcategory = {
      label_ru: (formData.get("label_ru") as string) || "",
      label_en: (formData.get("label_en") as string) || "",
      img: imgPath,
    };
    await db.updateSubcategory(id, updatedSubcategory);
    return NextResponse.json({ ...updatedSubcategory, id });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await getDb();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Subcategory ID is required" },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    // Delete associated image
    // Define the expected type for subcategory

    const subcategory = (await db.getSubcategoryById(id)) as Subcategory | null;
    if (subcategory?.img) {
      await fetch(
        `${baseUrl}/api/delete-image?imageUrl=${encodeURIComponent(
          subcategory.img
        )}`,
        {
          method: "DELETE",
        }
      );
    }
    await db.deleteSubcategory(id);
    return NextResponse.json({ message: "Subcategory deleted" });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
