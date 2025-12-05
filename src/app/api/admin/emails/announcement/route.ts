import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transporter } from "@/lib/nodemailer"

export async function POST(request: NextRequest) {
  try {
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
        await transporter.sendMail({
          from: `"FlowKit" <${process.env.SMTP_USER}>`,
          to: recipient.email,
          subject: subject,
          text: `
${message}

---

This email was sent from FlowKit to all ${sendTo} users.

FlowKit - Workflow Automation Platform
Built with precision. Powered by automation.

If you no longer wish to receive these emails, please contact us.
          `,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Courier New', monospace; background: #000; color: #fff; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 2px solid #FF6633; padding: 30px; }
                .header { text-align: center; border-bottom: 2px solid #FF6633; padding-bottom: 20px; margin-bottom: 20px; }
                h1 { color: #FF6633; margin: 0; font-size: 32px; }
                .badge { display: inline-block; padding: 5px 15px; border: 1px solid #FF6633; background: rgba(255, 102, 51, 0.1); color: #FF6633; font-size: 11px; margin-top: 10px; }
                .content { line-height: 1.8; white-space: pre-wrap; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 11px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>FLOWKIT</h1>
                  <div class="badge">ANNOUNCEMENT</div>
                </div>

                <div class="content">
                  <p style="white-space: pre-wrap;">${message}</p>
                </div>

                <div class="footer">
                  This email was sent from FlowKit to ${sendTo} users.<br><br>
                  FlowKit - Workflow Automation Platform<br>
                  Built with precision. Powered by automation.<br><br>
                  If you no longer wish to receive these emails, please contact us.
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
