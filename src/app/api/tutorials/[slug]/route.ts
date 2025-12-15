import { NextResponse } from "next/server"
import * as fs from "fs"
import * as path from "path"

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params

        // Construct file path
        const filePath = path.join(
            process.cwd(),
            "public",
            "tutorials",
            `${slug}.json`
        )

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: "Tutorial not found for this workflow" },
                { status: 404 }
            )
        }

        // Read and parse JSON file
        const tutorialData = fs.readFileSync(filePath, "utf-8")
        const tutorial = JSON.parse(tutorialData)

        return NextResponse.json(tutorial)
    } catch (error) {
        console.error("[TUTORIAL_GET]", error)
        return NextResponse.json(
            { error: "Failed to load tutorial" },
            { status: 500 }
        )
    }
}
