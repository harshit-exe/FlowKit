import { NextRequest, NextResponse } from "next/server"
import { setEmailProvider, getEmailProvider, EmailProvider } from "@/lib/email"

export async function GET() {
    try {
        const provider = await getEmailProvider()
        return NextResponse.json({ provider })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch email provider setting" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { provider } = await request.json()

        if (!["resend", "nodemailer"].includes(provider)) {
            return NextResponse.json(
                { error: "Invalid email provider" },
                { status: 400 }
            )
        }

        await setEmailProvider(provider as EmailProvider)

        return NextResponse.json({
            success: true,
            message: `Email provider switched to ${provider}`,
        })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update email provider setting" },
            { status: 500 }
        )
    }
}
