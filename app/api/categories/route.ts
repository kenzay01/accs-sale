import { NextResponse } from "next/server";
import { Category } from "@/types/categories";
import DatabaseManager from "@/database"; // Use default import for the class
let dbInstance: DatabaseManager | null = null;

async function getDb(): Promise<DatabaseManager> {
  if (!dbInstance) {
    const { default: Database } = await import("@/database");
    dbInstance = new Database();
  }
  return dbInstance;
}

export async function GET() {
  try {
    const db = await getDb();
    const categories = await db.getCategories();
    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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

    const baseUrl = new URL(request.url).origin;

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

    const category: Category = {
      id: (formData.get("id") as string) || `cat_${Date.now()}`,
      label_ru: (formData.get("label_ru") as string) || "",
      label_en: (formData.get("label_en") as string) || "",
      img: imgPath,
    };
    await db.createCategory(category);
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
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
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const baseUrl = new URL(request.url).origin;

    const imgFile = formData.get("img") as File | null;
    let imgPath = formData.get("img") as string | null;
    if (imgFile) {
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

      const oldCategory = (await db.getCategoryById(id)) as Category | null;
      if (oldCategory?.img && oldCategory.img !== imgPath) {
        await fetch(
          `${baseUrl}/api/delete-image?imageUrl=${encodeURIComponent(
            oldCategory.img
          )}`,
          { method: "DELETE" }
        );
      }
    }

    if (!imgPath) {
      return NextResponse.json(
        { error: "Image path or file is required" },
        { status: 400 }
      );
    }

    const updatedCategory: Omit<Category, "id"> = {
      label_ru: (formData.get("label_ru") as string) || "",
      label_en: (formData.get("label_en") as string) || "",
      img: imgPath,
    };
    await db.updateCategory(id, updatedCategory);
    return NextResponse.json({ ...updatedCategory, id });
  } catch (error: unknown) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const baseUrl = new URL(request.url).origin;

    const category = (await db.getCategoryById(id)) as Category | null;
    if (category?.img) {
      await fetch(
        `${baseUrl}/api/delete-image?imageUrl=${encodeURIComponent(
          category.img
        )}`,
        { method: "DELETE" }
      );
    }

    await db.deleteCategory(id);
    return NextResponse.json({ message: "Category deleted" });
  } catch (error: unknown) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
