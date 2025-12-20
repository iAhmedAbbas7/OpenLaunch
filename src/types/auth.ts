// <== IMPORTS ==>
import type { User } from "@supabase/supabase-js";

// <== AUTH USER TYPE ==>
export interface AuthUser {
  // <== USER ID ==>
  id: string;
  // <== EMAIL ==>
  email: string;
  // <== EMAIL CONFIRMED ==>
  emailConfirmed: boolean;
  // <== CREATED AT ==>
  createdAt: string;
  // <== LAST SIGN IN AT ==>
  lastSignInAt: string | null;
  // <== APP METADATA ==>
  appMetadata: {
    // <== PROVIDER ==>
    provider?: string;
    // <== PROVIDERS ==>
    providers?: string[];
  };
  // <== USER METADATA ==>
  userMetadata: {
    // <== AVATAR URL ==>
    avatarUrl?: string;
    // <== FULL NAME ==>
    fullName?: string;
    // <== USERNAME ==>
    username?: string;
    // <== NAME ==>
    name?: string;
    // <== PREFERRED USERNAME ==>
    preferredUsername?: string;
  };
}

// <== AUTH STATE TYPE ==>
export interface AuthState {
  // <== USER ==>
  user: AuthUser | null;
  // <== PROFILE ==>
  profile: UserProfile | null;
  // <== IS LOADING ==>
  isLoading: boolean;
  // <== IS AUTHENTICATED ==>
  isAuthenticated: boolean;
}

// <== USER PROFILE TYPE ==>
export interface UserProfile {
  // <== PROFILE ID ==>
  id: string;
  // <== USER ID (SUPABASE AUTH USER ID) ==>
  userId: string;
  // <== USERNAME ==>
  username: string;
  // <== DISPLAY NAME ==>
  displayName: string | null;
  // <== EMAIL ==>
  email: string;
  // <== BIO ==>
  bio: string | null;
  // <== AVATAR URL ==>
  avatarUrl: string | null;
  // <== BANNER URL ==>
  bannerUrl: string | null;
  // <== WEBSITE ==>
  website: string | null;
  // <== LOCATION ==>
  location: string | null;
  // <== GITHUB USERNAME ==>
  githubUsername: string | null;
  // <== TWITTER USERNAME ==>
  twitterUsername: string | null;
  // <== IS VERIFIED ==>
  isVerified: boolean;
  // <== IS PRO ==>
  isPro: boolean;
  // <== REPUTATION SCORE ==>
  reputationScore: number;
  // <== FOLLOWERS COUNT ==>
  followersCount: number;
  // <== FOLLOWING COUNT ==>
  followingCount: number;
  // <== CURRENT STREAK ==>
  currentStreak: number;
  // <== LONGEST STREAK ==>
  longestStreak: number;
  // <== CREATED AT ==>
  createdAt: string;
}

// <== SIGN UP DATA TYPE ==>
export interface SignUpData {
  // <== EMAIL ==>
  email: string;
  // <== PASSWORD ==>
  password: string;
  // <== USERNAME ==>
  username: string;
  // <== DISPLAY NAME (OPTIONAL) ==>
  displayName?: string;
}

// <== SIGN IN DATA TYPE ==>
export interface SignInData {
  // <== EMAIL ==>
  email: string;
  // <== PASSWORD ==>
  password: string;
}

// <== RESET PASSWORD DATA TYPE ==>
export interface ResetPasswordData {
  // <== EMAIL ==>
  email: string;
}

// <== UPDATE PASSWORD DATA TYPE ==>
export interface UpdatePasswordData {
  // <== NEW PASSWORD ==>
  password: string;
}

// <== AUTH RESPONSE TYPE ==>
export interface AuthResponse<T = undefined> {
  // <== SUCCESS ==>
  success: boolean;
  // <== DATA ==>
  data?: T;
  // <== ERROR MESSAGE ==>
  error?: string;
  // <== ERROR CODE ==>
  code?: string;
}

// <== OAUTH PROVIDER TYPE ==>
export type OAuthProvider = "github" | "google";

// <== TRANSFORM SUPABASE USER TO AUTH USER ==>
export function transformSupabaseUser(user: User): AuthUser {
  // RETURNING TRANSFORMED USER
  return {
    id: user.id,
    email: user.email ?? "",
    emailConfirmed: !!user.email_confirmed_at,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    appMetadata: {
      provider: user.app_metadata?.provider,
      providers: user.app_metadata?.providers,
    },
    userMetadata: {
      avatarUrl: user.user_metadata?.avatar_url,
      fullName: user.user_metadata?.full_name,
      username: user.user_metadata?.user_name,
      name: user.user_metadata?.name,
      preferredUsername: user.user_metadata?.preferred_username,
    },
  };
}
