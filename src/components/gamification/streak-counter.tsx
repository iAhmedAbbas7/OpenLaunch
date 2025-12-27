// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Calendar, Trophy } from "lucide-react";

// <== STREAK COUNTER PROPS ==>
interface StreakCounterProps {
  // <== CURRENT STREAK ==>
  currentStreak: number;
  // <== LONGEST STREAK ==>
  longestStreak: number;
  // <== LAST STREAK DATE ==>
  lastStreakDate?: string | null;
  // <== VARIANT ==>
  variant?: "default" | "compact" | "detailed";
  // <== CLASS NAME ==>
  className?: string;
}

// <== STREAK COUNTER COMPONENT ==>
export const StreakCounter = ({
  currentStreak,
  longestStreak,
  lastStreakDate,
  variant = "default",
  className,
}: StreakCounterProps) => {
  // GET STREAK STATUS
  const isActiveToday = lastStreakDate
    ? isToday(new Date(lastStreakDate))
    : false;
  // FORMAT LAST STREAK DATE
  const formattedLastStreak = lastStreakDate
    ? new Date(lastStreakDate).toLocaleDateString()
    : null;
  // STREAK COLOR BASED ON LENGTH
  const streakColor =
    currentStreak >= 30
      ? "text-amber-500"
      : currentStreak >= 7
      ? "text-orange-500"
      : currentStreak >= 3
      ? "text-red-500"
      : "text-muted-foreground";
  // FLAME SIZE BASED ON STREAK
  const flameSize =
    currentStreak >= 30
      ? "size-8"
      : currentStreak >= 7
      ? "size-7"
      : currentStreak >= 3
      ? "size-6"
      : "size-5";
  // COMPACT VARIANT
  if (variant === "compact") {
    // RETURN COMPACT STREAK
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50",
                className
              )}
            >
              <Flame
                className={cn(
                  "size-4",
                  currentStreak > 0 ? streakColor : "text-muted-foreground"
                )}
              />
              <span className="text-sm font-medium">{currentStreak}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="space-y-1">
              <p className="font-semibold">{currentStreak} Day Streak</p>
              <p className="text-xs text-muted-foreground">
                Longest: {longestStreak} days
              </p>
              {formattedLastStreak && (
                <p className="text-xs text-muted-foreground">
                  Last active: {formattedLastStreak}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  // DEFAULT AND DETAILED VARIANT
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-4">
        {/* FLAME ICON */}
        <div
          className={cn(
            "relative flex items-center justify-center size-16 rounded-xl bg-linear-to-br",
            currentStreak > 0
              ? "from-orange-500/20 to-red-500/20"
              : "from-muted/50 to-muted"
          )}
        >
          <Flame
            className={cn(
              flameSize,
              currentStreak > 0 ? streakColor : "text-muted-foreground",
              currentStreak >= 7 && "animate-pulse"
            )}
          />
          {isActiveToday && (
            <div className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-500 border-2 border-background" />
          )}
        </div>
        {/* STREAK INFO */}
        <div className="flex-1">
          {/* CURRENT STREAK */}
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", streakColor)}>
              {currentStreak}
            </span>
            <span className="text-muted-foreground">day streak</span>
          </div>
          {/* DETAILED INFO */}
          {variant === "detailed" && (
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {/* LONGEST STREAK */}
              <div className="flex items-center gap-1.5">
                <Trophy className="size-4 text-amber-500" />
                <span>Best: {longestStreak}</span>
              </div>
              {/* LAST ACTIVE */}
              {formattedLastStreak && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span>{formattedLastStreak}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* STREAK MILESTONES */}
      {variant === "detailed" && currentStreak > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            Streak Milestones
          </p>
          <div className="flex gap-2">
            {[3, 7, 14, 30, 100, 365].map((milestone) => (
              <div
                key={milestone}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  currentStreak >= milestone
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {milestone}d
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// <== STREAK COUNTER SKELETON ==>
export const StreakCounterSkeleton = ({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact" | "detailed";
  className?: string;
}) => {
  // COMPACT VARIANT
  if (variant === "compact") {
    // RETURN COMPACT SKELETON
    return <Skeleton className={cn("h-8 w-16 rounded-full", className)} />;
  }
  // DEFAULT AND DETAILED VARIANT
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-24" />
          {variant === "detailed" && <Skeleton className="h-4 w-32" />}
        </div>
      </div>
      {variant === "detailed" && (
        <div className="mt-4 pt-4 border-t">
          <Skeleton className="h-3 w-24 mb-2" />
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-10" />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// <== HELPER: CHECK IF DATE IS TODAY ==>
function isToday(date: Date): boolean {
  // GET TODAY
  const today = new Date();
  // CHECK IF DATE IS TODAY
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// <== STREAK COUNTER DISPLAY NAME ==>
StreakCounter.displayName = "StreakCounter";
// <== STREAK COUNTER SKELETON DISPLAY NAME ==>
StreakCounterSkeleton.displayName = "StreakCounterSkeleton";
