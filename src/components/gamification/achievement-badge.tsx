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
import type { AchievementWithProgress } from "@/hooks/use-achievements";

// <== RARITY COLORS ==>
const rarityColors = {
  // COMMON
  common: {
    bg: "bg-zinc-500/20",
    border: "border-zinc-500/30",
    glow: "shadow-zinc-500/20",
  },
  // RARE
  rare: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/30",
  },
  // EPIC
  epic: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/30",
  },
  // LEGENDARY
  legendary: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/30",
  },
};

// <== ACHIEVEMENT BADGE PROPS ==>
interface AchievementBadgeProps {
  // <== ACHIEVEMENT DATA ==>
  achievement: AchievementWithProgress;
  // <== SIZE VARIANT ==>
  size?: "xs" | "sm" | "default" | "lg";
  // <== SHOW TOOLTIP ==>
  showTooltip?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== ACHIEVEMENT BADGE COMPONENT ==>
export const AchievementBadge = ({
  achievement,
  size = "default",
  showTooltip = true,
  className,
}: AchievementBadgeProps) => {
  // GET RARITY COLORS
  const colors = rarityColors[achievement.rarity];
  // SIZE CLASSES
  const sizeClasses = {
    xs: "size-6 text-sm",
    sm: "size-8 text-base",
    default: "size-10 text-xl",
    lg: "size-14 text-3xl",
  };
  // BADGE ELEMENT
  const badge = (
    <div
      className={cn(
        "relative rounded-lg flex items-center justify-center border transition-all",
        sizeClasses[size],
        achievement.isUnlocked
          ? cn(colors.bg, colors.border, "shadow-lg", colors.glow)
          : "bg-muted/50 border-border opacity-50 grayscale",
        achievement.isUnlocked && "hover:scale-110 cursor-pointer",
        className
      )}
    >
      <span className="drop-shadow-sm">{achievement.icon}</span>
    </div>
  );
  // IF NO TOOLTIP, RETURN BADGE
  if (!showTooltip) return badge;
  // RETURN WITH TOOLTIP
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">
              {achievement.description}
            </p>
            {achievement.isUnlocked && achievement.unlockedAt && (
              <p className="text-xs text-emerald-500">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
            {!achievement.isUnlocked && (
              <p className="text-xs text-muted-foreground">
                Progress: {achievement.currentProgress}/
                {achievement.targetValue}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// <== ACHIEVEMENT BADGE GROUP ==>
interface AchievementBadgeGroupProps {
  // <== ACHIEVEMENTS ==>
  achievements: AchievementWithProgress[];
  // <== MAX DISPLAY ==>
  maxDisplay?: number;
  // <== SIZE ==>
  size?: "xs" | "sm" | "default" | "lg";
  // <== CLASS NAME ==>
  className?: string;
}

export const AchievementBadgeGroup = ({
  achievements,
  maxDisplay = 5,
  size = "sm",
  className,
}: AchievementBadgeGroupProps) => {
  // GET VISIBLE ACHIEVEMENTS
  const visible = achievements.slice(0, maxDisplay);
  // GET REMAINING COUNT
  const remaining = achievements.length - maxDisplay;
  // RETURN BADGE GROUP
  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {visible.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-lg bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground",
            size === "xs"
              ? "size-6"
              : size === "sm"
              ? "size-8"
              : size === "lg"
              ? "size-14"
              : "size-10"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

// <== ACHIEVEMENT BADGE DISPLAY NAME ==>
AchievementBadge.displayName = "AchievementBadge";
// <== ACHIEVEMENT BADGE GROUP DISPLAY NAME ==>
AchievementBadgeGroup.displayName = "AchievementBadgeGroup";
