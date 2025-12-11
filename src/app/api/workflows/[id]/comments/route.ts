import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "5");
        const skip = (page - 1) * limit;

        const [comments, total] = await prisma.$transaction([
            prisma.comment.findMany({
                where: {
                    workflowId: params.id,
                    parentId: null,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                    replies: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.comment.count({
                where: {
                    workflowId: params.id,
                    parentId: null,
                },
            }),
        ]);

        return NextResponse.json({
            comments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

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

        const { content, parentId } = await req.json();

        if (!content) {
            return NextResponse.json(
                { message: "Content is required" },
                { status: 400 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                workflowId: params.id,
                userId: (session.user as any).id,
                parentId: parentId || null,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
