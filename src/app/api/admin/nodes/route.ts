import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = {
      isDeprecated: false,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    const nodes = await prisma.n8nNode.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      nodes,
      count: nodes.length,
    });
  } catch (error) {
    console.error("[GET_NODES]", error);
    return NextResponse.json(
      { error: "Failed to fetch nodes" },
      { status: 500 }
    );
  }
}
