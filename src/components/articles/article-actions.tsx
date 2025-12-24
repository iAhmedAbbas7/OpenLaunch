// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  useLikeArticle,
  useBookmarkArticle,
  useArticleLikeStatus,
  useArticleBookmarkStatus,
} from "@/hooks/use-articles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";

// <== LIKE BUTTON PROPS ==>
interface LikeButtonProps {
  // <== ARTICLE ID ==>
  articleId: string;
  // <== LIKES COUNT ==>
  likesCount: number;
  // <== SIZE ==>
  size?: "sm" | "default";
  // <== SHOW COUNT ==>
  showCount?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== LIKE BUTTON COMPONENT ==>
export const LikeButton = ({
  articleId,
  likesCount,
  size = "default",
  showCount = true,
  className,
}: LikeButtonProps) => {
  // LIKE STATUS
  const { data: likeStatus } = useArticleLikeStatus(articleId);
  // LIKE MUTATION
  const likeMutation = useLikeArticle();
  // IS LIKED
  const isLiked = likeStatus?.liked ?? false;
  // HANDLE LIKE
  const handleLike = () => {
    // LIKE ARTICLE
    likeMutation.mutate(articleId);
  };
  // RETURN LIKE BUTTON COMPONENT
  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size={size}
      onClick={handleLike}
      disabled={likeMutation.isPending}
      className={cn(
        "gap-1.5 sm:gap-2 transition-all duration-200",
        isLiked && "bg-red-500 hover:bg-red-600 border-red-500",
        className
      )}
    >
      {/* LIKE ICON ANIMATION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isLiked ? "liked" : "unliked"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={cn("size-3.5 sm:size-4", isLiked && "fill-current")}
          />
        </motion.div>
      </AnimatePresence>
      {showCount && (
        <span className="text-xs sm:text-sm font-medium">
          {likeMutation.data?.likesCount ?? likesCount}
        </span>
      )}
    </Button>
  );
};

// <== BOOKMARK BUTTON PROPS ==>
interface BookmarkButtonProps {
  // <== ARTICLE ID ==>
  articleId: string;
  // <== BOOKMARKS COUNT ==>
  bookmarksCount: number;
  // <== SIZE ==>
  size?: "sm" | "default";
  // <== SHOW COUNT ==>
  showCount?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== BOOKMARK BUTTON COMPONENT ==>
export const BookmarkButton = ({
  articleId,
  bookmarksCount,
  size = "default",
  showCount = true,
  className,
}: BookmarkButtonProps) => {
  // BOOKMARK STATUS
  const { data: bookmarkStatus } = useArticleBookmarkStatus(articleId);
  // BOOKMARK MUTATION
  const bookmarkMutation = useBookmarkArticle();
  // IS BOOKMARKED
  const isBookmarked = bookmarkStatus?.bookmarked ?? false;
  // HANDLE BOOKMARK
  const handleBookmark = () => {
    // BOOKMARK ARTICLE
    bookmarkMutation.mutate(articleId);
  };
  // RETURN BOOKMARK BUTTON COMPONENT
  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size={size}
      onClick={handleBookmark}
      disabled={bookmarkMutation.isPending}
      className={cn(
        "gap-1.5 sm:gap-2 transition-all duration-200",
        isBookmarked && "bg-amber-500 hover:bg-amber-600 border-amber-500",
        className
      )}
    >
      {/* BOOKMARK ICON ANIMATION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isBookmarked ? "bookmarked" : "unbookmarked"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <Bookmark
            className={cn("size-3.5 sm:size-4", isBookmarked && "fill-current")}
          />
        </motion.div>
      </AnimatePresence>
      {showCount && (
        <span className="text-xs sm:text-sm font-medium">
          {bookmarkMutation.data?.bookmarksCount ?? bookmarksCount}
        </span>
      )}
    </Button>
  );
};

// <== ARTICLE ACTIONS BAR PROPS ==>
interface ArticleActionsBarProps {
  // <== ARTICLE ID ==>
  articleId: string;
  // <== ARTICLE SLUG ==>
  articleSlug: string;
  // <== LIKES COUNT ==>
  likesCount: number;
  // <== BOOKMARKS COUNT ==>
  bookmarksCount: number;
  // <== COMMENTS COUNT ==>
  commentsCount: number;
  // <== CLASS NAME ==>
  className?: string;
}

// <== ARTICLE ACTIONS BAR COMPONENT ==>
export const ArticleActionsBar = ({
  articleId,
  articleSlug,
  likesCount,
  bookmarksCount,
  commentsCount,
  className,
}: ArticleActionsBarProps) => {
  // HANDLE SHARE
  const handleShare = async () => {
    // GET ARTICLE URL
    const url = `${window.location.origin}/articles/${articleSlug}`;
    // CHECK IF SHARE API IS AVAILABLE
    if (navigator.share) {
      // TRY TO SHARE ARTICLE
      try {
        // SHARE ARTICLE
        await navigator.share({
          url,
        });
      } catch {
        // USER CANCELLED
      }
    } else {
      // COPY ARTICLE URL TO CLIPBOARD
      await navigator.clipboard.writeText(url);
      // SHOW SUCCESS TOAST
      toast.success("Link copied to clipboard!");
    }
  };
  // SCROLL TO COMMENTS
  const scrollToComments = () => {
    // GET COMMENTS SECTION
    const commentsSection = document.getElementById("comments");
    // CHECK IF COMMENTS SECTION EXISTS
    if (commentsSection) {
      // GET OFFSET
      const offset = 80;
      // GET ELEMENT POSITION
      const elementPosition = commentsSection.getBoundingClientRect().top;
      // GET OFFSET POSITION
      const offsetPosition = elementPosition + window.scrollY - offset;
      // SCROLL TO COMMENTS SECTION
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };
  // RETURN ARTICLE ACTIONS BAR COMPONENT
  return (
    // ARTICLE ACTIONS BAR CONTAINER
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      {/* LIKE BUTTON */}
      <LikeButton articleId={articleId} likesCount={likesCount} size="sm" />
      {/* BOOKMARK BUTTON */}
      <BookmarkButton
        articleId={articleId}
        bookmarksCount={bookmarksCount}
        size="sm"
      />
      {/* COMMENTS BUTTON */}
      <Button
        variant="outline"
        size="sm"
        onClick={scrollToComments}
        className="gap-1.5 sm:gap-2"
      >
        <MessageSquare className="size-3.5 sm:size-4" />
        <span className="text-xs sm:text-sm font-medium">{commentsCount}</span>
      </Button>
      {/* MORE OPTIONS DROPDOWN */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <MoreHorizontal className="size-3.5 sm:size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="size-4 mr-2" />
            Share
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// <== EXPORTING LIKE BUTTON ==>
export default LikeButton;
