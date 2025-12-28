// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { AchievementWithProgress } from "@/hooks/use-achievements";

// <== RARITY COLORS ==>
const rarityColors = {
  // COMMON
  common: {
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    text: "text-zinc-500",
    badge: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300",
  },
  // RARE
  rare: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-500",
    badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  },
  // EPIC
  epic: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-500",
    badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  },
  // LEGENDARY
  legendary: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-500",
    badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  },
};

// <== ACHIEVEMENT CARD PROPS ==>
interface AchievementCardProps {
  // <== ACHIEVEMENT DATA ==>
  achievement: AchievementWithProgress;
  // <== SHOW PROGRESS ==>
  showProgress?: boolean;
  // <== SIZE VARIANT ==>
  size?: "sm" | "default" | "lg";
  // <== CLASS NAME ==>
  className?: string;
}

// <== ACHIEVEMENT CARD COMPONENT ==>
export const AchievementCard = ({
  achievement,
  showProgress = true,
  size = "default",
  className,
}: AchievementCardProps) => {
  // GET RARITY COLORS
  const colors = rarityColors[achievement.rarity];
  // SIZE CLASSES
  const sizeClasses = {
    // SMALL
    sm: {
      card: "p-3",
      icon: "text-2xl",
      iconContainer: "size-10",
      title: "text-sm",
      description: "text-xs",
      badge: "text-[10px] px-1.5 py-0.5",
      points: "text-xs",
    },
    // DEFAULT
    default: {
      card: "p-4",
      icon: "text-3xl",
      iconContainer: "size-14",
      title: "text-base",
      description: "text-sm",
      badge: "text-xs px-2 py-0.5",
      points: "text-sm",
    },
    // LARGE
    lg: {
      card: "p-5",
      icon: "text-4xl",
      iconContainer: "size-16",
      title: "text-lg",
      description: "text-base",
      badge: "text-sm px-2.5 py-1",
      points: "text-base",
    },
  };
  // GET SIZE CLASSES
  const sc = sizeClasses[size];
  // RETURN ACHIEVEMENT CARD
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 h-full",
        achievement.isUnlocked
          ? "hover:shadow-md hover:scale-[1.02]"
          : "opacity-60 grayscale-30",
        className
      )}
    >
      {/* BACKGROUND GRADIENT */}
      <div
        className={cn(
          "absolute inset-0 opacity-30",
          achievement.isUnlocked && colors.bg
        )}
      />
      {/* CONTENT */}
      <div className={cn("relative h-full flex flex-col", sc.card)}>
        <div className="flex items-start gap-3 flex-1">
          {/* ICON CONTAINER */}
          <div
            className={cn(
              "shrink-0 rounded-xl flex items-center justify-center border",
              sc.iconContainer,
              achievement.isUnlocked
                ? cn(colors.bg, colors.border)
                : "bg-muted border-border"
            )}
          >
            {achievement.isUnlocked ? (
              <span className={sc.icon}>{achievement.icon}</span>
            ) : (
              <Lock
                className={cn(
                  "text-muted-foreground",
                  size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5"
                )}
              />
            )}
          </div>
          {/* INFO */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-2">
              {/* TITLE */}
              <h3
                className={cn("font-semibold font-heading truncate", sc.title)}
              >
                {achievement.name}
              </h3>
              {/* RARITY BADGE */}
              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0 capitalize font-medium",
                  sc.badge,
                  achievement.isUnlocked && colors.badge
                )}
              >
                {achievement.rarity}
              </Badge>
            </div>
            {/* DESCRIPTION */}
            <p
              className={cn(
                "text-muted-foreground mt-1 line-clamp-2 flex-1",
                sc.description
              )}
            >
              {achievement.description}
            </p>
            {/* POINTS AND STATUS */}
            <div className="flex items-center justify-between mt-2">
              {/* POINTS */}
              <span className={cn("font-medium", sc.points, colors.text)}>
                +{achievement.points} pts
              </span>
              {/* STATUS */}
              {achievement.isUnlocked ? (
                <div className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="size-4" />
                  <span className={cn("font-medium", sc.points)}>Unlocked</span>
                </div>
              ) : showProgress && achievement.progressPercentage > 0 ? (
                <span className={cn("text-muted-foreground", sc.points)}>
                  {achievement.currentProgress}/{achievement.targetValue}
                </span>
              ) : null}
            </div>
            {/* PROGRESS BAR - ALWAYS RESERVE SPACE FOR CONSISTENCY */}
            <div className="mt-3 h-1.5">
              {!achievement.isUnlocked &&
                showProgress &&
                achievement.targetValue > 0 && (
                  <Progress
                    value={achievement.progressPercentage}
                    className="h-1.5"
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// <== ACHIEVEMENT CARD SKELETON ==>
export const AchievementCardSkeleton = ({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) => {
  // SIZE CLASSES
  const sizeClasses = {
    // SMALL
    sm: { card: "p-3", icon: "size-10" },
    // DEFAULT
    default: { card: "p-4", icon: "size-14" },
    // LARGE
    lg: { card: "p-5", icon: "size-16" },
  };
  // GET SIZE CLASSES
  const sc = sizeClasses[size];
  // RETURN SKELETON
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className={sc.card}>
        <div className="flex items-start gap-3">
          {/* ICON SKELETON */}
          <Skeleton className={cn("rounded-xl shrink-0", sc.icon)} />
          {/* INFO SKELETON */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-1.5 w-full mt-2" />
          </div>
        </div>
      </div>
    </Card>
  );
};

// <== ACHIEVEMENT CARD DISPLAY NAME ==>
AchievementCard.displayName = "AchievementCard";
// <== ACHIEVEMENT CARD SKELETON DISPLAY NAME ==>
AchievementCardSkeleton.displayName = "AchievementCardSkeleton";
