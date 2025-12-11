"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSubmissions() {
    try {
        const submissions = await prisma.workflowSubmission.findMany({
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: submissions };
    } catch (error) {
        console.error("Failed to fetch submissions:", error);
        return { success: false, error: "Failed to fetch submissions" };
    }
}

export async function updateSubmissionStatus(id: string, status: "PENDING" | "REVIEWED" | "REJECTED") {
    try {
        await prisma.workflowSubmission.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/admin/submissions");
        return { success: true };
    } catch (error) {
        console.error("Failed to update submission status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function deleteSubmission(id: string) {
    try {
        await prisma.workflowSubmission.delete({
            where: { id },
        });
        revalidatePath("/admin/submissions");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete submission:", error);
        return { success: false, error: "Failed to delete submission" };
    }
}
