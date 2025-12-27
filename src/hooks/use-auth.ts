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
import { useCallback, useTransition } from "react";
import type { AuthResponse, OAuthProvider, UserProfile } from "@/types/auth";

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
    setProfile,
    setLoading,
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
  // <== SIGN IN ==>
  const signIn = useCallback(
    async (input: SignInInput) => {
      // SET LOADING STATE
      setLoading(true);
      // CALL SIGN IN ACTION
      const result = await signInAction(input);
      // CHECK IF SUCCESSFUL
      if (result.success) {
        // REDIRECT TO DEFAULT REDIRECT
        window.location.href = authConfig.routes.defaultRedirect;
        // DON'T SET LOADING FALSE - PAGE WILL RELOAD
        return result;
      }
      // SET LOADING FALSE ON ERROR
      setLoading(false);
      // RETURN RESULT
      return result;
    },
    [setLoading]
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
