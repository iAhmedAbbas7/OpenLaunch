// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  getLeaderboard,
  getUserRank,
  getTopUsersPreview,
} from "@/server/actions/leaderboard";
import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  LeaderboardType,
} from "@/server/actions/leaderboard";
import { leaderboardKeys } from "@/lib/query";
import { useQuery } from "@tanstack/react-query";
import type { OffsetPaginationParams } from "@/types/database";

// <== USE LEADERBOARD HOOK ==>
export function useLeaderboard(
  type: LeaderboardType,
  period: LeaderboardPeriod = "all",
  params?: OffsetPaginationParams
) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: leaderboardKeys.byType(type, period),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH LEADERBOARD
      const result = await getLeaderboard(type, period, params);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 2 * 60 * 1000,
  });
}

// <== USE USER RANK HOOK ==>
export function useUserRank(userId: string, type: LeaderboardType) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: [...leaderboardKeys.byType(type), "user-rank", userId],
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH USER RANK
      const result = await getUserRank(userId, type);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 2 * 60 * 1000,
    // ENABLED
    enabled: !!userId,
  });
}

// <== USE TOP USERS PREVIEW HOOK ==>
export function useTopUsersPreview(limit: number = 5) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: [...leaderboardKeys.all, "preview", limit],
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH TOP USERS
      const result = await getTopUsersPreview(limit);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 5 * 60 * 1000,
  });
}

// <== LEADERBOARD TYPE LABELS ==>
export const leaderboardTypeLabels: Record<LeaderboardType, string> = {
  reputation: "Reputation",
  projects: "Projects Launched",
  upvotes: "Upvotes Received",
  articles: "Articles Published",
  followers: "Followers",
  achievements: "Achievements",
};

// <== LEADERBOARD TYPE ICONS ==>
export const leaderboardTypeIcons: Record<LeaderboardType, string> = {
  reputation: "Star",
  projects: "Rocket",
  upvotes: "ArrowUp",
  articles: "FileText",
  followers: "Users",
  achievements: "Trophy",
};

// <== LEADERBOARD PERIOD LABELS ==>
export const leaderboardPeriodLabels: Record<LeaderboardPeriod, string> = {
  all: "All Time",
  month: "This Month",
  week: "This Week",
};

// <== GET RANK BADGE COLOR ==>
export function getRankBadgeColor(
  rank: number
): "gold" | "silver" | "bronze" | "default" {
  // RETURN GOLD IF RANK IS 1
  if (rank === 1) return "gold";
  // RETURN SILVER IF RANK IS 2
  if (rank === 2) return "silver";
  // RETURN BRONZE IF RANK IS 3
  if (rank === 3) return "bronze";
  // RETURN DEFAULT IF RANK IS NOT 1, 2, OR 3
  return "default";
}

// <== FORMAT RANK ==>
export function formatRank(rank: number): string {
  // ADD ORDINAL SUFFIX
  const suffixes = ["th", "st", "nd", "rd"];
  // GET V
  const v = rank % 100;
  // RETURN RANK WITH ORDINAL SUFFIX
  return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// <== EXPORT TYPES ==>
export type { LeaderboardEntry, LeaderboardPeriod, LeaderboardType };
