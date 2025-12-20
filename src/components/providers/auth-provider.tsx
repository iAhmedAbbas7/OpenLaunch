// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useCallback, useEffect } from "react";
import type { UserProfile } from "@/types/auth";
import { useAuthStore } from "@/stores/auth-store";
import { createBrowserClient } from "@supabase/ssr";
import { transformSupabaseUser } from "@/types/auth";
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

// <== AUTH PROVIDER PROPS ==>
interface AuthProviderProps {
  // CHILDREN
  children: React.ReactNode;
}

// <== AUTH PROVIDER COMPONENT ==>
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // GET AUTH STORE
  const {
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
        // CHECK IF SESSION EXISTS
        if (session?.user) {
          // SET USER
          setUser(transformSupabaseUser(session.user));
          // FETCH PROFILE ON SIGN IN
          if (event === "SIGNED_IN") {
            // FETCH PROFILE
            await fetchProfile(session.user.id);
          }
        } else {
          // RESET STATE
          reset();
          // SET INITIALIZED
          setInitialized(true);
        }
      }
    );
    // CLEANUP SUBSCRIPTION
    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, setUser, setLoading, setInitialized, reset, fetchProfile]);

  // RETURNING CHILDREN
  return <>{children}</>;
};
