// <== IMPORTS ==>
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/server/actions/articles";
import { ArticleDetailClient } from "./article-detail-client";

// <== PROPS TYPE ==>
interface ArticleDetailPageProps {
  // <== PARAMS ==>
  params: Promise<{ slug: string }>;
}

// <== GENERATE METADATA ==>
export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  // AWAIT PARAMS
  const { slug } = await params;
  // FETCH ARTICLE
  const result = await getArticleBySlug(slug);
  // CHECK IF ARTICLE EXISTS
  if (!result.success || !result.data) {
    // RETURN METADATA
    return {
      // <== TITLE ==>
      title: "Article Not Found",
    };
  }
  // GET ARTICLE
  const article = result.data;
  // RETURN METADATA
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.subtitle || article.title,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.subtitle || article.title,
      images:
        article.ogImageUrl || article.coverImageUrl
          ? [{ url: (article.ogImageUrl || article.coverImageUrl)! }]
          : undefined,
      type: "article",
      authors: [article.author.displayName || article.author.username],
      publishedTime: article.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.subtitle || article.title,
      images:
        article.ogImageUrl || article.coverImageUrl
          ? [(article.ogImageUrl || article.coverImageUrl)!]
          : undefined,
    },
  };
}

// <== ARTICLE DETAIL PAGE ==>
export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  // AWAIT PARAMS
  const { slug } = await params;
  // FETCH ARTICLE
  const result = await getArticleBySlug(slug);
  // CHECK IF ARTICLE EXISTS
  if (!result.success || !result.data) {
    // RETURN 404
    notFound();
  }
  // RETURN ARTICLE DETAIL CLIENT
  return <ArticleDetailClient article={result.data} />;
}
