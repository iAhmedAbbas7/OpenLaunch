// <== IMPORTS ==>
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AchievementsClient } from "./achievements-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "My Achievements",
  // <== DESCRIPTION ==>
  description: "View your unlocked achievements and track your progress",
};

// <== MY ACHIEVEMENTS PAGE ==>
const MyAchievementsPage = async () => {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET USER
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // IF NO USER, REDIRECT TO SIGN IN
  if (!user) {
    // REDIRECT TO SIGN IN
    redirect("/sign-in");
  }
  // RETURNING ACHIEVEMENTS CLIENT
  return <AchievementsClient />;
};

// <== EXPORTING MY ACHIEVEMENTS PAGE ==>
export default MyAchievementsPage;
