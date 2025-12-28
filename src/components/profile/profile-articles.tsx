// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useArticlesByAuthor } from "@/hooks/use-articles";
import {
  FileText,
  ArrowUpRight,
  Eye,
  Heart,
  MessageSquare,
} from "lucide-react";

// <== PROFILE ARTICLES PROPS ==>
interface ProfileArticlesProps {
  // <== PROFILE ID ==>
  profileId: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROFILE ARTICLES COMPONENT ==>
export const ProfileArticles = ({
  profileId,
  className,
}: ProfileArticlesProps) => {
  // FETCH ARTICLES
  const { data, isLoading, error } = useArticlesByAuthor(profileId);
  // HANDLE LOADING
  if (isLoading) {
    // RETURN PROFILE ARTICLES SKELETON
    return <ProfileArticlesSkeleton className={className} />;
  }
  // HANDLE ERROR
  if (error) {
    // RETURN ERROR MESSAGE
    return (
      <div
        className={cn(
          "text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground",
          className
        )}
      >
        Failed to load articles
      </div>
    );
  }
  // HANDLE EMPTY
  if (!data || data.items.length === 0) {
    // RETURN EMPTY MESSAGE
    return (
      <div className={cn("text-center py-8 sm:py-12", className)}>
        <FileText className="size-10 sm:size-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-muted-foreground">
          No articles yet
        </p>
      </div>
    );
  }
  // RETURN PROFILE ARTICLES COMPONENT
  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {data.items.map((article) => (
        <Card
          key={article.id}
          className="overflow-hidden hover:bg-secondary/50 transition-all duration-200 group"
        >
          <Link
            href={`/articles/${article.slug}`}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4"
          >
            {/* COVER IMAGE */}
            {article.coverImageUrl && (
              <div className="relative w-full sm:w-40 md:w-48 aspect-video sm:aspect-4/3 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={article.coverImageUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 192px"
                  className="object-cover"
                />
              </div>
            )}
            {/* CONTENT */}
            <div className="flex-1 min-w-0">
              {/* TAGS */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                  {article.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {/* TITLE */}
              <div className="flex items-start gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-semibold font-heading line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <ArrowUpRight className="size-3.5 sm:size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </div>
              {/* SUBTITLE */}
              {article.subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5 sm:mt-1">
                  {article.subtitle}
                </p>
              )}
              {/* META */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-xs text-muted-foreground">
                {/* DATE */}
                <span>
                  {formatDistanceToNow(
                    new Date(article.publishedAt ?? article.createdAt),
                    {
                      addSuffix: true,
                    }
                  )}
                </span>
                {/* READ TIME */}
                {article.readingTimeMinutes && (
                  <>
                    <span className="text-border">•</span>
                    <span>{article.readingTimeMinutes} min read</span>
                  </>
                )}
                {/* STATS */}
                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <Eye className="size-3 sm:size-3.5" />
                    {article.viewsCount}
                  </span>
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <Heart className="size-3 sm:size-3.5" />
                    {article.likesCount}
                  </span>
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <MessageSquare className="size-3 sm:size-3.5" />
                    {article.commentsCount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
};

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== ARTICLE CARD SKELETON ==>
const ArticleCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4">
        {/* COVER IMAGE SKELETON */}
        <Skeleton className="w-full sm:w-40 md:w-48 aspect-video sm:aspect-4/3 rounded-lg shrink-0" />
        {/* CONTENT SKELETON */}
        <div className="flex-1 min-w-0">
          {/* TAGS SKELETON */}
          <div className="flex gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
            <Skeleton className="h-4 sm:h-5 w-12 sm:w-14 rounded-full" />
            <Skeleton className="h-4 sm:h-5 w-16 sm:w-18 rounded-full" />
          </div>
          {/* TITLE SKELETON */}
          <Skeleton className="h-4 sm:h-5 w-3/4 mb-1 sm:mb-1.5" />
          <Skeleton className="h-4 sm:h-5 w-1/2" />
          {/* SUBTITLE SKELETON */}
          <Skeleton className="h-3 sm:h-4 w-full mt-1.5 sm:mt-2" />
          {/* META SKELETON */}
          <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3">
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-10 ml-auto" />
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-10" />
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-10" />
          </div>
        </div>
      </div>
    </Card>
  );
};

// <== PROFILE ARTICLES SKELETON ==>
export const ProfileArticlesSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURN PROFILE ARTICLES SKELETON
  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
};
