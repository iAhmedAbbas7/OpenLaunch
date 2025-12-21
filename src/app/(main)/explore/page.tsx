// <== IMPORTS ==>
import type { Metadata } from "next";
import { ExplorePageClient } from "./explore-page-client";

// <== PAGE METADATA ==>
export const metadata: Metadata = {
  title: "Explore Projects",
  description:
    "Discover amazing projects built by developers from around the world. Find open source projects, web apps, tools, and more.",
  openGraph: {
    title: "OpenLaunch | Explore Projects",
    description:
      "Discover amazing projects built by developers from around the world. Find open source projects, web apps, tools, and more.",
  },
};

// <== EXPLORE PAGE ==>
const ExplorePage = () => {
  // RETURN EXPLORE PAGE COMPONENT
  return <ExplorePageClient />;
};

export default ExplorePage;
