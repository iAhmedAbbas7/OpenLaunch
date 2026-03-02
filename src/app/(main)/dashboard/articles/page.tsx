// <== IMPORTS ==>
import { Suspense } from "react";
import type { Metadata } from "next";
import { MyArticlesClient } from "./my-articles-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "My Articles",
  // <== DESCRIPTION ==>
  description: "Manage your articles and drafts.",
};

// <== MY ARTICLES PAGE ==>
export default function MyArticlesPage() {
  // RETURNING PAGE
  return (
    <Suspense fallback={<div />}>
      <MyArticlesClient />
    </Suspense>
  );
}
