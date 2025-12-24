// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CommentForm } from "./comment-form";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { CommentUpvote } from "./comment-upvote";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import type { CommentWithAuthor } from "@/server/actions/comments";
import { useUpdateComment, useDeleteComment } from "@/hooks/use-comments";
import { MoreHorizontal, Reply, Pencil, Trash2, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== COMMENT ITEM PROPS ==>
interface CommentItemProps {
  // <== COMMENT ==>
  comment: CommentWithAuthor;
  // <== PROJECT ID ==>
  projectId?: string;
  // <== ARTICLE ID ==>
  articleId?: string;
  // <== IS REPLY ==>
  isReply?: boolean;
  // <== ON REPLY ==>
  onReply?: () => void;
  // <== SHOW REPLY FORM ==>
  showReplyForm?: boolean;
  // <== ON CANCEL REPLY ==>
  onCancelReply?: () => void;
  // <== CLASS NAME ==>
  className?: string;
}

// <== COMMENT ITEM COMPONENT ==>
export const CommentItem = ({
  comment,
  projectId,
  articleId,
  isReply = false,
  onReply,
  showReplyForm = false,
  onCancelReply,
  className,
}: CommentItemProps) => {
  // CURRENT USER PROFILE
  const { data: currentUser } = useCurrentUserProfile();
  // CHECK IF THIS IS AN OPTIMISTIC COMMENT (NOT YET SAVED TO SERVER)
  const isOptimisticComment = comment.id.startsWith("optimistic-");
  // IS OWNER
  const isOwner = currentUser?.id === comment.authorId;
  // EDIT MODE
  const [isEditing, setIsEditing] = useState(false);
  // EDIT CONTENT (TEXTAREA VALUE)
  const [editContent, setEditContent] = useState(comment.content);
  // OPTIMISTIC DISPLAY CONTENT (WHAT USER SEES)
  const [displayContent, setDisplayContent] = useState(comment.content);
  // OPTIMISTIC IS EDITED FLAG
  const [optimisticIsEdited, setOptimisticIsEdited] = useState(
    comment.isEdited
  );
  // DELETE DIALOG
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // UPDATE MUTATION
  const updateMutation = useUpdateComment();
  // DELETE MUTATION
  const deleteMutation = useDeleteComment();
  // FORMAT DATE
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });
  // HANDLE EDIT SAVE (OPTIMISTIC)
  const handleEditSave = () => {
    // GET NEW CONTENT
    const newContent = editContent.trim();
    // CHECK IF CONTENT CHANGED
    if (newContent === displayContent) {
      // EXIT EDIT MODE
      setIsEditing(false);
      // RETURN
      return;
    }
    // STORE PREVIOUS VALUES FOR ROLLBACK
    const previousContent = displayContent;
    // STORE PREVIOUS IS EDITED VALUE
    const previousIsEdited = optimisticIsEdited;
    // OPTIMISTIC UPDATE - INSTANT UI CHANGE
    setDisplayContent(newContent);
    // SET OPTIMISTIC IS EDITED FLAG
    setOptimisticIsEdited(true);
    // EXIT EDIT MODE
    setIsEditing(false);
    // UPDATE COMMENT (SERVER CALL)
    updateMutation.mutate(
      { commentId: comment.id, data: { content: newContent } },
      {
        // ON ERROR
        onError: () => {
          // ROLLBACK ON ERROR - RESTORE PREVIOUS VALUES
          setDisplayContent(previousContent);
          // ROLLBACK ON ERROR - RESTORE PREVIOUS IS EDITED VALUE
          setOptimisticIsEdited(previousIsEdited);
          // ROLLBACK ON ERROR - RESTORE PREVIOUS EDIT CONTENT
          setEditContent(previousContent);
        },
      }
    );
  };
  // HANDLE EDIT CANCEL
  const handleEditCancel = () => {
    // RESET EDIT CONTENT TO CURRENT DISPLAY CONTENT
    setEditContent(displayContent);
    // EXIT EDIT MODE
    setIsEditing(false);
  };
  // HANDLE DELETE
  const handleDelete = async () => {
    // DELETE COMMENT
    await deleteMutation.mutateAsync({
      commentId: comment.id,
      projectId,
      articleId,
      parentId: comment.parentId,
    });
    // CLOSE DIALOG
    setShowDeleteDialog(false);
  };
  // RETURN COMMENT ITEM COMPONENT
  return (
    <div className={cn("group", className)}>
      {/* COMMENT CONTAINER */}
      <div className="flex gap-3">
        {/* AVATAR */}
        <Link href={`/u/${comment.author.username}`} className="shrink-0">
          <Avatar className={cn("size-8", isReply && "size-6")}>
            <AvatarImage
              src={comment.author.avatarUrl ?? undefined}
              alt={comment.author.displayName ?? comment.author.username}
            />
            <AvatarFallback className="text-xs">
              {(comment.author.displayName ?? comment.author.username)
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          {/* HEADER */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* AUTHOR NAME */}
            <Link
              href={`/u/${comment.author.username}`}
              className="text-sm font-medium hover:underline"
            >
              {comment.author.displayName ?? comment.author.username}
            </Link>
            {/* VERIFIED BADGE */}
            {comment.author.isVerified && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                Verified
              </Badge>
            )}
            {/* SEPARATOR */}
            <span className="text-muted-foreground">·</span>
            {/* DATE */}
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
            {/* EDITED BADGE */}
            {optimisticIsEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
          {/* CONTENT */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              {/* EDIT TEXTAREA */}
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="resize-none text-sm"
                autoFocus
              />
              {/* EDIT ACTIONS */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleEditSave}
                  disabled={
                    editContent.trim().length === 0 || editContent.length > 5000
                  }
                  className="h-7 px-2 text-xs"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditCancel}
                  className="h-7 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap wrap-break-word">
              {displayContent}
            </p>
          )}
          {/* ACTIONS - HIDE ALL FOR OPTIMISTIC COMMENTS */}
          {!isEditing && !isOptimisticComment && (
            <div className="mt-2 flex items-center gap-1">
              {/* UPVOTE */}
              <CommentUpvote
                commentId={comment.id}
                upvotesCount={comment.upvotesCount}
                projectId={projectId}
                articleId={articleId}
                hasUpvoted={comment.hasUpvoted}
              />
              {/* REPLY BUTTON (NOT FOR REPLIES) */}
              {!isReply && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReply}
                  className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Reply className="size-3.5" />
                  Reply
                </Button>
              )}
              {/* MORE OPTIONS */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {/* OWNER ACTIONS */}
                  {isOwner && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditContent(displayContent);
                          setIsEditing(true);
                        }}
                      >
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* REPORT */}
                  <DropdownMenuItem disabled>
                    <Flag className="size-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {/* REPLY FORM */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                projectId={projectId}
                articleId={articleId}
                parentId={comment.id}
                onCancel={onCancelReply}
                placeholder={`Reply to ${
                  comment.author.displayName ?? comment.author.username
                }...`}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
              {comment.repliesCount > 0 && (
                <span className="block mt-2 text-destructive">
                  This will also delete {comment.repliesCount}{" "}
                  {comment.repliesCount === 1 ? "reply" : "replies"}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// <== EXPORTING COMMENT ITEM ==>
export default CommentItem;
