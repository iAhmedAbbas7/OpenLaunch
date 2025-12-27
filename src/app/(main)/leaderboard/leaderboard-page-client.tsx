// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Trophy,
  Rocket,
  ArrowUp,
  FileText,
  Users,
  Award,
  Crown,
  Medal,
  TrendingUp,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";
import {
  useLeaderboard,
  leaderboardTypeLabels,
  leaderboardPeriodLabels,
} from "@/hooks/use-leaderboard";
import type {
  LeaderboardType,
  LeaderboardPeriod,
} from "@/hooks/use-leaderboard";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import type { LeaderboardEntry } from "@/hooks/use-leaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== LEADERBOARD TYPE CONFIG ==>
const leaderboardTypeConfig: Record<
  LeaderboardType,
  { icon: typeof Trophy; color: string; valueLabel: string }
> = {
  // REPUTATION
  reputation: {
    icon: Trophy,
    color: "text-amber-500",
    valueLabel: "reputation",
  },
  // PROJECTS
  projects: {
    icon: Rocket,
    color: "text-blue-500",
    valueLabel: "projects",
  },
  // UPVOTES
  upvotes: {
    icon: ArrowUp,
    color: "text-emerald-500",
    valueLabel: "upvotes",
  },
  // ARTICLES
  articles: {
    icon: FileText,
    color: "text-purple-500",
    valueLabel: "articles",
  },
  // FOLLOWERS
  followers: {
    icon: Users,
    color: "text-pink-500",
    valueLabel: "followers",
  },
  // ACHIEVEMENTS
  achievements: {
    icon: Award,
    color: "text-orange-500",
    valueLabel: "achievements",
  },
};

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

// <== LEADERBOARD PAGE CLIENT COMPONENT ==>
export const LeaderboardPageClient = () => {
  // CURRENT USER
  const { data: currentUser } = useCurrentUserProfile();
  // ACTIVE TAB STATE
  const [activeType, setActiveType] = useState<LeaderboardType>("reputation");
  // ACTIVE PERIOD STATE
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>("all");
  // FETCH LEADERBOARD DATA
  const {
    data: leaderboardData,
    isLoading,
    isFetching,
    refetch,
  } = useLeaderboard(activeType, activePeriod, { limit: 50 });
  // GET TYPE CONFIG
  const config = leaderboardTypeConfig[activeType];
  // GET TYPE ICON
  const IconComponent = config.icon;
  // GET ALL LEADERBOARD ITEMS
  const items = leaderboardData?.items ?? [];
  // DETERMINE IF WE HAVE ENOUGH ITEMS FOR PODIUM (NEED AT LEAST 3)
  const hasPodium = items.length >= 3;
  // GET TOP 3 FOR PODIUM (ONLY IF WE HAVE 3+)
  const topThree = hasPodium ? items.slice(0, 3) : [];
  // GET REST OF ITEMS FOR TABLE (ENTRIES AFTER PODIUM OR ALL IF NO PODIUM)
  const restOfList = hasPodium ? items.slice(3) : items;
  // RETURN LEADERBOARD PAGE CLIENT COMPONENT
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="size-10 sm:size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Crown className="size-5 sm:size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading">
                Leaderboard
              </h1>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                <TrendingUp className="size-3 sm:size-3.5 mr-1" />
                {leaderboardData?.total
                  ? `${leaderboardData.total} users`
                  : "Rankings"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Top developers in the OpenLaunch community
            </p>
          </div>
          {/* REFRESH BUTTON */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0 size-8 sm:size-9"
          >
            <RefreshCw
              className={cn("size-3.5 sm:size-4", isFetching && "animate-spin")}
            />
          </Button>
        </div>
      </div>
      {/* TYPE TABS */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {(Object.keys(leaderboardTypeConfig) as LeaderboardType[]).map(
            (type) => {
              // GET TYPE CONFIG
              const typeConfig = leaderboardTypeConfig[type];
              // GET TYPE ICON
              const TypeIcon = typeConfig.icon;
              // CHECK IF TYPE IS ACTIVE
              const isActive = activeType === type;
              // RETURN TYPE BUTTON
              return (
                <Button
                  key={type}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveType(type)}
                  className={cn(
                    "h-8 sm:h-9 px-2.5 sm:px-3 gap-1 sm:gap-1.5 text-xs sm:text-sm",
                    isActive && "shadow-sm"
                  )}
                >
                  <TypeIcon className="size-3.5 sm:size-4" />
                  <span className="hidden xs:inline sm:inline">
                    {leaderboardTypeLabels[type]}
                  </span>
                </Button>
              );
            }
          )}
        </div>
      </div>
      {/* PERIOD FILTER */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {(Object.keys(leaderboardPeriodLabels) as LeaderboardPeriod[]).map(
            (period) => (
              <Button
                key={period}
                variant={activePeriod === period ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActivePeriod(period)}
                className="h-7 sm:h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
              >
                {leaderboardPeriodLabels[period]}
              </Button>
            )
          )}
        </div>
      </div>
      {/* ACTIVE TYPE HEADER */}
      <motion.div
        key={activeType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-linear-to-r from-primary/10 to-primary/5 border mb-6 sm:mb-8"
      >
        <IconComponent
          className={cn("size-6 sm:size-8 shrink-0", config.color)}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold truncate">
            {leaderboardTypeLabels[activeType]} Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {activePeriod === "all"
              ? "All time rankings"
              : activePeriod === "month"
              ? "Rankings for the past 30 days"
              : "Rankings for the past 7 days"}
          </p>
        </div>
      </motion.div>
      {/* LOADING STATE */}
      {isLoading && (
        <>
          {/* PODIUM SKELETON */}
          <div className="flex items-end justify-center gap-2 sm:gap-4 pb-4 mb-6 sm:mb-8">
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
          {/* TABLE SKELETON */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 mb-3 sm:mb-4" />
            {[...Array(7)].map((_, i) => (
              <Card key={i} className="p-3 sm:p-4">
                <div className="flex items-center gap-2.5 sm:gap-4">
                  <Skeleton className="size-8 sm:size-12 rounded-xl shrink-0" />
                  <Skeleton className="size-8 sm:size-12 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                    <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-32" />
                    <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 ml-auto" />
                    <Skeleton className="h-2.5 sm:h-3 w-10 sm:w-12 ml-auto" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      {/* CONTENT */}
      {!isLoading && (
        <>
          {/* PODIUM FOR TOP 3 (ONLY SHOWS IF WE HAVE 3+ ENTRIES) */}
          {hasPodium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end justify-center gap-2 sm:gap-4 pb-4 mb-6 sm:mb-8"
            >
              {/* SECOND PLACE */}
              <PodiumEntry
                entry={topThree[1]}
                rank={2}
                height="h-20 sm:h-32"
                valueLabel={config.valueLabel}
              />
              {/* FIRST PLACE */}
              <PodiumEntry
                entry={topThree[0]}
                rank={1}
                height="h-28 sm:h-40"
                valueLabel={config.valueLabel}
              />
              {/* THIRD PLACE */}
              <PodiumEntry
                entry={topThree[2]}
                rank={3}
                height="h-16 sm:h-24"
                valueLabel={config.valueLabel}
              />
            </motion.div>
          )}
          {/* REST OF THE LIST (OR ALL ITEMS IF NO PODIUM) */}
          {restOfList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: hasPodium ? 0.1 : 0 }}
            >
              <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
                {hasPodium ? "Runners Up" : "Rankings"}
              </h3>
              <div className="space-y-2">
                {restOfList.map((entry) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    valueLabel={config.valueLabel}
                    isCurrentUser={entry.userId === currentUser?.id}
                  />
                ))}
              </div>
            </motion.div>
          )}
          {/* EMPTY STATE */}
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 sm:py-16"
            >
              <div className="size-16 sm:size-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <IconComponent className="size-8 sm:size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                No data yet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                {activePeriod === "all"
                  ? `Be the first to make it to the ${leaderboardTypeLabels[
                      activeType
                    ].toLowerCase()} leaderboard!`
                  : `No ${leaderboardTypeLabels[
                      activeType
                    ].toLowerCase()} activity in the selected period.`}
              </p>
            </motion.div>
          )}
        </>
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

// <== LEADERBOARD ROW COMPONENT ==>
const LeaderboardRow = ({
  entry,
  valueLabel,
  isCurrentUser = false,
}: {
  entry: LeaderboardEntry;
  valueLabel: string;
  isCurrentUser?: boolean;
}) => {
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
          <span className="text-sm sm:text-xl font-bold">
            {entry.value.toLocaleString()}
          </span>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {valueLabel}
          </p>
        </div>
      </div>
    </Card>
  );
};

// <== EXPORTING LEADERBOARD PAGE CLIENT ==>
export default LeaderboardPageClient;
