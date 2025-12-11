import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAccessCodeEmail } from "@/lib/email"

// In-memory stores for rate limiting
// Note: In a serverless environment (like Vercel), these might reset on cold starts.
// For production scale, use Redis.
const otpCooldown = new Map<string, number>();
const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();

const COOLDOWN_DURATION = 60 * 1000; // 60 seconds
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function getIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const ip = getIp(request);

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const now = Date.now();

    // 1. Check Email Cooldown (60s)
    const lastRequestTime = otpCooldown.get(normalizedEmail);
    if (lastRequestTime && now - lastRequestTime < COOLDOWN_DURATION) {
      const remainingSeconds = Math.ceil((COOLDOWN_DURATION - (now - lastRequestTime)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${remainingSeconds} seconds before requesting another code.` },
        { status: 429 }
      )
    }

    // 2. Check IP Rate Limit (3 requests per hour)
    const ipData = ipRequestCounts.get(ip);
    if (ipData) {
      if (now > ipData.resetTime) {
        // Reset window if expired
        ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      } else if (ipData.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        )
      } else {
        // Increment count
        ipData.count++;
        ipRequestCounts.set(ip, ipData);
      }
    } else {
      // First request from this IP
      ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Update cooldown for this email
    otpCooldown.set(normalizedEmail, now);

    // Check if email already exists
    let waitlistEntry = await prisma.waitlist.findUnique({
      where: { email: normalizedEmail },
    })

    let accessCode: string

    if (waitlistEntry) {
      // User already signed up, resend their existing code
      accessCode = waitlistEntry.accessCode

      // Update updatedAt to reflect new request (useful for expiry checks)
      await prisma.waitlist.update({
        where: { id: waitlistEntry.id },
        data: { updatedAt: new Date() }
      });
    } else {
      // Generate new access code
      accessCode = generateAccessCode()

      // Ensure access code is unique
      let existingCode = await prisma.waitlist.findUnique({
        where: { accessCode },
      })

      while (existingCode) {
        accessCode = generateAccessCode()
        existingCode = await prisma.waitlist.findUnique({
          where: { accessCode },
        })
      }

      // Create new waitlist entry
      waitlistEntry = await prisma.waitlist.create({
        data: {
          email: normalizedEmail,
          accessCode,
        },
      })
    }

    // Send access code email with retry logic
    try {
      const emailResult = await sendAccessCodeEmail(normalizedEmail, accessCode);
      console.log(`✅ Access code email sent successfully to ${normalizedEmail} on attempt ${emailResult.attempt}, ID: ${emailResult.id}`);

      return NextResponse.json({
        success: true,
        message: "Access code sent to your email",
      });
    } catch (emailError: any) {
      console.error(`❌ Failed to send email to ${normalizedEmail} after all retries:`, emailError);

      // Email failed but user is in waitlist, they can try again
      return NextResponse.json({
        success: false,
        error: "Failed to send email. Please try again in a moment.",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Waitlist signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
