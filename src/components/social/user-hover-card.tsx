// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FollowButton } from "./follow-button";
import type { PublicProfile } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, Link as LinkIcon, Calendar } from "lucide-react";

// <== USER HOVER CARD PROPS ==>
interface UserHoverCardProps {
  // <== USER DATA ==>
  user: PublicProfile;
  // <== CHILDREN (TRIGGER ELEMENT) ==>
  children: React.ReactNode;
  // <== SIDE ==>
  side?: "top" | "bottom" | "left" | "right";
  // <== ALIGN ==>
  align?: "start" | "center" | "end";
}

// <== USER HOVER CARD COMPONENT ==>
export const UserHoverCard = ({
  user,
  children,
  side = "bottom",
  align = "start",
}: UserHoverCardProps) => {
  // RETURNING USER HOVER CARD COMPONENT
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      {/* TRIGGER */}
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      {/* CONTENT */}
      <HoverCardContent side={side} align={align} className="w-80 p-4">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          {/* AVATAR */}
          <Link href={`/u/${user.username}`}>
            <Avatar className="size-14 ring-2 ring-border">
              <AvatarImage
                src={user.avatarUrl ?? undefined}
                alt={user.displayName ?? user.username}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {(user.displayName ?? user.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          {/* FOLLOW BUTTON */}
          <FollowButton
            targetUserId={user.id}
            targetUsername={user.username}
            size="sm"
          />
        </div>
        {/* USER INFO */}
        <div className="mt-3">
          {/* NAME AND VERIFIED BADGE */}
          <div className="flex items-center gap-2">
            <Link
              href={`/u/${user.username}`}
              className="font-semibold font-heading text-base hover:text-primary transition-colors"
            >
              {user.displayName ?? user.username}
            </Link>
            {user.isVerified && (
              <BadgeCheck className="size-4 text-primary shrink-0" />
            )}
          </div>
          {/* USERNAME */}
          <Link
            href={`/u/${user.username}`}
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            @{user.username}
          </Link>
        </div>
        {/* BIO */}
        {user.bio && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
            {user.bio}
          </p>
        )}
        {/* META INFO */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
          {/* LOCATION */}
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="size-3" />
              <span>{user.location}</span>
            </div>
          )}
          {/* WEBSITE */}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <LinkIcon className="size-3" />
              <span className="truncate max-w-[120px]">
                {new URL(user.website).hostname}
              </span>
            </a>
          )}
          {/* JOINED DATE */}
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
        {/* STATS */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
          {/* FOLLOWERS */}
          <Link
            href={`/u/${user.username}?tab=followers`}
            className="text-sm hover:text-primary transition-colors"
          >
            <span className="font-semibold">
              {user.followersCount.toLocaleString()}
            </span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </Link>
          {/* FOLLOWING */}
          <Link
            href={`/u/${user.username}?tab=following`}
            className="text-sm hover:text-primary transition-colors"
          >
            <span className="font-semibold">
              {user.followingCount.toLocaleString()}
            </span>{" "}
            <span className="text-muted-foreground">Following</span>
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
