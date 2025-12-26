// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchUsers } from "@/hooks/use-messages";
import type { ProfilePreview } from "@/types/database";
import { Search, CheckCircle2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== USER SEARCH PROPS ==>
interface UserSearchProps {
  // <== ON SELECT ==>
  onSelect: (user: ProfilePreview) => void;
  // <== SELECTED USER ID ==>
  selectedUserId?: string;
  // <== PLACEHOLDER ==>
  placeholder?: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== USER SEARCH COMPONENT ==>
export const UserSearch = ({
  onSelect,
  selectedUserId,
  placeholder = "Search users...",
  className,
}: UserSearchProps) => {
  // SEARCH QUERY STATE
  const [query, setQuery] = useState("");
  // DEBOUNCED QUERY
  const debouncedQuery = useDebounce(query, 300);
  // SEARCH USERS
  const { data: users, isLoading, error } = useSearchUsers(debouncedQuery);
  // RETURN USER SEARCH COMPONENT
  return (
    <div className={cn("space-y-3", className)}>
      {/* SEARCH INPUT */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          autoFocus
        />
        {/* LOADING INDICATOR */}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {/* RESULTS */}
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {/* LOADING STATE */}
        {isLoading && (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </>
        )}
        {/* ERROR STATE */}
        {error && (
          <div className="p-4 text-center">
            <p className="text-sm text-destructive">Failed to search users</p>
          </div>
        )}
        {/* EMPTY STATE */}
        {!isLoading &&
          !error &&
          query.trim() &&
          users &&
          users.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          )}
        {/* HINT */}
        {!isLoading && !error && !query.trim() && (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Type to search for users
            </p>
          </div>
        )}
        {/* USER LIST */}
        {!isLoading &&
          !error &&
          users?.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                "hover:bg-accent/50 text-left",
                selectedUserId === user.id && "bg-accent"
              )}
            >
              {/* AVATAR */}
              <Avatar className="size-10">
                <AvatarImage
                  src={user.avatarUrl ?? undefined}
                  alt={user.displayName ?? user.username}
                />
                <AvatarFallback>
                  {(user.displayName ?? user.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium truncate">
                    {user.displayName ?? user.username}
                  </span>
                  {user.isVerified && (
                    <CheckCircle2 className="size-3.5 text-blue-500 shrink-0" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground truncate block">
                  @{user.username}
                </span>
              </div>
              {/* SELECTED INDICATOR */}
              {selectedUserId === user.id && (
                <CheckCircle2 className="size-5 text-primary shrink-0" />
              )}
            </button>
          ))}
      </div>
    </div>
  );
};

// <== EXPORTING USER SEARCH ==>
export default UserSearch;
