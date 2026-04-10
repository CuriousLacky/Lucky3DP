import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET  — List all PAID orders that don't have a shipment yet
 * POST — Create shipment for a specific order (proxies to /api/shipping/create-shipment)
 */

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: "PAID",
        delhiveryTrackingId: null,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const summary = orders.map((o) => ({
      orderNumber: o.uniqueOrderNumber,
      total: o.total,
      items: o.items.length,
      itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
      customer: `${o.shippingDetails?.firstName} ${o.shippingDetails?.lastName}`,
      city: o.shippingDetails?.city,
      state: o.shippingDetails?.state,
      pin: o.shippingDetails?.pinCode,
      phone: o.shippingDetails?.phone,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      pendingShipments: summary.length,
      orders: summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    // Proxy to the main create-shipment endpoint
    const res = await fetch(`${req.nextUrl.origin}/api/shipping/create-shipment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}
