// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  ArticleHeader,
  ArticleContent,
  ArticleActionsBar,
  ReadingProgress,
  TableOfContents,
} from "@/components/articles";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIncrementArticleViews } from "@/hooks/use-articles";
import type { ArticleWithAuthor } from "@/server/actions/articles";

// <== ARTICLE DETAIL CLIENT PROPS ==>
interface ArticleDetailClientProps {
  // <== ARTICLE ==>
  article: ArticleWithAuthor;
}

// <== ARTICLE DETAIL CLIENT COMPONENT ==>
export const ArticleDetailClient = ({ article }: ArticleDetailClientProps) => {
  // INCREMENT VIEWS MUTATION
  const incrementViews = useIncrementArticleViews();
  // REF TO STORE MUTATE FUNCTION
  const incrementViewsRef = useRef(incrementViews.mutate);
  // UPDATE REF WHEN MUTATE CHANGES
  useEffect(() => {
    // UPDATE REF WHEN MUTATE CHANGES
    incrementViewsRef.current = incrementViews.mutate;
  }, [incrementViews.mutate]);
  // INCREMENT VIEWS ON MOUNT USING REF
  useEffect(() => {
    // INCREMENT VIEWS USING REF
    incrementViewsRef.current(article.id);
  }, [article.id, incrementViewsRef]);
  // RETURN ARTICLE DETAIL CLIENT
  return (
    <>
      {/* READING PROGRESS */}
      <ReadingProgress />
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* BACK LINK */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="size-3.5 sm:size-4" />
          Back to Articles
        </Link>
        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 sm:gap-8">
          {/* ARTICLE MAIN */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* HEADER */}
            <ArticleHeader article={article} />

            {/* ACTIONS BAR - MOBILE */}
            <div className="lg:hidden mt-4 sm:mt-6">
              <ArticleActionsBar
                articleId={article.id}
                articleSlug={article.slug}
                likesCount={article.likesCount}
                bookmarksCount={article.bookmarksCount}
                commentsCount={article.commentsCount}
              />
            </div>
            {/* ARTICLE CONTENT */}
            <div className="mt-6 sm:mt-8">
              {article.content ? (
                <ArticleContent content={article.content} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>This article has no content yet.</p>
                </div>
              )}
            </div>
            {/* COMMENTS SECTION PLACEHOLDER */}
            <div id="comments" className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                Comments ({article.commentsCount})
              </h2>
              <Card className="p-6 sm:p-8 text-center">
                <div className="size-12 sm:size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <User className="size-6 sm:size-8 text-muted-foreground" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Comments feature coming soon in Phase 6!
                </p>
                <Button variant="outline" size="sm" disabled>
                  Add Comment
                </Button>
              </Card>
            </div>
          </motion.main>
          {/* SIDEBAR */}
          <aside className="hidden lg:block space-y-6">
            {/* STICKY CONTAINER */}
            <div className="sticky top-24 space-y-6">
              {/* ACTIONS */}
              <Card className="p-4">
                <ArticleActionsBar
                  articleId={article.id}
                  articleSlug={article.slug}
                  likesCount={article.likesCount}
                  bookmarksCount={article.bookmarksCount}
                  commentsCount={article.commentsCount}
                  className="flex-wrap"
                />
              </Card>
              {/* TABLE OF CONTENTS */}
              {article.content && <TableOfContents content={article.content} />}
              {/* AUTHOR CARD */}
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3">About the Author</h3>
                <Link
                  href={`/u/${article.author.username}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="size-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden relative">
                    {article.author.avatarUrl ? (
                      <Image
                        src={article.author.avatarUrl}
                        alt={
                          article.author.displayName ?? article.author.username
                        }
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <User className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {article.author.displayName ?? article.author.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{article.author.username}
                    </p>
                  </div>
                </Link>
                {article.author.bio && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-3">
                    {article.author.bio}
                  </p>
                )}
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

// <== EXPORTING ARTICLE DETAIL CLIENT ==>
export default ArticleDetailClient;
