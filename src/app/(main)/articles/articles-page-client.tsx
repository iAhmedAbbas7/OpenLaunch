// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  ArticleCard,
  ArticleCardSkeleton,
  ArticleFilters,
  ArticleFiltersSkeleton,
} from "@/components/articles";
import type {
  ArticleFiltersInput,
  ArticleSortBy,
} from "@/lib/validations/articles";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, RefreshCw } from "lucide-react";
import { useInfiniteArticles, useArticleTags } from "@/hooks/use-articles";

// <== ARTICLES PAGE CLIENT ==>
export const ArticlesPageClient = () => {
  // FILTERS STATE
  const [filters, setFilters] = useState<ArticleFiltersInput>({});
  // SORT STATE
  const [sortBy, setSortBy] = useState<ArticleSortBy>("newest");
  // FETCH ARTICLES
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteArticles(filters, sortBy, 12);
  // FETCH TAGS
  const { data: tags = [] } = useArticleTags();
  // HANDLE FILTERS CHANGE
  const handleFiltersChange = useCallback((newFilters: ArticleFiltersInput) => {
    // UPDATE FILTERS
    setFilters(newFilters);
  }, []);
  // HANDLE SORT CHANGE
  const handleSortChange = useCallback((newSortBy: ArticleSortBy) => {
    // UPDATE SORT BY
    setSortBy(newSortBy);
  }, []);
  // HANDLE RESET
  const handleReset = useCallback(() => {
    // UPDATE FILTERS
    setFilters({});
    // UPDATE SORT BY
    setSortBy("newest");
  }, []);
  // FLATTEN ARTICLES FROM INFINITE QUERY (FILTER OUT ANY UNDEFINED)
  const articles =
    data?.pages
      .flatMap((page) => page.items ?? [])
      .filter(
        (article): article is NonNullable<typeof article> => !!article?.id
      ) ?? [];
  // TOTAL COUNT
  const totalCount = data?.pages[0]?.total ?? 0;
  // SHOW SKELETON WHILE LOADING OR FETCHING
  const showSkeleton = isLoading || (isFetching && !isFetchingNextPage);
  // RETURN ARTICLES PAGE CLIENT
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="size-10 sm:size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="size-5 sm:size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Articles
              </h1>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                <TrendingUp className="size-3 sm:size-3.5 mr-1" />
                {totalCount > 0 ? `${totalCount} articles` : "Browse"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Discover insights, tutorials, and stories from the developer
              community
            </p>
          </div>
          {/* REFRESH BUTTON */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="ml-auto shrink-0 size-8 sm:size-9"
          >
            <RefreshCw
              className={`size-3.5 sm:size-4 ${
                isFetching ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </div>
      {/* FILTERS */}
      {showSkeleton ? (
        <ArticleFiltersSkeleton />
      ) : (
        <ArticleFilters
          filters={filters}
          sortBy={sortBy}
          availableTags={tags}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          onReset={handleReset}
          isLoading={isFetching}
        />
      )}
      {/* ARTICLES GRID */}
      <div className="mt-6 sm:mt-8">
        {showSkeleton ? (
          // SKELETON GRID
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : articles.length > 0 ? (
          // ARTICLES GRID
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {articles.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} />
              ))}
            </div>

            {/* LOAD MORE */}
            {hasNextPage && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full sm:w-auto"
                >
                  {isFetchingNextPage ? (
                    <>
                      <RefreshCw className="size-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Articles"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          // EMPTY STATE
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="size-16 sm:size-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileText className="size-8 sm:size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              No articles found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-4 sm:mb-6">
              {filters.search || (filters.tags && filters.tags.length > 0)
                ? "Try adjusting your filters or search query to find what you're looking for."
                : "Be the first to share your knowledge with the community!"}
            </p>
            {(filters.search || (filters.tags && filters.tags.length > 0)) && (
              <Button variant="outline" onClick={handleReset}>
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// <== EXPORTING ARTICLES PAGE CLIENT ==>
export default ArticlesPageClient;
