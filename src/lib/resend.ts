import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Track warmup status
let isWarmedUp = false;

/**
 * Warm up the Resend connection with a lightweight API call
 * This is critical for serverless environments where the first request is a cold start
 * Uses domains.list() instead of sending dummy emails to preserve email quota
 */
async function warmUpResendConnection() {
  if (isWarmedUp) return;

  try {
    console.log('🔥 Warming up Resend connection...');

    // Make a lightweight API call to establish connection
    // This warms up the connection pool and DNS resolution
    // WITHOUT consuming email quota (100 emails/day on free tier)
    await resend.domains.list();

    isWarmedUp = true;
    console.log('✅ Resend connection warmed up successfully (no email quota used)');
  } catch (error) {
    console.log('⚠️ Resend warmup failed (this is OK, will warm up on first real send):', error);
    // Don't throw - if warmup fails, the retry logic will handle it
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
  // Plain text version optimized for Primary inbox
  // Keep it simple and transactional - this is what spam filters analyze first
  const emailText = `Your FlowKit access code: ${accessCode}

This code is valid for 10 minutes.

Enter this code at https://flowkit.in to access your account.

If you didn't request this code, please ignore this email.

---
FlowKit
https://flowkit.in
  `.trim();

  // HTML version - keeping your premium design
  // The key is the plain text version and email headers, not the HTML
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
    </div>

    <!-- Access Code Box -->
    <div style="padding: 20px; background-color: #000000;">
      <div style="background-color: #0a0a0a; border: 2px solid rgba(255, 102, 51, 0.3); padding: 30px; text-align: center;">
        <div style="font-size: 11px; color: #a3a3a3; font-weight: bold; margin-bottom: 15px; letter-spacing: 2px;">YOUR ACCESS CODE</div>
        <div style="font-size: 48px; font-weight: bold; color: #FF6633; letter-spacing: 12px; font-family: 'Courier New', monospace;">${accessCode}</div>
        <div style="font-size: 12px; color: #666666; margin-top: 15px;">Valid for 10 minutes</div>
      </div>
    </div>

    <!-- Content -->
    <div style="padding: 20px 20px 40px 20px; background-color: #000000;">
      <p style="font-size: 14px; line-height: 1.8; color: #a3a3a3; margin: 0 0 20px 0;">
        You requested access to FlowKit. Enter the code above at <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a> to continue.
      </p>

      <p style="font-size: 14px; line-height: 1.8; color: #a3a3a3; margin: 0 0 20px 0;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 30px 20px; text-align: center; border-top: 1px solid #262626; background-color: #000000;">
      <div style="font-size: 11px; color: #666666; margin-bottom: 15px; line-height: 1.6;">
        <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a><br>
        © ${new Date().getFullYear()} FlowKit
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const emailOptions = {
    from: 'FlowKit <noreply@flowkit.in>',
    to: [to],
    // Subject line is critical - keep it transactional
    subject: `Your verification code: ${accessCode}`,
    text: emailText,
    html: emailHtml,
    // Add email headers to mark this as transactional
    headers: {
      'X-Entity-Ref-ID': `otp-${Date.now()}`,
      'X-Priority': '1',
      'Importance': 'high',
    },
    tags: [
      {
        name: 'category',
        value: 'authentication'
      }
    ]
  };

  // Warm up connection on first call (critical for serverless cold starts)
  // This makes a lightweight API call to establish the connection
  // WITHOUT consuming email quota - preserves all 100 emails/day for actual users
  if (!isWarmedUp) {
    console.log('🔥 First email send detected - warming up connection...');
    await warmUpResendConnection();
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
