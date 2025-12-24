// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CommentReplies } from "./comment-replies";
import { MessageSquare, RefreshCw } from "lucide-react";
import { useInfiniteComments } from "@/hooks/use-comments";
import type { CommentSortBy } from "@/lib/validations/comments";
import type { CommentWithReplies } from "@/server/actions/comments";
import { CommentsListSkeleton, CommentFormSkeleton } from "./comment-skeleton";

// <== SORT OPTIONS ==>
const SORT_OPTIONS: { value: CommentSortBy; label: string }[] = [
  // SORT BY NEWEST
  { value: "newest", label: "Newest First" },
  // SORT BY OLDEST
  { value: "oldest", label: "Oldest First" },
  // SORT BY MOST UPVOTED
  { value: "top", label: "Most Upvoted" },
];

// <== COMMENTS SECTION PROPS ==>
interface CommentsSectionProps {
  // <== PROJECT ID ==>
  projectId?: string;
  // <== ARTICLE ID ==>
  articleId?: string;
  // <== COMMENTS COUNT ==>
  commentsCount?: number;
  // <== CLASS NAME ==>
  className?: string;
}

// <== COMMENTS SECTION COMPONENT ==>
export const CommentsSection = ({
  projectId,
  articleId,
  commentsCount = 0,
  className,
}: CommentsSectionProps) => {
  // AUTH
  const { isLoading: isAuthLoading } = useAuth();
  // SORT BY STATE
  const [sortBy, setSortBy] = useState<CommentSortBy>("newest");
  // REPLY TO STATE (COMMENT ID)
  const [replyTo, setReplyTo] = useState<string | null>(null);
  // FETCH COMMENTS
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteComments({ projectId, articleId }, sortBy);
  // ALL COMMENTS
  const allComments: CommentWithReplies[] =
    data?.pages.flatMap((page) => page.items) ?? [];
  // HANDLE REPLY
  const handleReply = useCallback((commentId: string) => {
    // SET REPLY TO COMMENT ID
    setReplyTo(commentId);
  }, []);
  // HANDLE CANCEL REPLY
  const handleCancelReply = useCallback(() => {
    // SET REPLY TO NULL
    setReplyTo(null);
  }, []);
  // RETURN COMMENTS SECTION COMPONENT
  return (
    <div id="comments" className={cn("space-y-6", className)}>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        {/* TITLE */}
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <div className="size-7 sm:size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquare className="size-3.5 sm:size-4 text-primary" />
          </div>
          Discussion ({commentsCount})
        </h2>
        {/* SORT */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* REFRESH BUTTON */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="size-8 p-0"
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          </Button>
          {/* SORT SELECT */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as CommentSortBy)}
          >
            <SelectTrigger className="w-36 sm:w-40 h-8 text-xs sm:text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* COMMENT FORM */}
      {isAuthLoading ? (
        <CommentFormSkeleton />
      ) : (
        <CommentForm projectId={projectId} articleId={articleId} />
      )}
      {/* COMMENTS LIST */}
      {isLoading ? (
        <CommentsListSkeleton count={3} />
      ) : isError ? (
        <div className="text-center py-6 sm:py-8">
          <div className="size-12 sm:size-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="size-5 sm:size-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {error?.message ?? "Failed to load comments"}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : allComments.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="size-12 sm:size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="size-5 sm:size-6 text-primary" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* COMMENTS */}
          {allComments.map((comment) => (
            <div key={comment.id}>
              {/* MAIN COMMENT */}
              <CommentItem
                comment={comment}
                projectId={projectId}
                articleId={articleId}
                onReply={() => handleReply(comment.id)}
                showReplyForm={replyTo === comment.id}
                onCancelReply={handleCancelReply}
              />
              {/* REPLIES */}
              <CommentReplies
                replies={comment.replies}
                projectId={projectId}
                articleId={articleId}
              />
            </div>
          ))}
          {/* LOAD MORE */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load more comments"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// <== EXPORTING COMMENTS SECTION ==>
export default CommentsSection;
