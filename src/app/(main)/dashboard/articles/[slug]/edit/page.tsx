// <== IMPORTS ==>
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/server/actions/articles";
import { ArticleEditorForm } from "@/components/articles/editor";

// <== EDIT ARTICLE PAGE PROPS ==>
interface EditArticlePageProps {
  // <== PARAMS ==>
  params: Promise<{ slug: string }>;
}

// <== GENERATE METADATA ==>
export async function generateMetadata({
  params,
}: EditArticlePageProps): Promise<Metadata> {
  // AWAIT PARAMS
  const { slug } = await params;
  // FETCH ARTICLE
  const result = await getArticleBySlug(slug);
  // CHECK IF ARTICLE EXISTS
  if (!result.success || !result.data) {
    // RETURN DEFAULT METADATA
    return {
      title: "Article Not Found",
    };
  }
  // RETURN METADATA
  return {
    title: `Edit: ${result.data.title}`,
    description: "Edit your article.",
  };
}

// <== EDIT ARTICLE PAGE ==>
export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  // AWAIT PARAMS
  const { slug } = await params;
  // FETCH ARTICLE
  const result = await getArticleBySlug(slug);
  // CHECK IF ARTICLE EXISTS
  if (!result.success || !result.data) {
    // RETURN 404
    notFound();
  }
  // RETURN EDIT ARTICLE PAGE
  return <ArticleEditorForm article={result.data} />;
}
