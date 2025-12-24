// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Send, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComment } from "@/hooks/use-comments";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// <== COMMENT FORM PROPS ==>
interface CommentFormProps {
  // <== PROJECT ID ==>
  projectId?: string;
  // <== ARTICLE ID ==>
  articleId?: string;
  // <== PARENT ID (FOR REPLIES) ==>
  parentId?: string;
  // <== ON CANCEL (FOR REPLY FORM) ==>
  onCancel?: () => void;
  // <== PLACEHOLDER ==>
  placeholder?: string;
  // <== CLASS NAME ==>
  className?: string;
  // <== AUTO FOCUS ==>
  autoFocus?: boolean;
}

// <== COMMENT FORM COMPONENT ==>
export const CommentForm = ({
  projectId,
  articleId,
  parentId,
  onCancel,
  placeholder = "Write a comment...",
  className,
  autoFocus = false,
}: CommentFormProps) => {
  // AUTH
  const { isAuthenticated } = useAuth();
  // CURRENT USER PROFILE
  const { data: profile } = useCurrentUserProfile();
  // COMMENT CONTENT
  const [content, setContent] = useState("");
  // CREATE COMMENT MUTATION
  const createComment = useCreateComment();
  // MAX CHARACTERS
  const maxChars = 5000;
  // CHARACTERS LEFT
  const charsLeft = maxChars - content.length;
  // IS OVER LIMIT
  const isOverLimit = charsLeft < 0;
  // CAN SUBMIT
  const canSubmit =
    content.trim().length > 0 && !isOverLimit && !createComment.isPending;
  // HANDLE SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    // PREVENT DEFAULT
    e.preventDefault();
    // CHECK IF CAN SUBMIT
    if (!canSubmit) return;
    // CREATE COMMENT
    await createComment.mutateAsync({
      content: content.trim(),
      projectId,
      articleId,
      parentId,
    });
    // CLEAR CONTENT
    setContent("");
    // CALL ON CANCEL IF REPLY FORM
    if (parentId && onCancel) {
      onCancel();
    }
  };
  // HANDLE KEY DOWN
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // SUBMIT ON CMD/CTRL + ENTER
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      // PREVENT DEFAULT
      e.preventDefault();
      // CHECK IF CAN SUBMIT
      if (canSubmit) {
        // HANDLE SUBMIT
        handleSubmit(e);
      }
    }
  };
  // IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    // RETURN SIGN IN FORM
    return (
      <div
        className={cn(
          "rounded-lg border bg-secondary/30 p-4 text-center",
          className
        )}
      >
        <p className="text-sm text-muted-foreground mb-2">
          Sign in to join the conversation
        </p>
        <Link href="/auth/login">
          <Button size="sm" variant="outline">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }
  // RETURN COMMENT FORM COMPONENT
  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      {/* INPUT CONTAINER */}
      <div className="flex gap-3">
        {/* AVATAR */}
        <Avatar className="size-8 shrink-0">
          <AvatarImage
            src={profile?.avatarUrl ?? undefined}
            alt={profile?.displayName ?? profile?.username ?? "User"}
          />
          <AvatarFallback className="text-xs">
            {(profile?.displayName ?? profile?.username ?? "U")
              .charAt(0)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* TEXTAREA CONTAINER */}
        <div className="flex-1 space-y-2">
          {/* TEXTAREA */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={parentId ? 2 : 3}
            className={cn(
              "resize-none text-sm",
              isOverLimit && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={createComment.isPending}
          />
          {/* FOOTER */}
          <div className="flex items-center justify-between">
            {/* CHARACTER COUNT */}
            <span
              className={cn(
                "text-xs text-muted-foreground",
                charsLeft < 100 && "text-yellow-500",
                isOverLimit && "text-destructive"
              )}
            >
              {charsLeft.toLocaleString()} characters left
            </span>
            {/* ACTIONS */}
            <div className="flex items-center gap-2">
              {/* CANCEL BUTTON (FOR REPLIES) */}
              {parentId && onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={createComment.isPending}
                  className="h-8 px-3 gap-1.5"
                >
                  <X className="size-3.5" />
                  Cancel
                </Button>
              )}
              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                size="sm"
                disabled={!canSubmit}
                className="h-8 px-3 gap-1.5"
              >
                <Send className="size-3.5" />
                {parentId ? "Reply" : "Comment"}
              </Button>
            </div>
          </div>
          {/* HINT */}
          <p className="text-[10px] text-muted-foreground">
            Press Ctrl+Enter to submit
          </p>
        </div>
      </div>
    </form>
  );
};

// <== EXPORTING COMMENT FORM ==>
export default CommentForm;
