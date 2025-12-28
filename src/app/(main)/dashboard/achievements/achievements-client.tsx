// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Trophy,
  Award,
  Star,
  Target,
  Sparkles,
  Lock,
  CheckCircle2,
  RefreshCw,
  Gem,
  Crown,
  Medal,
} from "lucide-react";
import {
  useUserAchievements,
  useUserAchievementSummary,
  useCheckAchievements,
  groupAchievementsByRarity,
} from "@/hooks/use-achievements";
import {
  AchievementCard,
  AchievementCardSkeleton,
} from "@/components/gamification/achievement-card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LevelProgress } from "@/components/gamification/level-progress";
import { StreakCounter } from "@/components/gamification/streak-counter";

// <== FILTER TYPES ==>
type FilterType =
  | "all"
  | "unlocked"
  | "locked"
  | "common"
  | "rare"
  | "epic"
  | "legendary";

// <== FILTER CONFIG ==>
const filterConfig: Record<FilterType, { label: string; icon: typeof Trophy }> =
  {
    // ALL
    all: { label: "All", icon: Award },
    // UNLOCKED
    unlocked: { label: "Unlocked", icon: CheckCircle2 },
    // LOCKED
    locked: { label: "Locked", icon: Lock },
    // COMMON
    common: { label: "Common", icon: Medal },
    // RARE
    rare: { label: "Rare", icon: Star },
    // EPIC
    epic: { label: "Epic", icon: Gem },
    // LEGENDARY
    legendary: { label: "Legendary", icon: Crown },
  };

// <== SUMMARY CARD COMPONENT ==>
const SummaryCard = ({
  icon: Icon,
  value,
  label,
  color,
  delay = 0,
}: {
  icon: typeof Trophy;
  value: string | number;
  label: string;
  color: string;
  delay?: number;
}) => {
  // RETURN SUMMARY CARD
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={cn(
              "size-12 sm:size-14 rounded-xl flex items-center justify-center shrink-0",
              color
            )}
          >
            <Icon className="size-6 sm:size-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl sm:text-3xl font-bold">{value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {label}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// <== ACHIEVEMENTS CLIENT COMPONENT ==>
export const AchievementsClient = () => {
  // GET AUTH
  const { profile, isLoading: authLoading } = useAuth();
  // FILTER STATE
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  // GET USER ACHIEVEMENTS (ONLY FETCH WHEN PROFILE IS LOADED)
  const {
    data: achievements,
    isLoading: achievementsLoading,
    error: achievementsError,
    refetch: refetchAchievements,
  } = useUserAchievements(profile?.id ?? "");
  // GET ACHIEVEMENT SUMMARY (ONLY FETCH WHEN PROFILE IS LOADED)
  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useUserAchievementSummary(profile?.id ?? "");
  // CHECK ACHIEVEMENTS MUTATION
  const checkAchievements = useCheckAchievements();
  // FILTER ACHIEVEMENTS
  const filteredAchievements = useMemo(() => {
    // CHECK IF ACHIEVEMENTS ARE LOADING
    if (!achievements) return [];
    // SWITCH ON FILTER TYPE
    switch (activeFilter) {
      // UNLOCKED
      case "unlocked":
        return achievements.filter((a) => a.isUnlocked);
      // LOCKED
      case "locked":
        return achievements.filter((a) => !a.isUnlocked);
      // COMMON
      case "common":
      // RARE
      case "rare":
      // EPIC
      case "epic":
      // LEGENDARY
      case "legendary":
        return achievements.filter((a) => a.rarity === activeFilter);
      // ALL
      default:
        return achievements;
    }
  }, [achievements, activeFilter]);
  // GROUP BY RARITY FOR DISPLAY
  const groupedAchievements = useMemo(() => {
    // CHECK IF FILTER IS NOT ALL
    if (activeFilter !== "all") return null;
    return groupAchievementsByRarity(achievements ?? []);
  }, [achievements, activeFilter]);
  // LOADING STATE (INCLUDE AUTH LOADING)
  const isLoading = authLoading || achievementsLoading || summaryLoading;
  // ERROR STATE
  const error = achievementsError;
  // HANDLE REFETCH AFTER CHECK ACHIEVEMENTS
  const handleCheckAchievements = async () => {
    // CHECK ACHIEVEMENTS
    await checkAchievements.mutateAsync();
    // REFETCH ACHIEVEMENTS DATA
    await Promise.all([refetchAchievements(), refetchSummary()]);
  };
  // RETURN ACHIEVEMENTS PAGE
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8"
      >
        {/* LEFT SIDE - ICON + TEXT */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON */}
          <div className="size-12 sm:size-14 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Trophy className="size-6 sm:size-7 text-amber-500" />
          </div>
          {/* TEXT */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">
                My Achievements
              </h1>
              {summary && (
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {summary.unlockedCount}/{summary.totalAchievements}
                </Badge>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
              Track your progress and unlock rewards
            </p>
          </div>
        </div>
        {/* CHECK ACHIEVEMENTS BUTTON */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCheckAchievements}
          disabled={checkAchievements.isPending || isLoading}
          className="h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto"
        >
          <RefreshCw
            className={cn(
              "size-3.5 sm:size-4 mr-1.5 sm:mr-2",
              checkAchievements.isPending && "animate-spin"
            )}
          />
          Check for New Achievements
        </Button>
      </motion.div>
      {/* ERROR STATE */}
      {error && (
        <Card className="p-6 sm:p-8 text-center mb-6">
          <p className="text-sm sm:text-base text-destructive mb-3 sm:mb-4">
            {error.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="sm:size-default"
          >
            Try Again
          </Button>
        </Card>
      )}
      {/* SUMMARY CARDS */}
      {!error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <SummaryCard
            icon={Trophy}
            value={summary?.unlockedCount ?? 0}
            label="Unlocked"
            color="bg-emerald-500"
            delay={0}
          />
          <SummaryCard
            icon={Target}
            value={summary?.totalAchievements ?? 0}
            label="Total Available"
            color="bg-blue-500"
            delay={0.05}
          />
          <SummaryCard
            icon={Sparkles}
            value={summary?.earnedPoints ?? 0}
            label="Points Earned"
            color="bg-amber-500"
            delay={0.1}
          />
          <SummaryCard
            icon={Star}
            value={summary?.totalPoints ?? 0}
            label="Total Points"
            color="bg-purple-500"
            delay={0.15}
          />
        </div>
      )}
      {/* LEVEL PROGRESS & STREAK */}
      {!error && profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {/* LEVEL PROGRESS */}
          <LevelProgress
            score={profile.reputationScore ?? 0}
            variant="default"
          />
          {/* STREAK COUNTER */}
          <StreakCounter
            currentStreak={profile.currentStreak ?? 0}
            longestStreak={profile.longestStreak ?? 0}
            lastStreakDate={profile.lastStreakDate}
            variant="detailed"
          />
        </motion.div>
      )}
      {/* FILTER TABS */}
      {!error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(Object.keys(filterConfig) as FilterType[]).map((filter) => {
              // GET CONFIG
              const config = filterConfig[filter];
              // GET FILTER ICON
              const FilterIcon = config.icon;
              // CHECK IF FILTER IS ACTIVE
              const isActive = activeFilter === filter;
              // GET COUNT FOR FILTER
              let count = 0;
              // CHECK IF ACHIEVEMENTS ARE LOADED
              if (achievements) {
                // SWITCH ON FILTER TYPE
                switch (filter) {
                  // ALL
                  case "all":
                    count = achievements.length;
                    break;
                  // UNLOCKED
                  case "unlocked":
                    count = achievements.filter((a) => a.isUnlocked).length;
                    break;
                  // LOCKED
                  case "locked":
                    count = achievements.filter((a) => !a.isUnlocked).length;
                    break;
                  // COMMON
                  case "common":
                  // RARE
                  case "rare":
                  // EPIC
                  case "epic":
                  // LEGENDARY
                  case "legendary":
                    count = achievements.filter(
                      (a) => a.rarity === filter
                    ).length;
                    break;
                }
              }
              // RETURN FILTER BUTTON
              return (
                <Button
                  key={filter}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "h-8 sm:h-9 text-xs sm:text-sm gap-1 sm:gap-1.5",
                    isActive && "shadow-sm"
                  )}
                >
                  <FilterIcon className="size-3 sm:size-3.5" />
                  {config.label}
                  <span
                    className={cn(
                      "ml-0.5 text-[10px] sm:text-xs",
                      isActive
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </motion.div>
      )}
      {/* LOADING STATE */}
      {isLoading && <AchievementsGridSkeleton />}
      {/* EMPTY STATE */}
      {!isLoading && !error && filteredAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 sm:p-12 text-center">
            <div className="size-16 sm:size-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6">
              {activeFilter === "unlocked" ? (
                <Trophy className="size-8 sm:size-10 text-muted-foreground" />
              ) : activeFilter === "locked" ? (
                <Lock className="size-8 sm:size-10 text-muted-foreground" />
              ) : (
                <Award className="size-8 sm:size-10 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              {activeFilter === "unlocked"
                ? "No achievements unlocked yet"
                : activeFilter === "locked"
                ? "All achievements unlocked!"
                : `No ${activeFilter} achievements`}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              {activeFilter === "unlocked"
                ? "Keep engaging with the platform to unlock your first achievement!"
                : activeFilter === "locked"
                ? "Congratulations! You've unlocked all available achievements."
                : `There are no ${activeFilter} achievements available at the moment.`}
            </p>
            {activeFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="mt-4 sm:mt-6"
              >
                View All Achievements
              </Button>
            )}
          </Card>
        </motion.div>
      )}
      {/* ACHIEVEMENTS GRID */}
      {!isLoading && !error && filteredAchievements.length > 0 && (
        <>
          {/* GROUPED VIEW (FOR "ALL" FILTER) */}
          {groupedAchievements ? (
            <div className="space-y-6 sm:space-y-8">
              {(["legendary", "epic", "rare", "common"] as const).map(
                (rarity) => {
                  // GET RARITY ACHIEVEMENTS
                  const rarityAchievements = groupedAchievements[rarity];
                  // CHECK IF RARITY ACHIEVEMENTS ARE NOT LOADED
                  if (!rarityAchievements || rarityAchievements.length === 0)
                    return null;
                  // RARITY CONFIG
                  const rarityConfig = {
                    // LEGENDARY
                    legendary: {
                      label: "Legendary",
                      color: "text-amber-500",
                      bg: "bg-amber-500/10",
                    },
                    // EPIC
                    epic: {
                      label: "Epic",
                      color: "text-purple-500",
                      bg: "bg-purple-500/10",
                    },
                    // RARE
                    rare: {
                      label: "Rare",
                      color: "text-blue-500",
                      bg: "bg-blue-500/10",
                    },
                    // COMMON
                    common: {
                      label: "Common",
                      color: "text-zinc-500",
                      bg: "bg-zinc-500/10",
                    },
                  };
                  // GET RARITY CONFIG
                  const config = rarityConfig[rarity];
                  // RETURN RARITY GROUP
                  return (
                    <motion.div
                      key={rarity}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* RARITY HEADER */}
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div
                          className={cn(
                            "size-8 sm:size-10 rounded-lg flex items-center justify-center",
                            config.bg
                          )}
                        >
                          <Crown
                            className={cn("size-4 sm:size-5", config.color)}
                          />
                        </div>
                        <div>
                          <h3
                            className={cn(
                              "text-sm sm:text-base font-semibold",
                              config.color
                            )}
                          >
                            {config.label}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {
                              rarityAchievements.filter((a) => a.isUnlocked)
                                .length
                            }
                            /{rarityAchievements.length} unlocked
                          </p>
                        </div>
                      </div>
                      {/* ACHIEVEMENTS GRID */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {rarityAchievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <AchievementCard
                              achievement={achievement}
                              showProgress={true}
                              size="default"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          ) : (
            /* FLAT GRID VIEW (FOR FILTERED VIEWS) */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <AchievementCard
                    achievement={achievement}
                    showProgress={true}
                    size="default"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// <== ACHIEVEMENTS GRID SKELETON ==>
const AchievementsGridSkeleton = () => {
  // RETURN SKELETON GRID
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <AchievementCardSkeleton key={i} size="default" />
      ))}
    </div>
  );
};
