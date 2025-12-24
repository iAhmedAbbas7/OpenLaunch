// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { ArticlePreview } from "@/server/actions/articles";
import { Eye, Heart, MessageSquare, Clock, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== ARTICLE CARD PROPS ==>
interface ArticleCardProps {
  // <== ARTICLE ==>
  article: ArticlePreview;
  // <== INDEX FOR ANIMATION ==>
  index?: number;
  // <== CLASS NAME ==>
  className?: string;
}

// <== ARTICLE CARD COMPONENT ==>
export const ArticleCard = ({
  article,
  index = 0,
  className,
}: ArticleCardProps) => {
  // FORMAT DATE
  const formattedDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : formatDistanceToNow(new Date(article.createdAt), { addSuffix: true });
  // RETURN ARTICLE CARD COMPONENT
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* LINK TO ARTICLE */}
      <Link href={`/articles/${article.slug}`}>
        {/* ARTICLE CARD */}
        <Card
          className={cn(
            "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20",
            className
          )}
        >
          {/* COVER IMAGE */}
          {article.coverImageUrl && (
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          {/* CONTENT */}
          <div className="p-3 sm:p-4">
            {/* TAGS */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] sm:text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs font-normal"
                  >
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            {/* TITLE */}
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1 sm:mb-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {/* SUBTITLE */}
            {article.subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                {article.subtitle}
              </p>
            )}
            {/* AUTHOR & META */}
            <div className="flex items-center justify-between">
              {/* AUTHOR */}
              <div className="flex items-center gap-2">
                <Avatar className="size-6 sm:size-7">
                  <AvatarImage src={article.author.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-[10px] sm:text-xs">
                    {article.author.displayName?.[0] ??
                      article.author.username?.[0] ??
                      "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    {article.author.displayName ?? article.author.username}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                    <span>{formattedDate}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="size-2.5 sm:size-3" />
                      {article.readingTimeMinutes} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* STATS */}
            <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t text-muted-foreground">
              <span className="flex items-center gap-1 text-[10px] sm:text-xs">
                <Heart className="size-3 sm:size-3.5" />
                {article.likesCount}
              </span>
              <span className="flex items-center gap-1 text-[10px] sm:text-xs">
                <MessageSquare className="size-3 sm:size-3.5" />
                {article.commentsCount}
              </span>
              <span className="flex items-center gap-1 text-[10px] sm:text-xs">
                <Eye className="size-3 sm:size-3.5" />
                {article.viewsCount}
              </span>
              <span className="flex items-center gap-1 text-[10px] sm:text-xs ml-auto">
                <Bookmark className="size-3 sm:size-3.5" />
                {article.bookmarksCount}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

// <== ARTICLE CARD SKELETON ==>
export const ArticleCardSkeleton = ({ className }: { className?: string }) => {
  // RETURN ARTICLE CARD SKELETON
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* COVER IMAGE SKELETON */}
      <div className="aspect-video bg-secondary animate-pulse" />
      {/* CONTENT SKELETON */}
      <div className="p-3 sm:p-4">
        {/* TAGS SKELETON */}
        <div className="flex gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <div className="h-4 sm:h-5 w-12 sm:w-14 bg-secondary rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-14 sm:w-16 bg-secondary rounded animate-pulse" />
        </div>
        {/* TITLE SKELETON */}
        <div className="h-4 sm:h-5 w-full bg-secondary rounded animate-pulse mb-1 sm:mb-2" />
        <div className="h-4 sm:h-5 w-3/4 bg-secondary rounded animate-pulse mb-3 sm:mb-4" />
        {/* SUBTITLE SKELETON */}
        <div className="h-3 sm:h-4 w-full bg-secondary rounded animate-pulse mb-1" />
        <div className="h-3 sm:h-4 w-4/5 bg-secondary rounded animate-pulse mb-3 sm:mb-4" />
        {/* AUTHOR SKELETON */}
        <div className="flex items-center gap-2">
          <div className="size-6 sm:size-7 rounded-full bg-secondary animate-pulse" />
          <div className="flex-1">
            <div className="h-3 sm:h-4 w-24 sm:w-28 bg-secondary rounded animate-pulse mb-1" />
            <div className="h-2.5 sm:h-3 w-32 sm:w-36 bg-secondary rounded animate-pulse" />
          </div>
        </div>
        {/* STATS SKELETON */}
        <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
          <div className="h-3 sm:h-4 w-8 sm:w-10 bg-secondary rounded animate-pulse" />
          <div className="h-3 sm:h-4 w-8 sm:w-10 bg-secondary rounded animate-pulse" />
          <div className="h-3 sm:h-4 w-8 sm:w-10 bg-secondary rounded animate-pulse" />
          <div className="h-3 sm:h-4 w-8 sm:w-10 bg-secondary rounded animate-pulse ml-auto" />
        </div>
      </div>
    </Card>
  );
};

// <== EXPORTING ARTICLE CARD ==>
export default ArticleCard;
