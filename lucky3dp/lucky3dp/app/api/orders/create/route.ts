import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/order-number";
import { shippingSchema } from "@/lib/shipping-schema";
import { z } from "zod";

/* ─── Request Schema ──────────────────────────────────── */

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  packType: z.enum(["single", "4pack", "7pack"]),
  unitPrice: z.number().int().positive(),
  uploadedImageUrls: z.array(z.string()).optional().default([]),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart is empty"),
  shipping: shippingSchema,
});

/* ─── Pricing Validation ──────────────────────────────── */

const VALID_PRICES: Record<string, number> = {
  single: 149,
  "7pack": 249,
  "4pack": 170,
  "7pack-custom": 289,
};

function validateItemPrice(item: z.infer<typeof orderItemSchema>): boolean {
  if (item.packType === "7pack" && item.uploadedImageUrls.length > 0) {
    return item.unitPrice === 289;
  }
  return item.unitPrice === (VALID_PRICES[item.packType] ?? 0);
}

/* ─── POST Handler ────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, shipping } = parsed.data;

    // Validate prices server-side
    for (const item of items) {
      if (!validateItemPrice(item)) {
        return NextResponse.json(
          { error: `Invalid price for ${item.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate total
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const total = subtotal; // free shipping

    // Generate unique order number (retry on collision)
    let uniqueOrderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.order.findUnique({
        where: { uniqueOrderNumber },
      });
      if (!existing) break;
      uniqueOrderNumber = generateOrderNumber();
      attempts++;
    }

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // paise
      currency: "INR",
      receipt: uniqueOrderNumber,
      notes: {
        orderNumber: uniqueOrderNumber,
        customerName: `${shipping.firstName} ${shipping.lastName}`,
      },
    });

    // Save order to DB
    const order = await prisma.order.create({
      data: {
        uniqueOrderNumber,
        status: "PENDING",
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          packType: item.packType,
          unitPrice: item.unitPrice,
          uploadedImageUrls: item.uploadedImageUrls,
        })),
        subtotal,
        total,
        shippingDetails: {
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          pinCode: shipping.pinCode,
          addressLine1: shipping.addressLine1,
          addressLine2: shipping.addressLine2 || "",
          city: shipping.city,
          state: shipping.state,
          country: "India",
          email: shipping.email,
          phone: shipping.phone,
          whatsappUpdates: shipping.whatsappUpdates,
        },
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: uniqueOrderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: "INR",
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
