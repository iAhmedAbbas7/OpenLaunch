// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>

import {
  FileText,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Clock,
  Heart,
  MessageSquare,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import type { ArticlePreview } from "@/server/actions/articles";
import { useMyArticles, useDeleteArticle } from "@/hooks/use-articles";

// <== MY ARTICLES CLIENT ==>
export const MyArticlesClient = () => {
  // ROUTER
  const router = useRouter();
  // PAGE STATE
  const [page, setPage] = useState(1);
  // DELETE DIALOG STATE
  const [articleToDelete, setArticleToDelete] = useState<ArticlePreview | null>(
    null
  );
  // FETCH MY ARTICLES
  const { data, isLoading, isFetching, refetch } = useMyArticles(page, 12);
  // DELETE MUTATION
  const deleteMutation = useDeleteArticle();
  // HANDLE DELETE
  const handleDelete = async () => {
    // CHECK IF ARTICLE TO DELETE EXISTS
    if (!articleToDelete) return;
    // DELETE ARTICLE
    await deleteMutation.mutateAsync(articleToDelete.id);
    // RESET ARTICLE TO DELETE
    setArticleToDelete(null);
    // REFETCH ARTICLES
    refetch();
  };
  // ARTICLES DATA
  const articles = (data?.items ?? []).filter(
    (article): article is NonNullable<typeof article> => !!article?.id
  );
  // TOTAL COUNT
  const totalCount = data?.total ?? 0;
  // HAS MORE
  const hasMore = data?.hasMore ?? false;
  // SHOW SKELETON WHILE LOADING OR FETCHING
  const showSkeleton = isLoading || isFetching;
  // RETURN MY ARTICLES CLIENT COMPONENT
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-10 sm:size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="size-5 sm:size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                My Articles
              </h1>
              {!showSkeleton && totalCount > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs sm:text-sm shrink-0"
                >
                  {totalCount} {totalCount === 1 ? "article" : "articles"}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your articles and drafts
            </p>
          </div>
          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="size-8 sm:size-9"
            >
              <RefreshCw
                className={cn(
                  "size-3.5 sm:size-4",
                  isFetching && "animate-spin"
                )}
              />
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/dashboard/articles/new")}
              className="h-8 sm:h-9 px-3 sm:px-4 gap-1.5 sm:gap-2"
            >
              <Plus className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">New Article</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>
      {/* ARTICLES LIST */}
      {showSkeleton ? (
        // SKELETON
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : articles.length > 0 ? (
        // ARTICLES LIST
        <>
          <div className="space-y-3 sm:space-y-4">
            {articles.map((article, index) => (
              <ArticleListCard
                key={article.id}
                article={article}
                index={index}
                onEdit={() =>
                  router.push(`/dashboard/articles/${article.slug}/edit`)
                }
                onDelete={() => setArticleToDelete(article)}
              />
            ))}
          </div>
          {/* PAGINATION */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                Next
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
            No articles yet
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-4 sm:mb-6">
            Start writing your first article to share your knowledge with the
            community!
          </p>
          <Button onClick={() => router.push("/dashboard/articles/new")}>
            <Plus className="size-4 mr-2" />
            Create Your First Article
          </Button>
        </motion.div>
      )}
      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={!!articleToDelete}
        onOpenChange={(open) => !open && setArticleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{articleToDelete?.title}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// <== ARTICLE LIST CARD PROPS ==>
interface ArticleListCardProps {
  // <== ARTICLE ==>
  article: ArticlePreview;
  // <== INDEX ==>
  index: number;
  // <== ON EDIT ==>
  onEdit: () => void;
  // <== ON DELETE ==>
  onDelete: () => void;
}

// <== ARTICLE LIST CARD ==>
const ArticleListCard = ({
  article,
  index,
  onEdit,
  onDelete,
}: ArticleListCardProps) => {
  // GET FORMATTED DATE
  const formattedDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : formatDistanceToNow(new Date(article.createdAt), { addSuffix: true });
  // RETURN ARTICLE LIST CARD
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* THUMBNAIL */}
          {article.coverImageUrl && (
            <div className="hidden sm:block relative w-32 md:w-40 aspect-video rounded-lg overflow-hidden shrink-0">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          {/* CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              {/* TITLE AND STATUS */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="font-semibold text-sm sm:text-base hover:text-primary transition-colors truncate"
                  >
                    {article.title}
                  </Link>
                  {article.isPublished ? (
                    <Badge
                      variant="default"
                      className="shrink-0 text-[10px] sm:text-xs gap-1"
                    >
                      <Eye className="size-2.5 sm:size-3" />
                      <span className="hidden sm:inline">Published</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[10px] sm:text-xs gap-1"
                    >
                      <EyeOff className="size-2.5 sm:size-3" />
                      <span className="hidden sm:inline">Draft</span>
                    </Badge>
                  )}
                </div>
                {article.subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mb-2">
                    {article.subtitle}
                  </p>
                )}
              </div>
              {/* ACTIONS DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 sm:size-8 shrink-0"
                  >
                    <MoreHorizontal className="size-3.5 sm:size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/articles/${article.slug}`}>
                      <Eye className="size-4 mr-2" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* META INFO */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3 sm:size-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3 sm:size-3.5" />
                {article.viewsCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="size-3 sm:size-3.5" />
                {article.likesCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3 sm:size-3.5" />
                {article.commentsCount}
              </span>
              {article.readingTimeMinutes > 0 && (
                <span className="hidden sm:flex items-center gap-1">
                  {article.readingTimeMinutes} min read
                </span>
              )}
            </div>
            {/* TAGS */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] sm:text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// <== ARTICLE CARD SKELETON ==>
const ArticleCardSkeleton = () => {
  // RETURN ARTICLE CARD SKELETON
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        {/* THUMBNAIL SKELETON */}
        <div className="hidden sm:block w-32 md:w-40 aspect-video rounded-lg bg-secondary animate-pulse shrink-0" />
        {/* CONTENT SKELETON */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-4 sm:h-5 w-48 sm:w-64 bg-secondary rounded animate-pulse" />
                <div className="h-4 sm:h-5 w-16 sm:w-20 bg-secondary rounded animate-pulse" />
              </div>
              <div className="h-3 sm:h-4 w-3/4 bg-secondary rounded animate-pulse" />
            </div>
            <div className="size-7 sm:size-8 bg-secondary rounded animate-pulse shrink-0" />
          </div>
          {/* META SKELETON */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-3 sm:h-4 w-16 sm:w-20 bg-secondary rounded animate-pulse" />
            <div className="h-3 sm:h-4 w-10 sm:w-12 bg-secondary rounded animate-pulse" />
            <div className="h-3 sm:h-4 w-10 sm:w-12 bg-secondary rounded animate-pulse" />
            <div className="h-3 sm:h-4 w-10 sm:w-12 bg-secondary rounded animate-pulse" />
          </div>
          {/* TAGS SKELETON */}
          <div className="flex gap-1 mt-2">
            <div className="h-4 sm:h-5 w-12 sm:w-14 bg-secondary rounded animate-pulse" />
            <div className="h-4 sm:h-5 w-14 sm:w-16 bg-secondary rounded animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
};

// <== EXPORTING MY ARTICLES CLIENT ==>
export default MyArticlesClient;
