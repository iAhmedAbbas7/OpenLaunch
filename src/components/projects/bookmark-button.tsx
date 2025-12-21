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
import { Bookmark, Loader2 } from "lucide-react";
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
  // HAS BOOKMARKED
  const hasBookmarked = bookmarkData?.hasBookmarked ?? false;
  // <== HANDLE BOOKMARK ==>
  const handleBookmark = () => {
    // CHECK IF AUTHENTICATED
    if (!isAuthenticated) return;
    // BOOKMARK PROJECT
    bookmark(projectId);
  };
  // BUTTON CONTENT
  const buttonContent = (
    <Button
      variant={hasBookmarked ? "default" : "outline"}
      size={variant === "icon" ? "icon" : size}
      onClick={handleBookmark}
      disabled={isBookmarking || !isAuthenticated}
      className={cn(
        "transition-all duration-200",
        hasBookmarked &&
          "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30",
        !isAuthenticated && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {isBookmarking ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Bookmark
          className={cn("size-4", hasBookmarked && "fill-primary text-primary")}
        />
      )}
      {variant !== "icon" && (
        <span className="ml-2">
          {hasBookmarked ? "Bookmarked" : "Bookmark"}
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
