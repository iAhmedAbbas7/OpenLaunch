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
  // HAS UPVOTED
  const hasUpvoted = upvoteData?.hasUpvoted ?? false;
  // <== HANDLE UPVOTE ==>
  const handleUpvote = (e: React.MouseEvent) => {
    // PREVENT LINK NAVIGATION
    e.preventDefault();
    // STOP PROPAGATION
    e.stopPropagation();
    // CHECK IF AUTHENTICATED
    if (!isAuthenticated) return;
    // UPVOTE PROJECT
    upvote(project.id);
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
            variant={hasUpvoted ? "default" : "outline"}
            size="sm"
            onClick={handleUpvote}
            disabled={isUpvoting || !isAuthenticated}
            className={cn(
              "flex-col h-auto py-2 px-3 shrink-0",
              hasUpvoted && "bg-primary/10 text-primary hover:bg-primary/20",
              !isAuthenticated && "cursor-not-allowed opacity-60"
            )}
          >
            <ChevronUp className={cn("size-4", hasUpvoted && "text-primary")} />
            <span className="text-xs font-medium">{project.upvotesCount}</span>
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

// <== PROJECT CARD SKELETON ==>
export const ProjectCardSkeleton = ({ className }: { className?: string }) => {
  // RETURN PROJECT CARD SKELETON
  return (
    <Card className={cn("p-5", className)}>
      {/* HEADER */}
      <div className="flex items-start gap-4">
        {/* LOGO SKELETON */}
        <div className="size-14 rounded-xl bg-secondary animate-pulse shrink-0" />
        {/* INFO SKELETON */}
        <div className="flex-1 space-y-2">
          <div className="h-6 w-40 bg-secondary rounded animate-pulse" />
          <div className="h-4 w-full bg-secondary rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
        </div>
        {/* UPVOTE SKELETON */}
        <div className="h-14 w-10 bg-secondary rounded animate-pulse shrink-0" />
      </div>
      {/* TECH STACK SKELETON */}
      <div className="flex gap-1.5 mt-4">
        <div className="h-6 w-16 bg-secondary rounded-full animate-pulse" />
        <div className="h-6 w-20 bg-secondary rounded-full animate-pulse" />
        <div className="h-6 w-14 bg-secondary rounded-full animate-pulse" />
      </div>
      {/* FOOTER SKELETON */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        {/* OWNER SKELETON */}
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-secondary animate-pulse" />
          <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
        </div>
        {/* STATS SKELETON */}
        <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
      </div>
    </Card>
  );
};
