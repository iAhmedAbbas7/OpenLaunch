// <== IMPORTS ==>
import { Suspense } from "react";
import type { Metadata } from "next";
import { LeaderboardPageSkeleton } from "./loading";
import { LeaderboardPageClient } from "./leaderboard-page-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Leaderboard",
  // <== DESCRIPTION ==>
  description:
    "See the top developers on OpenLaunch. Compete for the highest reputation, most project launches, and biggest impact in the developer community.",
  // <== OPEN GRAPH ==>
  openGraph: {
    // <== TITLE ==>
    title: "Leaderboard | OpenLaunch",
    // <== DESCRIPTION ==>
    description:
      "See the top developers on OpenLaunch. Compete for the highest reputation, most project launches, and biggest impact in the developer community.",
  },
};

// <== LEADERBOARD PAGE COMPONENT ==>
const LeaderboardPage = () => {
  // RETURNING LEADERBOARD PAGE
  return (
    <Suspense fallback={<LeaderboardPageSkeleton />}>
      <LeaderboardPageClient />
    </Suspense>
  );
};

// <== EXPORTING LEADERBOARD PAGE ==>
export default LeaderboardPage;
