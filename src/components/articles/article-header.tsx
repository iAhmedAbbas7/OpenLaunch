// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Clock,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import type { ArticleWithAuthor } from "@/server/actions/articles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== ARTICLE HEADER PROPS ==>
interface ArticleHeaderProps {
  // <== ARTICLE ==>
  article: ArticleWithAuthor;
  // <== CLASS NAME ==>
  className?: string;
}

// <== ARTICLE HEADER COMPONENT ==>
export const ArticleHeader = ({ article, className }: ArticleHeaderProps) => {
  // FORMAT PUBLISHED DATE
  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "MMMM d, yyyy")
    : format(new Date(article.createdAt), "MMMM d, yyyy");
  // FORMAT RELATIVE DATE
  const relativeDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : formatDistanceToNow(new Date(article.createdAt), { addSuffix: true });
  // RETURN ARTICLE HEADER COMPONENT
  return (
    // ARTICLE HEADER CONTAINER
    <header className={cn("space-y-4 sm:space-y-6", className)}>
      {/* COVER IMAGE */}
      {article.coverImageUrl && (
        <div className="relative aspect-video sm:aspect-21/9 rounded-lg sm:rounded-xl overflow-hidden">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      {/* TAGS */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {article.tags.map((tag) => (
            <Link key={tag} href={`/articles?tag=${encodeURIComponent(tag)}`}>
              <Badge
                variant="secondary"
                className="text-xs sm:text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
        {article.title}
      </h1>
      {/* SUBTITLE */}
      {article.subtitle && (
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
          {article.subtitle}
        </p>
      )}
      {/* AUTHOR AND META */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 sm:pt-4 border-t">
        {/* AUTHOR */}
        <Link
          href={`/u/${article.author.username}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="size-10 sm:size-12">
            <AvatarImage src={article.author.avatarUrl ?? undefined} />
            <AvatarFallback className="text-sm sm:text-base">
              {article.author.displayName?.[0] ??
                article.author.username?.[0] ??
                "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm sm:text-base">
              {article.author.displayName ?? article.author.username}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              @{article.author.username}
            </p>
          </div>
        </Link>
        {/* META INFO */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          {/* DATE */}
          <span className="flex items-center gap-1.5" title={publishedDate}>
            <Calendar className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">{publishedDate}</span>
            <span className="sm:hidden">{relativeDate}</span>
          </span>
          {/* READING TIME */}
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 sm:size-4" />
            {article.readingTimeMinutes} min read
          </span>
          {/* VIEWS */}
          <span className="flex items-center gap-1.5">
            <Eye className="size-3.5 sm:size-4" />
            {article.viewsCount.toLocaleString()}
          </span>
        </div>
      </div>
      {/* STATS BAR */}
      <div className="flex items-center gap-4 sm:gap-6 py-3 sm:py-4 border-y text-muted-foreground">
        <span className="flex items-center gap-1.5 text-xs sm:text-sm">
          <Heart className="size-4 sm:size-5" />
          <span className="font-medium">{article.likesCount}</span>
          <span className="hidden sm:inline">likes</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs sm:text-sm">
          <MessageSquare className="size-4 sm:size-5" />
          <span className="font-medium">{article.commentsCount}</span>
          <span className="hidden sm:inline">comments</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs sm:text-sm">
          <Bookmark className="size-4 sm:size-5" />
          <span className="font-medium">{article.bookmarksCount}</span>
          <span className="hidden sm:inline">bookmarks</span>
        </span>
      </div>
    </header>
  );
};

// <== ARTICLE HEADER SKELETON ==>
export const ArticleHeaderSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURNING SKELETON
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* COVER IMAGE SKELETON */}
      <div className="aspect-video sm:aspect-21/9 rounded-lg sm:rounded-xl bg-secondary animate-pulse" />
      {/* TAGS SKELETON */}
      <div className="flex gap-1.5 sm:gap-2">
        <div className="h-5 sm:h-6 w-14 sm:w-16 bg-secondary rounded-full animate-pulse" />
        <div className="h-5 sm:h-6 w-16 sm:w-20 bg-secondary rounded-full animate-pulse" />
        <div className="h-5 sm:h-6 w-12 sm:w-14 bg-secondary rounded-full animate-pulse" />
      </div>
      {/* TITLE SKELETON */}
      <div className="space-y-2 sm:space-y-3">
        <div className="h-8 sm:h-10 md:h-12 w-full bg-secondary rounded animate-pulse" />
        <div className="h-8 sm:h-10 md:h-12 w-3/4 bg-secondary rounded animate-pulse" />
      </div>
      {/* SUBTITLE SKELETON */}
      <div className="h-5 sm:h-6 w-2/3 bg-secondary rounded animate-pulse" />
      {/* AUTHOR AND META SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 sm:pt-4 border-t">
        {/* AUTHOR SKELETON */}
        <div className="flex items-center gap-3">
          <div className="size-10 sm:size-12 rounded-full bg-secondary animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 sm:h-5 w-28 sm:w-32 bg-secondary rounded animate-pulse" />
            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-secondary rounded animate-pulse" />
          </div>
        </div>
        {/* META SKELETON */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-4 sm:h-5 w-20 sm:w-24 bg-secondary rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-16 sm:w-20 bg-secondary rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-12 sm:w-16 bg-secondary rounded animate-pulse" />
        </div>
      </div>
      {/* STATS BAR SKELETON */}
      <div className="flex items-center gap-4 sm:gap-6 py-3 sm:py-4 border-y">
        <div className="h-4 sm:h-5 w-14 sm:w-16 bg-secondary rounded animate-pulse" />
        <div className="h-4 sm:h-5 w-16 sm:w-20 bg-secondary rounded animate-pulse" />
        <div className="h-4 sm:h-5 w-16 sm:w-20 bg-secondary rounded animate-pulse" />
      </div>
    </div>
  );
};

// <== EXPORTING ARTICLE HEADER ==>
export default ArticleHeader;
