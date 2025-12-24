// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CommentItem } from "./comment-item";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CommentWithAuthor } from "@/server/actions/comments";

// <== COMMENT REPLIES PROPS ==>
interface CommentRepliesProps {
  // <== REPLIES ==>
  replies: CommentWithAuthor[];
  // <== PROJECT ID ==>
  projectId?: string;
  // <== ARTICLE ID ==>
  articleId?: string;
  // <== INITIAL VISIBLE COUNT ==>
  initialVisible?: number;
  // <== CLASS NAME ==>
  className?: string;
}

// <== COMMENT REPLIES COMPONENT ==>
export const CommentReplies = ({
  replies,
  projectId,
  articleId,
  initialVisible = 3,
  className,
}: CommentRepliesProps) => {
  // EXPANDED STATE
  const [isExpanded, setIsExpanded] = useState(false);
  // IF NO REPLIES
  if (replies.length === 0) {
    // RETURN NULL
    return null;
  }
  // VISIBLE REPLIES
  const visibleReplies = isExpanded
    ? replies
    : replies.slice(0, initialVisible);
  // HAS MORE REPLIES
  const hasMore = replies.length > initialVisible;
  // HIDDEN COUNT
  const hiddenCount = replies.length - initialVisible;
  // RETURN COMMENT REPLIES COMPONENT
  return (
    <div className={cn("ml-8 sm:ml-11 mt-3 space-y-3", className)}>
      {/* REPLIES */}
      {visibleReplies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          projectId={projectId}
          articleId={articleId}
          isReply
        />
      ))}
      {/* SHOW MORE/LESS BUTTON */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="size-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" />
              Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

// <== EXPORTING COMMENT REPLIES ==>
export default CommentReplies;
