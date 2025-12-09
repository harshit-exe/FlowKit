import { prisma } from "@/lib/prisma";
import { sendAccessCodeEmail as sendResend } from "./resend";
import { sendAccessCodeEmail as sendNodemailer, sendEmail as sendNodemailerGeneric } from "./nodemailer";

export type EmailProvider = "resend" | "nodemailer";

export async function getEmailProvider(): Promise<EmailProvider> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: "email_provider" },
        });
        return (setting?.value as EmailProvider) || "resend";
    } catch (error) {
        console.error("Failed to fetch email provider setting:", error);
        return "resend"; // Default fallback
    }
}

export async function setEmailProvider(provider: EmailProvider) {
    await prisma.systemSetting.upsert({
        where: { key: "email_provider" },
        update: { value: provider },
        create: {
            key: "email_provider",
            value: provider,
            description: "Active email service provider (resend or nodemailer)"
        },
    });
}

export async function sendAccessCodeEmail(to: string, accessCode: string) {
    const provider = await getEmailProvider();

    console.log(`📧 Sending email using provider: ${provider}`);

    if (provider === "nodemailer") {
        return sendNodemailer(to, accessCode);
    } else {
        return sendResend(to, accessCode);
    }
}

export async function sendEmail(params: {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
}) {
    const provider = await getEmailProvider();

    console.log(`📧 Sending generic email using provider: ${provider}`);

    if (provider === "nodemailer") {
        return sendNodemailerGeneric(params);
    } else {
        // Resend implementation using the raw client
        const { resend } = await import("./resend");
        return resend.emails.send({
            from: 'FlowKit <noreply@flowkit.in>',
            to: params.to,
            subject: params.subject,
            text: params.text,
            html: params.html,
        });
    }
}
