import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, accessCode } = await request.json()

    if (!email || !accessCode) {
      return NextResponse.json(
        { error: "Email and access code are required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedCode = accessCode.trim()

    // Find waitlist entry
    const waitlistEntry = await prisma.waitlist.findFirst({
      where: {
        email: normalizedEmail,
        accessCode: normalizedCode,
      },
    })

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: "Invalid access code or email" },
        { status: 401 }
      )
    }

    // Check if OTP is expired (15 minutes validity)
    const OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
    const now = new Date();
    const otpAge = now.getTime() - new Date(waitlistEntry.updatedAt).getTime();

    if (otpAge > OTP_EXPIRY_MS) {
      return NextResponse.json(
        { error: "Access code has expired. Please request a new one." },
        { status: 401 }
      )
    }

    // Mark as accessed if first time
    if (!waitlistEntry.hasAccessed) {
      await prisma.waitlist.update({
        where: { id: waitlistEntry.id },
        data: {
          hasAccessed: true,
          accessedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Access granted",
    })
  } catch (error) {
    console.error("Access verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
