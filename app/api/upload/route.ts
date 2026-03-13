import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { getSessionCookie } from "better-auth/cookies";

export async function POST(request: NextRequest) {
    // 1. Auth Check
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // 2. Validate File Type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only images and PDFs are allowed." }, { status: 400 });
        }

        // 3. Limit File Size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 4. Create Directory
        const uploadDir = join(process.cwd(), "public/uploads/verification");
        await mkdir(uploadDir, { recursive: true });

        // 5. Unique Filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
        const filename = `${timestamp}-${safeName}`;
        const path = join(uploadDir, filename);

        // 6. Write File
        await writeFile(path, buffer);
        
        const fileUrl = `/uploads/verification/${filename}`;
        return NextResponse.json({ success: true, url: fileUrl });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
