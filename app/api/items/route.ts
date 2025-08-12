import { NextResponse, NextRequest } from "next/server";
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
    const items = await db.getItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
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

    const item = {
      id: (formData.get("id") as string) || `item_${Date.now()}`,
      category_id: (formData.get("category_id") as string) || "",
      subcategory_id: (formData.get("subcategory_id") as string) || "",
      name: (formData.get("name") as string) || "",
      price: parseFloat((formData.get("price") as string) || "0"),
      description_ru: (formData.get("description_ru") as string) || "",
      description_en: (formData.get("description_en") as string) || "",
      img: imgPath,
      time_added: new Date().toISOString(),
    };
    await db.createItem(item);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
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
        { error: "Item ID is required" },
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

      const oldItem = (await db.getItemById(id)) as { img?: string };
      if (oldItem?.img && oldItem.img !== imgPath) {
        const deleteMockReq = new NextRequest(
          `http://localhost/api/delete-image?imageUrl=${encodeURIComponent(
            oldItem.img
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

    const updatedItem = {
      category_id: (formData.get("category_id") as string) || "",
      subcategory_id: (formData.get("subcategory_id") as string) || "",
      name: (formData.get("name") as string) || "",
      price: parseFloat((formData.get("price") as string) || "0"),
      description_ru: (formData.get("description_ru") as string) || "",
      description_en: (formData.get("description_en") as string) || "",
      img: imgPath,
      time_added:
        (formData.get("time_added") as string) || new Date().toISOString(),
    };
    await db.updateItem(id, updatedItem);
    return NextResponse.json({ ...updatedItem, id });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
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
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const item = (await db.getItemById(id)) as { img?: string } | null;
    if (item?.img) {
      const deleteMockReq = new NextRequest(
        `http://localhost/api/delete-image?imageUrl=${encodeURIComponent(
          item.img
        )}`,
        { method: "DELETE" }
      );
      await deleteImageHandler(deleteMockReq);
    }

    await db.deleteItem(id);
    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
