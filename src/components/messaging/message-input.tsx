// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { useSendMessage } from "@/hooks/use-messages";
import { useState, useRef, useCallback, memo } from "react";
import { Smile, Mic, Image as ImageIcon, Heart } from "lucide-react";

// <== MESSAGE INPUT PROPS ==>
interface MessageInputProps {
  // <== CONVERSATION ID ==>
  conversationId: string;
  // <== ON MESSAGE SENT ==>
  onMessageSent?: () => void;
  // <== CLASS NAME ==>
  className?: string;
}

// <== MESSAGE INPUT COMPONENT ==>
export const MessageInput = memo(
  ({ conversationId, onMessageSent, className }: MessageInputProps) => {
    // MESSAGE CONTENT STATE
    const [content, setContent] = useState("");
    // INPUT REF
    const inputRef = useRef<HTMLInputElement>(null);
    // SEND MESSAGE MUTATION
    const sendMessage = useSendMessage();
    // CHECK IF HAS CONTENT
    const hasContent = content.trim().length > 0;
    // HANDLE INPUT CHANGE
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // SET CONTENT
      setContent(e.target.value);
    };
    // HANDLE SEND
    const handleSend = useCallback(() => {
      // GET TRIMMED CONTENT
      const trimmedContent = content.trim();
      // SKIP IF EMPTY
      if (!trimmedContent) return;
      // SEND MESSAGE
      sendMessage.mutate(
        {
          conversationId,
          content: trimmedContent,
          type: "text",
        },
        {
          // ON SUCCESS
          onSuccess: () => {
            // CLEAR CONTENT
            setContent("");
            // TRIGGER MESSAGE SENT CALLBACK
            onMessageSent?.();
            // FOCUS INPUT
            inputRef.current?.focus();
          },
        }
      );
    }, [content, conversationId, sendMessage, onMessageSent]);
    // HANDLE KEY DOWN
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // SEND ON ENTER
      if (e.key === "Enter") {
        // PREVENT DEFAULT
        e.preventDefault();
        // SEND MESSAGE
        handleSend();
      }
    };
    // RETURN MESSAGE INPUT COMPONENT
    return (
      <div className={cn("shrink-0 border-t bg-background p-3", className)}>
        {/* INPUT CONTAINER - INSTAGRAM STYLE */}
        <div className="flex items-center h-11 rounded-full border border-border bg-background px-3 gap-3">
          {/* EMOJI BUTTON (LEFT) */}
          <button
            type="button"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="Emojis coming soon"
          >
            <Smile className="size-6" />
          </button>
          {/* TEXT INPUT */}
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {/* RIGHT SIDE ICONS - SHOW WHEN EMPTY */}
          {!hasContent && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Voice message coming soon"
              >
                <Mic className="size-6" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Send image coming soon"
              >
                <ImageIcon className="size-6" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Send reaction coming soon"
              >
                <Heart className="size-6" />
              </button>
            </div>
          )}
          {/* SEND BUTTON - SHOW WHEN HAS CONTENT */}
          {hasContent && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sendMessage.isPending}
              className="shrink-0 text-primary font-semibold text-sm hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          )}
        </div>
      </div>
    );
  }
);

// <== DISPLAY NAME ==>
MessageInput.displayName = "MessageInput";

// <== EXPORTING MESSAGE INPUT ==>
export default MessageInput;
