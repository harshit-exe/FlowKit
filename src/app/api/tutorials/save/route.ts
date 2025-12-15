import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as fs from "fs"
import * as path from "path"

export async function POST(request: Request) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has admin role
        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { tutorial } = body

        if (!tutorial || !tutorial.workflowSlug) {
            return NextResponse.json(
                { error: "Tutorial data and workflow slug are required" },
                { status: 400 }
            )
        }

        // Construct file path
        const tutorialsDir = path.join(process.cwd(), "public", "tutorials")
        const filePath = path.join(tutorialsDir, `${tutorial.workflowSlug}.json`)

        // Ensure tutorials directory exists
        if (!fs.existsSync(tutorialsDir)) {
            fs.mkdirSync(tutorialsDir, { recursive: true })
        }

        // Check if file already exists
        const fileExists = fs.existsSync(filePath)

        // Write tutorial to file
        fs.writeFileSync(filePath, JSON.stringify(tutorial, null, 2), "utf-8")

        console.log(`[TUTORIAL_SAVE] Saved tutorial to: ${filePath}`)

        return NextResponse.json({
            success: true,
            message: fileExists ? "Tutorial updated successfully" : "Tutorial created successfully",
            filePath: `/tutorials/${tutorial.workflowSlug}.json`,
        })
    } catch (error) {
        console.error("[TUTORIAL_SAVE] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to save tutorial" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has admin role
        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const slug = searchParams.get("slug")

        if (!slug) {
            return NextResponse.json(
                { error: "Workflow slug is required" },
                { status: 400 }
            )
        }

        // Construct file path
        const filePath = path.join(process.cwd(), "public", "tutorials", `${slug}.json`)

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: "Tutorial not found" },
                { status: 404 }
            )
        }

        // Delete file
        fs.unlinkSync(filePath)

        console.log(`[TUTORIAL_DELETE] Deleted tutorial: ${filePath}`)

        return NextResponse.json({
            success: true,
            message: "Tutorial deleted successfully",
        })
    } catch (error) {
        console.error("[TUTORIAL_DELETE] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete tutorial" },
            { status: 500 }
        )
    }
}
