// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import { BadgeCheck, Star } from "lucide-react";
import type { ProfilePreview } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== USER CARD PROPS ==>
interface UserCardProps {
  // <== USER DATA ==>
  user: ProfilePreview;
  // <== SHOW FOLLOW BUTTON ==>
  showFollowButton?: boolean;
  // <== SHOW BIO ==>
  showBio?: boolean;
  // <== SHOW REPUTATION ==>
  showReputation?: boolean;
  // <== CLASS NAME ==>
  className?: string;
  // <== SIZE ==>
  size?: "sm" | "default" | "lg";
}

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return (
    <div className={cn("bg-secondary rounded animate-pulse", className)} />
  );
};

// <== USER CARD COMPONENT ==>
export const UserCard = ({
  user,
  showFollowButton = true,
  showBio = true,
  showReputation = true,
  className,
  size = "default",
}: UserCardProps) => {
  // GET AVATAR SIZE BASED ON SIZE
  const avatarSize =
    size === "sm"
      ? "size-8 sm:size-10"
      : size === "lg"
      ? "size-12 sm:size-16"
      : "size-10 sm:size-12";
  // GET NAME SIZE BASED ON SIZE
  const nameSize =
    size === "sm"
      ? "text-xs sm:text-sm"
      : size === "lg"
      ? "text-base sm:text-lg"
      : "text-sm sm:text-base";
  // RETURNING USER CARD COMPONENT
  return (
    <Card
      className={cn(
        "p-3 sm:p-4 transition-all duration-200 hover:bg-secondary/50",
        className
      )}
    >
      {/* CARD CONTENT */}
      <div className="flex items-start gap-2.5 sm:gap-4">
        {/* AVATAR LINK */}
        <Link href={`/u/${user.username}`} className="shrink-0">
          <Avatar className={cn(avatarSize, "ring-2 ring-border")}>
            <AvatarImage
              src={user.avatarUrl ?? undefined}
              alt={user.displayName ?? user.username}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs sm:text-sm">
              {(user.displayName ?? user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        {/* USER INFO */}
        <div className="flex-1 min-w-0">
          {/* NAME AND VERIFIED BADGE */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* NAME LINK */}
            <Link
              href={`/u/${user.username}`}
              className={cn(
                "font-semibold font-heading truncate hover:text-primary transition-colors",
                nameSize
              )}
            >
              {user.displayName ?? user.username}
            </Link>
            {/* VERIFIED BADGE */}
            {user.isVerified && (
              <BadgeCheck className="size-3.5 sm:size-4 text-primary shrink-0" />
            )}
          </div>
          {/* USERNAME */}
          <Link
            href={`/u/${user.username}`}
            className="text-muted-foreground text-xs sm:text-sm hover:text-foreground transition-colors"
          >
            @{user.username}
          </Link>
          {/* BIO */}
          {showBio && user.bio && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2">
              {user.bio}
            </p>
          )}
          {/* REPUTATION */}
          {showReputation && user.reputationScore > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
              <Star className="size-2.5 sm:size-3 text-amber-500 fill-amber-500" />
              <span>{user.reputationScore.toLocaleString()} rep</span>
            </div>
          )}
        </div>
        {/* FOLLOW BUTTON */}
        {showFollowButton && (
          <FollowButton
            targetUserId={user.id}
            targetUsername={user.username}
            size="sm"
            className="shrink-0 h-7 sm:h-8 text-xs"
          />
        )}
      </div>
    </Card>
  );
};

// <== USER CARD SKELETON ==>
export const UserCardSkeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON
  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      <div className="flex items-start gap-2.5 sm:gap-4">
        {/* AVATAR SKELETON */}
        <Skeleton className="size-10 sm:size-12 rounded-full shrink-0" />
        {/* INFO SKELETON */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
          <Skeleton className="h-3 sm:h-4 w-full max-w-[200px] mt-1.5 sm:mt-2" />
        </div>
        {/* BUTTON SKELETON */}
        <Skeleton className="h-7 sm:h-8 w-16 sm:w-20 rounded-md shrink-0" />
      </div>
    </Card>
  );
};
