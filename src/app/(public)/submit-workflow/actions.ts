"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitWorkflow(formData: FormData) {
    try {
        const workflowJson = formData.get("workflowJson") as string;
        const category = formData.get("category") as string;
        const submitterName = formData.get("submitterName") as string;
        const contactEmail = formData.get("contactEmail") as string;
        const captchaAnswer = formData.get("captchaAnswer") as string;

        // Manual Captcha Validation (2 + 8 = 10)
        if (captchaAnswer !== "10") {
            return { success: false, error: "Math is hard, but that's not correct. Try again!" };
        }

        if (!workflowJson || !category) {
            return { success: false, error: "Workflow JSON and Category are required." };
        }

        // Validate JSON
        try {
            JSON.parse(workflowJson);
        } catch (e) {
            return { success: false, error: "Invalid JSON format." };
        }

        await prisma.workflowSubmission.create({
            data: {
                workflowJson: JSON.parse(workflowJson),
                category,
                submitterName: submitterName || null,
                contactEmail: contactEmail || null,
                authorUrl: formData.get("authorUrl") as string | null,
                status: "PENDING",
            },
        });

        // Notify admin (optional, can be added later)

        return { success: true };
    } catch (error) {
        console.error("Failed to submit workflow:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}
