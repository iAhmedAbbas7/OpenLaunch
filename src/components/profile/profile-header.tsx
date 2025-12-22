// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  BadgeCheck,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Github,
  Twitter,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import type { ProfileWithStats } from "@/types/database";
import { FollowButton } from "@/components/social/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== PROFILE HEADER PROPS ==>
interface ProfileHeaderProps {
  // <== PROFILE DATA ==>
  profile: ProfileWithStats;
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROFILE HEADER COMPONENT ==>
export const ProfileHeader = ({ profile, className }: ProfileHeaderProps) => {
  // GET AUTH STATE
  const { profile: currentUserProfile } = useAuthStore();
  // CHECK IF IS OWN PROFILE
  const isOwnProfile = currentUserProfile?.id === profile.id;
  // RETURNING PROFILE HEADER COMPONENT
  return (
    <div className={cn("relative", className)}>
      {/* BANNER */}
      <div className="h-32 sm:h-48 md:h-64 w-full bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-xl overflow-hidden relative">
        {profile.bannerUrl && (
          <Image
            src={profile.bannerUrl}
            alt="Profile banner"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            priority
          />
        )}
      </div>
      {/* PROFILE INFO CONTAINER */}
      <div className="relative px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
        {/* AVATAR */}
        <div className="absolute -top-10 sm:-top-14 md:-top-16 left-3 sm:left-4 md:left-6">
          <Avatar className="size-20 sm:size-28 md:size-32 ring-3 sm:ring-4 ring-background shadow-xl">
            <AvatarImage
              src={profile.avatarUrl ?? undefined}
              alt={profile.displayName ?? profile.username}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl sm:text-3xl md:text-4xl">
              {(profile.displayName ?? profile.username)
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* ACTION BUTTONS */}
        <div className="flex justify-end pt-3 sm:pt-4 gap-2 sm:gap-3">
          {isOwnProfile ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
            >
              <Link href="/settings/profile">
                <Settings className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Edit </span>Profile
              </Link>
            </Button>
          ) : (
            <FollowButton
              targetUserId={profile.id}
              targetUsername={profile.username}
              size="default"
              className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
            />
          )}
        </div>
        {/* USER INFO */}
        <div className="mt-8 sm:mt-6 md:mt-4">
          {/* NAME AND BADGES */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* DISPLAY NAME */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading">
              {profile.displayName ?? profile.username}
            </h1>
            {/* VERIFIED BADGE */}
            {profile.isVerified && (
              <BadgeCheck className="size-5 sm:size-6 text-primary" />
            )}
            {/* PRO BADGE */}
            {profile.isPro && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-500 text-[10px] sm:text-xs font-medium">
                <Sparkles className="size-2.5 sm:size-3" />
                PRO
              </span>
            )}
          </div>
          {/* USERNAME */}
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            @{profile.username}
          </p>
          {/* BIO */}
          {profile.bio && (
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-foreground/90 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
          )}
          {/* META INFO */}
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
            {/* LOCATION */}
            {profile.location && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <MapPin className="size-3.5 sm:size-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {/* WEBSITE */}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-1.5 hover:text-primary transition-colors"
              >
                <LinkIcon className="size-3.5 sm:size-4" />
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {new URL(profile.website).hostname}
                </span>
              </a>
            )}
            {/* GITHUB */}
            {profile.githubUsername && (
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-1.5 hover:text-primary transition-colors"
              >
                <Github className="size-3.5 sm:size-4" />
                <span className="hidden sm:inline">{profile.githubUsername}</span>
              </a>
            )}
            {/* TWITTER */}
            {profile.twitterUsername && (
              <a
                href={`https://twitter.com/${profile.twitterUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-1.5 hover:text-primary transition-colors"
              >
                <Twitter className="size-3.5 sm:size-4" />
                <span className="hidden sm:inline">{profile.twitterUsername}</span>
              </a>
            )}
            {/* JOINED DATE */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Calendar className="size-3.5 sm:size-4" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>
          </div>
          {/* STATS */}
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mt-4 sm:mt-6 text-sm sm:text-base">
            {/* FOLLOWERS */}
            <Link
              href={`/u/${profile.username}?tab=followers`}
              className="hover:text-primary transition-colors"
            >
              <span className="font-bold text-base sm:text-lg">
                {profile.followersCount.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground text-xs sm:text-sm">Followers</span>
            </Link>
            {/* FOLLOWING */}
            <Link
              href={`/u/${profile.username}?tab=following`}
              className="hover:text-primary transition-colors"
            >
              <span className="font-bold text-base sm:text-lg">
                {profile.followingCount.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground text-xs sm:text-sm">Following</span>
            </Link>
            {/* PROJECTS */}
            <div>
              <span className="font-bold text-base sm:text-lg">
                {profile.projectsCount.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground text-xs sm:text-sm">Projects</span>
            </div>
            {/* ARTICLES - HIDDEN ON VERY SMALL SCREENS */}
            <div className="hidden sm:block">
              <span className="font-bold text-base sm:text-lg">
                {profile.articlesCount.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground text-xs sm:text-sm">Articles</span>
            </div>
            {/* REPUTATION */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-bold text-base sm:text-lg text-amber-500">
                {profile.reputationScore.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-xs sm:text-sm">Rep</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== PROFILE HEADER SKELETON ==>
export const ProfileHeaderSkeleton = () => {
  // RETURN PROFILE HEADER SKELETON
  return (
    <div className="relative">
      {/* BANNER SKELETON */}
      <Skeleton className="h-32 sm:h-48 md:h-64 w-full rounded-xl" />
      {/* PROFILE INFO CONTAINER */}
      <div className="relative px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
        {/* AVATAR SKELETON */}
        <div className="absolute -top-10 sm:-top-14 md:-top-16 left-3 sm:left-4 md:left-6">
          <Skeleton className="size-20 sm:size-28 md:size-32 rounded-full ring-3 sm:ring-4 ring-background" />
        </div>
        {/* ACTION BUTTON SKELETON */}
        <div className="flex justify-end pt-3 sm:pt-4">
          <Skeleton className="h-8 sm:h-9 md:h-10 w-20 sm:w-28 md:w-32 rounded-md" />
        </div>
        {/* INFO SKELETON */}
        <div className="mt-8 sm:mt-6 md:mt-4 space-y-2 sm:space-y-3">
          {/* NAME SKELETON */}
          <Skeleton className="h-6 sm:h-7 md:h-8 w-36 sm:w-44 md:w-48" />
          {/* USERNAME SKELETON */}
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-28 md:w-32" />
          {/* BIO SKELETON */}
          <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4">
            <Skeleton className="h-3 sm:h-4 w-full max-w-md" />
            <Skeleton className="h-3 sm:h-4 w-4/5 max-w-sm" />
          </div>
          {/* META INFO SKELETON */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          </div>
          {/* STATS SKELETON */}
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 mt-4 sm:mt-6">
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
            <Skeleton className="h-5 sm:h-6 w-14 sm:w-18" />
            <Skeleton className="hidden sm:block h-6 w-16" />
            <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};
