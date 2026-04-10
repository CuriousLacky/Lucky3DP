import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * POST /api/notifications/whatsapp
 *
 * Placeholder for WhatsApp Business API / Twilio integration.
 * Currently logs the notification intent. In production, connect
 * to Meta WhatsApp Business API or Twilio to send real messages.
 */

const notifySchema = z.object({
  orderId: z.string().min(1),
  messageType: z.enum(["ORDER_CONFIRMED", "SHIPPED", "DELIVERED"]),
});

const MESSAGE_TEMPLATES: Record<string, (order: any) => string> = {
  ORDER_CONFIRMED: (order) =>
    `✅ *Order Confirmed!*\n\nOrder: ${order.uniqueOrderNumber}\nTotal: ₹${order.total}\n\nThank you for shopping at Lucky 3DP! We'll notify you when your order ships.\n\n— Lucky 3DP Team`,

  SHIPPED: (order) =>
    `📦 *Order Shipped!*\n\nOrder: ${order.uniqueOrderNumber}\nTracking: ${order.delhiveryTrackingId || "Will be shared soon"}\n\nYour posters are on the way via Delhivery!\n\n— Lucky 3DP Team`,

  DELIVERED: (order) =>
    `🏠 *Order Delivered!*\n\nOrder: ${order.uniqueOrderNumber}\n\nWe hope you love your posters! Share them on social media and tag us.\n\nQuestions? Reply to this message.\n\n— Lucky 3DP Team`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = notifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orderId, messageType } = parsed.data;

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { uniqueOrderNumber: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const phone = order.shippingDetails?.phone;
    const whatsappEnabled = order.shippingDetails?.whatsappUpdates;

    if (!phone || !whatsappEnabled) {
      return NextResponse.json({
        sent: false,
        reason: "WhatsApp updates not enabled or no phone number",
      });
    }

    // Generate message from template
    const message = MESSAGE_TEMPLATES[messageType](order);

    // ─── PLACEHOLDER: Log for now ───────────────────────
    // In production, replace with Meta WhatsApp Business API call:
    //
    //   const response = await fetch(
    //     `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    //     {
    //       method: "POST",
    //       headers: {
    //         Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         messaging_product: "whatsapp",
    //         to: `91${phone}`,
    //         type: "text",
    //         text: { body: message },
    //       }),
    //     }
    //   );
    //
    // Or use Twilio:
    //
    //   const twilio = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
    //   await twilio.messages.create({
    //     from: "whatsapp:+14155238886",
    //     to: `whatsapp:+91${phone}`,
    //     body: message,
    //   });

    console.log("──────────────────────────────────────");
    console.log(`📱 WhatsApp Notification [${messageType}]`);
    console.log(`   To: +91${phone}`);
    console.log(`   Order: ${order.uniqueOrderNumber}`);
    console.log(`   Message:\n${message}`);
    console.log("──────────────────────────────────────");

    return NextResponse.json({
      sent: true,
      to: `+91${phone}`,
      messageType,
      orderNumber: order.uniqueOrderNumber,
      note: "Logged only — connect Meta/Twilio API for real delivery",
    });
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return NextResponse.json(
      { error: "Notification failed" },
      { status: 500 }
    );
  }
}
