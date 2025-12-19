// <== IMPORTS ==>
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

// <== UPDATE SESSION ==>
export async function updateSession(request: NextRequest) {
  // CREATE INITIAL RESPONSE
  let supabaseResponse = NextResponse.next({
    request,
  });
  // SKIP IF SUPABASE IS NOT CONFIGURED
  if (!supabaseUrl || !supabaseAnonKey) {
    // RETURN RESPONSE
    return supabaseResponse;
  }
  // CREATE SUPABASE CLIENT FOR MIDDLEWARE
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    // COOKIE MANAGEMENT
    cookies: {
      // GET ALL COOKIES
      getAll() {
        // GET ALL COOKIES FROM REQUEST
        return request.cookies.getAll();
      },
      // SET ALL COOKIES
      setAll(cookiesToSet) {
        // SET ALL COOKIES TO REQUEST
        cookiesToSet.forEach(({ name, value }) =>
          // SET COOKIES ON REQUEST
          request.cookies.set(name, value)
        );
        // CREATE NEW RESPONSE WITH UPDATED COOKIES
        supabaseResponse = NextResponse.next({
          request,
        });
        // SET COOKIES ON RESPONSE
        cookiesToSet.forEach(({ name, value, options }) =>
          // SET COOKIES ON RESPONSE
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });
  // REFRESH SESSION
  await supabase.auth.getUser();
  // RETURN RESPONSE
  return supabaseResponse;
}

// <== GET SESSION FROM REQUEST ==>
export async function getSessionFromRequest(request: NextRequest) {
  // SKIP IF SUPABASE IS NOT CONFIGURED
  if (!supabaseUrl || !supabaseAnonKey) {
    // RETURN NULL
    return null;
  }
  // CREATE SUPABASE CLIENT FOR MIDDLEWARE
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    // COOKIE MANAGEMENT
    cookies: {
      // GET ALL COOKIES
      getAll() {
        // GET ALL COOKIES FROM REQUEST
        return request.cookies.getAll();
      },
      // SET ALL COOKIES
      setAll() {
        // IGNORE ERROR
      },
    },
  });
  // GET USER FROM SUPABASE
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // RETURN USER
  return user;
}
