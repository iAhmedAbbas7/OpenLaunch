// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  MoreHorizontal,
  Pencil,
  Check,
  X,
  ExternalLink,
  Clock,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  User,
  Users,
} from "lucide-react";
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
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, isToday, isYesterday } from "date-fns";
import type { MessageWithSender } from "@/types/database";
import type { DeleteMode } from "@/lib/validations/messages";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useUpdateMessage, useDeleteMessage } from "@/hooks/use-messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== EDIT TIME LIMIT IN MINUTES (MUST MATCH SERVER) ==>
const EDIT_TIME_LIMIT_MINUTES = 5;

// <== MESSAGE ITEM PROPS ==>
interface MessageItemProps {
  // <== MESSAGE ==>
  message: MessageWithSender;
  // <== IS OWN MESSAGE ==>
  isOwn: boolean;
  // <== SHOW AVATAR ==>
  showAvatar?: boolean;
  // <== SHOW TIME ==>
  showTime?: boolean;
  // <== ON RETRY ==>
  onRetry?: (message: MessageWithSender) => void;
  // <== CLASS NAME ==>
  className?: string;
}

// <== FORMAT MESSAGE TIME ==>
function formatMessageTime(date: Date | string | null | undefined): string {
  // SAFELY PARSE DATE
  const parsedDate = date instanceof Date ? date : date ? new Date(date) : null;
  // CHECK IF VALID DATE
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    // RETURN FALLBACK
    return "Just now";
  }
  // CHECK IF TODAY
  if (isToday(parsedDate)) {
    // RETURN TIME ONLY
    return format(parsedDate, "h:mm a");
  }
  // CHECK IF YESTERDAY
  if (isYesterday(parsedDate)) {
    // RETURN YESTERDAY AND TIME
    return `Yesterday ${format(parsedDate, "h:mm a")}`;
  }
  // RETURN FULL DATE AND TIME
  return format(parsedDate, "MMM d, h:mm a");
}

// <== MESSAGE STATUS ICON COMPONENT ==>
const MessageStatusIcon = memo(
  ({ status, isOptimistic }: { status: string; isOptimistic: boolean }) => {
    // SENDING OR OPTIMISTIC
    if (isOptimistic || status === "sending") {
      // RETURN CLOCK ICON
      return <Clock className="size-3 text-muted-foreground" />;
    }
    // CHECK IF FAILED
    if (status === "failed") {
      // RETURN ALERT CIRCLE ICON
      return <AlertCircle className="size-3 text-destructive" />;
    }
    // CHECK IF SENT
    if (status === "sent") {
      // RETURN CHECK ICON
      return <Check className="size-3 text-muted-foreground" />;
    }
    // CHECK IF DELIVERED
    if (status === "delivered") {
      // RETURN DOUBLE CHECK ICON
      return <CheckCheck className="size-3 text-muted-foreground" />;
    }
    // CHECK IF READ
    if (status === "read") {
      // RETURN DOUBLE CHECK ICON
      return <CheckCheck className="size-3 text-primary" />;
    }
    // RETURN CHECK ICON
    return <Check className="size-3 text-muted-foreground" />;
  }
);

// <== DISPLAY NAME ==>
MessageStatusIcon.displayName = "MessageStatusIcon";

// <== MESSAGE ITEM COMPONENT ==>
export const MessageItem = memo(
  ({
    message,
    isOwn,
    showAvatar = true,
    showTime = true,
    onRetry,
    className,
  }: MessageItemProps) => {
    // EDIT MODE STATE
    const [isEditing, setIsEditing] = useState(false);
    // EDIT CONTENT STATE
    const [editContent, setEditContent] = useState(message.content ?? "");
    // DELETE DIALOG STATE
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    // DELETE MODE STATE
    const [deleteMode, setDeleteMode] = useState<DeleteMode>("for_me");
    // CAN EDIT STATE
    const [canEdit, setCanEdit] = useState(true);
    // REMAINING EDIT TIME STATE
    const [remainingEditTime, setRemainingEditTime] = useState(0);
    // UPDATE MUTATION
    const updateMutation = useUpdateMessage();
    // DELETE MUTATION
    const deleteMutation = useDeleteMessage();
    // IS OPTIMISTIC
    const isOptimistic = message.id.startsWith("optimistic-");
    // IS FAILED
    const isFailed = message.status === "failed";
    // CALCULATE EDIT TIME REMAINING
    useEffect(() => {
      // SKIP IF NOT OWN MESSAGE OR OPTIMISTIC
      if (!isOwn || isOptimistic) return;
      // CALCULATE REMAINING TIME
      const calculateRemaining = () => {
        // GET MESSAGE AGE
        const messageAge = Date.now() - new Date(message.createdAt).getTime();
        // GET EDIT TIME LIMIT IN MILLISECONDS
        const editTimeLimitMs = EDIT_TIME_LIMIT_MINUTES * 60 * 1000;
        // CALCULATE REMAINING TIME IN MILLISECONDS
        const remainingMs = Math.max(0, editTimeLimitMs - messageAge);
        // GET REMAINING TIME IN SECONDS
        const remainingSeconds = Math.floor(remainingMs / 1000);
        // SET REMAINING EDIT TIME
        setRemainingEditTime(remainingSeconds);
        // SET CAN EDIT
        setCanEdit(remainingMs > 0);
      };
      // CALL FUNCTION TO CALCULATE REMAINING TIME
      calculateRemaining();
      // SET INTERVAL TO UPDATE EVERY 10 SECONDS
      const interval = setInterval(calculateRemaining, 10000);
      // CLEANUP INTERVAL ON UNMOUNT
      return () => clearInterval(interval);
    }, [isOwn, isOptimistic, message.createdAt]);
    // FORMAT REMAINING TIME
    const formattedRemainingTime = useMemo(() => {
      // SKIP IF NO REMAINING TIME
      if (remainingEditTime <= 0) return "";
      // GET MINUTES
      const minutes = Math.floor(remainingEditTime / 60);
      // GET SECONDS
      const seconds = remainingEditTime % 60;
      // CHECK IF MINUTES ARE GREATER THAN 0
      if (minutes > 0) {
        // RETURN MINUTES AND SECONDS
        return `${minutes}m ${seconds}s`;
      }
      // RETURN SECONDS
      return `${seconds}s`;
    }, [remainingEditTime]);
    // HANDLE EDIT SAVE
    const handleEditSave = useCallback(() => {
      // GET NEW CONTENT
      const newContent = editContent.trim();
      // SKIP IF EMPTY OR SAME
      if (!newContent || newContent === message.content) {
        // EXIT EDIT MODE
        setIsEditing(false);
        // RETURN
        return;
      }
      // UPDATE MESSAGE
      updateMutation.mutate(
        {
          messageId: message.id,
          conversationId: message.conversationId,
          data: { content: newContent },
        },
        {
          // ON SUCCESS
          onSuccess: () => {
            // EXIT EDIT MODE
            setIsEditing(false);
          },
          onError: () => {
            // KEEP EDIT MODE OPEN ON ERROR
          },
        }
      );
    }, [
      editContent,
      message.content,
      message.id,
      message.conversationId,
      updateMutation,
    ]);
    // HANDLE EDIT CANCEL
    const handleEditCancel = useCallback(() => {
      // RESET CONTENT
      setEditContent(message.content ?? "");
      // EXIT EDIT MODE
      setIsEditing(false);
    }, [message.content]);
    // HANDLE DELETE
    const handleDelete = useCallback(() => {
      // DELETE MESSAGE
      deleteMutation.mutate({
        messageId: message.id,
        conversationId: message.conversationId,
        mode: deleteMode,
      });
      // CLOSE DIALOG
      setShowDeleteDialog(false);
    }, [message.id, message.conversationId, deleteMode, deleteMutation]);
    // HANDLE RETRY
    const handleRetry = useCallback(() => {
      // CALL ON RETRY
      onRetry?.(message);
    }, [message, onRetry]);
    // OPEN DELETE DIALOG WITH MODE
    const openDeleteDialog = useCallback((mode: DeleteMode) => {
      // SET DELETE MODE
      setDeleteMode(mode);
      // SET SHOW DELETE DIALOG
      setShowDeleteDialog(true);
    }, []);
    // RETURN MESSAGE ITEM COMPONENT
    return (
      <div
        className={cn(
          "group flex gap-2",
          isOwn ? "flex-row-reverse" : "flex-row",
          className
        )}
      >
        {/* AVATAR (FOR OTHER'S MESSAGES) */}
        {showAvatar && !isOwn && (
          <Link
            href={`/u/${message.sender.username}`}
            className="shrink-0 self-end"
          >
            <Avatar className="size-8">
              <AvatarImage
                src={message.sender.avatarUrl ?? undefined}
                alt={message.sender.displayName ?? message.sender.username}
              />
              <AvatarFallback className="text-xs">
                {(message.sender.displayName ?? message.sender.username)
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
        {/* NO AVATAR SPACER FOR OWN MESSAGES - THEY ALIGN TO THE RIGHT EDGE */}
        <div
          className={cn(
            "flex flex-col max-w-[70%]",
            isOwn ? "items-end" : "items-start"
          )}
        >
          {/* MESSAGE BUBBLE */}
          {isEditing ? (
            <div className="space-y-2 w-full min-w-[200px]">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
                className="resize-none text-sm"
                autoFocus
              />
              <div className="flex items-center gap-1.5 justify-between">
                {/* REMAINING EDIT TIME */}
                <span className="text-[10px] text-muted-foreground">
                  {formattedRemainingTime && `${formattedRemainingTime} left`}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditCancel}
                    className="h-7 px-2"
                  >
                    <X className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEditSave}
                    disabled={
                      !editContent.trim() ||
                      updateMutation.isPending ||
                      !canEdit
                    }
                    className="h-7 px-2"
                  >
                    <Check className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "relative rounded-2xl px-4 py-2 transition-opacity duration-200",
                isOwn
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md",
                isOptimistic && "opacity-70",
                isFailed && "opacity-50 border border-destructive/50"
              )}
            >
              {/* MESSAGE TEXT */}
              {message.type === "text" ? (
                <p className="text-sm whitespace-pre-wrap break-all">
                  {typeof message.content === "string" ? message.content : ""}
                </p>
              ) : null}
              {/* PROJECT SHARE */}
              {message.type === "project_share"
                ? (() => {
                    // GET METADATA
                    const metadata = message.metadata as {
                      projectSlug?: string;
                      projectName?: string;
                    } | null;
                    // CHECK IF METADATA EXISTS
                    if (!metadata) return null;
                    // RETURN PROJECT SHARE
                    return (
                      <Link
                        href={`/projects/${metadata.projectSlug}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <ExternalLink className="size-4" />
                        <span className="text-sm font-medium">
                          {metadata.projectName || "View Project"}
                        </span>
                      </Link>
                    );
                  })()
                : null}
              {/* IMAGE MESSAGE */}
              {message.type === "image"
                ? (() => {
                    // GET METADATA
                    const metadata = message.metadata as {
                      url?: string;
                    } | null;
                    // CHECK IF URL EXISTS
                    if (!metadata?.url) return null;
                    // RETURN IMAGE
                    return (
                      <Image
                        src={metadata.url}
                        alt="Shared image"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-auto h-auto max-w-full max-h-80 rounded-lg"
                        unoptimized
                      />
                    );
                  })()
                : null}
              {/* EDITED INDICATOR */}
              {message.isEdited && !isFailed && (
                <span
                  className={cn(
                    "text-[10px] ml-1",
                    isOwn
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  (edited)
                </span>
              )}
              {/* FAILED INDICATOR */}
              {isFailed && (
                <span className="text-[10px] ml-1 text-destructive font-medium">
                  Failed to send
                </span>
              )}
            </div>
          )}
          {/* TIME, STATUS, AND ACTIONS - ALWAYS SHOW ROW FOR ACTIONS */}
          {!isEditing && (
            <div
              className={cn(
                "flex items-center gap-1.5 mt-1 px-1",
                isOwn ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* TIME - ONLY SHOW IF showTime IS TRUE */}
              {showTime && (
                <span className="text-[10px] text-muted-foreground">
                  {formatMessageTime(message.createdAt)}
                </span>
              )}
              {/* STATUS ICON (OWN MESSAGES ONLY) - ALWAYS SHOW */}
              {isOwn && (
                <MessageStatusIcon
                  status={message.status ?? "sent"}
                  isOptimistic={isOptimistic}
                />
              )}
              {/* RETRY BUTTON (FAILED MESSAGES) */}
              {isFailed && isOwn && onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                  title="Retry sending"
                >
                  <RefreshCw className="size-3" />
                </Button>
              )}
              {/* ACTIONS (OWN MESSAGES ONLY, NOT OPTIMISTIC/FAILED) - ALWAYS SHOW */}
              {isOwn && !isOptimistic && !isFailed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwn ? "end" : "start"}>
                    {/* EDIT (ONLY IF CAN EDIT) */}
                    {canEdit && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditContent(message.content ?? "");
                            setIsEditing(true);
                          }}
                        >
                          <Pencil className="size-4 mr-2" />
                          Edit
                          {formattedRemainingTime && (
                            <span className="ml-auto text-[10px] text-muted-foreground">
                              {formattedRemainingTime}
                            </span>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {/* DELETE FOR ME */}
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog("for_me")}
                    >
                      <User className="size-4 mr-2" />
                      Delete for me
                    </DropdownMenuItem>
                    {/* DELETE FOR EVERYONE */}
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog("for_everyone")}
                    >
                      <Users className="size-4 mr-2" />
                      Delete for everyone
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {/* ACTIONS FOR OTHER'S MESSAGES (DELETE FOR ME ONLY) - ALWAYS SHOW */}
              {!isOwn && !isOptimistic && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwn ? "end" : "start"}>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog("for_me")}
                    >
                      <User className="size-4 mr-2" />
                      Delete for me
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
        {/* DELETE CONFIRMATION DIALOG */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteMode === "for_everyone"
                  ? "Delete for everyone?"
                  : "Delete for me?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteMode === "for_everyone"
                  ? "This message will be deleted for all participants. This action cannot be undone."
                  : "This message will be deleted only for you. Other participants will still see it."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className={cn(
                  deleteMode === "for_everyone" &&
                    "bg-destructive hover:bg-destructive/90"
                )}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
);

// <== DISPLAY NAME ==>
MessageItem.displayName = "MessageItem";

// <== EXPORTING MESSAGE ITEM ==>
export default MessageItem;
