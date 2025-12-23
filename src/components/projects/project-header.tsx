// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Folder,
  Globe,
  Github,
  ExternalLink,
  Calendar,
  Eye,
  MessageSquare,
  Share2,
  Flag,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpvoteButton } from "./upvote-button";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "./bookmark-button";
import type { ProjectWithDetails } from "@/types/database";

// <== PROJECT HEADER PROPS ==>
interface ProjectHeaderProps {
  // <== PROJECT ==>
  project: ProjectWithDetails;
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROJECT HEADER COMPONENT ==>
export const ProjectHeader = ({ project, className }: ProjectHeaderProps) => {
  // FORMAT LAUNCH DATE
  const formattedLaunchDate = project.launchDate
    ? new Date(project.launchDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  // <== HANDLE SHARE ==>
  const handleShare = async () => {
    const url = `${window.location.origin}/projects/${project.slug}`;
    // TRY NATIVE SHARE
    if (navigator.share) {
      // TRY NATIVE SHARE
      try {
        // SHARE PROJECT
        await navigator.share({
          title: project.name,
          text: project.tagline,
          url,
        });
        return;
      } catch {
        // FALLBACK TO CLIPBOARD
      }
    }
    // FALLBACK TO CLIPBOARD
    await navigator.clipboard.writeText(url);
    // SHOW SUCCESS TOAST
    toast.success("Link copied to clipboard");
  };
  // <== HANDLE REPORT ==>
  const handleReport = () => {
    // SHOW INFO TOAST
    toast.info("Report feature coming soon");
  };
  // RETURNING PROJECT HEADER COMPONENT
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* BANNER */}
      {project.bannerUrl && (
        <div className="relative h-32 sm:h-48 md:h-56 w-full">
          <Image
            src={project.bannerUrl}
            alt={`${project.name} banner`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
            className="object-cover"
          />
          {/* GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
        </div>
      )}
      {/* CONTENT */}
      <div
        className={cn(
          "p-4 sm:p-6 md:p-8",
          project.bannerUrl && "-mt-16 sm:-mt-20 relative z-10"
        )}
      >
        {/* TOP ROW */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          {/* LOGO */}
          {project.logoUrl ? (
            <div className="size-16 sm:size-20 md:size-24 relative shrink-0">
              <Image
                src={project.logoUrl}
                alt={project.name}
                fill
                sizes="96px"
                priority
                className="rounded-xl sm:rounded-2xl object-cover ring-2 sm:ring-4 ring-background shadow-xl"
              />
            </div>
          ) : (
            <div className="size-16 sm:size-20 md:size-24 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 ring-2 sm:ring-4 ring-background shadow-xl">
              <Folder className="size-7 sm:size-10 text-primary" />
            </div>
          )}

          {/* INFO & ACTIONS */}
          <div className="flex-1 min-w-0">
            {/* NAME & BADGES */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading">
                {project.name}
              </h1>
              {project.status === "featured" && (
                <Badge className="bg-primary/10 text-primary text-xs">
                  Featured
                </Badge>
              )}
              {project.isOpenSource && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Github className="size-3" />
                  Open Source
                </Badge>
              )}
            </div>

            {/* TAGLINE */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-3 sm:mb-4">
              {project.tagline}
            </p>

            {/* META */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              {/* LAUNCH DATE */}
              {formattedLaunchDate && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Calendar className="size-3.5 sm:size-4" />
                  <span className="hidden xs:inline">Launched</span>{" "}
                  {new Date(project.launchDate!).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {/* VIEWS */}
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Eye className="size-3.5 sm:size-4" />
                {project.viewsCount.toLocaleString()} views
              </span>
              {/* COMMENTS */}
              <span className="flex items-center gap-1 sm:gap-1.5">
                <MessageSquare className="size-3.5 sm:size-4" />
                {project.commentsCount} comments
              </span>
            </div>
          </div>
          {/* ACTIONS - POSITIONED TOP RIGHT */}
          <div className="flex items-center gap-2 shrink-0 self-start">
            {/* UPVOTE */}
            <UpvoteButton
              projectId={project.id}
              initialCount={project.upvotesCount}
              variant="default"
              className="h-9 sm:h-10"
            />
            {/* BOOKMARK */}
            <BookmarkButton
              projectId={project.id}
              variant="icon"
              size="default"
              className="size-9 sm:size-10"
            />
            {/* MORE ACTIONS */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 sm:size-10"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="size-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleReport}
                  className="text-destructive"
                >
                  <Flag className="size-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* LINKS */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
          {project.websiteUrl && (
            <Button
              asChild
              variant="default"
              size="sm"
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
            >
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="size-3.5 sm:size-4" />
                Visit Website
                <ExternalLink className="size-2.5 sm:size-3" />
              </a>
            </Button>
          )}
          {project.githubUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
            >
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-3.5 sm:size-4" />
                View Source
                <ExternalLink className="size-2.5 sm:size-3" />
              </a>
            </Button>
          )}
          {project.demoUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
            >
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3.5 sm:size-4" />
                Live Demo
              </a>
            </Button>
          )}
        </div>
        {/* OWNER & CONTRIBUTORS */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* LABEL */}
            <span className="text-xs sm:text-sm text-muted-foreground">
              Built by
            </span>
            {/* OWNER */}
            <Link
              href={`/u/${project.owner.username}`}
              className="flex items-center gap-1.5 sm:gap-2 group"
            >
              {project.owner.avatarUrl ? (
                <Image
                  src={project.owner.avatarUrl}
                  alt={project.owner.displayName ?? project.owner.username}
                  width={28}
                  height={28}
                  className="size-6 sm:size-8 rounded-full ring-2 ring-border/50"
                />
              ) : (
                <div className="size-6 sm:size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {(project.owner.displayName ?? project.owner.username)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors">
                {project.owner.displayName ?? project.owner.username}
              </span>
              {project.owner.isVerified && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  Verified
                </Badge>
              )}
            </Link>
            {/* CONTRIBUTORS */}
            {project.contributors.length > 0 && (
              <>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  and
                </span>
                <div className="flex -space-x-1.5 sm:-space-x-2">
                  {project.contributors.slice(0, 5).map((contributor) => (
                    <Link
                      key={contributor.id}
                      href={`/u/${contributor.user.username}`}
                      className="relative"
                      title={
                        contributor.user.displayName ??
                        contributor.user.username
                      }
                    >
                      {contributor.user.avatarUrl ? (
                        <Image
                          src={contributor.user.avatarUrl}
                          alt={
                            contributor.user.displayName ??
                            contributor.user.username
                          }
                          width={24}
                          height={24}
                          className="size-5 sm:size-7 rounded-full ring-2 ring-background hover:ring-primary transition-colors"
                        />
                      ) : (
                        <div className="size-5 sm:size-7 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                          <span className="text-[10px] sm:text-xs font-medium text-primary">
                            {(
                              contributor.user.displayName ??
                              contributor.user.username
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                  {project.contributors.length > 5 && (
                    <div className="size-5 sm:size-7 rounded-full bg-secondary flex items-center justify-center ring-2 ring-background text-[10px] sm:text-xs font-medium">
                      +{project.contributors.length - 5}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// <== PROJECT HEADER SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return (
    <div className={cn("bg-secondary animate-pulse rounded", className)} />
  );
};

// <== PROJECT HEADER SKELETON ==>
export const ProjectHeaderSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURN PROJECT HEADER SKELETON
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* BANNER SKELETON */}
      <Skeleton className="h-32 sm:h-48 md:h-56 w-full rounded-none" />
      {/* CONTENT */}
      <div className="p-4 sm:p-6 md:p-8 -mt-16 sm:-mt-20 relative z-10">
        {/* TOP ROW */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          {/* LOGO SKELETON */}
          <Skeleton className="size-16 sm:size-20 md:size-24 rounded-xl sm:rounded-2xl ring-2 sm:ring-4 ring-background shrink-0" />
          {/* INFO SKELETON */}
          <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
            {/* NAME & BADGES */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <Skeleton className="h-6 sm:h-7 md:h-8 w-44 sm:w-60" />
              <Skeleton className="h-5 w-14 sm:w-16 rounded-full" />
              <Skeleton className="h-5 w-20 sm:w-24 rounded-full" />
            </div>
            {/* TAGLINE */}
            <Skeleton className="h-4 sm:h-5 md:h-6 w-full max-w-sm sm:max-w-md mb-3 sm:mb-4" />
            {/* META */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-28" />
              <Skeleton className="h-3.5 sm:h-4 w-14 sm:w-18" />
              <Skeleton className="h-3.5 sm:h-4 w-16 sm:w-22" />
            </div>
          </div>
          {/* ACTIONS SKELETON - MATCHING ACTUAL BUTTON LAYOUT */}
          <div className="flex items-center gap-2 shrink-0 self-start">
            {/* UPVOTE BUTTON - VERTICAL LAYOUT WITH ARROW + COUNT */}
            <div className="h-9 sm:h-10 w-12 sm:w-14 rounded-md bg-secondary animate-pulse flex flex-col items-center justify-center gap-0.5">
              <Skeleton className="size-3 sm:size-4 rounded-sm" />
              <Skeleton className="h-2.5 sm:h-3 w-4 sm:w-5 rounded-sm" />
            </div>
            {/* BOOKMARK BUTTON */}
            <Skeleton className="size-9 sm:size-10 rounded-md" />
            {/* MORE OPTIONS BUTTON */}
            <Skeleton className="size-9 sm:size-10 rounded-md" />
          </div>
        </div>
        {/* LINKS SKELETON */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
          <Skeleton className="h-8 sm:h-9 w-28 sm:w-32 rounded-md" />
          <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 rounded-md" />
        </div>
        {/* OWNER SKELETON */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Skeleton className="h-3 sm:h-3.5 w-12 sm:w-14" />
            <Skeleton className="size-6 sm:size-8 rounded-full" />
            <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-28" />
          </div>
        </div>
      </div>
    </Card>
  );
};
