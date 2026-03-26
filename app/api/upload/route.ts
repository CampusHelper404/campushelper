import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
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

        // 4. Upload to Vercel Blob
        const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase()}`;
        
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        return NextResponse.json({ success: true, url: blob.url });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
