import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/* ─── Request Schema ──────────────────────────────────── */

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderNumber: string;
}

/* ─── POST Handler ────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body: VerifyBody = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderNumber
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark order as failed
      await prisma.order.updateMany({
        where: { uniqueOrderNumber: orderNumber },
        data: { status: "PENDING" }, // keep as pending, don't mark paid
      });

      return NextResponse.json(
        { error: "Payment verification failed — signature mismatch" },
        { status: 400 }
      );
    }

    // Update order to PAID
    const order = await prisma.order.update({
      where: { uniqueOrderNumber: orderNumber },
      data: {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      },
    });

    // Fire WhatsApp notification (non-blocking)
    fetch(`${req.nextUrl.origin}/api/notifications/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.uniqueOrderNumber,
        messageType: "ORDER_CONFIRMED",
      }),
    }).catch(() => {}); // silent — don't block response

    return NextResponse.json({
      success: true,
      orderNumber: order.uniqueOrderNumber,
      status: order.status,
      total: order.total,
      shippingDetails: order.shippingDetails,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
