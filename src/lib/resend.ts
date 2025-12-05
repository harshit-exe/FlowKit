import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Track warmup status
let isWarmedUp = false;

/**
 * Warm up the Resend connection with a dummy email
 * This is critical for serverless environments where the first request is a cold start
 */
async function warmUpWithDummyEmail() {
  if (isWarmedUp) return;

  try {
    console.log('🔥 Warming up Resend connection with dummy email...');

    // Send a dummy email to warm up the connection
    // This establishes the connection pool and DNS resolution
    const dummyResponse = await resend.emails.send({
      from: 'FlowKit <noreply@flowkit.in>',
      to: ['warmup@resend.dev'], // Resend's special warmup address
      subject: 'Connection Warmup',
      text: 'This is a warmup email to establish the connection.',
    });

    isWarmedUp = true;
    console.log('✅ Resend connection warmed up successfully');
  } catch (error) {
    console.log('⚠️ Resend warmup failed (this is OK, will warm up on first real send):', error);
  }
}

/**
 * Send access code email with retry logic and exponential backoff
 * This ensures emails are sent reliably even on first attempt
 */
export async function sendAccessCodeEmail(
  to: string,
  accessCode: string
): Promise<{ success: boolean; id?: string; attempt: number }> {
  // Plain text version for better spam score
  // IMPORTANT: Access code is at the top for mobile preview visibility
  const emailText = `
YOUR FLOWKIT ACCESS CODE: ${accessCode}

Welcome to FlowKit!

You've requested access to FlowKit, and we're thrilled to have you. We're not just building another automation tool—we're crafting an experience that respects your time, your workflow, and your intelligence.

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
  // IMPORTANT: Access code is at the top for mobile preview visibility
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
    <div style="padding: 40px 20px 20px 20px; text-align: center; background-color: #000000;">
      <h1 style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0 0 10px 0; letter-spacing: 2px;">FLOWKIT</h1>
      <div style="display: inline-block; padding: 6px 16px; border: 1px solid rgba(255, 102, 51, 0.3); background-color: rgba(255, 102, 51, 0.05); color: rgba(255, 102, 51, 0.9); font-size: 11px; border-radius: 20px; letter-spacing: 1px;">EXCLUSIVE EARLY ACCESS</div>
    </div>

    <!-- Access Code Box - MOVED TO TOP for mobile preview -->
    <div style="padding: 20px; background-color: #000000;">
      <div style="background-color: #0a0a0a; border: 2px solid rgba(255, 102, 51, 0.3); padding: 30px; text-align: center;">
        <div style="font-size: 11px; color: #a3a3a3; font-weight: bold; margin-bottom: 15px; letter-spacing: 2px;">YOUR ACCESS CODE</div>
        <div style="font-size: 48px; font-weight: bold; color: #FF6633; letter-spacing: 12px; font-family: 'Courier New', monospace;">${accessCode}</div>
        <div style="font-size: 12px; color: #666666; margin-top: 15px;">Valid for 10 minutes (one-time use)</div>
      </div>
    </div>

    <!-- Content -->
    <div style="padding: 20px 20px 40px 20px; background-color: #000000; border-top: 2px solid #FF6633;">
      <div style="font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #ffffff; letter-spacing: 1px;">WELCOME TO THE INNER CIRCLE</div>

      <p style="font-size: 14px; line-height: 1.8; color: #a3a3a3; margin: 0 0 20px 0;">
        You've requested access to FlowKit, and we're thrilled to have you. We're not just building another automation tool—we're crafting an experience that respects your time, your workflow, and your intelligence.
      </p>

      <p style="font-size: 14px; line-height: 1.8; color: #a3a3a3; margin: 0 0 20px 0;">
        Head back to <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a>, enter the code above, and step into a workflow automation platform that doesn't compromise on power or elegance.
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

  const emailOptions = {
    from: 'FlowKit <noreply@flowkit.in>',
    to: [to],
    subject: 'Your FlowKit Access Code',
    text: emailText,
    html: emailHtml,
  };

  // Warm up connection on first call (critical for serverless cold starts)
  // This sends a dummy email to establish the connection, then sends the real email
  if (!isWarmedUp) {
    console.log('🔥 First email send detected - warming up connection...');
    await warmUpWithDummyEmail();
  }

  // Retry logic - attempt up to 3 times with exponential backoff
  let lastError: any;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`📧 Attempt ${attempt}/3 - Sending OTP to ${to}`);

      const response = await resend.emails.send(emailOptions);

      // Check if the response has an error
      if (response.error) {
        throw new Error(response.error.message || 'Email send failed');
      }

      console.log(`✅ Email sent successfully on attempt ${attempt}:`, response.data?.id);
      return { success: true, id: response.data?.id, attempt };

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Attempt ${attempt}/3 failed:`, error.message);

      // Wait before retry with exponential backoff (1s, 2s)
      if (attempt < 3) {
        const waitTime = attempt * 1000;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All attempts failed
  console.error('❌ All 3 email send attempts failed:', lastError);
  throw new Error(`Failed to send email after 3 attempts: ${lastError?.message || 'Unknown error'}`);
}

export { resend };
