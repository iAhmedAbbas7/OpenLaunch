// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  getAllAchievements,
  getUserAchievements,
  getUserAchievementSummary,
  checkAndUnlockAchievements,
  getRecentlyUnlockedAchievements,
} from "@/server/actions/achievements";
import type {
  AchievementWithProgress,
  UserAchievementSummary,
} from "@/server/actions/achievements";
import { toast } from "sonner";
import { achievementKeys } from "@/lib/query";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// <== USE ALL ACHIEVEMENTS HOOK ==>
export function useAllAchievements() {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: achievementKeys.list(),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH ALL ACHIEVEMENTS
      const result = await getAllAchievements();
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

// <== USE USER ACHIEVEMENTS HOOK ==>
export function useUserAchievements(userId: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: achievementKeys.byUser(userId),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH USER ACHIEVEMENTS
      const result = await getUserAchievements(userId);
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

// <== USE USER ACHIEVEMENT SUMMARY HOOK ==>
export function useUserAchievementSummary(userId: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: [...achievementKeys.byUser(userId), "summary"],
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH SUMMARY
      const result = await getUserAchievementSummary(userId);
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

// <== USE CHECK ACHIEVEMENTS MUTATION ==>
export function useCheckAchievements() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async () => {
      // CHECK AND UNLOCK ACHIEVEMENTS
      const result = await checkAndUnlockAchievements();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // IF NEW ACHIEVEMENTS UNLOCKED
      if (data.newlyUnlocked.length > 0) {
        // INVALIDATE ACHIEVEMENT QUERIES
        queryClient.invalidateQueries({ queryKey: achievementKeys.all });
        // SHOW TOAST FOR EACH NEW ACHIEVEMENT
        data.newlyUnlocked.forEach((achievement) => {
          toast.success(`🏆 Achievement Unlocked: ${achievement.name}`, {
            description: achievement.description ?? undefined,
            duration: 5000,
          });
        });
      }
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message || "Failed to check achievements");
    },
  });
}

// <== USE RECENTLY UNLOCKED ACHIEVEMENTS HOOK ==>
export function useRecentlyUnlockedAchievements(limit: number = 10) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: [...achievementKeys.all, "recent", limit],
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH RECENT ACHIEVEMENTS
      const result = await getRecentlyUnlockedAchievements(limit);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 60 * 1000,
  });
}

// <== GROUPED ACHIEVEMENTS BY RARITY ==>
export function groupAchievementsByRarity(
  achievements: AchievementWithProgress[]
): Record<string, AchievementWithProgress[]> {
  // GROUP BY RARITY
  return achievements.reduce((acc, achievement) => {
    // GET RARITY
    const rarity = achievement.rarity;
    // INITIALIZE ARRAY IF NOT EXISTS
    if (!acc[rarity]) {
      acc[rarity] = [];
    }
    // ADD ACHIEVEMENT TO ARRAY
    acc[rarity].push(achievement);
    // RETURN ACCUMULATOR
    return acc;
  }, {} as Record<string, AchievementWithProgress[]>);
}

// <== FILTER UNLOCKED ACHIEVEMENTS ==>
export function filterUnlockedAchievements(
  achievements: AchievementWithProgress[]
): AchievementWithProgress[] {
  // FILTER UNLOCKED
  return achievements.filter((a) => a.isUnlocked);
}

// <== FILTER LOCKED ACHIEVEMENTS ==>
export function filterLockedAchievements(
  achievements: AchievementWithProgress[]
): AchievementWithProgress[] {
  // FILTER LOCKED
  return achievements.filter((a) => !a.isUnlocked);
}

// <== GET NEXT ACHIEVABLE ACHIEVEMENTS ==>
export function getNextAchievableAchievements(
  achievements: AchievementWithProgress[],
  limit: number = 3
): AchievementWithProgress[] {
  // FILTER LOCKED AND SORT BY PROGRESS
  return achievements
    .filter((a) => !a.isUnlocked && a.progressPercentage > 0)
    .sort((a, b) => b.progressPercentage - a.progressPercentage)
    .slice(0, limit);
}

// <== EXPORT TYPES ==>
export type { AchievementWithProgress, UserAchievementSummary };
