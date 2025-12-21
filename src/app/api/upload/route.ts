// <== IMPORTS ==>
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// <== ALLOWED FILE TYPES ==>
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// <== MAX FILE SIZE (5MB) ==>
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// <== UPLOAD FILE ==>
export async function POST(request: NextRequest) {
  // TRY TO UPLOAD FILE
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be logged in to upload files",
          },
        },
        { status: 401 }
      );
    }
    // PARSE FORM DATA
    const formData = await request.formData();
    // GET FILE FROM FORM DATA
    const file = formData.get("file") as File | null;
    // CHECK IF FILE EXISTS
    if (!file) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "No file provided",
          },
        },
        { status: 400 }
      );
    }
    // CHECK FILE TYPE
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message:
              "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP, SVG",
          },
        },
        { status: 400 }
      );
    }
    // CHECK FILE SIZE
    if (file.size > MAX_FILE_SIZE) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "File size exceeds 5MB limit",
          },
        },
        { status: 400 }
      );
    }
    // GET UPLOAD TYPE (AVATAR, BANNER, PROJECT, ARTICLE)
    const uploadType = formData.get("type") as string | null;
    // BUILD FILE PATH
    const timestamp = Date.now();
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();
    // DETERMINE BUCKET AND PATH
    const bucket = "uploads";
    let filePath: string;
    switch (uploadType) {
      case "avatar":
        filePath = `avatars/${user.id}/${timestamp}-${sanitizedFileName}`;
        break;
      case "banner":
        filePath = `banners/${user.id}/${timestamp}-${sanitizedFileName}`;
        break;
      case "project":
        filePath = `projects/${user.id}/${timestamp}-${sanitizedFileName}`;
        break;
      case "article":
        filePath = `articles/${user.id}/${timestamp}-${sanitizedFileName}`;
        break;
      default:
        filePath = `misc/${user.id}/${timestamp}-${sanitizedFileName}`;
    }
    // CONVERT FILE TO BUFFER
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // UPLOAD TO SUPABASE STORAGE
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    // CHECK FOR UPLOAD ERROR
    if (error) {
      // LOG ERROR
      console.error("Supabase storage error:", error);
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STORAGE_ERROR",
            message: error.message ?? "Failed to upload file",
          },
        },
        { status: 500 }
      );
    }
    // GET PUBLIC URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);
    // RETURN SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        path: data.path,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    // LOG ERROR
    console.error("Error uploading file:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to upload file",
        },
      },
      { status: 500 }
    );
  }
}

// <== DELETE FILE ==>
export async function DELETE(request: NextRequest) {
  // TRY TO DELETE FILE
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be logged in to delete files",
          },
        },
        { status: 401 }
      );
    }
    // PARSE REQUEST BODY
    const { path } = await request.json();
    // CHECK IF PATH PROVIDED
    if (!path) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "No file path provided",
          },
        },
        { status: 400 }
      );
    }
    // CHECK IF USER OWNS THE FILE (PATH SHOULD CONTAIN USER ID)
    if (!path.includes(user.id)) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to delete this file",
          },
        },
        { status: 403 }
      );
    }
    // DELETE FROM SUPABASE STORAGE
    const { error } = await supabase.storage.from("uploads").remove([path]);
    // CHECK FOR DELETE ERROR
    if (error) {
      // LOG ERROR
      console.error("Supabase storage delete error:", error);
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STORAGE_ERROR",
            message: error.message ?? "Failed to delete file",
          },
        },
        { status: 500 }
      );
    }
    // RETURN SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting file:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete file",
        },
      },
      { status: 500 }
    );
  }
}
