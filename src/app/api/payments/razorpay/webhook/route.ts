import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header." }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "RAZORPAY_WEBHOOK_SECRET is missing." }, { status: 400 });
    }

    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100; // in Rupees
      const email = paymentEntity.email;

      // Find matching user
      const user = await db.user.findFirst({
        where: { email: email },
      });

      if (user) {
        // Find existing payment
        const existingPayment = await db.payment.findFirst({
          where: { razorpayOrderId: orderId, userId: user.id },
        });

        if (existingPayment) {
          if (existingPayment.status !== "PAID") {
            await db.payment.update({
              where: { id: existingPayment.id },
              data: {
                razorpayPaymentId: paymentId,
                status: "PAID",
              },
            });
          }
        } else {
          await db.payment.create({
            data: {
              userId: user.id,
              razorpayOrderId: orderId,
              razorpayPaymentId: paymentId,
              amount: Math.round(amount),
              currency: "INR",
              status: "PAID",
              plan: "PREMIUM_TEMPLATES",
            },
          });
        }

        // Make sure user is updated to premium status
        const premiumUntilDate = new Date();
        premiumUntilDate.setFullYear(premiumUntilDate.getFullYear() + 1);

        await db.user.update({
          where: { id: user.id },
          data: {
            isPremium: true,
            premiumUntil: premiumUntilDate,
          },
        });

        // Add ActivityLog entry if not logged
        const logExists = await db.activityLog.findFirst({
          where: { userId: user.id, action: "PAYMENT_SUCCESS", details: { contains: paymentId } },
        });

        if (!logExists) {
          await db.activityLog.create({
            data: {
              userId: user.id,
              action: "PAYMENT_SUCCESS",
              message: `Razorpay Webhook: Premium status verified successfully.`,
              details: `Event: ${event}. Payment ID: ${paymentId}. Order ID: ${orderId}`,
            },
          });
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const email = paymentEntity.email;

      const user = await db.user.findFirst({
        where: { email: email },
      });

      if (user) {
        const existingPayment = await db.payment.findFirst({
          where: { razorpayOrderId: orderId, userId: user.id },
        });

        if (existingPayment) {
          await db.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: "FAILED",
            },
          });
        }

        await db.activityLog.create({
          data: {
            userId: user.id,
            action: "PAYMENT_FAILED",
            message: `Razorpay Webhook: Transaction failed.`,
            details: `Event: ${event}. Order ID: ${orderId}. Reason: ${paymentEntity.error_description || "unknown"}`,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook handler failure:", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
