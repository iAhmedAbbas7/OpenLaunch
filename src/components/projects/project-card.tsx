// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Folder,
  ArrowUpRight,
  MessageSquare,
  ChevronUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectPreview } from "@/types/database";
import { useUpvote, useUpvoteStatus } from "@/hooks/use-projects";

// <== PROJECT CARD PROPS ==>
interface ProjectCardProps {
  // <== PROJECT ==>
  project: ProjectPreview;
  // <== CLASS NAME ==>
  className?: string;
  // <== SHOW OWNER ==>
  showOwner?: boolean;
  // <== ANIMATE ==>
  animate?: boolean;
  // <== INDEX ==>
  index?: number;
}

// <== PROJECT CARD COMPONENT ==>
export const ProjectCard = ({
  project,
  className,
  showOwner = true,
  animate = true,
  index = 0,
}: ProjectCardProps) => {
  // GET AUTH
  const { isAuthenticated } = useAuth();
  // GET UPVOTE STATUS
  const { data: upvoteData } = useUpvoteStatus(project.id);
  // GET UPVOTE MUTATION
  const { mutate: upvote, isPending: isUpvoting } = useUpvote();
  // SERVER HAS UPVOTED STATE
  const serverHasUpvoted = upvoteData?.hasUpvoted ?? false;
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticHasUpvoted, setOptimisticHasUpvoted] =
    useState(serverHasUpvoted);
  // LOCAL STATE FOR OPTIMISTIC UPDATES
  const [optimisticCount, setOptimisticCount] = useState(project.upvotesCount);
  // SYNC WITH SERVER STATE
  useEffect(() => {
    // SET OPTIMISTIC HAS UPVOTED
    setOptimisticHasUpvoted(serverHasUpvoted);
  }, [serverHasUpvoted]);
  // SYNC INITIAL COUNT
  useEffect(() => {
    // SET OPTIMISTIC COUNT
    setOptimisticCount(project.upvotesCount);
  }, [project.upvotesCount]);
  // <== HANDLE UPVOTE ==>
  const handleUpvote = (e: React.MouseEvent) => {
    // PREVENT LINK NAVIGATION
    e.preventDefault();
    // STOP PROPAGATION
    e.stopPropagation();
    // CHECK IF AUTHENTICATED OR ALREADY PENDING
    if (!isAuthenticated || isUpvoting) return;
    // OPTIMISTIC UPDATE - INSTANT UI CHANGE
    const wasUpvoted = optimisticHasUpvoted;
    // SET OPTIMISTIC HAS UPVOTED
    setOptimisticHasUpvoted(!wasUpvoted);
    // SET OPTIMISTIC COUNT
    setOptimisticCount((prev) => (wasUpvoted ? prev - 1 : prev + 1));
    // UPVOTE PROJECT (SERVER CALL)
    upvote(project.id, {
      // ON ERROR
      onError: () => {
        // SET OPTIMISTIC HAS UPVOTED
        setOptimisticHasUpvoted(wasUpvoted);
        // SET OPTIMISTIC COUNT
        setOptimisticCount((prev) => (wasUpvoted ? prev + 1 : prev - 1));
      },
    });
  };
  // FORMAT LAUNCH DATE
  const formattedLaunchDate = project.launchDate
    ? new Date(project.launchDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;
  // CARD CONTENT
  const cardContent = (
    <Card
      className={cn(
        "group relative overflow-hidden",
        "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300",
        className
      )}
    >
      {/* FEATURED BADGE */}
      {project.status === "featured" && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Featured
          </Badge>
        </div>
      )}
      {/* CARD CONTENT */}
      <div className="p-5">
        {/* HEADER */}
        <div className="flex items-start gap-4">
          {/* LOGO */}
          <Link
            href={`/projects/${project.slug}`}
            className="shrink-0 relative"
          >
            {project.logoUrl ? (
              <div className="size-14 relative">
                <Image
                  src={project.logoUrl}
                  alt={project.name}
                  fill
                  sizes="56px"
                  className="rounded-xl object-cover ring-2 ring-border/50"
                />
              </div>
            ) : (
              <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-border/50">
                <Folder className="size-7 text-primary" />
              </div>
            )}
          </Link>
          {/* INFO */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/projects/${project.slug}`}
              className="flex items-center gap-2 group/title"
            >
              <h3 className="font-semibold font-heading text-lg truncate group-hover/title:text-primary transition-colors">
                {project.name}
              </h3>
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover/title:opacity-100 group-hover/title:text-primary transition-all" />
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {project.tagline}
            </p>
          </div>
          {/* UPVOTE BUTTON */}
          <Button
            variant={optimisticHasUpvoted ? "default" : "outline"}
            size="sm"
            onClick={handleUpvote}
            disabled={!isAuthenticated}
            className={cn(
              "flex-col h-auto py-2 px-3 shrink-0 transition-all duration-150",
              optimisticHasUpvoted &&
                "bg-primary/10 text-primary hover:bg-primary/20",
              !isAuthenticated && "cursor-not-allowed opacity-60",
              isUpvoting && "pointer-events-none"
            )}
          >
            <ChevronUp
              className={cn(
                "size-4 transition-all duration-150",
                optimisticHasUpvoted && "text-primary scale-110"
              )}
            />
            <span className="text-xs font-medium tabular-nums">
              {optimisticCount}
            </span>
          </Button>
        </div>
        {/* TECH STACK */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.techStack.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 5 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                +{project.techStack.length - 5}
              </span>
            )}
          </div>
        )}
        {/* FOOTER */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          {/* OWNER */}
          {showOwner && project.owner && (
            <Link
              href={`/u/${project.owner.username}`}
              className="flex items-center gap-2 group/owner"
              onClick={(e) => e.stopPropagation()}
            >
              {project.owner.avatarUrl ? (
                <Image
                  src={project.owner.avatarUrl}
                  alt={project.owner.displayName ?? project.owner.username}
                  width={24}
                  height={24}
                  className="rounded-full ring-1 ring-border/50"
                />
              ) : (
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {(project.owner.displayName ?? project.owner.username)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-muted-foreground group-hover/owner:text-foreground transition-colors">
                {project.owner.displayName ?? project.owner.username}
              </span>
            </Link>
          )}
          {/* STATS */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* LAUNCH DATE */}
            {formattedLaunchDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {formattedLaunchDate}
              </span>
            )}
            {/* COMMENTS */}
            <span className="flex items-center gap-1.5">
              <MessageSquare className="size-3.5" />
              {project.commentsCount}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
  // RETURN WITH OR WITHOUT ANIMATION
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        {cardContent}
      </motion.div>
    );
  }
  // RETURN WITHOUT ANIMATION
  return cardContent;
};

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  return <div className={cn("bg-secondary animate-pulse", className)} />;
};

// <== PROJECT CARD SKELETON ==>
export const ProjectCardSkeleton = ({ className }: { className?: string }) => {
  // RETURN PROJECT CARD SKELETON
  return (
    <Card className={cn("p-5", className)}>
      {/* HEADER */}
      <div className="flex items-start gap-4">
        {/* LOGO SKELETON */}
        <Skeleton className="size-14 rounded-xl shrink-0" />
        {/* INFO SKELETON */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        {/* UPVOTE SKELETON */}
        <Skeleton className="h-14 w-10 rounded shrink-0" />
      </div>
      {/* TECH STACK SKELETON */}
      <div className="flex gap-1.5 mt-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      {/* FOOTER SKELETON */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        {/* OWNER SKELETON */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        {/* STATS SKELETON */}
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </Card>
  );
};
