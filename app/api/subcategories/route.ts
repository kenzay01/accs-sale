import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Subcategory } from "@/types/categories"; // Припускаємо, що є тип для Subcategory
import DatabaseManager from "@/database"; // Використовуємо дефолтний імпорт для класу
let dbInstance: DatabaseManager | null = null;

// Функція для отримання екземпляра бази даних
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
    const subcategories = await db.getSubcategories();
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
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

export async function PUT(request: NextRequest) {
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

      const oldSubcategory = (await db.getSubcategoryById(
        id
      )) as Subcategory | null;
      if (oldSubcategory?.img && oldSubcategory.img !== imgPath) {
        const deleteMockReq = new NextRequest(
          `http://localhost/api/delete-image?imageUrl=${encodeURIComponent(
            oldSubcategory.img
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

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Subcategory ID is required" },
        { status: 400 }
      );
    }

    const subcategory = (await db.getSubcategoryById(id)) as Subcategory | null;
    if (subcategory?.img) {
      const deleteMockReq = new NextRequest(
        `http://localhost/api/delete-image?imageUrl=${encodeURIComponent(
          subcategory.img
        )}`,
        { method: "DELETE" }
      );
      await deleteImageHandler(deleteMockReq);
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
