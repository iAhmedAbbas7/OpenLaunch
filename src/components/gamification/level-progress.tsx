// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  reputationLevels,
  getReputationLevel,
  getNextLevelProgress,
} from "./reputation-badge";

// <== LEVEL PROGRESS PROPS ==>
interface LevelProgressProps {
  // <== REPUTATION SCORE ==>
  score: number;
  // <== VARIANT ==>
  variant?: "default" | "compact" | "detailed";
  // <== CLASS NAME ==>
  className?: string;
}

// <== LEVEL PROGRESS COMPONENT ==>
export const LevelProgress = ({
  score,
  variant = "default",
  className,
}: LevelProgressProps) => {
  // GET LEVEL INFO
  const level = getReputationLevel(score);
  // GET NEXT LEVEL INFO
  const { progress, nextLevel, pointsNeeded } = getNextLevelProgress(score);
  // GET ICON COMPONENT
  const IconComponent = level.icon;
  // GET NEXT ICON COMPONENT
  const NextIconComponent = nextLevel?.icon;
  // COMPACT VARIANT
  if (variant === "compact") {
    // RETURN COMPACT PROGRESS
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {/* CURRENT LEVEL ICON */}
        <div
          className={cn(
            "size-8 rounded-lg flex items-center justify-center shrink-0",
            level.bg
          )}
        >
          <IconComponent className={cn("size-4", level.color)} />
        </div>
        {/* PROGRESS */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium truncate">{level.name}</span>
            {nextLevel && (
              <span className="text-xs text-muted-foreground">{progress}%</span>
            )}
          </div>
          {nextLevel ? (
            <Progress value={progress} className="h-1.5" />
          ) : (
            <Progress value={100} className="h-1.5" />
          )}
        </div>
      </div>
    );
  }
  // DEFAULT VARIANT
  if (variant === "default") {
    // RETURN DEFAULT PROGRESS
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center gap-4">
          {/* CURRENT LEVEL */}
          <div
            className={cn(
              "size-14 rounded-xl flex items-center justify-center",
              level.bg
            )}
          >
            <IconComponent className={cn("size-7", level.color)} />
          </div>
          {/* INFO */}
          <div className="flex-1 min-w-0">
            {/* LEVEL NAME AND SCORE */}
            <div className="flex items-center justify-between">
              <h3 className={cn("font-semibold", level.color)}>{level.name}</h3>
              <span className="text-sm text-muted-foreground">
                {score.toLocaleString()} rep
              </span>
            </div>
            {/* PROGRESS */}
            {nextLevel ? (
              <>
                <Progress value={progress} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {pointsNeeded.toLocaleString()} pts to {nextLevel.name}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">
                Maximum level achieved! 🎉
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }
  // DETAILED VARIANT
  return (
    <Card className={cn("p-5", className)}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Level Progress</h3>
        <span className="text-sm text-muted-foreground">
          {score.toLocaleString()} reputation
        </span>
      </div>
      {/* CURRENT TO NEXT LEVEL */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* CURRENT LEVEL */}
        <div className="text-center">
          <div
            className={cn(
              "size-16 rounded-xl flex items-center justify-center mx-auto mb-2",
              level.bg
            )}
          >
            <IconComponent className={cn("size-8", level.color)} />
          </div>
          <p className={cn("text-sm font-medium", level.color)}>{level.name}</p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>
        {/* ARROW */}
        {nextLevel && (
          <>
            <ChevronRight className="size-6 text-muted-foreground" />
            {/* NEXT LEVEL */}
            <div className="text-center opacity-50">
              <div
                className={cn(
                  "size-16 rounded-xl flex items-center justify-center mx-auto mb-2",
                  nextLevel.bg
                )}
              >
                {NextIconComponent && (
                  <NextIconComponent
                    className={cn("size-8", nextLevel.color)}
                  />
                )}
              </div>
              <p className={cn("text-sm font-medium", nextLevel.color)}>
                {nextLevel.name}
              </p>
              <p className="text-xs text-muted-foreground">Next</p>
            </div>
          </>
        )}
      </div>
      {/* PROGRESS BAR */}
      {nextLevel ? (
        <>
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-muted-foreground">{progress}% complete</span>
            <span className="text-muted-foreground">
              {pointsNeeded.toLocaleString()} pts to go
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-lg font-semibold text-primary">
            🏆 Maximum Level!
          </p>
          <p className="text-sm text-muted-foreground">
            You&apos;ve reached the highest reputation level
          </p>
        </div>
      )}
      {/* ALL LEVELS PREVIEW */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-3">All Levels</p>
        <div className="flex items-center justify-between gap-1">
          {reputationLevels.map((lvl) => {
            // GET ICON
            const LvlIcon = lvl.icon;
            // CHECK IF CURRENT
            const isCurrent = lvl.name === level.name;
            // CHECK IF PASSED
            const isPassed = score >= lvl.min;
            // RETURN LEVEL INDICATOR
            return (
              <div
                key={lvl.name}
                className={cn("flex-1 text-center", !isPassed && "opacity-30")}
              >
                <div
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center mx-auto mb-1",
                    lvl.bg,
                    isCurrent && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <LvlIcon className={cn("size-4", lvl.color)} />
                </div>
                <p className="text-[10px] truncate">{lvl.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// <== LEVEL PROGRESS SKELETON ==>
export const LevelProgressSkeleton = ({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact" | "detailed";
  className?: string;
}) => {
  // COMPACT VARIANT
  if (variant === "compact") {
    // RETURN COMPACT SKELETON
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Skeleton className="size-8 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>
      </div>
    );
  }
  // DEFAULT VARIANT
  if (variant === "default") {
    // RETURN DEFAULT SKELETON
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </Card>
    );
  }
  // DETAILED VARIANT
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex justify-between mb-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="text-center">
          <Skeleton className="size-16 rounded-xl mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto mb-1" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
        <Skeleton className="size-6" />
        <div className="text-center">
          <Skeleton className="size-16 rounded-xl mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto mb-1" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="flex justify-between mt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
};

// <== LEVEL PROGRESS DISPLAY NAME ==>
LevelProgress.displayName = "LevelProgress";
// <== LEVEL PROGRESS SKELETON DISPLAY NAME ==>
LevelProgressSkeleton.displayName = "LevelProgressSkeleton";
