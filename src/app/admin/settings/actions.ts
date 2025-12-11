"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AIProvider } from "@/lib/ai-provider";

export async function updateAIProvider(provider: AIProvider) {
    try {
        await prisma.systemSetting.upsert({
            where: { key: "ai_provider" },
            update: { value: provider },
            create: { key: "ai_provider", value: provider },
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update AI provider:", error);
        return { success: false, error: "Failed to update AI provider" };
    }
}
