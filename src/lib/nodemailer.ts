import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.NODEMAILER_PORT || '587'),
    secure: process.env.NODEMAILER_SECURE === 'true',
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});

export async function sendAccessCodeEmail(
    to: string,
    accessCode: string
): Promise<{ success: boolean; id?: string; attempt: number }> {
    const emailText = `
YOUR FLOWKIT ACCESS CODE: ${accessCode}

This code is valid for 10 minutes.

Enter this code at https://flowkit.in to complete your sign-in.

If you did not request this code, please ignore this email.

---
FlowKit
https://flowkit.in
  `.trim();

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
    <div style="margin-bottom: 30px;">
      <h1 style="font-size: 24px; font-weight: 600; color: #000000; margin: 0 0 8px 0;">FlowKit</h1>
      <p style="font-size: 14px; color: #666666; margin: 0;">Access Code Verification</p>
    </div>
    <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 32px; text-align: center; margin-bottom: 30px;">
      <div style="font-size: 12px; color: #666666; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Access Code</div>
      <div style="font-size: 42px; font-weight: 700; color: #FF6633; letter-spacing: 8px; font-family: 'Courier New', monospace; margin-bottom: 12px;">${accessCode}</div>
      <div style="font-size: 13px; color: #666666;">Valid for 10 minutes</div>
    </div>
    <div style="margin-bottom: 30px;">
      <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px 0;">
        Enter this code at <a href="https://flowkit.in" style="color: #FF6633; text-decoration: none;">flowkit.in</a> to complete your sign-in.
      </p>
    </div>
    <div style="padding-top: 30px; border-top: 1px solid #e0e0e0; margin-top: 40px;">
      <p style="font-size: 13px; color: #999999; margin: 0 0 8px 0;">
        FlowKit<br>
        <a href="https://flowkit.in" style="color: #999999; text-decoration: none;">flowkit.in</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

    try {
        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_FROM || '"FlowKit" <noreply@flowkit.in>',
            to,
            subject: 'Your FlowKit Access Code',
            text: emailText,
            html: emailHtml,
        });

        console.log('✅ Email sent via Nodemailer:', info.messageId);
        return { success: true, id: info.messageId, attempt: 1 };
    } catch (error: any) {
        console.error('❌ Nodemailer send failed:', error);
        throw new Error(`Nodemailer failed: ${error.message}`);
    }
}

export async function sendEmail({
    to,
    subject,
    text,
    html,
}: {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
}) {
    try {
        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_FROM || '"FlowKit" <noreply@flowkit.in>',
            to,
            subject,
            text,
            html,
        });
        return { success: true, id: info.messageId };
    } catch (error: any) {
        console.error('❌ Nodemailer generic send failed:', error);
        throw new Error(`Nodemailer failed: ${error.message}`);
    }
}
