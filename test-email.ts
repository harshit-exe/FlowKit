// Quick SMTP Test Script
// Run with: npx tsx test-email.ts

import nodemailer from "nodemailer"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config()

async function testSMTP() {
  console.log("\n🔍 Testing SMTP Configuration...\n")

  // Check if credentials are set
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ SMTP_USER or SMTP_PASS not found in .env")
    console.log("\nPlease add to your .env file:")
    console.log('SMTP_USER="your-email@yourdomain.com"')
    console.log('SMTP_PASS="your-password"')
    return
  }

  console.log("📧 SMTP User:", process.env.SMTP_USER)
  console.log("🔐 Password:", "•".repeat(process.env.SMTP_PASS.length), "\n")

  // Create transporter with updated settings
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    logger: true,
    debug: true,
  })

  try {
    // Test 1: Verify connection
    console.log("⏳ Testing connection to smtp.hostinger.com:587...\n")
    await transporter.verify()
    console.log("\n✅ SMTP connection successful!\n")

    // Test 2: Send test email
    console.log("⏳ Sending test email...\n")

    const testEmail = await transporter.sendMail({
      from: `"FlowKit Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: "✓ SMTP Test Successful - FlowKit",
      text: "If you're reading this, your SMTP configuration is working correctly!",
      html: `
        <div style="font-family: monospace; padding: 20px; background: #000; color: #fff;">
          <h1 style="color: #FF6633;">✓ SMTP Test Successful</h1>
          <p>Your FlowKit email configuration is working correctly!</p>
          <p style="color: #888; font-size: 12px;">
            This test email was sent from: ${process.env.SMTP_USER}<br>
            Using: smtp.hostinger.com:587
          </p>
        </div>
      `,
    })

    console.log("\n✅ Test email sent successfully!")
    console.log("📬 Message ID:", testEmail.messageId)
    console.log("\n💡 Check your inbox at:", process.env.SMTP_USER)
    console.log("   (Check spam folder if not in inbox)\n")

    console.log("🎉 All tests passed! Your email is ready to use.\n")
  } catch (error: any) {
    console.error("\n❌ SMTP test failed!\n")

    // Provide helpful error messages
    if (error.code === "ETIMEDOUT") {
      console.error("⏱️  Connection timeout")
      console.error("\nPossible causes:")
      console.error("  • Firewall blocking port 587")
      console.error("  • Network restrictions")
      console.error("  • SMTP server is down")
      console.error("\n💡 Try:")
      console.error("  • Check firewall settings")
      console.error("  • Try different network/VPN")
      console.error("  • Try port 465 instead (edit src/lib/nodemailer.ts)")
    } else if (error.code === "EAUTH") {
      console.error("🔐 Authentication failed")
      console.error("\nPossible causes:")
      console.error("  • Wrong email or password")
      console.error("  • Email account doesn't exist")
      console.error("  • Special characters in password")
      console.error("\n💡 Try:")
      console.error("  • Double-check credentials in .env")
      console.error("  • Verify email exists in Hostinger")
      console.error("  • Reset password to simpler one")
    } else if (error.code === "ECONNECTION" || error.code === "ENOTFOUND") {
      console.error("🌐 Cannot connect to server")
      console.error("\nPossible causes:")
      console.error("  • DNS resolution failed")
      console.error("  • No internet connection")
      console.error("  • Wrong SMTP host")
      console.error("\n💡 Try:")
      console.error("  • Check internet connection")
      console.error("  • Verify domain in email address")
      console.error("  • Try using 8.8.8.8 DNS")
    } else {
      console.error("Error details:", error.message)
      if (error.code) {
        console.error("Error code:", error.code)
      }
    }

    console.error("\n📖 See EMAIL_SETUP_GUIDE.md for detailed troubleshooting\n")
  }
}

// Run test
testSMTP()
