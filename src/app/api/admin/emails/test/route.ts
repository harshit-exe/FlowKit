import { NextRequest, NextResponse } from "next/server"
import { transporter } from "@/lib/nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    // Send test email
    await transporter.sendMail({
      from: `"FlowKit Test" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "✓ Test Email - FlowKit Admin Panel",
      text: `
FlowKit Email Test

This is a test email sent from the FlowKit admin panel.

If you're reading this, your SMTP configuration is working correctly!

Test Details:
- SMTP Server: smtp.hostinger.com
- Port: 587
- From: ${process.env.SMTP_USER}
- To: ${email}
- Time: ${new Date().toISOString()}

---
FlowKit - Workflow Automation Platform
Built with precision. Powered by automation.
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
            .content { line-height: 1.8; }
            .success { color: #4ade80; font-size: 20px; font-weight: bold; margin: 20px 0; }
            .details { background: #1a1a1a; border: 1px solid #333; padding: 15px; margin: 20px 0; font-size: 12px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 11px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FLOWKIT</h1>
              <div class="badge">EMAIL TEST</div>
            </div>

            <div class="content">
              <div class="success">✓ EMAIL TEST SUCCESSFUL</div>

              <p>This is a test email sent from the FlowKit admin panel.</p>

              <p><strong>If you're reading this, your SMTP configuration is working correctly!</strong></p>

              <div class="details">
                <strong>Test Details:</strong><br>
                <strong>SMTP Server:</strong> smtp.hostinger.com<br>
                <strong>Port:</strong> 587<br>
                <strong>From:</strong> ${process.env.SMTP_USER}<br>
                <strong>To:</strong> ${email}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}<br>
              </div>

              <p>You can now safely send emails to your users using the announcement feature.</p>
            </div>

            <div class="footer">
              FlowKit - Workflow Automation Platform<br>
              Built with precision. Powered by automation.
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      { error: "Failed to send test email. Check SMTP configuration." },
      { status: 500 }
    )
  }
}
