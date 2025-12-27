// <== IMPORTS ==>
import type { Metadata } from "next";
import { AchievementsClient } from "./achievements-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "My Achievements",
  // <== DESCRIPTION ==>
  description: "View your unlocked achievements and track your progress",
};

// <== MY ACHIEVEMENTS PAGE ==>
const MyAchievementsPage = () => {
  // RETURNING ACHIEVEMENTS CLIENT
  return <AchievementsClient />;
};

// <== EXPORTING MY ACHIEVEMENTS PAGE ==>
export default MyAchievementsPage;
