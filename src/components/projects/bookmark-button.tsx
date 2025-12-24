// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBookmark, useBookmarkStatus } from "@/hooks/use-projects";

// <== BOOKMARK BUTTON PROPS ==>
interface BookmarkButtonProps {
  // <== PROJECT ID ==>
  projectId: string;
  // <== VARIANT ==>
  variant?: "default" | "icon";
  // <== SIZE ==>
  size?: "sm" | "default" | "lg";
  // <== CLASS NAME ==>
  className?: string;
}

// <== BOOKMARK BUTTON COMPONENT ==>
export const BookmarkButton = ({
  projectId,
  variant = "default",
  size = "default",
  className,
}: BookmarkButtonProps) => {
  // GET AUTH
  const { isAuthenticated } = useAuth();
  // GET BOOKMARK STATUS
  const { data: bookmarkData } = useBookmarkStatus(projectId);
  // GET BOOKMARK MUTATION
  const { mutate: bookmark, isPending: isBookmarking } = useBookmark();
  // SERVER HAS BOOKMARKED STATE
  const serverHasBookmarked = bookmarkData?.hasBookmarked ?? false;
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticHasBookmarked, setOptimisticHasBookmarked] =
    useState(serverHasBookmarked);
  // SYNC WITH SERVER STATE
  useEffect(() => {
    // SET OPTIMISTIC HAS BOOKMARKED
    setOptimisticHasBookmarked(serverHasBookmarked);
  }, [serverHasBookmarked]);
  // <== HANDLE BOOKMARK ==>
  const handleBookmark = () => {
    // CHECK IF AUTHENTICATED OR ALREADY PENDING
    if (!isAuthenticated || isBookmarking) return;
    // OPTIMISTIC UPDATE - INSTANT UI CHANGE
    const wasBookmarked = optimisticHasBookmarked;
    // SET OPTIMISTIC HAS BOOKMARKED
    setOptimisticHasBookmarked(!wasBookmarked);
    // BOOKMARK PROJECT (SERVER CALL)
    bookmark(projectId, {
      // ON ERROR
      onError: () => {
        // ROLLBACK ON ERROR
        setOptimisticHasBookmarked(wasBookmarked);
      },
    });
  };
  // BUTTON CONTENT
  const buttonContent = (
    <Button
      variant={optimisticHasBookmarked ? "default" : "outline"}
      size={variant === "icon" ? "icon" : size}
      onClick={handleBookmark}
      disabled={!isAuthenticated}
      className={cn(
        "transition-all duration-200",
        optimisticHasBookmarked &&
          "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30",
        !isAuthenticated && "cursor-not-allowed opacity-60",
        isBookmarking && "pointer-events-none",
        className
      )}
    >
      <Bookmark
        className={cn(
          "size-4 transition-transform duration-150",
          optimisticHasBookmarked && "fill-primary text-primary scale-110"
        )}
      />
      {variant !== "icon" && (
        <span className="ml-2">
          {optimisticHasBookmarked ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </Button>
  );
  // RETURN WITH TOOLTIP IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>
          <p>Sign in to bookmark</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  // RETURN BUTTON
  return buttonContent;
};
