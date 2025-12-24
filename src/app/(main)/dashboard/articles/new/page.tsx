// <== IMPORTS ==>
import type { Metadata } from "next";
import { ArticleEditorForm } from "@/components/articles/editor";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "New Article",
  // <== DESCRIPTION ==>
  description: "Create a new article to share with the community.",
};

// <== NEW ARTICLE PAGE ==>
export default function NewArticlePage() {
  // RETURN NEW ARTICLE PAGE
  return <ArticleEditorForm />;
}
