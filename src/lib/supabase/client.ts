// <== IMPORTS ==>
import { createBrowserClient } from "@supabase/ssr";

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
export const createClient = () => {
  // CREATE BROWSER CLIENT
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
};

// <== TYPE EXPORTS ==>
export type SupabaseClient = ReturnType<typeof createClient>;
