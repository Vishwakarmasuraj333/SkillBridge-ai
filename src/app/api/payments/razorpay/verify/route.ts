export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment verification details." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay provider key secret is not configured on the server." }, { status: 500 });
    }

    // Generate expected signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Find matching payment order
      const existingPayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: razorpay_order_id, userId: user.id },
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: "PAID",
          },
        });
      } else {
        // Create payment if not found
        await prisma.payment.create({
          data: {
            userId: user.id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: 199,
            currency: "INR",
            status: "PAID",
            plan: "PREMIUM_TEMPLATES",
          },
        });
      }

      // Upgrade User to premium status (valid for 1 year)
      const premiumUntilDate = new Date();
      premiumUntilDate.setFullYear(premiumUntilDate.getFullYear() + 1);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPremium: true,
          premiumUntil: premiumUntilDate,
        },
      });

      // Log success
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "PAYMENT_SUCCESS",
          message: `Premium templates unlocked successfully! Order ID: ${razorpay_order_id}`,
          details: `Transaction verification successful. Payment ID: ${razorpay_payment_id}. Premium active until: ${premiumUntilDate.toLocaleDateString()}`,
        },
      });

      return NextResponse.json({ success: true, message: "Payment verified successfully!" });
    } else {
      // Signature mismatch
      const existingPayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: razorpay_order_id, userId: user.id },
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: "FAILED",
          },
        });
      }

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "PAYMENT_FAILED",
          message: `Payment verification failed for order: ${razorpay_order_id}`,
          details: `HMAC signature mismatch. Expected: ${expectedSignature}, Received: ${razorpay_signature}`,
        },
      });

      return NextResponse.json({ error: "Invalid payment signature verification failed." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Verification endpoint failure:", error);
    return NextResponse.json({ error: error.message || "Failed to verify transaction." }, { status: 500 });
  }
}
