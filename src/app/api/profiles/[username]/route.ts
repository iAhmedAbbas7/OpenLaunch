// <== IMPORTS ==>
import { NextRequest, NextResponse } from "next/server";
import {
  getProfileByUsername,
  getProfileWithStats,
} from "@/server/actions/profiles";

// <== GET PROFILE BY USERNAME ==>
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  // TRY TO FETCH PROFILE
  try {
    // GET USERNAME FROM PARAMS
    const { username } = await params;
    // CHECK IF STATS REQUESTED
    const searchParams = request.nextUrl.searchParams;
    // DETERMINE IF STATS ARE REQUESTED
    const withStats = searchParams.get("stats") === "true";
    // FETCH PROFILE WITH OR WITHOUT STATS
    const result = withStats
      ? await getProfileWithStats(username)
      : await getProfileByUsername(username);
    // CHECK IF SUCCESS
    if (!result.success) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(result, {
        status: result.error.code === "NOT_FOUND" ? 404 : 500,
      });
    }
    // RETURN SUCCESS RESPONSE
    return NextResponse.json(result);
  } catch (error) {
    // LOG ERROR
    console.error("Error in profile API:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch profile",
        },
      },
      { status: 500 }
    );
  }
}
