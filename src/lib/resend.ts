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
  // Plain text version - transactional and straightforward
  // No marketing copy, just essential information
  const emailText = `
YOUR FLOWKIT ACCESS CODE: ${accessCode}

This code is valid for 10 minutes.

Enter this code at https://flowkit.in to complete your sign-in.

If you did not request this code, please ignore this email.

---
FlowKit
https://flowkit.in

You received this email because someone requested access to FlowKit using this email address.
  `.trim();

  // HTML version with minimal styling - looks transactional, not promotional
  // Key changes: Simple layout, no marketing language, no features list, no badges
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your FlowKit Access Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff; color: #000000; padding: 0; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Simple Header -->
    <div style="margin-bottom: 30px;">
      <h1 style="font-size: 24px; font-weight: 600; color: #000000; margin: 0 0 8px 0;">FlowKit</h1>
      <p style="font-size: 14px; color: #666666; margin: 0;">Access Code Verification</p>
    </div>

    <!-- Access Code Box - Clean and Simple -->
    <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 32px; text-align: center; margin-bottom: 30px;">
      <div style="font-size: 12px; color: #666666; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Access Code</div>
      <div style="font-size: 42px; font-weight: 700; color: #FF6633; letter-spacing: 8px; font-family: 'Courier New', monospace; margin-bottom: 12px;">${accessCode}</div>
      <div style="font-size: 13px; color: #666666;">Valid for 10 minutes</div>
    </div>

    <!-- Simple Instructions -->
    <div style="margin-bottom: 30px;">
      <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px 0;">
        Enter this code at <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a> to complete your sign-in.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 0;">
        If you did not request this code, please ignore this email.
      </p>
    </div>

    <!-- Simple Footer -->
    <div style="padding-top: 30px; border-top: 1px solid #e0e0e0; margin-top: 40px;">
      <p style="font-size: 13px; color: #999999; margin: 0 0 8px 0;">
        FlowKit<br>
        <a href="https://flowkit.in" style="color: #999999; text-decoration: none;">flowkit.in</a>
      </p>
      <p style="font-size: 12px; color: #999999; margin: 0;">
        You received this email because someone requested access to FlowKit using this email address.
      </p>
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