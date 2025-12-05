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

    // Send access code email
    try {
      await sendAccessCodeEmail(normalizedEmail, accessCode)
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError)

      // Provide more specific error messages
      let errorMessage = "Failed to send access code email. Please try again."

      if (emailError.code === "ETIMEDOUT") {
        errorMessage = "Email server timeout. Please check your SMTP settings or try again later."
      } else if (emailError.code === "EAUTH") {
        errorMessage = "Email authentication failed. Please check your SMTP credentials."
      } else if (emailError.code === "ECONNECTION") {
        errorMessage = "Cannot connect to email server. Please check your SMTP configuration."
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Access code sent to your email",
    })
  } catch (error) {
    console.error("Waitlist signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
