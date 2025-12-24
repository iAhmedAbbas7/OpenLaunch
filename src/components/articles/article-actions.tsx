// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
  // LIKE STATUS FROM SERVER
  const { data: likeStatus } = useArticleLikeStatus(articleId);
  // LIKE MUTATION
  const likeMutation = useLikeArticle();
  // SERVER IS LIKED STATE
  const serverIsLiked = likeStatus?.liked ?? false;
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(serverIsLiked);
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticCount, setOptimisticCount] = useState(likesCount);
  // SYNC WITH SERVER STATE
  useEffect(() => {
    // SET OPTIMISTIC IS LIKED
    setOptimisticIsLiked(serverIsLiked);
  }, [serverIsLiked]);
  // SYNC INITIAL COUNT
  useEffect(() => {
    // SET OPTIMISTIC COUNT
    setOptimisticCount(likesCount);
  }, [likesCount]);
  // HANDLE LIKE
  const handleLike = () => {
    // CHECK IF ALREADY PENDING
    if (likeMutation.isPending) return;
    // OPTIMISTIC UPDATE - INSTANT UI CHANGE
    const wasLiked = optimisticIsLiked;
    // SET OPTIMISTIC IS LIKED
    setOptimisticIsLiked(!wasLiked);
    // SET OPTIMISTIC COUNT
    setOptimisticCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    // LIKE ARTICLE (SERVER CALL)
    likeMutation.mutate(articleId, {
      // ON ERROR
      onError: () => {
        // ROLLBACK ON ERROR - RESTORE OPTIMISTIC IS LIKED
        setOptimisticIsLiked(wasLiked);
        // ROLLBACK ON ERROR - RESTORE OPTIMISTIC COUNT
        setOptimisticCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      },
    });
  };
  // RETURN LIKE BUTTON COMPONENT
  return (
    <Button
      variant={optimisticIsLiked ? "default" : "outline"}
      size={size}
      onClick={handleLike}
      className={cn(
        "gap-1.5 sm:gap-2 transition-all duration-200",
        optimisticIsLiked && "bg-red-500 hover:bg-red-600 border-red-500",
        likeMutation.isPending && "pointer-events-none",
        className
      )}
    >
      {/* LIKE ICON ANIMATION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={optimisticIsLiked ? "liked" : "unliked"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={cn(
              "size-3.5 sm:size-4",
              optimisticIsLiked && "fill-current"
            )}
          />
        </motion.div>
      </AnimatePresence>
      {showCount && (
        <span className="text-xs sm:text-sm font-medium tabular-nums">
          {optimisticCount}
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
  // BOOKMARK STATUS FROM SERVER
  const { data: bookmarkStatus } = useArticleBookmarkStatus(articleId);
  // BOOKMARK MUTATION
  const bookmarkMutation = useBookmarkArticle();
  // SERVER IS BOOKMARKED STATE
  const serverIsBookmarked = bookmarkStatus?.bookmarked ?? false;
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticIsBookmarked, setOptimisticIsBookmarked] =
    useState(serverIsBookmarked);
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticCount, setOptimisticCount] = useState(bookmarksCount);
  // SYNC WITH SERVER STATE
  useEffect(() => {
    // SET OPTIMISTIC IS BOOKMARKED
    setOptimisticIsBookmarked(serverIsBookmarked);
  }, [serverIsBookmarked]);
  // SYNC INITIAL COUNT
  useEffect(() => {
    // SET OPTIMISTIC COUNT
    setOptimisticCount(bookmarksCount);
  }, [bookmarksCount]);
  // HANDLE BOOKMARK
  const handleBookmark = () => {
    // CHECK IF ALREADY PENDING
    if (bookmarkMutation.isPending) return;
    // OPTIMISTIC UPDATE - INSTANT UI CHANGE
    const wasBookmarked = optimisticIsBookmarked;
    // SET OPTIMISTIC IS BOOKMARKED
    setOptimisticIsBookmarked(!wasBookmarked);
    // SET OPTIMISTIC COUNT
    setOptimisticCount((prev) => (wasBookmarked ? prev - 1 : prev + 1));
    // BOOKMARK ARTICLE (SERVER CALL)
    bookmarkMutation.mutate(articleId, {
      // ON ERROR
      onError: () => {
        // ROLLBACK ON ERROR - RESTORE OPTIMISTIC IS BOOKMARKED
        setOptimisticIsBookmarked(wasBookmarked);
        // ROLLBACK ON ERROR - RESTORE OPTIMISTIC COUNT
        setOptimisticCount((prev) => (wasBookmarked ? prev + 1 : prev - 1));
      },
    });
  };
  // RETURN BOOKMARK BUTTON COMPONENT
  return (
    <Button
      variant={optimisticIsBookmarked ? "default" : "outline"}
      size={size}
      onClick={handleBookmark}
      className={cn(
        "gap-1.5 sm:gap-2 transition-all duration-200",
        optimisticIsBookmarked &&
          "bg-amber-500 hover:bg-amber-600 border-amber-500",
        bookmarkMutation.isPending && "pointer-events-none",
        className
      )}
    >
      {/* BOOKMARK ICON ANIMATION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={optimisticIsBookmarked ? "bookmarked" : "unbookmarked"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <Bookmark
            className={cn(
              "size-3.5 sm:size-4",
              optimisticIsBookmarked && "fill-current"
            )}
          />
        </motion.div>
      </AnimatePresence>
      {showCount && (
        <span className="text-xs sm:text-sm font-medium tabular-nums">
          {optimisticCount}
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
