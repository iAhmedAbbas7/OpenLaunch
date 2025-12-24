// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowBigUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUpvoteComment, useCommentUpvoteStatus } from "@/hooks/use-comments";

// <== COMMENT UPVOTE PROPS ==>
interface CommentUpvoteProps {
  // <== COMMENT ID ==>
  commentId: string;
  // <== UPVOTES COUNT ==>
  upvotesCount: number;
  // <== PROJECT ID (FOR CACHE INVALIDATION) ==>
  projectId?: string;
  // <== ARTICLE ID (FOR CACHE INVALIDATION) ==>
  articleId?: string;
  // <== HAS UPVOTED (FROM PARENT) ==>
  hasUpvoted?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== COMMENT UPVOTE COMPONENT ==>
export const CommentUpvote = ({
  commentId,
  upvotesCount,
  projectId,
  articleId,
  hasUpvoted: initialHasUpvoted = false,
  className,
}: CommentUpvoteProps) => {
  // AUTH
  const { isAuthenticated } = useAuth();
  // UPVOTE STATUS FROM SERVER
  const { data: upvoteStatus } = useCommentUpvoteStatus(commentId);
  // UPVOTE MUTATION
  const upvoteMutation = useUpvoteComment();
  // SERVER HAS UPVOTED STATE
  const serverHasUpvoted = upvoteStatus?.upvoted ?? initialHasUpvoted;
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticHasUpvoted, setOptimisticHasUpvoted] =
    useState(serverHasUpvoted);
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticCount, setOptimisticCount] = useState(upvotesCount);
  // SYNC WITH SERVER STATE
  useEffect(() => {
    // SET OPTIMISTIC HAS UPVOTED
    setOptimisticHasUpvoted(serverHasUpvoted);
  }, [serverHasUpvoted]);
  // SYNC INITIAL COUNT
  useEffect(() => {
    // SET OPTIMISTIC COUNT
    setOptimisticCount(upvotesCount);
  }, [upvotesCount]);
  // HANDLE UPVOTE
  const handleUpvote = () => {
    // CHECK IF AUTHENTICATED OR ALREADY PENDING
    if (!isAuthenticated || upvoteMutation.isPending) return;
    // OPTIMISTIC UPDATE - INSTANT UI CHANGE
    const wasUpvoted = optimisticHasUpvoted;
    // SET OPTIMISTIC HAS UPVOTED
    setOptimisticHasUpvoted(!wasUpvoted);
    // SET OPTIMISTIC COUNT
    setOptimisticCount((prev) => (wasUpvoted ? prev - 1 : prev + 1));
    // UPVOTE COMMENT (SERVER CALL)
    upvoteMutation.mutate(
      { commentId, projectId, articleId },
      {
        // ON ERROR
        onError: () => {
          // ROLLBACK ON ERROR - RESTORE OPTIMISTIC HAS UPVOTED
          setOptimisticHasUpvoted(wasUpvoted);
          // ROLLBACK ON ERROR - RESTORE OPTIMISTIC COUNT
          setOptimisticCount((prev) => (wasUpvoted ? prev + 1 : prev - 1));
        },
      }
    );
  };
  // RETURN COMMENT UPVOTE COMPONENT
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            disabled={!isAuthenticated}
            className={cn(
              "h-7 px-2 gap-1 text-xs transition-all duration-150",
              optimisticHasUpvoted && "text-primary",
              !isAuthenticated && "cursor-not-allowed opacity-60",
              upvoteMutation.isPending && "pointer-events-none",
              className
            )}
          >
            <ArrowBigUp
              className={cn(
                "size-4 transition-all duration-150",
                optimisticHasUpvoted && "fill-primary scale-110"
              )}
            />
            <span className="tabular-nums">{optimisticCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {!isAuthenticated
            ? "Sign in to upvote"
            : optimisticHasUpvoted
            ? "Remove upvote"
            : "Upvote this comment"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// <== EXPORTING COMMENT UPVOTE ==>
export default CommentUpvote;
