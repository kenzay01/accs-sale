import { NextResponse, NextRequest } from "next/server";
import { Category } from "@/types/categories";
import DatabaseManager from "@/database";
let dbInstance: DatabaseManager | null = null;

async function getDb(): Promise<DatabaseManager> {
  if (!dbInstance) {
    const { default: Database } = await import("@/database");
    dbInstance = new Database();
  }
  return dbInstance;
}

// Імпортуємо обробники з інших роутів
import { POST as uploadImageHandler } from "@/app/api/upload-image/route";
import { DELETE as deleteImageHandler } from "@/app/api/delete-image/route";

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

export async function POST(request: NextRequest) {
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

    // Виклик внутрішнього обробника замість fetch
    const uploadFormData = new FormData();
    uploadFormData.append("image", imgFile);
    const mockReq = new NextRequest("http://localhost/api/upload-image", {
      method: "POST",
      body: uploadFormData,
    });
    const uploadResponse = await uploadImageHandler(mockReq);
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

export async function PUT(request: NextRequest) {
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

    const imgFile = formData.get("img") as File | null;
    let imgPath = formData.get("img") as string | null;
    if (imgFile) {
      const uploadFormData = new FormData();
      uploadFormData.append("image", imgFile);
      const mockReq = new NextRequest("http://localhost/api/upload-image", {
        method: "POST",
        body: uploadFormData,
      });
      const uploadResponse = await uploadImageHandler(mockReq);
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
        const deleteMockReq = new NextRequest(
          `http://localhost/api/delete-image?imageUrl=${encodeURIComponent(
            oldCategory.img
          )}`,
          { method: "DELETE" }
        );
        await deleteImageHandler(deleteMockReq);
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

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = (await db.getCategoryById(id)) as Category | null;
    if (category?.img) {
      const deleteMockReq = new NextRequest(
        `http://localhost/api/delete-image?imageUrl=${encodeURIComponent(
          category.img
        )}`,
        { method: "DELETE" }
      );
      await deleteImageHandler(deleteMockReq);
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
