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

        const { type } = await req.json();

        if (!["UPVOTE", "DOWNVOTE"].includes(type)) {
            return NextResponse.json(
                { message: "Invalid vote type" },
                { status: 400 }
            );
        }

        const userId = (session.user as any).id;
        const workflowId = params.id;

        // Check if vote exists
        const existingVote = await prisma.vote.findUnique({
            where: {
                userId_workflowId: {
                    userId,
                    workflowId,
                },
            },
        });

        if (existingVote) {
            if (existingVote.type === type) {
                // Toggle off if same vote type
                await prisma.vote.delete({
                    where: {
                        id: existingVote.id,
                    },
                });
                return NextResponse.json({ message: "Vote removed", vote: null });
            } else {
                // Update vote type if different
                const vote = await prisma.vote.update({
                    where: {
                        id: existingVote.id,
                    },
                    data: {
                        type,
                    },
                });
                return NextResponse.json(vote);
            }
        } else {
            // Create new vote
            const vote = await prisma.vote.create({
                data: {
                    type,
                    userId,
                    workflowId,
                },
            });
            return NextResponse.json(vote);
        }
    } catch (error) {
        console.error("Vote error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
