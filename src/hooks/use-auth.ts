// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import type {
  SignInInput,
  SignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/validations/auth";
import {
  signIn as signInAction,
  signUp as signUpAction,
  signOut as signOutAction,
  signInWithOAuth as signInWithOAuthAction,
  requestPasswordReset as requestPasswordResetAction,
  updatePassword as updatePasswordAction,
} from "@/server/actions/auth";
import { authConfig } from "@/config/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { createBrowserClient } from "@supabase/ssr";
import { transformSupabaseUser } from "@/types/auth";
import { useCallback, useEffect, useTransition } from "react";
import type { AuthResponse, OAuthProvider, UserProfile } from "@/types/auth";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

// <== SUPABASE CLIENT SINGLETON ==>
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

// <== GET SUPABASE CLIENT ==>
function getSupabaseClient() {
  // CHECK IF CLIENT EXISTS
  if (!supabaseClient) {
    // CREATE CLIENT
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  // RETURN CLIENT
  return supabaseClient;
}

// <== USE AUTH HOOK ==>
export function useAuth() {
  // GET ROUTER
  const router = useRouter();
  // GET TRANSITION
  const [isPending, startTransition] = useTransition();
  // GET AUTH STORE
  const {
    user,
    profile,
    isLoading,
    isInitialized,
    setUser,
    setProfile,
    setLoading,
    setInitialized,
    reset,
  } = useAuthStore();
  // <== FETCH PROFILE ==>
  const fetchProfile = useCallback(
    async (userId: string) => {
      // FETCH PROFILE FROM API
      try {
        // FETCH PROFILE
        const response = await fetch(`/api/auth/profile?userId=${userId}`);
        // CHECK IF RESPONSE IS OK
        if (response.ok) {
          // GET PROFILE DATA
          const data = await response.json();
          // SET PROFILE
          setProfile(data.profile as UserProfile);
        }
      } catch (error) {
        // LOG ERROR
        console.error("Failed to fetch profile:", error);
      }
    },
    [setProfile]
  );
  // <== INITIALIZE AUTH ==>
  useEffect(() => {
    // CHECK IF ALREADY INITIALIZED
    if (isInitialized) return;
    // GET SUPABASE CLIENT
    const supabase = getSupabaseClient();
    // GET INITIAL SESSION
    const initializeAuth = async () => {
      // SET LOADING
      setLoading(true);
      // GET SESSION
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // CHECK IF SESSION EXISTS
      if (session?.user) {
        // SET USER
        setUser(transformSupabaseUser(session.user));
        // FETCH PROFILE
        await fetchProfile(session.user.id);
      }
      // SET INITIALIZED
      setInitialized(true);
      // SET LOADING
      setLoading(false);
    };
    // INITIALIZE AUTH
    initializeAuth();
    // SUBSCRIBE TO AUTH CHANGES
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // HANDLE SIGN OUT EVENT
        if (event === "SIGNED_OUT") {
          // RESET STATE COMPLETELY
          reset();
          // SET INITIALIZED
          setInitialized(true);
          // SET LOADING
          setLoading(false);
          // RETURN
          return;
        }
        // CHECK IF SESSION EXISTS
        if (session?.user) {
          // SET USER
          setUser(transformSupabaseUser(session.user));
          // FETCH PROFILE ON SIGN IN OR TOKEN REFRESH
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            // FETCH PROFILE
            await fetchProfile(session.user.id);
          }
        } else {
          // RESET STATE (NO SESSION)
          reset();
          // SET INITIALIZED
          setInitialized(true);
          // SET LOADING
          setLoading(false);
        }
      }
    );
    // CLEANUP SUBSCRIPTION
    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, setUser, setLoading, setInitialized, reset, fetchProfile]);
  // <== SIGN IN ==>
  const signIn = useCallback(
    async (input: SignInInput) => {
      // SET LOADING STATE
      setLoading(true);
      // CALL SIGN IN ACTION
      const result = await signInAction(input);
      // CHECK IF SUCCESSFUL
      if (result.success) {
        // GET SUPABASE CLIENT
        const supabase = getSupabaseClient();
        // REFRESH THE BROWSER CLIENT'S SESSION FROM SERVER COOKIES
        const {
          data: { session },
        } = await supabase.auth.getSession();
        // IF SESSION EXISTS, UPDATE LOCAL STATE
        if (session?.user) {
          // SET USER IN STORE
          setUser(transformSupabaseUser(session.user));
          // FETCH PROFILE
          await fetchProfile(session.user.id);
        }
        // START TRANSITION
        startTransition(() => {
          // NAVIGATE TO DEFAULT REDIRECT
          router.push(authConfig.routes.defaultRedirect);
          // REFRESH PAGE
          router.refresh();
        });
      }
      // SET LOADING FALSE
      setLoading(false);
      // RETURN RESULT
      return result;
    },
    [router, setUser, setLoading, fetchProfile]
  );
  // <== SIGN UP ==>
  const signUp = useCallback(async (input: SignUpInput) => {
    // CALL SIGN UP ACTION
    const result = await signUpAction(input);
    // RETURN RESULT
    return result;
  }, []);
  // <== SIGN IN WITH OAUTH ==>
  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    // CALL SIGN IN WITH OAUTH ACTION
    const result = await signInWithOAuthAction(provider);
    // CHECK IF SUCCESSFUL
    if (result.success && result.data?.url) {
      // REDIRECT TO OAUTH URL
      window.location.href = result.data.url;
    }
    // RETURN RESULT
    return result;
  }, []);
  // <== SIGN OUT ==>
  const signOut = useCallback(async () => {
    // GET SUPABASE CLIENT
    const supabase = getSupabaseClient();
    // SIGN OUT ON BROWSER CLIENT FIRST
    await supabase.auth.signOut();
    // CALL SERVER ACTION TO CLEAR SERVER-SIDE SESSION/COOKIES
    await signOutAction();
    // RESET STORE STATE
    reset();
    // HARD REDIRECT TO HOME PAGE
    window.location.href = "/";
  }, [reset]);
  // <== REQUEST PASSWORD RESET ==>
  const requestPasswordReset = useCallback(
    async (input: ForgotPasswordInput) => {
      // CALL REQUEST PASSWORD RESET ACTION
      const result = await requestPasswordResetAction(input);
      // RETURN RESULT
      return result;
    },
    []
  );
  // <== UPDATE PASSWORD ==>
  const updatePassword = useCallback(
    async (input: ResetPasswordInput): Promise<AuthResponse> => {
      // CALL UPDATE PASSWORD ACTION
      const result = await updatePasswordAction(input);
      // CHECK IF SUCCESSFUL
      if (result.success) {
        // START TRANSITION
        startTransition(() => {
          // NAVIGATE TO SIGN IN
          router.push(authConfig.routes.signIn);
        });
      }
      // RETURN RESULT
      return result;
    },
    [router]
  );
  // <== RETURN AUTH HOOK ==>
  return {
    user,
    profile,
    isLoading: isLoading || isPending,
    isAuthenticated: !!user,
    isInitialized,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    requestPasswordReset,
    updatePassword,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}
