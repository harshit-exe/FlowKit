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

        const { value } = await req.json();

        if (!value || value < 1 || value > 5) {
            return NextResponse.json(
                { message: "Invalid rating value" },
                { status: 400 }
            );
        }

        const rating = await prisma.rating.upsert({
            where: {
                userId_workflowId: {
                    userId: (session.user as any).id,
                    workflowId: params.id,
                },
            },
            update: {
                value,
            },
            create: {
                value,
                userId: (session.user as any).id,
                workflowId: params.id,
            },
        });

        return NextResponse.json(rating);
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
