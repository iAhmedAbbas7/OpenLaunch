// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUpvote, useUpvoteStatus } from "@/hooks/use-projects";

// <== UPVOTE BUTTON PROPS ==>
interface UpvoteButtonProps {
  // <== PROJECT ID ==>
  projectId: string;
  // <== INITIAL COUNT ==>
  initialCount?: number;
  // <== VARIANT ==>
  variant?: "default" | "compact" | "large";
  // <== CLASS NAME ==>
  className?: string;
}

// <== UPVOTE BUTTON COMPONENT ==>
export const UpvoteButton = ({
  projectId,
  initialCount = 0,
  variant = "default",
  className,
}: UpvoteButtonProps) => {
  // GET AUTH
  const { isAuthenticated } = useAuth();
  // GET UPVOTE STATUS
  const { data: upvoteData } = useUpvoteStatus(projectId);
  // GET UPVOTE MUTATION
  const { mutate: upvote, isPending: isUpvoting } = useUpvote();
  // SERVER HAS UPVOTED STATE
  const serverHasUpvoted = upvoteData?.hasUpvoted ?? false;
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticHasUpvoted, setOptimisticHasUpvoted] =
    useState(serverHasUpvoted);
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticCount, setOptimisticCount] = useState(initialCount);
  // SYNC WITH SERVER STATE
  useEffect(() => {
    // SET OPTIMISTIC HAS UPVOTED
    setOptimisticHasUpvoted(serverHasUpvoted);
  }, [serverHasUpvoted]);
  // SYNC INITIAL COUNT
  useEffect(() => {
    // SET OPTIMISTIC COUNT
    setOptimisticCount(initialCount);
  }, [initialCount]);
  // <== HANDLE UPVOTE ==>
  const handleUpvote = () => {
    // CHECK IF AUTHENTICATED OR ALREADY PENDING
    if (!isAuthenticated || isUpvoting) return;
    // OPTIMISTIC UPDATE - INSTANT UI CHANGE
    const wasUpvoted = optimisticHasUpvoted;
    // SET OPTIMISTIC HAS UPVOTED
    setOptimisticHasUpvoted(!wasUpvoted);
    // SET OPTIMISTIC COUNT
    setOptimisticCount((prev) => (wasUpvoted ? prev - 1 : prev + 1));
    // UPVOTE PROJECT (SERVER CALL)
    upvote(projectId, {
      // ON ERROR
      onError: () => {
        // SET OPTIMISTIC HAS UPVOTED
        setOptimisticHasUpvoted(wasUpvoted);
        // ROLLBACK ON ERROR - RESTORE VISUAL STATE AND COUNT
        setOptimisticCount((prev) => (wasUpvoted ? prev + 1 : prev - 1));
      },
    });
  };
  // BUTTON CONTENT
  const buttonContent = (
    <Button
      variant={optimisticHasUpvoted ? "default" : "outline"}
      size={
        variant === "compact" ? "sm" : variant === "large" ? "lg" : "default"
      }
      onClick={handleUpvote}
      disabled={!isAuthenticated}
      className={cn(
        "flex-col gap-0.5 h-auto transition-all duration-200",
        variant === "compact" && "py-1.5 px-2",
        variant === "default" && "py-2 px-3",
        variant === "large" && "py-3 px-4",
        optimisticHasUpvoted &&
          "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30",
        !isAuthenticated && "cursor-not-allowed opacity-60",
        isUpvoting && "pointer-events-none",
        className
      )}
    >
      <ChevronUp
        className={cn(
          "transition-transform duration-150",
          optimisticHasUpvoted && "text-primary scale-110",
          variant === "compact" && "size-3",
          variant === "default" && "size-4",
          variant === "large" && "size-5"
        )}
      />
      <span
        className={cn(
          "font-semibold tabular-nums",
          variant === "compact" && "text-xs",
          variant === "default" && "text-sm",
          variant === "large" && "text-base"
        )}
      >
        {optimisticCount}
      </span>
    </Button>
  );
  // RETURN WITH TOOLTIP IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>
          <p>Sign in to upvote</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  // RETURN BUTTON
  return buttonContent;
};
