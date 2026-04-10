import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createShipment,
  calcPosterWeight,
  calcPosterHeight,
  A4_POSTER_DEFAULTS,
} from "@/lib/delhivery";
import { z } from "zod";

const bodySchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { uniqueOrderNumber: parsed.data.orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: `Cannot ship order with status: ${order.status}` },
        { status: 400 }
      );
    }

    if (order.delhiveryTrackingId) {
      return NextResponse.json(
        {
          error: "Shipment already created",
          waybill: order.delhiveryTrackingId,
        },
        { status: 409 }
      );
    }

    const shipping = order.shippingDetails;
    if (!shipping) {
      return NextResponse.json(
        { error: "Order missing shipping details" },
        { status: 400 }
      );
    }

    // Calculate weight/dimensions from item count
    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const result = await createShipment({
      name: `${shipping.firstName} ${shipping.lastName}`,
      phone: shipping.phone,
      addressLine1: shipping.addressLine1,
      addressLine2: shipping.addressLine2 || undefined,
      city: shipping.city,
      state: shipping.state,
      pinCode: shipping.pinCode,
      country: "India",
      orderNumber: order.uniqueOrderNumber,
      paymentMode: "Prepaid",
      totalAmount: order.total,
      productDescription: `Lucky 3DP A4 Posters x${totalQty}`,
      quantity: totalQty,
      weight: calcPosterWeight(totalQty),
      length: A4_POSTER_DEFAULTS.length,
      breadth: A4_POSTER_DEFAULTS.breadth,
      height: calcPosterHeight(totalQty),
    });

    // Update order with tracking ID and status
    await prisma.order.update({
      where: { uniqueOrderNumber: order.uniqueOrderNumber },
      data: {
        delhiveryTrackingId: result.waybill,
        status: "PROCESSING",
      },
    });

    // Fire WhatsApp notification (non-blocking)
    fetch(`${req.nextUrl.origin}/api/notifications/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.uniqueOrderNumber,
        messageType: "SHIPPED",
      }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      waybill: result.waybill,
      orderNumber: order.uniqueOrderNumber,
      status: result.status,
      remarks: result.remarks,
    });
  } catch (error: any) {
    console.error("Create shipment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}
