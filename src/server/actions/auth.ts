// <== SERVER ACTIONS FOR AUTH ==>
"use server";

// <== IMPORTS ==>
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignUpInput,
  type SignInInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { profiles } from "@/lib/db/schema";
import { authConfig } from "@/config/auth";
import { createClient } from "@/lib/supabase/server";
import type { AuthResponse, OAuthProvider } from "@/types/auth";

// <== SIGN UP WITH EMAIL AND PASSWORD ==>
export async function signUp(
  input: SignUpInput
): Promise<AuthResponse<{ userId: string; needsEmailConfirmation?: boolean }>> {
  // VALIDATE INPUT
  const validatedFields = signUpSchema.safeParse(input);
  // CHECK IF INPUT IS VALID
  if (!validatedFields.success) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION_ERROR",
    };
  }
  // DESTRUCTURE VALIDATED DATA
  const { email, password, username, displayName } = validatedFields.data;
  // CHECK IF USERNAME IS ALREADY TAKEN
  const existingProfile = await db.query.profiles.findFirst({
    where: eq(profiles.username, username),
  });
  // RETURN ERROR IF USERNAME IS TAKEN
  if (existingProfile) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: "This username is already taken",
      code: "USERNAME_TAKEN",
    };
  }
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET ORIGIN FOR REDIRECT
  const headersList = await headers();
  // GET ORIGIN FOR REDIRECT
  const origin = headersList.get("origin") ?? "http://localhost:3000";
  // BUILD REDIRECT URL
  const redirectUrl = `${origin}${authConfig.routes.callback}`;
  // SIGN UP USER
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        username,
        display_name: displayName ?? username,
      },
    },
  });
  // CHECK IF ERROR OCCURRED
  if (error) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: error.message,
      code: error.code ?? "AUTH_ERROR",
    };
  }
  // CHECK IF USER WAS CREATED
  if (!data.user) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: "Failed to create user",
      code: "USER_CREATION_FAILED",
    };
  }
  // CREATE PROFILE IN DATABASE
  try {
    // INSERT PROFILE
    await db.insert(profiles).values({
      userId: data.user.id,
      username,
      displayName: displayName ?? username,
      email,
      avatarUrl: data.user.user_metadata?.avatar_url ?? null,
    });
  } catch (profileError) {
    // LOG ERROR
    console.error("Failed to create profile:", profileError);
    // PROFILE WILL BE CREATED ON FIRST LOGIN IF IT FAILS HERE
  }
  // CHECK IF SESSION EXISTS (EMAIL CONFIRMATION DISABLED = SESSION EXISTS)
  const needsEmailConfirmation = !data.session;
  // IF EMAIL CONFIRMATION IS DISABLED, SIGN OUT TO PREVENT AUTO-LOGIN
  if (!needsEmailConfirmation) {
    // SIGN OUT THE AUTO-CREATED SESSION
    await supabase.auth.signOut();
  }
  // RETURN SUCCESS RESPONSE
  return {
    success: true,
    data: {
      userId: data.user.id,
      needsEmailConfirmation,
    },
  };
}

// <== SIGN IN WITH EMAIL AND PASSWORD ==>
export async function signIn(
  input: SignInInput
): Promise<AuthResponse<{ userId: string }>> {
  // VALIDATE INPUT
  const validatedFields = signInSchema.safeParse(input);
  // CHECK IF INPUT IS VALID
  if (!validatedFields.success) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION_ERROR",
    };
  }
  // DESTRUCTURE VALIDATED DATA
  const { email, password } = validatedFields.data;
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // SIGN IN USER
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  // CHECK IF ERROR OCCURRED
  if (error) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: error.message,
      code: error.code ?? "AUTH_ERROR",
    };
  }
  // CHECK IF USER EXISTS
  if (!data.user) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: "Failed to sign in",
      code: "SIGN_IN_FAILED",
    };
  }
  // ENSURE PROFILE EXISTS
  await ensureProfileExists(data.user.id, data.user.email ?? email);
  // RETURN SUCCESS RESPONSE
  return {
    success: true,
    data: { userId: data.user.id },
  };
}

// <== SIGN IN WITH OAUTH PROVIDER ==>
export async function signInWithOAuth(
  provider: OAuthProvider
): Promise<AuthResponse<{ url: string }>> {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET HEADERS LIST
  const headersList = await headers();
  // GET HOST FOR REDIRECT
  const host = headersList.get("host") ?? "localhost:3000";
  // GET PROTOCOL FOR REDIRECT
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  // BUILD ORIGIN FOR REDIRECT
  const origin = `${protocol}://${host}`;
  // GET PROVIDER SCOPES
  const scopes = authConfig.providers[provider]?.enabled
    ? authConfig.providers[provider]?.scopes?.join(" ")
    : undefined;
  // BUILD REDIRECT URL
  const redirectTo = `${origin}${authConfig.routes.callback}`;
  // SIGN IN WITH OAUTH
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      scopes,
    },
  });
  // CHECK IF ERROR OCCURRED
  if (error) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: error.message,
      code: error.code ?? "OAUTH_ERROR",
    };
  }
  // CHECK IF URL EXISTS
  if (!data.url) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: "Failed to get OAuth URL",
      code: "OAUTH_URL_FAILED",
    };
  }
  // RETURN SUCCESS RESPONSE
  return {
    success: true,
    data: { url: data.url },
  };
}

// <== SIGN OUT ==>
export async function signOut(): Promise<AuthResponse> {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // SIGN OUT USER
  const { error } = await supabase.auth.signOut();
  // CHECK IF ERROR OCCURRED
  if (error) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: error.message,
      code: error.code ?? "SIGN_OUT_ERROR",
    };
  }
  // RETURN SUCCESS - LET CLIENT HANDLE REDIRECT
  return {
    success: true,
  };
}

// <== REQUEST PASSWORD RESET ==>
export async function requestPasswordReset(
  input: ForgotPasswordInput
): Promise<AuthResponse> {
  // VALIDATE INPUT
  const validatedFields = forgotPasswordSchema.safeParse(input);
  // CHECK IF INPUT IS VALID
  if (!validatedFields.success) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION_ERROR",
    };
  }
  // DESTRUCTURE VALIDATED DATA
  const { email } = validatedFields.data;
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET ORIGIN FOR REDIRECT
  const headersList = await headers();
  // GET ORIGIN FOR REDIRECT
  const origin = headersList.get("origin") ?? "http://localhost:3000";
  // REQUEST PASSWORD RESET
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}${authConfig.routes.resetPassword}`,
  });
  // CHECK IF ERROR OCCURRED
  if (error) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: error.message,
      code: error.code ?? "RESET_PASSWORD_ERROR",
    };
  }
  // RETURN SUCCESS RESPONSE (ALWAYS RETURN SUCCESS TO PREVENT EMAIL ENUMERATION)
  return {
    success: true,
  };
}

// <== UPDATE PASSWORD ==>
export async function updatePassword(
  input: ResetPasswordInput
): Promise<AuthResponse> {
  // VALIDATE INPUT
  const validatedFields = resetPasswordSchema.safeParse(input);
  // CHECK IF INPUT IS VALID
  if (!validatedFields.success) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION_ERROR",
    };
  }
  // DESTRUCTURE VALIDATED DATA
  const { password } = validatedFields.data;
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // UPDATE PASSWORD
  const { error } = await supabase.auth.updateUser({
    password,
  });
  // CHECK IF ERROR OCCURRED
  if (error) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: error.message,
      code: error.code ?? "UPDATE_PASSWORD_ERROR",
    };
  }
  // RETURN SUCCESS RESPONSE
  return {
    success: true,
  };
}

// <== GET CURRENT USER ==>
export async function getCurrentUser() {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET USER
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // RETURN USER
  return user;
}

// <== GET CURRENT USER PROFILE ==>
export async function getCurrentUserProfile() {
  // GET CURRENT USER
  const user = await getCurrentUser();
  // CHECK IF USER EXISTS
  if (!user) {
    // RETURN NULL
    return null;
  }
  // GET PROFILE
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });
  // RETURN PROFILE
  return profile ?? null;
}

// <== ENSURE PROFILE EXISTS ==>
async function ensureProfileExists(userId: string, email: string) {
  // CHECK IF PROFILE EXISTS
  const existingProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  // RETURN IF PROFILE EXISTS
  if (existingProfile) {
    // UPDATE LAST LOGIN
    await db
      .update(profiles)
      .set({ lastLoginAt: new Date() })
      .where(eq(profiles.userId, userId));
    return;
  }
  // CREATE SUPABASE CLIENT TO GET USER DATA
  const supabase = await createClient();
  // GET USER DATA
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // GENERATE USERNAME FROM EMAIL OR USER DATA
  const baseUsername =
    user?.user_metadata?.user_name ??
    user?.user_metadata?.preferred_username ??
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
    userId,
    username,
    displayName:
      user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? username,
    email,
    avatarUrl: user?.user_metadata?.avatar_url ?? null,
    githubUsername: user?.user_metadata?.user_name ?? null,
    lastLoginAt: new Date(),
  });
}
