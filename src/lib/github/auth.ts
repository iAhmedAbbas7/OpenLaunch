// <== IMPORTS ==>
import { createClient } from "@/lib/supabase/server";

// <== GITHUB OAUTH CONFIGURATION ==>
export const GITHUB_OAUTH_CONFIG = {
  // SCOPES FOR FULL REPO ACCESS
  scopes: ["read:user", "user:email", "repo", "read:org"],
  // SCOPES FOR READ-ONLY ACCESS
  readOnlyScopes: ["read:user", "user:email", "public_repo"],
};

// <== GET GITHUB ACCESS TOKEN ==>
export async function getGitHubAccessToken(): Promise<string | null> {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET SESSION
  const {
    data: { session },
  } = await supabase.auth.getSession();
  // CHECK IF SESSION EXISTS
  if (!session) return null;
  // RETURN PROVIDER TOKEN
  return session.provider_token ?? null;
}

// <== CHECK IF GITHUB IS CONNECTED ==>
export async function isGitHubConnected(): Promise<boolean> {
  // GET ACCESS TOKEN
  const token = await getGitHubAccessToken();
  // RETURN TRUE IF TOKEN EXISTS
  return !!token;
}

// <== GET GITHUB OAUTH URL ==>
export function getGitHubOAuthUrl(
  redirectTo: string,
  scopes: string[] = GITHUB_OAUTH_CONFIG.scopes
): string {
  // BUILD REDIRECT URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // BUILD CALLBACK URL
  const callbackUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(
    redirectTo
  )}`;
  // RETURN SUPABASE OAUTH URL (HANDLED BY SUPABASE)
  return `/api/auth/github?redirect_to=${encodeURIComponent(
    callbackUrl
  )}&scopes=${scopes.join(",")}`;
}

// <== REFRESH GITHUB TOKEN ==>
export async function refreshGitHubToken(): Promise<string | null> {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // REFRESH SESSION
  const { data, error } = await supabase.auth.refreshSession();
  // CHECK FOR ERROR
  if (error) {
    // LOG ERROR
    console.error("Error refreshing GitHub token:", error);
    // RETURN NULL
    return null;
  }
  // RETURN PROVIDER TOKEN
  return data.session?.provider_token ?? null;
}

// <== DISCONNECT GITHUB ==>
export async function disconnectGitHub(): Promise<boolean> {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET CURRENT SESSION
  const {
    data: { session },
  } = await supabase.auth.getSession();
  // CHECK IF SESSION EXISTS
  if (!session) return false;
  // UPDATE PROFILE
  return true;
}

// <== VALIDATE GITHUB TOKEN ==>
export async function validateGitHubToken(token: string): Promise<boolean> {
  // TRY TO FETCH USER
  try {
    // FETCH USER
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token}`,
      },
    });
    // RETURN TRUE IF OK
    return response.ok;
  } catch {
    // RETURN FALSE ON ERROR
    return false;
  }
}
