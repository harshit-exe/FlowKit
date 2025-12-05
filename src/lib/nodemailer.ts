import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587, // Using port 587 with STARTTLS is more reliable
  secure: false, // false for port 587, true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
  // Optimized timeouts for faster delivery
  connectionTimeout: 10000, // 10 seconds (reduced from 30)
  greetingTimeout: 10000,
  socketTimeout: 15000,
  // Connection pooling for faster subsequent sends
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
})

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
      <div class="logo-box">
        <svg width="60" height="60" viewBox="0 0 85 87" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d_90_10)">
            <rect x="9.94092" width="68.2211" height="68.2211" rx="10" transform="rotate(8.37885 9.94092 0)" fill="url(#paint0_linear_90_10)"/>
          </g>
          <path d="M39.0024 22.1547C40.0961 22.3088 40.858 23.3202 40.7041 24.414L39.2057 35.058C39.3515 35.9151 39.578 36.8367 39.9149 37.5721C40.5191 38.8909 40.7153 38.6824 42.1698 39.5019C42.944 39.938 44.1691 40.3503 44.1951 40.359L44.1237 40.418L54.4245 41.8681C55.5182 42.022 56.28 43.0336 56.1262 44.1273L54.409 56.3254C54.255 57.4192 53.2435 58.1811 52.1497 58.0271L38.8241 56.1512C37.7305 55.9971 36.9685 54.9856 37.1224 53.8919L38.6696 42.9017C38.6038 42.5759 38.5233 42.2549 38.4225 41.9872C37.9282 40.6741 37.3258 39.5882 36.1253 38.7605C35.799 38.5355 35.2508 38.2701 34.7008 38.0284L23.402 36.4378C22.3082 36.2839 21.5464 35.2723 21.7003 34.1786L23.4175 21.9805C23.5715 20.8867 24.583 20.1248 25.6768 20.2788L39.0024 22.1547Z" fill="url(#paint1_linear_90_10)"/>
          <defs>
            <filter id="filter0_d_90_10" x="1.34888" y="1.34912" width="82.7358" height="84.7357" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dx="4" dy="6"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_90_10"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_90_10" result="shape"/>
            </filter>
            <linearGradient id="paint0_linear_90_10" x1="44.0515" y1="0" x2="44.0515" y2="68.2211" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FFF3DF"/>
              <stop offset="1" stop-color="white"/>
            </linearGradient>
            <linearGradient id="paint1_linear_90_10" x1="41.2614" y1="22.4727" x2="36.5651" y2="55.8332" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FFAC36"/>
              <stop offset="1" stop-color="#EA7201"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
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
