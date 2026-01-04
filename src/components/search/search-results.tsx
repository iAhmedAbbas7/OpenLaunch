// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import type {
  SearchResultProject,
  SearchResultArticle,
  SearchResultUser,
} from "@/lib/validations/search";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, Heart, Star, BadgeCheck, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== PROJECT RESULT ITEM ==>
interface ProjectResultItemProps {
  // <== PROJECT ==>
  project: SearchResultProject;
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROJECT RESULT ITEM COMPONENT ==>
export const ProjectResultItem = ({
  project,
  className,
}: ProjectResultItemProps) => {
  // RETURN COMPONENT
  return (
    <Link href={`/projects/${project.slug}`} className="block group">
      <Card
        className={cn(
          "p-3 sm:p-4 transition-all duration-200 hover:bg-secondary/50 hover:border-primary/20",
          className
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* PROJECT LOGO */}
          <Avatar className="size-10 sm:size-12 rounded-lg sm:rounded-xl shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all">
            <AvatarImage
              src={project.logoUrl ?? undefined}
              alt={project.name}
            />
            <AvatarFallback className="rounded-lg sm:rounded-xl bg-primary/10 text-primary font-semibold text-sm sm:text-lg">
              {project.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* PROJECT INFO */}
          <div className="flex-1 min-w-0">
            {/* NAME AND OWNER */}
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  by @{project.owner.username}
                </p>
              </div>
              {/* UPVOTES */}
              <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-muted-foreground shrink-0">
                <ArrowUp className="size-3 sm:size-4" />
                <span className="font-medium">
                  {project.upvotesCount.toLocaleString()}
                </span>
              </div>
            </div>
            {/* TAGLINE */}
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2">
              {project.tagline}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// <== PROJECT RESULT ITEM SKELETON ==>
export const ProjectResultItemSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURN SKELETON
  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      <div className="flex items-start gap-3 sm:gap-4">
        <Skeleton className="size-10 sm:size-12 rounded-lg sm:rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
            </div>
            <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-full" />
        </div>
      </div>
    </Card>
  );
};

// <== ARTICLE RESULT ITEM ==>
interface ArticleResultItemProps {
  // <== ARTICLE ==>
  article: SearchResultArticle;
  // <== CLASS NAME ==>
  className?: string;
}

// <== ARTICLE RESULT ITEM COMPONENT ==>
export const ArticleResultItem = ({
  article,
  className,
}: ArticleResultItemProps) => {
  // RETURN COMPONENT
  return (
    <Link href={`/articles/${article.slug}`} className="block group">
      <Card
        className={cn(
          "p-3 sm:p-4 transition-all duration-200 hover:bg-secondary/50 hover:border-primary/20",
          className
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ARTICLE COVER */}
          <Avatar className="size-10 sm:size-12 rounded-lg sm:rounded-xl shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all">
            <AvatarImage
              src={article.coverImageUrl ?? undefined}
              alt={article.title}
            />
            <AvatarFallback className="rounded-lg sm:rounded-xl bg-secondary text-muted-foreground">
              <FileText className="size-4 sm:size-5" />
            </AvatarFallback>
          </Avatar>
          {/* ARTICLE INFO */}
          <div className="flex-1 min-w-0">
            {/* TITLE AND AUTHOR */}
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                  {article.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  by @{article.author.username}
                </p>
              </div>
              {/* LIKES */}
              <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-muted-foreground shrink-0">
                <Heart className="size-3 sm:size-4" />
                <span className="font-medium">
                  {article.likesCount.toLocaleString()}
                </span>
              </div>
            </div>
            {/* SUBTITLE */}
            {article.subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2">
                {article.subtitle}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

// <== ARTICLE RESULT ITEM SKELETON ==>
export const ArticleResultItemSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURN SKELETON
  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      <div className="flex items-start gap-3 sm:gap-4">
        <Skeleton className="size-10 sm:size-12 rounded-lg sm:rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton className="h-4 sm:h-5 w-32 sm:w-48" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
            </div>
            <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-full" />
        </div>
      </div>
    </Card>
  );
};

// <== USER RESULT ITEM ==>
interface UserResultItemProps {
  // <== USER ==>
  user: SearchResultUser;
  // <== CLASS NAME ==>
  className?: string;
}

// <== USER RESULT ITEM COMPONENT ==>
export const UserResultItem = ({ user, className }: UserResultItemProps) => {
  // RETURN COMPONENT
  return (
    <Link href={`/u/${user.username}`} className="block group">
      <Card
        className={cn(
          "p-3 sm:p-4 transition-all duration-200 hover:bg-secondary/50 hover:border-primary/20",
          className
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* USER AVATAR */}
          <Avatar className="size-10 sm:size-12 shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all">
            <AvatarImage
              src={user.avatarUrl ?? undefined}
              alt={user.displayName ?? user.username}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm sm:text-lg">
              {(user.displayName ?? user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* USER INFO */}
          <div className="flex-1 min-w-0">
            {/* NAME AND USERNAME */}
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                    {user.displayName ?? user.username}
                  </h3>
                  {user.isVerified && (
                    <BadgeCheck className="size-3.5 sm:size-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
              {/* REPUTATION */}
              {user.reputationScore > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-muted-foreground shrink-0">
                  <Star className="size-3 sm:size-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium">
                    {user.reputationScore.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            {/* BIO */}
            {user.bio && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

// <== USER RESULT ITEM SKELETON ==>
export const UserResultItemSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURN SKELETON
  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      <div className="flex items-start gap-3 sm:gap-4">
        <Skeleton className="size-10 sm:size-12 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
            </div>
            <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-full" />
        </div>
      </div>
    </Card>
  );
};

// <== SEARCH RESULTS LIST PROPS ==>
interface SearchResultsListProps<T> {
  // <== ITEMS ==>
  items: T[];
  // <== RENDER ITEM ==>
  renderItem: (item: T, index: number) => React.ReactNode;
  // <== IS LOADING ==>
  isLoading?: boolean;
  // <== SKELETON COUNT ==>
  skeletonCount?: number;
  // <== RENDER SKELETON ==>
  renderSkeleton?: (index: number) => React.ReactNode;
  // <== EMPTY MESSAGE ==>
  emptyMessage?: string;
  // <== EMPTY ICON ==>
  EmptyIcon?: React.ElementType;
  // <== CLASS NAME ==>
  className?: string;
}

// <== SEARCH RESULTS LIST COMPONENT ==>
export function SearchResultsList<T>({
  items,
  renderItem,
  isLoading,
  skeletonCount = 5,
  renderSkeleton,
  emptyMessage = "No results found",
  EmptyIcon,
  className,
}: SearchResultsListProps<T>) {
  // LOADING STATE
  if (isLoading && renderSkeleton) {
    return (
      <div className={cn("space-y-2 sm:space-y-3", className)}>
        {Array.from({ length: skeletonCount }).map((_, index) =>
          renderSkeleton(index)
        )}
      </div>
    );
  }
  // EMPTY STATE
  if (items.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        {EmptyIcon && (
          <EmptyIcon className="size-10 sm:size-12 text-muted-foreground/50 mx-auto mb-2 sm:mb-3" />
        )}
        <p className="text-sm sm:text-base text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }
  // RENDER ITEMS
  return (
    <div className={cn("space-y-2 sm:space-y-3", className)}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
}

// <== SEARCH RESULTS SUMMARY ==>
interface SearchResultsSummaryProps {
  // <== QUERY ==>
  query: string;
  // <== TOTAL COUNT ==>
  totalCount: number;
  // <== CLASS NAME ==>
  className?: string;
}

// <== SEARCH RESULTS SUMMARY COMPONENT ==>
export const SearchResultsSummary = ({
  query,
  totalCount,
  className,
}: SearchResultsSummaryProps) => {
  // RETURN COMPONENT
  return (
    <div className={cn("text-xs sm:text-sm text-muted-foreground", className)}>
      {totalCount > 0 ? (
        <span>
          Found{" "}
          <span className="font-medium text-foreground">
            {totalCount.toLocaleString()}
          </span>{" "}
          result{totalCount !== 1 ? "s" : ""} for{" "}
          <span className="font-medium text-foreground">
            &quot;{query}&quot;
          </span>
        </span>
      ) : (
        <span>
          No results found for{" "}
          <span className="font-medium text-foreground">
            &quot;{query}&quot;
          </span>
        </span>
      )}
    </div>
  );
};
