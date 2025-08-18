import { NextRequest, NextResponse } from "next/server";
import DatabaseManager from "@/database"; // Use default import for the class
import { Page } from "@/types/categories";
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
    const pages = await db.getPages();
    // Parse FAQ content if necessary
    const parsedPages = pages.map((page: Page) => ({
      ...page,
      content_ru:
        page.content_type === "faq" && typeof page.content_ru === "string"
          ? JSON.parse(page.content_ru)
          : page.content_ru,
      content_en:
        page.content_type === "faq" && typeof page.content_en === "string"
          ? JSON.parse(page.content_en)
          : page.content_en,
    }));
    return NextResponse.json(parsedPages);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const title_ru = formData.get("title_ru") as string;
    const title_en = formData.get("title_en") as string;
    let content_ru = formData.get("content_ru") as string;
    let content_en = formData.get("content_en") as string;
    const content_type = formData.get("content_type") as string;

    if (!id || !title_ru || !title_en || !content_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate FAQ content if content_type is 'faq'
    if (content_type === "faq") {
      try {
        content_ru = JSON.parse(content_ru);
        content_en = JSON.parse(content_en);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid FAQ JSON format" },
          { status: 400 }
        );
      }
    }

    const page = {
      id,
      title_ru,
      title_en,
      content_ru,
      content_en,
      content_type,
    };

    await db.createPage(page);
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const title_ru = formData.get("title_ru") as string;
    const title_en = formData.get("title_en") as string;
    let content_ru = formData.get("content_ru") as string;
    let content_en = formData.get("content_en") as string;
    const content_type = formData.get("content_type") as string;

    if (!id || !title_ru || !title_en || !content_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate FAQ content if content_type is 'faq'
    if (content_type === "faq") {
      try {
        content_ru = JSON.parse(content_ru);
        content_en = JSON.parse(content_en);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid FAQ JSON format" },
          { status: 400 }
        );
      }
    }

    const updatedPage = {
      title_ru,
      title_en,
      content_ru,
      content_en,
      content_type,
    };

    await db.updatePage(id, updatedPage);
    return NextResponse.json({ id, ...updatedPage });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await db.deletePage(id);
    return NextResponse.json({ message: "Page deleted" });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
