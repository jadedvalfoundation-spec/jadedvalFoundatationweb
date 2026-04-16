import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { ApiResponse, CloudinaryUploadResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) ?? "jadedval_foundation";

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await uploadImage(base64, folder);

    return NextResponse.json<ApiResponse<CloudinaryUploadResult>>({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        resource_type: result.resource_type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Public ID is required" },
        { status: 400 }
      );
    }

    await deleteImage(publicId);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
