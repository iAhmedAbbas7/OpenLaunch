// <== IMPORTS ==>
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { authConfig } from "@/config/auth";
import { NextResponse } from "next/server";
import { profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

// <== GET HANDLER FOR AUTH CALLBACK ==>
export async function GET(request: Request) {
  // GET SEARCH PARAMS FROM REQUEST
  const { searchParams, origin } = new URL(request.url);
  // GET CODE FROM SEARCH PARAMS
  const code = searchParams.get("code");
  // GET NEXT URL FROM SEARCH PARAMS (FOR REDIRECTING AFTER AUTH)
  let next = searchParams.get("next") ?? authConfig.routes.defaultRedirect;
  // ENSURE NEXT IS A RELATIVE URL FOR SECURITY
  if (!next.startsWith("/")) {
    next = authConfig.routes.defaultRedirect;
  }
  // CHECK IF CODE EXISTS
  if (code) {
    // CREATE SUPABASE CLIENT (USES COOKIES FROM SERVER)
    const supabase = await createClient();
    // EXCHANGE CODE FOR SESSION
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    // CHECK IF ERROR OCCURRED
    if (!error && data.user && data.session) {
      // ENSURE PROFILE EXISTS
      try {
        await ensureProfileExists(data.user);
      } catch (profileError) {
        // LOG ERROR BUT DON'T BLOCK LOGIN
        console.error("Profile creation error:", profileError);
      }
      // TRY TO PERSIST GITHUB ACCESS TOKEN
      try {
        // PERSIST GITHUB ACCESS TOKEN
        await persistGitHubTokenIfNeeded(data.user, data.session);
      } catch (tokenError) {
        // LOG ERROR BUT DON'T BLOCK LOGIN
        console.error("GitHub token persistence error:", tokenError);
      }
      // HANDLE FORWARDED HOST FOR PRODUCTION DEPLOYMENTS
      const forwardedHost = request.headers.get("x-forwarded-host");
      // CHECK IF LOCAL ENVIRONMENT
      const isLocalEnv = process.env.NODE_ENV === "development";
      // CHECK IF FORWARDED HOST EXISTS
      if (isLocalEnv) {
        // LOCAL DEVELOPMENT - USE ORIGIN
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // PRODUCTION WITH LOAD BALANCER - USE FORWARDED HOST
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        // PRODUCTION WITHOUT LOAD BALANCER - USE ORIGIN
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
    // LOG ERROR IF OCCURRED
    if (error) {
      // LOG ERROR
      console.error("Auth callback error:", error.message);
    }
  }
  // REDIRECT TO ERROR PAGE IF SOMETHING WENT WRONG
  return NextResponse.redirect(
    `${origin}${authConfig.routes.signIn}?error=auth_callback_error`
  );
}

// <== ENSURE PROFILE EXISTS ==>
async function ensureProfileExists(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  // CHECK IF PROFILE EXISTS
  const existingProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });
  // RETURN IF PROFILE EXISTS
  if (existingProfile) {
    // UPDATE LAST LOGIN
    await db
      .update(profiles)
      .set({ lastLoginAt: new Date() })
      .where(eq(profiles.userId, user.id));
    return;
  }
  // GET EMAIL FROM USER
  const email = user.email ?? "";
  // GENERATE USERNAME FROM EMAIL OR USER DATA
  const baseUsername =
    (user.user_metadata?.user_name as string | undefined) ??
    (user.user_metadata?.preferred_username as string | undefined) ??
    email.split("@")[0] ??
    "user";
  // ENSURE USERNAME IS UNIQUE
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, "");
  // CHECK IF USERNAME EXISTS AND APPEND RANDOM SUFFIX IF NEEDED
  let usernameExists = await db.query.profiles.findFirst({
    where: eq(profiles.username, username),
  });
  // LOOP UNTIL UNIQUE USERNAME IS FOUND
  while (usernameExists) {
    // APPEND RANDOM SUFFIX
    username = `${baseUsername}_${Math.random().toString(36).slice(2, 6)}`;
    // CHECK IF USERNAME EXISTS
    usernameExists = await db.query.profiles.findFirst({
      where: eq(profiles.username, username),
    });
  }
  // CREATE PROFILE
  await db.insert(profiles).values({
    userId: user.id,
    username,
    displayName:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      username,
    email,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    githubUsername:
      (user.user_metadata?.user_name as string | undefined) ?? null,
    lastLoginAt: new Date(),
  });
}

// <== PERSIST GITHUB TOKEN IF NEEDED ==>
async function persistGitHubTokenIfNeeded(
  user: {
    id: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  },
  session: {
    provider_token?: string | null;
  }
) {
  // CHECK IF SESSION HAS PROVIDER TOKEN
  if (!session.provider_token) {
    // NO PROVIDER TOKEN (EMAIL/PASSWORD LOGIN)
    return;
  }
  // GET PROVIDER FROM APP METADATA
  const provider = user.app_metadata?.provider as string | undefined;
  // GET PROVIDERS FROM APP METADATA
  const providers = user.app_metadata?.providers as string[] | undefined;
  // CHECK IF THIS IS A GITHUB OAUTH LOGIN
  const isGitHubAuth =
    provider === "github" || (providers && providers.includes("github"));
  // ALSO CHECK FOR GITHUB USERNAME IN USER METADATA AS A FALLBACK
  const hasGitHubUsername = !!user.user_metadata?.user_name;
  // IF NOT GITHUB AUTH AND NO GITHUB USERNAME, RETURN
  if (!isGitHubAuth && !hasGitHubUsername) {
    // SKIP PERSISTING GITHUB ACCESS TOKEN
    return;
  }
  // GET GITHUB USERNAME FROM USER METADATA
  const githubUsername = user.user_metadata?.user_name as string | undefined;
  // UPDATE PROFILE WITH GITHUB ACCESS TOKEN
  await db
    .update(profiles)
    .set({
      githubAccessToken: session.provider_token,
      ...(githubUsername ? { githubUsername } : {}),
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id));
}
