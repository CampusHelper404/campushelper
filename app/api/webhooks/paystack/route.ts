import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature || !PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verify Signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // 2. Handle relevant events
    if (event.event === "charge.success") {
      const { metadata, reference } = event.data;
      const sessionId = metadata?.sessionId;

      if (!sessionId) {
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      // 3. Update Payment and Session
      const session = await prisma.academicSession.findUnique({
        where: { id: sessionId },
        include: { payment: true }
      });

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Idempotency: skip if already processed (e.g. manual verify ran first)
      if (session.payment?.status === 'HELD' || session.payment?.status === 'RELEASED') {
        console.log(`[Escrow] Already processed for ${sessionId}, skipping webhook.`);
        return NextResponse.json({ received: true, alreadyProcessed: true }, { status: 200 });
      }

      // Generate a unique-ish meeting link
      const meetingLink = `https://meet.google.com/campus-${sessionId.slice(-8)}`;

      await prisma.$transaction([
        prisma.payment.update({
          where: { sessionId },
          data: {
            status: "HELD",
            providerPaymentId: reference,
          },
        }),
        prisma.academicSession.update({
          where: { id: sessionId },
          data: { meetingLink },
        }),
        // Message TO Student FROM Helper (to unlock chat and share link)
        prisma.message.create({
          data: {
            senderId: session.helperId,
            recipientId: session.studentId,
            content: `📢 Session Secured! Here is our meeting link: ${meetingLink}`,
            sessionId: sessionId
          }
        }),
        // Notification to Helper
        prisma.notification.create({
          data: {
            userId: session.helperId,
            type: "SESSION_SECURED",
            title: "New Booking Paid",
            body: `Student has paid and secured the session. Meeting link: ${meetingLink}`,
          }
        }),
        // Notification to Student
        prisma.notification.create({
          data: {
            userId: session.studentId,
            type: "PAYMENT_SUCCESS",
            title: "Payment Confirmed",
            body: `Your payment was successful and the session is now active. Meeting link: ${meetingLink}`,
          }
        })
      ]);

      console.log(`[Escrow] Payment HELD and Session Activated for ${sessionId}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error(`[Webhook Error]`, error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
