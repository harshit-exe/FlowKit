import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id;
        const workflowId = params.id;

        // Check if already saved
        const existing = await prisma.savedWorkflow.findUnique({
            where: {
                userId_workflowId: {
                    userId,
                    workflowId,
                },
            },
        });

        if (existing) {
            // Unsave
            await prisma.savedWorkflow.delete({
                where: {
                    userId_workflowId: {
                        userId,
                        workflowId,
                    },
                },
            });
            return NextResponse.json({ saved: false });
        } else {
            // Save
            await prisma.savedWorkflow.create({
                data: {
                    userId,
                    workflowId,
                },
            });
            return NextResponse.json({ saved: true });
        }
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
