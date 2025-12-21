// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronUp, Loader2 } from "lucide-react";
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
  // HAS UPVOTED
  const hasUpvoted = upvoteData?.hasUpvoted ?? false;
  // UPVOTES COUNT - USING OPTIMISTIC UPDATE
  const upvotesCount = initialCount;
  // <== HANDLE UPVOTE ==>
  const handleUpvote = () => {
    // CHECK IF AUTHENTICATED
    if (!isAuthenticated) return;
    // UPVOTE PROJECT
    upvote(projectId);
  };
  // BUTTON CONTENT
  const buttonContent = (
    <Button
      variant={hasUpvoted ? "default" : "outline"}
      size={
        variant === "compact" ? "sm" : variant === "large" ? "lg" : "default"
      }
      onClick={handleUpvote}
      disabled={isUpvoting || !isAuthenticated}
      className={cn(
        "flex-col gap-0.5 h-auto transition-all duration-200",
        variant === "compact" && "py-1.5 px-2",
        variant === "default" && "py-2 px-3",
        variant === "large" && "py-3 px-4",
        hasUpvoted &&
          "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30",
        !isAuthenticated && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {isUpvoting ? (
        <Loader2
          className={cn(
            "animate-spin",
            variant === "compact" && "size-3",
            variant === "default" && "size-4",
            variant === "large" && "size-5"
          )}
        />
      ) : (
        <ChevronUp
          className={cn(
            hasUpvoted && "text-primary",
            variant === "compact" && "size-3",
            variant === "default" && "size-4",
            variant === "large" && "size-5"
          )}
        />
      )}
      <span
        className={cn(
          "font-semibold",
          variant === "compact" && "text-xs",
          variant === "default" && "text-sm",
          variant === "large" && "text-base"
        )}
      >
        {upvotesCount}
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
