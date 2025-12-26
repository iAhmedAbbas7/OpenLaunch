// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Rocket,
  BookOpen,
  Trophy,
  Loader2,
  MessageCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useUnreadMessagesCount } from "@/hooks/use-messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== USER MENU COMPONENT ==>
export const UserMenu = () => {
  // GET AUTH HOOK
  const { user, profile, isAuthenticated, signOut } = useAuth();
  // GET UNREAD MESSAGES COUNT
  const { data: unreadCount } = useUnreadMessagesCount();
  // STATE FOR SIGN OUT LOADING
  const [isSigningOut, setIsSigningOut] = useState(false);
  // <== HANDLE SIGN OUT ==>
  const handleSignOut = async () => {
    // PREVENT DOUBLE CLICK
    if (isSigningOut) return;
    // SET SIGNING OUT STATE
    setIsSigningOut(true);
    // SIGN OUT
    await signOut();
  };
  // <== RENDER SIGN IN BUTTON IF NOT AUTHENTICATED ==>
  if (!isAuthenticated) {
    // RETURNING SIGN IN BUTTON
    return (
      // BUTTON CONTAINER
      <div className="flex items-center gap-2">
        {/* SIGN IN BUTTON */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-9 px-3 text-sm font-medium transition-colors duration-200 hover:text-primary"
        >
          <Link href="/sign-in">Sign In</Link>
        </Button>
        {/* SIGN UP BUTTON */}
        <Button
          size="sm"
          asChild
          className="h-9 px-4 text-sm font-medium transition-all duration-200 hover:opacity-90"
        >
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }
  // <== GET USERNAME ==>
  const username: string =
    profile?.username ??
    user?.userMetadata?.username ??
    user?.userMetadata?.preferredUsername ??
    "";
  // <== GET DISPLAY NAME (WITH PROPER FALLBACKS) ==>
  const displayName: string =
    profile?.displayName ??
    user?.userMetadata?.fullName ??
    user?.userMetadata?.name ??
    username ??
    "User";
  // <== GET AVATAR URL ==>
  const avatarUrl: string | undefined =
    profile?.avatarUrl ?? user?.userMetadata?.avatarUrl ?? undefined;
  // <== GET INITIALS (FALLBACK TO EMPTY IF NO NAME) ==>
  const initials = getInitials(displayName);

  // RETURNING USER MENU COMPONENT
  return (
    // DROPDOWN MENU
    <DropdownMenu>
      {/* DROPDOWN TRIGGER */}
      <DropdownMenuTrigger asChild>
        {/* AVATAR BUTTON */}
        <Button
          variant="ghost"
          className="relative size-9 rounded-full p-0 ring-offset-background transition-all duration-200 hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {/* AVATAR */}
          <Avatar className="size-9">
            {/* AVATAR IMAGE */}
            <AvatarImage src={avatarUrl} alt={displayName} />
            {/* AVATAR FALLBACK - SHOW INITIALS OR USER ICON */}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initials || <User className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {/* DROPDOWN CONTENT */}
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* USER INFO */}
        <DropdownMenuLabel className="font-normal p-3">
          {/* USER INFO CONTAINER */}
          <div className="flex flex-col space-y-1">
            {/* DISPLAY NAME */}
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {/* USERNAME */}
            {username && (
              <p className="text-xs leading-none text-muted-foreground">
                @{username}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        {/* SEPARATOR */}
        <DropdownMenuSeparator />
        {/* NAVIGATION GROUP */}
        <DropdownMenuGroup>
          {/* DASHBOARD */}
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard"
              className="cursor-pointer transition-colors duration-150"
            >
              <LayoutDashboard className="mr-2 size-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          {/* MESSAGES */}
          <DropdownMenuItem asChild>
            <Link
              href="/messages"
              className="cursor-pointer transition-colors duration-150"
            >
              <MessageCircle className="mr-2 size-4" />
              <span>Messages</span>
              {/* UNREAD DOT INDICATOR */}
              {(unreadCount ?? 0) > 0 ? (
                <span className="ml-auto size-2.5 bg-primary rounded-full" />
              ) : null}
            </Link>
          </DropdownMenuItem>
          {/* PROFILE */}
          <DropdownMenuItem asChild>
            <Link
              href={`/u/${username || "profile"}`}
              className="cursor-pointer transition-colors duration-150"
            >
              <User className="mr-2 size-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          {/* MY PROJECTS */}
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/projects"
              className="cursor-pointer transition-colors duration-150"
            >
              <Rocket className="mr-2 size-4" />
              <span>My Projects</span>
            </Link>
          </DropdownMenuItem>
          {/* MY ARTICLES */}
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/articles"
              className="cursor-pointer transition-colors duration-150"
            >
              <BookOpen className="mr-2 size-4" />
              <span>My Articles</span>
            </Link>
          </DropdownMenuItem>
          {/* ACHIEVEMENTS */}
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/achievements"
              className="cursor-pointer transition-colors duration-150"
            >
              <Trophy className="mr-2 size-4" />
              <span>Achievements</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {/* SEPARATOR */}
        <DropdownMenuSeparator />
        {/* SETTINGS */}
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="cursor-pointer transition-colors duration-150"
          >
            <Settings className="mr-2 size-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        {/* SEPARATOR */}
        <DropdownMenuSeparator />
        {/* SIGN OUT */}
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 size-4" />
          )}
          <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
