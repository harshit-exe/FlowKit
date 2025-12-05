import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587, // Reverting to 587 as 465 timed out (likely blocked)
  secure: false, // false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // Force IPv4 to avoid IPv6 lookup delays
  family: 4,
  // Disable pooling to ensure fresh connections for reliability
  pool: false,
  // optimized timeouts
  connectionTimeout: 20000, // 20 seconds
  greetingTimeout: 20000,
  socketTimeout: 20000,
} as any)

// Verify connection on startup
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log("✓ Email server is ready")
    return true
  } catch (error) {
    console.error("✗ Email server connection failed:", error)
    return false
  }
}

export async function sendAccessCodeEmail(
  to: string,
  accessCode: string
): Promise<void> {
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your FlowKit Access Code</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', monospace;
      background-color: #000000;
      color: #ffffff;
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #000000;
    }
    .header {
      padding: 40px 20px;
      text-align: center;
      background-color: #000000;
      border-bottom: 2px solid #FF6633;
    }
    .logo-box {
      width: 60px;
      height: 60px;
      margin: 0 auto 20px;
      border: 2px solid #FF6633;
      background-color: rgba(255, 102, 51, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-icon {
      width: 30px;
      height: 30px;
      color: #FF6633;
    }
    .header h1 {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      border: 1px solid rgba(255, 102, 51, 0.3);
      background-color: rgba(255, 102, 51, 0.05);
      color: rgba(255, 102, 51, 0.9);
      font-size: 11px;
      border-radius: 20px;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 20px;
      background-color: #000000;
    }
    .greeting {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #ffffff;
      letter-spacing: 1px;
    }
    .message {
      font-size: 14px;
      line-height: 1.8;
      color: #a3a3a3;
      margin-bottom: 30px;
    }
    .code-container {
      background-color: #0a0a0a;
      border: 2px solid rgba(255, 102, 51, 0.3);
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 11px;
      color: #a3a3a3;
      font-weight: bold;
      margin-bottom: 15px;
      letter-spacing: 2px;
    }
    .code {
      font-size: 48px;
      font-weight: bold;
      color: #FF6633;
      letter-spacing: 12px;
      font-family: 'Courier New', monospace;
    }
    .code-hint {
      font-size: 12px;
      color: #666666;
      margin-top: 15px;
    }
    .features {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #262626;
    }
    .feature {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
      gap: 15px;
    }
    .feature-icon {
      width: 32px;
      height: 32px;
      border: 2px solid #FF6633;
      background-color: rgba(255, 102, 51, 0.1);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .feature-icon-inner {
      width: 14px;
      height: 14px;
      background-color: #FF6633;
    }
    .feature-content {
      flex: 1;
    }
    .feature-title {
      font-size: 12px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 5px;
      letter-spacing: 1px;
    }
    .feature-text {
      font-size: 11px;
      color: #666666;
      line-height: 1.6;
    }
    .footer {
      padding: 30px 20px;
      text-align: center;
      border-top: 1px solid #262626;
      background-color: #000000;
    }
    .footer-text {
      font-size: 11px;
      color: #666666;
      margin-bottom: 15px;
      line-height: 1.6;
    }
    .footer-link {
      color: #FF6633;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #262626;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">

      <h1>FLOWKIT</h1>
      <div class="badge">EXCLUSIVE EARLY ACCESS</div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">WELCOME TO THE INNER CIRCLE</div>

      <div class="message">
        You've requested access to FlowKit, and we're thrilled to have you. We're not just building another automation tool—we're crafting an experience that respects your time, your workflow, and your intelligence.
      </div>

      <div class="message">
        Here's your exclusive access code:
      </div>

      <!-- Access Code Box -->
      <div class="code-container">
        <div class="code-label">YOUR ACCESS CODE</div>
        <div class="code">${accessCode}</div>
        <div class="code-hint">Valid for one-time access</div>
      </div>

      <div class="message">
        Head back to the site, enter this code, and step into a workflow automation platform that doesn't compromise on power or elegance.
      </div>

      <!-- Features Section -->
      <div class="features">
        <div class="feature">
          <div class="feature-icon">
            <div class="feature-icon-inner"></div>
          </div>
          <div class="feature-content">
            <div class="feature-title">NODE-BASED PRECISION</div>
            <div class="feature-text">Build workflows that mirror how you think and solve problems</div>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">
            <div class="feature-icon-inner"></div>
          </div>
          <div class="feature-content">
            <div class="feature-title">PRODUCTION READY</div>
            <div class="feature-text">Every workflow is tested, documented, and ready to deploy</div>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">
            <div class="feature-icon-inner"></div>
          </div>
          <div class="feature-content">
            <div class="feature-title">100% OPEN SOURCE</div>
            <div class="feature-text">Built in public, MIT licensed, community-driven</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="message">
        Questions? Feedback? We're all ears. Reply to this email or reach out—we read everything.
      </div>

      <div class="message" style="margin-top: 30px; color: #ffffff;">
        Welcome aboard.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        Built with precision. Powered by automation.<br>
        © ${new Date().getFullYear()} FlowKit. All rights reserved.
      </div>
      <div class="footer-text">
        You received this email because you requested access to FlowKit.<br>
        No spam. No BS. Just your access code.
      </div>
    </div>
  </div>
</body>
</html>
  `

  const emailText = `
FLOWKIT - EXCLUSIVE EARLY ACCESS

WELCOME TO THE INNER CIRCLE

You've requested access to FlowKit, and we're thrilled to have you. We're not just building another automation tool—we're crafting an experience that respects your time, your workflow, and your intelligence.

YOUR ACCESS CODE: ${accessCode}

Head back to the site, enter this code, and step into a workflow automation platform that doesn't compromise on power or elegance.

WHAT'S INSIDE:
• Node-based precision that mirrors how you think
• Production-ready workflows, tested and documented
• 100% open source, MIT licensed

Questions? Feedback? We're all ears. Reply to this email or reach out—we read everything.

Welcome aboard.

---
Built with precision. Powered by automation.
© ${new Date().getFullYear()} FlowKit. All rights reserved.
  `

  await transporter.sendMail({
    from: `"FlowKit" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your FlowKit Access Code 🔑",
    text: emailText,
    html: emailHtml,
  })
}
