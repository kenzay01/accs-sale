import { NextRequest, NextResponse } from "next/server";
import DatabaseManager from "@/database";

let dbInstance: DatabaseManager | null = null;

async function getDb(): Promise<DatabaseManager> {
  if (!dbInstance) {
    const { default: Database } = await import("@/database");
    dbInstance = new Database();
  }
  return dbInstance;
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();
    const {
      userId,
      customerName,
      telegramUsername,
      cartItems,
      totalPrice,
      paymentMethod = "USDT",
    } = body;

    // Валідація
    if (
      !userId ||
      !customerName ||
      !telegramUsername ||
      !cartItems ||
      !totalPrice
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    // Створюємо замовлення для кожного товару в кошику
    const orders = [];
    for (const item of cartItems) {
      const order = await db.createOrder(
        parseInt(userId),
        `${item.name} (x${item.quantity})`,
        item.price * item.quantity
      );
      orders.push(order);
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orders: orders.map((o) => o.lastID),
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
