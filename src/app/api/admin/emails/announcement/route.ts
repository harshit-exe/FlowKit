import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, message, sendTo } = await request.json()

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      )
    }

    if (!["all", "accessed", "pending"].includes(sendTo)) {
      return NextResponse.json(
        { error: "Invalid sendTo parameter" },
        { status: 400 }
      )
    }

    // Get recipients based on filter
    const whereClause = sendTo === "all"
      ? {}
      : sendTo === "accessed"
        ? { hasAccessed: true }
        : { hasAccessed: false }

    const recipients = await prisma.waitlist.findMany({
      where: whereClause,
      select: { email: true },
    })

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found" },
        { status: 400 }
      )
    }

    // Send emails to all recipients
    let successCount = 0
    let failureCount = 0

    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient.email,
          subject: subject,
          text: `
${message}

---

This email was sent from FlowKit to all ${sendTo} users.

FlowKit - Workflow Automation Platform
Built with precision. Powered by automation.
https://flowkit.in

Unsubscribe: https://flowkit.in/unsubscribe?email=${encodeURIComponent(recipient.email)}
          `,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Courier New', monospace; background: #000; color: #fff; padding: 20px; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 2px solid #FF6633; padding: 30px;">
                <div style="text-align: center; border-bottom: 2px solid #FF6633; padding-bottom: 20px; margin-bottom: 20px;">
                  <h1 style="color: #FF6633; margin: 0; font-size: 32px;">FLOWKIT</h1>
                  <div style="display: inline-block; padding: 5px 15px; border: 1px solid #FF6633; background: rgba(255, 102, 51, 0.1); color: #FF6633; font-size: 11px; margin-top: 10px;">ANNOUNCEMENT</div>
                </div>

                <div style="line-height: 1.8;">
                  <p style="white-space: pre-wrap; margin: 0 0 15px 0;">${message}</p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 11px; color: #666;">
                  This email was sent from FlowKit to ${sendTo} users.<br><br>
                  FlowKit - Workflow Automation Platform<br>
                  Built with precision. Powered by automation.<br>
                  <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a><br><br>
                  <a href="https://flowkit.in/unsubscribe?email=${encodeURIComponent(recipient.email)}" style="color: #888; text-decoration: underline;">Unsubscribe</a>
                </div>
              </div>
            </body>
            </html>
          `,
        })
        successCount++

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error)
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      total: recipients.length,
      message: `Successfully sent announcement to ${successCount} out of ${recipients.length} users`,
    })
  } catch (error) {
    console.error("Announcement error:", error)
    return NextResponse.json(
      { error: "Failed to send announcement" },
      { status: 500 }
    )
  }
}
