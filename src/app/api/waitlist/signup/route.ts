import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAccessCodeEmail } from "@/lib/email"

function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    let waitlistEntry = await prisma.waitlist.findUnique({
      where: { email: normalizedEmail },
    })

    let accessCode: string

    if (waitlistEntry) {
      // User already signed up, resend their existing code
      accessCode = waitlistEntry.accessCode
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
