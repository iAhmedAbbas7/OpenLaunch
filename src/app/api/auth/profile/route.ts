// <== IMPORTS ==>
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { profiles } from "@/lib/db/schema";
import { NextResponse } from "next/server";

// <== GET HANDLER FOR PROFILE ==>
export async function GET(request: Request) {
  // GET SEARCH PARAMS FROM REQUEST
  const { searchParams } = new URL(request.url);
  // GET USER ID FROM SEARCH PARAMS
  const userId = searchParams.get("userId");
  // CHECK IF USER ID EXISTS
  if (!userId) {
    // RETURN ERROR RESPONSE
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  // GET PROFILE FROM DATABASE
  try {
    // QUERY PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN NOT FOUND RESPONSE
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    // RETURN PROFILE
    return NextResponse.json({
      profile: {
        id: profile.id,
        userId: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        email: profile.email,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        bannerUrl: profile.bannerUrl,
        website: profile.website,
        location: profile.location,
        githubUsername: profile.githubUsername,
        twitterUsername: profile.twitterUsername,
        isVerified: profile.isVerified,
        isPro: profile.isPro,
        reputationScore: profile.reputationScore,
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        createdAt: profile.createdAt.toISOString(),
      },
    });
  } catch (error) {
    // LOG ERROR
    console.error("Failed to fetch profile:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
