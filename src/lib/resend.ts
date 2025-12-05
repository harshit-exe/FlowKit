import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAccessCodeEmail(
    to: string,
    accessCode: string
): Promise<void> {
    // Plain text version for better spam score
    const emailText = `
FLOWKIT - YOUR ACCESS CODE

Welcome to FlowKit!

You've requested access to FlowKit, and we're thrilled to have you. We're not just building another automation tool—we're crafting an experience that respects your time, your workflow, and your intelligence.

YOUR ACCESS CODE: ${accessCode}

This code is valid for 10 minutes for one-time access.

Head back to https://flowkit.in, enter this code, and step into a workflow automation platform that doesn't compromise on power or elegance.

What You'll Get:
• NODE-BASED PRECISION: Build workflows that mirror how you think
• PRODUCTION READY: Every workflow is tested and ready to deploy
• 100% OPEN SOURCE: MIT licensed, community-driven

Questions? Reply to this email—we read everything.

Welcome aboard!

---
FlowKit - Workflow Automation Platform
https://flowkit.in
© ${new Date().getFullYear()} FlowKit. All rights reserved.

You received this email because you requested access to FlowKit.
Unsubscribe: https://flowkit.in/unsubscribe?email=${encodeURIComponent(to)}
  `.trim();

    // HTML version with inline styles (email clients strip <style> tags)
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your FlowKit Access Code</title>
</head>
<body style="font-family: 'Courier New', monospace; background-color: #000000; color: #ffffff; padding: 0; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
    <!-- Header -->
    <div style="padding: 40px 20px; text-align: center; background-color: #000000; border-bottom: 2px solid #FF6633;">
      <h1 style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0 0 10px 0; letter-spacing: 2px;">FLOWKIT</h1>
      <div style="display: inline-block; padding: 6px 16px; border: 1px solid rgba(255, 102, 51, 0.3); background-color: rgba(255, 102, 51, 0.05); color: rgba(255, 102, 51, 0.9); font-size: 11px; border-radius: 20px; letter-spacing: 1px;">EXCLUSIVE EARLY ACCESS</div>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px; background-color: #000000;">
      <div style="font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #ffffff; letter-spacing: 1px;">WELCOME TO THE INNER CIRCLE</div>

      <p style="font-size: 14px; line-height: 1.8; color: #a3a3a3; margin: 0 0 20px 0;">
        You've requested access to FlowKit, and we're thrilled to have you. We're not just building another automation tool—we're crafting an experience that respects your time, your workflow, and your intelligence.
      </p>

      <p style="font-size: 14px; line-height: 1.8; color: #a3a3a3; margin: 0 0 20px 0;">
        Here's your exclusive access code:
      </p>

      <!-- Access Code Box -->
      <div style="background-color: #0a0a0a; border: 2px solid rgba(255, 102, 51, 0.3); padding: 30px; text-align: center; margin: 30px 0;">
        <div style="font-size: 11px; color: #a3a3a3; font-weight: bold; margin-bottom: 15px; letter-spacing: 2px;">YOUR ACCESS CODE</div>
        <div style="font-size: 48px; font-weight: bold; color: #FF6633; letter-spacing: 12px; font-family: 'Courier New', monospace;">${accessCode}</div>
        <div style="font-size: 12px; color: #666666; margin-top: 15px;">Valid for 10 minutes (one-time use)</div>
      </div>

      <p style="font-size: 14px; line-height: 1.8; color: #a3a3a3; margin: 0 0 20px 0;">
        Head back to <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a>, enter this code, and step into a workflow automation platform that doesn't compromise on power or elegance.
      </p>

      <!-- Features Section -->
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #262626;">
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: bold; color: #ffffff; margin-bottom: 5px; letter-spacing: 1px;">• NODE-BASED PRECISION</div>
          <div style="font-size: 11px; color: #666666; line-height: 1.6; padding-left: 12px;">Build workflows that mirror how you think and solve problems</div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: bold; color: #ffffff; margin-bottom: 5px; letter-spacing: 1px;">• PRODUCTION READY</div>
          <div style="font-size: 11px; color: #666666; line-height: 1.6; padding-left: 12px;">Every workflow is tested, documented, and ready to deploy</div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: bold; color: #ffffff; margin-bottom: 5px; letter-spacing: 1px;">• 100% OPEN SOURCE</div>
          <div style="font-size: 11px; color: #666666; line-height: 1.6; padding-left: 12px;">Built in public, MIT licensed, community-driven</div>
        </div>
      </div>

      <div style="height: 1px; background-color: #262626; margin: 30px 0;"></div>

      <p style="font-size: 14px; line-height: 1.8; color: #a3a3a3; margin: 0 0 20px 0;">
        Questions? Feedback? We're all ears. Reply to this email or reach out—we read everything.
      </p>

      <p style="margin-top: 30px; font-size: 14px; line-height: 1.8; color: #ffffff;">
        Welcome aboard.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 30px 20px; text-align: center; border-top: 1px solid #262626; background-color: #000000;">
      <div style="font-size: 11px; color: #666666; margin-bottom: 15px; line-height: 1.6;">
        Built with precision. Powered by automation.<br>
        <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a><br>
        © ${new Date().getFullYear()} FlowKit. All rights reserved.
      </div>
      <div style="font-size: 11px; color: #666666; margin-bottom: 15px; line-height: 1.6;">
        You received this email because you requested access to FlowKit.<br>
        No spam. No BS. Just your access code.
      </div>
      <div style="font-size: 10px; color: #555555; margin-top: 15px;">
        <a href="https://flowkit.in/unsubscribe?email=${encodeURIComponent(to)}" style="color: #888888; text-decoration: underline;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

    try {
        await resend.emails.send({
            from: 'FlowKit <noreply@flowkit.in>',
            to,
            subject: 'Your FlowKit Access Code',
            text: emailText,
            html: emailHtml,
        });
    } catch (error) {
        console.error('Failed to send access code email:', error);
        throw error;
    }
}

export { resend };
