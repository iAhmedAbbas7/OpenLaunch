// <== IMPORTS ==>
import type { Metadata } from "next";
import { ArticlesPageClient } from "./articles-page-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Articles",
  // <== DESCRIPTION ==>
  description:
    "Discover insights, tutorials, and stories from the developer community. Browse articles on web development, programming, and technology.",
  // <== OPEN GRAPH ==>
  openGraph: {
    // <== TITLE ==>
    title: "Articles | OpenLaunch",
    // <== DESCRIPTION ==>
    description:
      "Discover insights, tutorials, and stories from the developer community.",
  },
};

// <== ARTICLES PAGE ==>
export default function ArticlesPage() {
  // RETURN ARTICLES PAGE CLIENT
  return <ArticlesPageClient />;
}
