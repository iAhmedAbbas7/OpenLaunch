// <== IMPORTS ==>
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// <== SUPABASE URL VALIDATION ==>
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// <== SUPABASE ANON KEY VALIDATION ==>
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// <== THROW AN ERROR IF THE SUPABASE URL OR ANON KEY IS NOT SET ==>
if (!supabaseUrl || !supabaseAnonKey) {
  // THROW AN ERROR IF THE SUPABASE URL OR ANON KEY IS NOT SET
  throw new Error(
    "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// <== CREATE CLIENT ==>
export const createClient = async () => {
  // GET COOKIE STORE
  const cookieStore = await cookies();
  // CREATE SERVER CLIENT
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    // COOKIE MANAGEMENT
    cookies: {
      // GET ALL COOKIES
      getAll() {
        // GET ALL COOKIES FROM COOKIE STORE
        return cookieStore.getAll();
      },
      // SET ALL COOKIES
      setAll(cookiesToSet) {
        // SET ALL COOKIES TO COOKIE STORE
        try {
          // SET EACH COOKIE TO COOKIE STORE
          cookiesToSet.forEach(({ name, value, options }) =>
            // SET EACH COOKIE TO COOKIE STORE
            cookieStore.set(name, value, options)
          );
        } catch {
          // IGNORE ERROR
        }
      },
    },
  });
};

// <== CREATE ADMIN CLIENT ==>
export const createAdminClient = async () => {
  // GET SERVICE ROLE KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // THROW AN ERROR IF THE SERVICE ROLE KEY IS NOT SET
  if (!serviceRoleKey) {
    // THROW AN ERROR IF THE SERVICE ROLE KEY IS NOT SET
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable for admin client"
    );
  }
  // CREATE SERVER CLIENT
  return createServerClient(supabaseUrl!, serviceRoleKey, {
    // COOKIE MANAGEMENT
    cookies: {
      // GET ALL COOKIES
      getAll() {
        // RETURN EMPTY ARRAY
        return [];
      },
      // SET ALL COOKIES
      setAll() {
        // IGNORE ERROR
      },
    },
    // AUTH MANAGEMENT
    auth: {
      // DISABLE AUTO REFRESH FOR ADMIN CLIENT
      autoRefreshToken: false,
      // DISABLE PERSIST SESSION FOR ADMIN CLIENT
      persistSession: false,
    },
  });
};

// <== TYPE EXPORTS ==>
export type SupabaseAdminClient = ReturnType<typeof createAdminClient>;
// <== TYPE EXPORTS ==>
export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
