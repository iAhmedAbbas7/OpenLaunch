// <== IMPORTS ==>
import type { Metadata } from "next";
import { SearchPageClient } from "./search-page-client";

// <== PAGE METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Search",
  // <== DESCRIPTION ==>
  description:
    "Search for projects, articles, and users on OpenLaunch. Find what you're looking for across the entire platform.",
  // <== OPEN GRAPH ==>
  openGraph: {
    // <== TITLE ==>
    title: "Search | OpenLaunch",
    // <== DESCRIPTION ==>
    description:
      "Search for projects, articles, and users on OpenLaunch. Find what you're looking for across the entire platform.",
  },
};

// <== SEARCH PAGE ==>
const SearchPage = () => {
  // RETURN SEARCH PAGE COMPONENT
  return <SearchPageClient />;
};

// <== EXPORTING SEARCH PAGE ==>
export default SearchPage;
