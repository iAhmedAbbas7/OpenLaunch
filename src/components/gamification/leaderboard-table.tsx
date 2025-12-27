// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  BadgeCheck,
  Crown,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaderboardEntry } from "@/hooks/use-leaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== RANK BADGE COLORS ==>
const rankBadgeColors = {
  // FIRST PLACE
  1: {
    bg: "bg-amber-500",
    border: "border-amber-400",
    text: "text-amber-950",
    icon: Crown,
  },
  // SECOND PLACE
  2: {
    bg: "bg-slate-400",
    border: "border-slate-300",
    text: "text-slate-950",
    icon: Medal,
  },
  // THIRD PLACE
  3: {
    bg: "bg-orange-600",
    border: "border-orange-500",
    text: "text-orange-950",
    icon: Award,
  },
};

// <== LEADERBOARD TABLE PROPS ==>
interface LeaderboardTableProps {
  // <== ENTRIES ==>
  entries: LeaderboardEntry[];
  // <== VALUE LABEL ==>
  valueLabel?: string;
  // <== LOADING STATE ==>
  isLoading?: boolean;
  // <== CURRENT USER ID (FOR HIGHLIGHTING) ==>
  currentUserId?: string;
  // <== SHOW CHANGE ==>
  showChange?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== LEADERBOARD TABLE COMPONENT ==>
export const LeaderboardTable = ({
  entries,
  valueLabel = "Score",
  isLoading = false,
  currentUserId,
  showChange = false,
  className,
}: LeaderboardTableProps) => {
  // LOADING STATE
  if (isLoading) {
    // RETURN SKELETON
    return (
      <div className={cn("space-y-2", className)}>
        {[...Array(10)].map((_, i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
    );
  }
  // EMPTY STATE
  if (entries.length === 0) {
    // RETURN EMPTY MESSAGE
    return (
      <Card className={cn("p-6 sm:p-8 text-center", className)}>
        <p className="text-sm sm:text-base text-muted-foreground">
          No data available
        </p>
      </Card>
    );
  }
  // RETURN TABLE
  return (
    <div className={cn("space-y-2", className)}>
      {entries.map((entry) => (
        <LeaderboardRow
          key={entry.userId}
          entry={entry}
          valueLabel={valueLabel}
          isCurrentUser={entry.userId === currentUserId}
          showChange={showChange}
        />
      ))}
    </div>
  );
};

// <== LEADERBOARD ROW PROPS ==>
interface LeaderboardRowProps {
  // <== ENTRY DATA ==>
  entry: LeaderboardEntry;
  // <== VALUE LABEL ==>
  valueLabel: string;
  // <== IS CURRENT USER ==>
  isCurrentUser?: boolean;
  // <== SHOW CHANGE ==>
  showChange?: boolean;
}

// <== LEADERBOARD ROW COMPONENT ==>
const LeaderboardRow = ({
  entry,
  valueLabel,
  isCurrentUser = false,
  showChange = false,
}: LeaderboardRowProps) => {
  // GET RANK BADGE CONFIG
  const rankConfig = rankBadgeColors[entry.rank as 1 | 2 | 3];
  // GET RANK ICON IF TOP 3
  const RankIcon = rankConfig?.icon;
  // RETURN ROW
  return (
    <Card
      className={cn(
        "p-2.5 sm:p-4 transition-all duration-200 hover:bg-secondary/50",
        isCurrentUser && "ring-2 ring-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* RANK BADGE */}
        <div
          className={cn(
            "shrink-0 size-8 sm:size-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-xl",
            rankConfig
              ? cn(rankConfig.bg, rankConfig.text)
              : "bg-muted text-muted-foreground"
          )}
        >
          {RankIcon ? <RankIcon className="size-4 sm:size-6" /> : entry.rank}
        </div>
        {/* USER INFO */}
        <Link
          href={`/u/${entry.username}`}
          className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 group"
        >
          {/* AVATAR */}
          <Avatar className="size-8 sm:size-12 shrink-0 ring-2 ring-border">
            <AvatarImage
              src={entry.avatarUrl ?? undefined}
              alt={entry.displayName ?? entry.username}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs sm:text-base">
              {(entry.displayName ?? entry.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* NAME */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-semibold truncate text-xs sm:text-base group-hover:text-primary transition-colors">
                {entry.displayName ?? entry.username}
              </span>
              {entry.isVerified && (
                <BadgeCheck className="size-3.5 sm:size-4 text-primary shrink-0" />
              )}
            </div>
            <span className="text-[10px] sm:text-sm text-muted-foreground">
              @{entry.username}
            </span>
          </div>
        </Link>
        {/* VALUE */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 justify-end">
            {showChange && entry.change !== undefined && entry.change !== 0 && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-[10px] sm:text-xs",
                  entry.change > 0 ? "text-emerald-500" : "text-red-500"
                )}
              >
                {entry.change > 0 ? (
                  <TrendingUp className="size-2.5 sm:size-3" />
                ) : (
                  <TrendingDown className="size-2.5 sm:size-3" />
                )}
                <span>{Math.abs(entry.change)}</span>
              </div>
            )}
            <span className="text-sm sm:text-xl font-bold">
              {entry.value.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {valueLabel}
          </p>
        </div>
      </div>
    </Card>
  );
};

// <== LEADERBOARD ROW SKELETON ==>
const LeaderboardRowSkeleton = () => {
  // RETURN SKELETON
  return (
    <Card className="p-2.5 sm:p-4">
      <div className="flex items-center gap-2.5 sm:gap-4">
        <Skeleton className="size-8 sm:size-12 rounded-lg sm:rounded-xl shrink-0" />
        <Skeleton className="size-8 sm:size-12 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-32" />
          <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-20" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-4 sm:h-6 w-10 sm:w-16 ml-auto" />
          <Skeleton className="h-2.5 sm:h-3 w-8 sm:w-12 ml-auto" />
        </div>
      </div>
    </Card>
  );
};

// <== LEADERBOARD PODIUM PROPS ==>
interface LeaderboardPodiumProps {
  // <== TOP 3 ENTRIES ==>
  entries: LeaderboardEntry[];
  // <== VALUE LABEL ==>
  valueLabel?: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== LEADERBOARD PODIUM COMPONENT ==>
export const LeaderboardPodium = ({
  entries,
  valueLabel = "Score",
  className,
}: LeaderboardPodiumProps) => {
  // GET TOP 3
  const [first, second, third] = entries.slice(0, 3);
  // IF NOT ENOUGH ENTRIES, RETURN NULL
  if (!first) return null;
  // RETURN PODIUM
  return (
    <div
      className={cn(
        "flex items-end justify-center gap-2 sm:gap-4 pb-4",
        className
      )}
    >
      {/* SECOND PLACE */}
      {second && (
        <PodiumEntry
          entry={second}
          rank={2}
          height="h-20 sm:h-32"
          valueLabel={valueLabel}
        />
      )}
      {/* FIRST PLACE */}
      <PodiumEntry
        entry={first}
        rank={1}
        height="h-28 sm:h-40"
        valueLabel={valueLabel}
      />
      {/* THIRD PLACE */}
      {third && (
        <PodiumEntry
          entry={third}
          rank={3}
          height="h-16 sm:h-24"
          valueLabel={valueLabel}
        />
      )}
    </div>
  );
};

// <== PODIUM ENTRY COMPONENT ==>
const PodiumEntry = ({
  entry,
  rank,
  height,
  valueLabel,
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  height: string;
  valueLabel: string;
}) => {
  // GET RANK CONFIG
  const config = rankBadgeColors[rank];
  // GET ICON
  const IconComponent = config.icon;
  // RETURN ENTRY
  return (
    <div className="flex flex-col items-center">
      {/* AVATAR */}
      <Link href={`/u/${entry.username}`}>
        <Avatar
          className={cn(
            "ring-4 transition-transform hover:scale-110",
            rank === 1 ? "size-14 sm:size-20" : "size-10 sm:size-16",
            config.border
          )}
        >
          <AvatarImage
            src={entry.avatarUrl ?? undefined}
            alt={entry.displayName ?? entry.username}
          />
          <AvatarFallback className="text-base sm:text-lg font-bold bg-primary/10 text-primary">
            {(entry.displayName ?? entry.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      {/* NAME */}
      <Link
        href={`/u/${entry.username}`}
        className="mt-1.5 sm:mt-2 font-semibold text-xs sm:text-sm truncate max-w-16 sm:max-w-24 hover:text-primary transition-colors"
      >
        {entry.displayName ?? entry.username}
      </Link>
      {/* VALUE */}
      <span className="text-[10px] sm:text-xs text-muted-foreground">
        {entry.value.toLocaleString()} {valueLabel}
      </span>
      {/* PEDESTAL */}
      <div
        className={cn(
          "mt-1.5 sm:mt-2 w-16 sm:w-24 rounded-t-lg flex flex-col items-center justify-start pt-1.5 sm:pt-2",
          config.bg,
          height
        )}
      >
        <IconComponent className={cn("size-5 sm:size-8", config.text)} />
        <span className={cn("text-xl sm:text-3xl font-bold", config.text)}>
          {rank}
        </span>
      </div>
    </div>
  );
};

// <== LEADERBOARD PODIUM SKELETON ==>
export const LeaderboardPodiumSkeleton = () => {
  // RETURN SKELETON
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 pb-4">
      {[2, 1, 3].map((rank) => (
        <div key={rank} className="flex flex-col items-center">
          <Skeleton
            className={cn(
              "rounded-full",
              rank === 1 ? "size-14 sm:size-20" : "size-10 sm:size-16"
            )}
          />
          <Skeleton className="h-3 sm:h-4 w-14 sm:w-20 mt-2 rounded" />
          <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16 mt-1 rounded" />
          <Skeleton
            className={cn(
              "w-16 sm:w-24 rounded-t-lg mt-2",
              rank === 1
                ? "h-28 sm:h-40"
                : rank === 2
                ? "h-20 sm:h-32"
                : "h-16 sm:h-24"
            )}
          />
        </div>
      ))}
    </div>
  );
};

// <== LEADERBOARD TABLE DISPLAY NAME ==>
LeaderboardTable.displayName = "LeaderboardTable";
// <== LEADERBOARD PODIUM DISPLAY NAME ==>
LeaderboardPodium.displayName = "LeaderboardPodium";
// <== LEADERBOARD PODIUM SKELETON DISPLAY NAME ==>
LeaderboardPodiumSkeleton.displayName = "LeaderboardPodiumSkeleton";
