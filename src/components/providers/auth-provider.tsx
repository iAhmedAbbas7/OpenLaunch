// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import type { UserProfile } from "@/types/auth";
import { useAuthStore } from "@/stores/auth-store";
import { createBrowserClient } from "@supabase/ssr";
import { transformSupabaseUser } from "@/types/auth";
import { useCallback, useEffect, useRef } from "react";
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
  // REF TO TRACK IF INITIALIZED
  const initializedRef = useRef(false);
  // GET AUTH STORE
  const { setUser, setProfile, setLoading, setInitialized, reset } =
    useAuthStore();
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
    // CHECK IF ALREADY INITIALIZED (USE REF TO PREVENT STRICT MODE DOUBLE INIT)
    if (initializedRef.current) return;
    // MARK AS INITIALIZED
    initializedRef.current = true;
    // GET SUPABASE CLIENT
    const supabase = getSupabaseClient();
    // GET INITIAL SESSION
    const initializeAuth = async () => {
      // SET LOADING
      setLoading(true);
      try {
        // USE getUser() INSTEAD OF getSession() FOR PROPER TOKEN VALIDATION
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        // CHECK IF USER EXISTS AND NO ERROR
        if (user && !error) {
          // SET USER
          setUser(transformSupabaseUser(user));
          // FETCH PROFILE
          await fetchProfile(user.id);
        }
      } catch (error) {
        // LOG ERROR
        console.error("Failed to initialize auth:", error);
      } finally {
        // SET INITIALIZED
        setInitialized(true);
        // SET LOADING
        setLoading(false);
      }
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
          // RESET STATE
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
        } else if (event === "INITIAL_SESSION" && !session) {
          // NO INITIAL SESSION - USER IS NOT LOGGED IN
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
  }, [setUser, setProfile, setLoading, setInitialized, reset, fetchProfile]);

  // RETURNING CHILDREN
  return <>{children}</>;
};
