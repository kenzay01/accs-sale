import { NextResponse } from "next/server";
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

export async function PUT(request: Request) {
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
      const oldItem = (await db.getItemById(id)) as { img?: string };
      if (oldItem?.img && oldItem.img !== imgPath) {
        await fetch(
          `${baseUrl}/api/delete-image?imageUrl=${encodeURIComponent(
            oldItem.img
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

export async function DELETE(request: Request) {
  try {
    const db = await getDb();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    // Delete associated image
    const item = (await db.getItemById(id)) as { img?: string } | null;
    if (item?.img) {
      await fetch(
        `${baseUrl}/api/delete-image?imageUrl=${encodeURIComponent(item.img)}`,
        {
          method: "DELETE",
        }
      );
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
