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
      <div className="h-48 md:h-64 w-full bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-xl overflow-hidden relative">
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
      <div className="relative px-4 md:px-6 pb-6">
        {/* AVATAR */}
        <div className="absolute -top-16 left-4 md:left-6">
          <Avatar className="size-32 ring-4 ring-background shadow-xl">
            <AvatarImage
              src={profile.avatarUrl ?? undefined}
              alt={profile.displayName ?? profile.username}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-4xl">
              {(profile.displayName ?? profile.username)
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* ACTION BUTTONS */}
        <div className="flex justify-end pt-4 gap-3">
          {isOwnProfile ? (
            <Button variant="outline" asChild>
              <Link href="/settings/profile">
                <Settings className="size-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          ) : (
            <FollowButton
              targetUserId={profile.id}
              targetUsername={profile.username}
              size="lg"
            />
          )}
        </div>
        {/* USER INFO */}
        <div className="mt-4">
          {/* NAME AND BADGES */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* DISPLAY NAME */}
            <h1 className="text-2xl md:text-3xl font-bold font-heading">
              {profile.displayName ?? profile.username}
            </h1>
            {/* VERIFIED BADGE */}
            {profile.isVerified && (
              <BadgeCheck className="size-6 text-primary" />
            )}
            {/* PRO BADGE */}
            {profile.isPro && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-500 text-xs font-medium">
                <Sparkles className="size-3" />
                PRO
              </span>
            )}
          </div>
          {/* USERNAME */}
          <p className="text-muted-foreground text-lg">@{profile.username}</p>
          {/* BIO */}
          {profile.bio && (
            <p className="mt-4 text-foreground/90 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
          )}
          {/* META INFO */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            {/* LOCATION */}
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {/* WEBSITE */}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <LinkIcon className="size-4" />
                <span>{new URL(profile.website).hostname}</span>
              </a>
            )}
            {/* GITHUB */}
            {profile.githubUsername && (
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Github className="size-4" />
                <span>{profile.githubUsername}</span>
              </a>
            )}
            {/* TWITTER */}
            {profile.twitterUsername && (
              <a
                href={`https://twitter.com/${profile.twitterUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Twitter className="size-4" />
                <span>{profile.twitterUsername}</span>
              </a>
            )}
            {/* JOINED DATE */}
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>
          </div>
          {/* STATS */}
          <div className="flex flex-wrap items-center gap-6 mt-6">
            {/* FOLLOWERS */}
            <Link
              href={`/u/${profile.username}?tab=followers`}
              className="hover:text-primary transition-colors"
            >
              <span className="font-bold text-lg">
                {profile.followersCount.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </Link>
            {/* FOLLOWING */}
            <Link
              href={`/u/${profile.username}?tab=following`}
              className="hover:text-primary transition-colors"
            >
              <span className="font-bold text-lg">
                {profile.followingCount.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">Following</span>
            </Link>
            {/* PROJECTS */}
            <div>
              <span className="font-bold text-lg">
                {profile.projectsCount.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">Projects</span>
            </div>
            {/* ARTICLES */}
            <div>
              <span className="font-bold text-lg">
                {profile.articlesCount.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">Articles</span>
            </div>
            {/* REPUTATION */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-amber-500">
                {profile.reputationScore.toLocaleString()}
              </span>
              <span className="text-muted-foreground">Reputation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// <== PROFILE HEADER SKELETON ==>
export const ProfileHeaderSkeleton = () => {
  // RETURN PROFILE HEADER SKELETON
  return (
    <div className="relative">
      {/* BANNER SKELETON */}
      <div className="h-48 md:h-64 w-full bg-secondary/50 rounded-xl animate-pulse" />
      {/* PROFILE INFO CONTAINER */}
      <div className="relative px-4 md:px-6 pb-6">
        {/* AVATAR SKELETON */}
        <div className="absolute -top-16 left-4 md:left-6">
          <div className="size-32 rounded-full bg-secondary ring-4 ring-background animate-pulse" />
        </div>
        {/* ACTION BUTTON SKELETON */}
        <div className="flex justify-end pt-4">
          <div className="h-10 w-32 bg-secondary rounded-md animate-pulse" />
        </div>
        {/* INFO SKELETON */}
        <div className="mt-4 space-y-3">
          {/* NAME SKELETON */}
          <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
          {/* USERNAME SKELETON */}
          <div className="h-5 w-32 bg-secondary rounded animate-pulse" />
          {/* BIO SKELETON */}
          <div className="h-16 w-full max-w-2xl bg-secondary rounded animate-pulse mt-4" />
          {/* LOCATION SKELETON */}
          <div className="flex gap-4 mt-4">
            {/* LOCATION SKELETON */}
            <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
            {/* WEBSITE SKELETON */}
            <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
            {/* GITHUB SKELETON */}
            <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
          </div>
          {/* STATS SKELETON */}
          <div className="flex gap-6 mt-6">
            {/* FOLLOWERS SKELETON */}
            <div className="h-6 w-20 bg-secondary rounded animate-pulse" />
            {/* FOLLOWING SKELETON */}
            <div className="h-6 w-20 bg-secondary rounded animate-pulse" />
            {/* PROJECTS SKELETON */}
            <div className="h-6 w-20 bg-secondary rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
