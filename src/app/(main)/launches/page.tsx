// <== IMPORTS ==>
import type { Metadata } from "next";
import { LaunchesPageClient } from "./launches-page-client";

// <== PAGE METADATA ==>
export const metadata: Metadata = {
  title: "Launches",
  description:
    "Discover today's hottest project launches. Upvote your favorites and help developers get the recognition they deserve.",
  openGraph: {
    title: "Launches | OpenLaunch",
    description:
      "Discover today's hottest project launches. Upvote your favorites and help developers get the recognition they deserve.",
  },
};

// <== LAUNCHES PAGE ==>
const LaunchesPage = () => {
  // RETURN LAUNCHES PAGE COMPONENT
  return <LaunchesPageClient />;
};

// <== EXPORTING LAUNCHES PAGE ==>
export default LaunchesPage;
