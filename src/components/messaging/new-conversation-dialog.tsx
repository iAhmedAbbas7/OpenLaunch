// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { UserSearch } from "./user-search";
import { Button } from "@/components/ui/button";
import type { ProfilePreview } from "@/types/database";
import { MessageSquarePlus, X, Loader2 } from "lucide-react";
import { useGetOrCreateConversation } from "@/hooks/use-messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== NEW CONVERSATION DIALOG PROPS ==>
interface NewConversationDialogProps {
  // <== OPEN STATE ==>
  open: boolean;
  // <== ON OPEN CHANGE ==>
  onOpenChange: (open: boolean) => void;
  // <== ON CONVERSATION CREATED ==>
  onConversationCreated?: (conversationId: string) => void;
}

// <== NEW CONVERSATION DIALOG COMPONENT ==>
export const NewConversationDialog = ({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationDialogProps) => {
  // SELECTED USER STATE
  const [selectedUser, setSelectedUser] = useState<ProfilePreview | null>(null);
  // GET OR CREATE CONVERSATION MUTATION
  const getOrCreateConversation = useGetOrCreateConversation();
  // HANDLE SELECT USER
  const handleSelectUser = (user: ProfilePreview) => {
    // SET SELECTED USER
    setSelectedUser(user);
  };
  // HANDLE CLEAR SELECTION
  const handleClearSelection = () => {
    // CLEAR SELECTED USER
    setSelectedUser(null);
  };
  // HANDLE START CONVERSATION
  const handleStartConversation = () => {
    // SKIP IF NO SELECTED USER
    if (!selectedUser) return;
    // GET OR CREATE CONVERSATION
    getOrCreateConversation.mutate(selectedUser.id, {
      onSuccess: (conversation) => {
        // CALL CALLBACK
        onConversationCreated?.(conversation.id);
        // CLOSE DIALOG
        onOpenChange(false);
        // CLEAR SELECTION
        setSelectedUser(null);
      },
    });
  };
  // HANDLE CLOSE
  const handleClose = () => {
    // CLOSE DIALOG
    onOpenChange(false);
    // CLEAR SELECTION (AFTER ANIMATION)
    setTimeout(() => {
      setSelectedUser(null);
    }, 200);
  };
  // RETURN NEW CONVERSATION DIALOG COMPONENT
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* HEADER */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
              <MessageSquarePlus className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle>New Conversation</DialogTitle>
              <DialogDescription>
                Search for a user to start a conversation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {/* CONTENT */}
        <div className="py-4">
          {/* SELECTED USER */}
          {selectedUser && (
            <div className="mb-4 p-3 bg-accent/50 rounded-lg flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage
                  src={selectedUser.avatarUrl ?? undefined}
                  alt={selectedUser.displayName ?? selectedUser.username}
                />
                <AvatarFallback>
                  {(selectedUser.displayName ?? selectedUser.username)
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block">
                  {selectedUser.displayName ?? selectedUser.username}
                </span>
                <span className="text-sm text-muted-foreground truncate block">
                  @{selectedUser.username}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSelection}
                className="shrink-0 size-8"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
          {/* USER SEARCH */}
          {!selectedUser && (
            <UserSearch
              onSelect={handleSelectUser}
              selectedUserId={undefined}
            />
          )}
        </div>
        {/* FOOTER */}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStartConversation}
            disabled={!selectedUser || getOrCreateConversation.isPending}
          >
            {getOrCreateConversation.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              "Start Conversation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// <== EXPORTING NEW CONVERSATION DIALOG ==>
export default NewConversationDialog;
