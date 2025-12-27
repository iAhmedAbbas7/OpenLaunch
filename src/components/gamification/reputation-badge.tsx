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
import { Star, Zap, Crown, Shield, Award } from "lucide-react";

// <== REPUTATION LEVELS ==>
const reputationLevels = [
  // NEWCOMER
  {
    min: 0,
    max: 99,
    name: "Newcomer",
    icon: Star,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
  },
  // CONTRIBUTOR
  {
    min: 100,
    max: 499,
    name: "Contributor",
    icon: Award,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  // REGULAR
  {
    min: 500,
    max: 999,
    name: "Regular",
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  // VETERAN
  {
    min: 1000,
    max: 4999,
    name: "Veteran",
    icon: Zap,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  // EXPERT
  {
    min: 5000,
    max: 9999,
    name: "Expert",
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  // LEGEND
  {
    min: 10000,
    max: Infinity,
    name: "Legend",
    icon: Crown,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

// <== GET REPUTATION LEVEL ==>
function getReputationLevel(score: number) {
  // FIND MATCHING LEVEL
  return (
    reputationLevels.find(
      (level) => score >= level.min && score <= level.max
    ) ?? reputationLevels[0]
  );
}

// <== GET NEXT LEVEL PROGRESS ==>
function getNextLevelProgress(score: number) {
  // GET CURRENT LEVEL
  const currentLevel = getReputationLevel(score);
  // GET CURRENT LEVEL INDEX
  const currentIndex = reputationLevels.indexOf(currentLevel);
  // CHECK IF MAX LEVEL
  if (currentIndex === reputationLevels.length - 1) {
    // RETURN MAX PROGRESS
    return { progress: 100, nextLevel: null, pointsNeeded: 0 };
  }
  // GET NEXT LEVEL
  const nextLevel = reputationLevels[currentIndex + 1];
  // CALCULATE PROGRESS
  const levelRange = currentLevel.max - currentLevel.min + 1;
  // CALCULATE PROGRESS IN LEVEL
  const progressInLevel = score - currentLevel.min;
  // CALCULATE PROGRESS
  const progress = Math.round((progressInLevel / levelRange) * 100);
  // CALCULATE POINTS NEEDED
  const pointsNeeded = nextLevel.min - score;
  // RETURN PROGRESS INFO
  return { progress, nextLevel, pointsNeeded };
}

// <== REPUTATION BADGE PROPS ==>
interface ReputationBadgeProps {
  // <== REPUTATION SCORE ==>
  score: number;
  // <== SIZE VARIANT ==>
  size?: "xs" | "sm" | "default" | "lg";
  // <== SHOW TOOLTIP ==>
  showTooltip?: boolean;
  // <== SHOW SCORE ==>
  showScore?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== REPUTATION BADGE COMPONENT ==>
export const ReputationBadge = ({
  score,
  size = "default",
  showTooltip = true,
  showScore = true,
  className,
}: ReputationBadgeProps) => {
  // GET LEVEL INFO
  const level = getReputationLevel(score);
  // GET NEXT LEVEL INFO
  const { progress, nextLevel, pointsNeeded } = getNextLevelProgress(score);
  // GET ICON COMPONENT
  const IconComponent = level.icon;
  // SIZE CLASSES
  const sizeClasses = {
    // SMALL
    xs: { container: "gap-1", icon: "size-3", text: "text-xs" },
    // SMALL
    sm: { container: "gap-1.5", icon: "size-3.5", text: "text-xs" },
    // DEFAULT
    default: { container: "gap-2", icon: "size-4", text: "text-sm" },
    // LARGE
    lg: { container: "gap-2.5", icon: "size-5", text: "text-base" },
  };
  // GET SIZE CLASSES
  const sc = sizeClasses[size];
  // BADGE CONTENT
  const badgeContent = (
    <div
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full",
        level.bg,
        sc.container,
        className
      )}
    >
      <IconComponent className={cn(sc.icon, level.color)} />
      {showScore && (
        <span className={cn("font-medium", sc.text, level.color)}>
          {score.toLocaleString()}
        </span>
      )}
    </div>
  );
  // IF NO TOOLTIP, RETURN BADGE
  if (!showTooltip) return badgeContent;
  // RETURN WITH TOOLTIP
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="w-48">
          <div className="space-y-2">
            {/* LEVEL NAME */}
            <div className="flex items-center justify-between">
              <span className={cn("font-semibold", level.color)}>
                {level.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {score.toLocaleString()} rep
              </span>
            </div>
            {/* PROGRESS TO NEXT LEVEL */}
            {nextLevel && (
              <>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={cn(
                      "h-1.5 rounded-full",
                      level.bg.replace("/10", "")
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {pointsNeeded.toLocaleString()} pts to {nextLevel.name}
                </p>
              </>
            )}
            {!nextLevel && (
              <p className="text-xs text-muted-foreground">
                Maximum level reached!
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// <== REPUTATION DISPLAY PROPS ==>
interface ReputationDisplayProps {
  // <== REPUTATION SCORE ==>
  score: number;
  // <== SHOW LEVEL NAME ==>
  showLevelName?: boolean;
  // <== SHOW PROGRESS ==>
  showProgress?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== REPUTATION DISPLAY COMPONENT ==>
export const ReputationDisplay = ({
  score,
  showLevelName = true,
  showProgress = true,
  className,
}: ReputationDisplayProps) => {
  // GET LEVEL INFO
  const level = getReputationLevel(score);
  // GET NEXT LEVEL INFO
  const { progress, nextLevel, pointsNeeded } = getNextLevelProgress(score);
  // GET ICON COMPONENT
  const IconComponent = level.icon;
  // RETURN DISPLAY
  return (
    <div className={cn("space-y-2", className)}>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-10 rounded-lg flex items-center justify-center",
              level.bg
            )}
          >
            <IconComponent className={cn("size-5", level.color)} />
          </div>
          <div>
            {showLevelName && (
              <p className={cn("font-semibold text-sm", level.color)}>
                {level.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {score.toLocaleString()} reputation
            </p>
          </div>
        </div>
      </div>
      {/* PROGRESS */}
      {showProgress && nextLevel && (
        <div className="space-y-1">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                level.bg.replace("/10", "")
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {pointsNeeded.toLocaleString()} pts to {nextLevel.name}
          </p>
        </div>
      )}
    </div>
  );
};

// <== EXPORT UTILITIES ==>
export { getReputationLevel, getNextLevelProgress, reputationLevels };

// <== REPUTATION BADGE DISPLAY NAME ==>
ReputationBadge.displayName = "ReputationBadge";
// <== REPUTATION DISPLAY DISPLAY NAME ==>
ReputationDisplay.displayName = "ReputationDisplay";
