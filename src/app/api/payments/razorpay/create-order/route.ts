import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay integration keys missing from server env.");
      return NextResponse.json({ error: "Razorpay keys missing. Add keys in .env and restart server." }, { status: 400 });
    }

    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amount = 19900; // ₹199.00 in paise
    const currency = "INR";

    const options = {
      amount,
      currency,
      receipt: `receipt_order_${Date.now()}_${user.id.substring(0, 8)}`,
    };

    const order = await razorpayInstance.orders.create(options);

    // Save Payment record status CREATED
    await db.payment.create({
      data: {
        userId: user.id,
        provider: "RAZORPAY",
        razorpayOrderId: order.id,
        amount: 199,
        currency: "INR",
        status: "CREATED",
        plan: "PREMIUM_TEMPLATES",
      },
    });

    // Create ActivityLog entry
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "CREATE_PAYMENT_ORDER",
        message: `Created payment order for Premium Templates: ${order.id}`,
        details: `Order amount: ₹199. Razorpay Order ID: ${order.id}.`,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      publicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
    });
  } catch (error: any) {
    console.error("Failed to create Razorpay order:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment order." }, { status: 500 });
  }
}
