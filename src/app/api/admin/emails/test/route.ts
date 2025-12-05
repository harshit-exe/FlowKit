import { NextRequest, NextResponse } from "next/server"
import { resend } from "@/lib/resend"

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
    await resend.emails.send({
      from: 'FlowKit Test <noreply@flowkit.in>',
      to: email,
      subject: "Test Email - FlowKit Admin Panel",
      text: `
FlowKit Email Test

This is a test email sent from the FlowKit admin panel.

If you're reading this, your email configuration is working correctly!

Test Details:
- Provider: Resend
- From: noreply@flowkit.in
- To: ${email}
- Time: ${new Date().toISOString()}

---
FlowKit - Workflow Automation Platform
Built with precision. Powered by automation.
https://flowkit.in

Unsubscribe: https://flowkit.in/unsubscribe?email=${encodeURIComponent(email)}
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
              <div style="display: inline-block; padding: 5px 15px; border: 1px solid #FF6633; background: rgba(255, 102, 51, 0.1); color: #FF6633; font-size: 11px; margin-top: 10px;">EMAIL TEST</div>
            </div>

            <div style="line-height: 1.8;">
              <div style="color: #4ade80; font-size: 20px; font-weight: bold; margin: 20px 0;">✓ EMAIL TEST SUCCESSFUL</div>

              <p style="margin: 0 0 15px 0;">This is a test email sent from the FlowKit admin panel.</p>

              <p style="margin: 0 0 15px 0;"><strong>If you're reading this, your email configuration is working correctly!</strong></p>

              <div style="background: #1a1a1a; border: 1px solid #333; padding: 15px; margin: 20px 0; font-size: 12px;">
                <strong>Test Details:</strong><br>
                <strong>Provider:</strong> Resend<br>
                <strong>From:</strong> noreply@flowkit.in<br>
                <strong>To:</strong> ${email}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}<br>
              </div>

              <p style="margin: 0 0 15px 0;">You can now safely send emails to your users using the announcement feature.</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 11px; color: #666;">
              FlowKit - Workflow Automation Platform<br>
              Built with precision. Powered by automation.<br>
              <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a><br><br>
              <a href="https://flowkit.in/unsubscribe?email=${encodeURIComponent(email)}" style="color: #888; text-decoration: underline;">Unsubscribe</a>
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
