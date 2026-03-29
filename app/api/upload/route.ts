import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    // 1. Auth Check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
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
        
        // 4. Check for Vercel Blob Token
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return NextResponse.json({ error: "Vercel Blob token is missing. Please configure BLOB_READ_WRITE_TOKEN in Vercel." }, { status: 500 });
        }

        // 5. Upload to Vercel Blob
        const safeName = file.name ? file.name : "upload.file";
        const filename = `${Date.now()}-${safeName.replace(/[^a-z0-9.]/gi, "_").toLowerCase()}`;
        
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        return NextResponse.json({ success: true, url: blob.url });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ 
            error: error?.message || "Internal Server Error parsing or uploading file",
            details: String(error)
        }, { status: 500 });
    }
}
