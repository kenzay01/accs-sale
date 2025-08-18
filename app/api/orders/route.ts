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

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.getAllOrders();

    // Define interface for database row
    interface OrderRow {
      id: number;
      user_id: number;
      product_name: string;
      price: number;
      status: string;
      created_at: string;
      telegram_id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      language: string;
    }

    // Normalize to include nested user object for the admin UI
    const orders = rows.map((row: OrderRow) => ({
      id: row.id,
      user_id: row.user_id,
      product_name: row.product_name,
      price: row.price,
      status: row.status,
      created_at: row.created_at,
      user: {
        telegram_id: row.telegram_id,
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        language: row.language,
      },
    }));

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
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

export async function PUT(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const result = await db.updateOrderStatus(orderId, status);
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: "Order status updated successfully"
      });
    } else {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
