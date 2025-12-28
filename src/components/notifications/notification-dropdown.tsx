// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationList } from "./notification-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import type { NotificationWithDetails } from "@/server/actions/notifications";

// <== NOTIFICATION DROPDOWN PROPS ==>
interface NotificationDropdownProps {
  // <== NOTIFICATIONS ==>
  notifications: NotificationWithDetails[];
  // <== UNREAD COUNT ==>
  unreadCount: number;
  // <== IS LOADING ==>
  isLoading?: boolean;
  // <== ON MARK AS READ ==>
  onMarkAsRead?: (id: string) => void;
  // <== ON MARK ALL AS READ ==>
  onMarkAllAsRead?: () => void;
  // <== ON DELETE ==>
  onDelete?: (id: string) => void;
  // <== IS MARKING ALL AS READ ==>
  isMarkingAllAsRead?: boolean;
  // <== ON OPEN CHANGE ==>
  onOpenChange?: (open: boolean) => void;
  // <== OPEN STATE ==>
  open?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== NOTIFICATION DROPDOWN COMPONENT ==>
export const NotificationDropdown = ({
  notifications,
  unreadCount,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  isMarkingAllAsRead = false,
  onOpenChange,
  open,
  className,
}: NotificationDropdownProps) => {
  // RETURN NOTIFICATION DROPDOWN
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {/* TRIGGER */}
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex items-center justify-center size-9 rounded-full border-2 border-primary/60 hover:border-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer",
            className
          )}
          aria-label={`Notifications${
            unreadCount > 0 ? ` (${unreadCount} unread)` : ""
          }`}
        >
          <Bell className="size-4 text-primary" />
          {/* UNREAD DOT - ONLY SHOWS WHEN UNREAD NOTIFICATIONS EXIST */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-3 bg-primary rounded-full border-2 border-background" />
          )}
        </button>
      </PopoverTrigger>
      {/* CONTENT */}
      <PopoverContent className="w-80 sm:w-96 p-0" align="end" sideOffset={8}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-1">
            {/* MARK ALL AS READ */}
            {unreadCount > 0 && onMarkAllAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                disabled={isMarkingAllAsRead}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="size-3.5 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        {/* NOTIFICATIONS LIST */}
        <ScrollArea className="max-h-[400px]">
          <NotificationList
            notifications={notifications.slice(0, 10)}
            isLoading={isLoading}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            compact
            emptyMessage="You're all caught up!"
          />
        </ScrollArea>
        {/* FOOTER */}
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Link href="/notifications" className="block">
              <Button
                variant="ghost"
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                View all notifications
                <ExternalLink className="size-3 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// <== NOTIFICATION DROPDOWN DISPLAY NAME ==>
NotificationDropdown.displayName = "NotificationDropdown";
