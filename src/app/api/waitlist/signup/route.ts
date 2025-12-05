import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAccessCodeEmail } from "@/lib/nodemailer"

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

    // Send access code email asynchronously (non-blocking)
    // This responds immediately to the user while email sends in background
    sendAccessCodeEmail(normalizedEmail, accessCode)
      .then(() => {
        console.log(`✓ Access code email sent successfully to ${normalizedEmail}`)
      })
      .catch((emailError: any) => {
        console.error(`✗ Failed to send email to ${normalizedEmail}:`, emailError)

        // Log specific error for debugging
        if (emailError.code === "ETIMEDOUT") {
          console.error("Email server timeout - check SMTP settings")
        } else if (emailError.code === "EAUTH") {
          console.error("Email authentication failed - check SMTP credentials")
        } else if (emailError.code === "ECONNECTION") {
          console.error("Cannot connect to email server - check SMTP configuration")
        }
      })

    // Respond immediately - don't wait for email
    return NextResponse.json({
      success: true,
      message: "Access code is being sent to your email",
    })
  } catch (error) {
    console.error("Waitlist signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
