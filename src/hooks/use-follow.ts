// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  followUser,
  isFollowing,
  getFollowers,
  getFollowing,
  getSuggestedUsers,
} from "@/server/actions/social";
import { toast } from "sonner";
import { socialKeys, profileKeys } from "@/lib/query";
import type { OffsetPaginationParams } from "@/types/database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// <== USE FOLLOW STATUS HOOK ==>
export function useFollowStatus(targetUserId: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: socialKeys.followStatus(targetUserId),
    // QUERY FUNCTION
    queryFn: async () => {
      // CHECK IF FOLLOWING
      const result = await isFollowing(targetUserId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 30 * 1000,
    // ENABLED
    enabled: !!targetUserId,
  });
}

// <== USE FOLLOW MUTATION ==>
export function useFollow() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (targetUserId: string) => {
      // FOLLOW/UNFOLLOW USER
      const result = await followUser(targetUserId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return { ...result.data, targetUserId };
    },
    // ON MUTATE
    onMutate: async (targetUserId) => {
      // CANCEL OUTGOING RE-FETCHES
      await queryClient.cancelQueries({
        queryKey: socialKeys.followStatus(targetUserId),
      });
      // SNAPSHOT PREVIOUS VALUE
      const previousStatus = queryClient.getQueryData<{ isFollowing: boolean }>(
        socialKeys.followStatus(targetUserId)
      );
      // OPTIMISTICALLY UPDATE
      queryClient.setQueryData(socialKeys.followStatus(targetUserId), {
        isFollowing: !previousStatus?.isFollowing,
      });
      // RETURN CONTEXT WITH PREVIOUS VALUE
      return { previousStatus, targetUserId };
    },
    // ON ERROR
    onError: (error, targetUserId, context) => {
      // ROLLBACK ON ERROR
      if (context?.previousStatus) {
        queryClient.setQueryData(
          socialKeys.followStatus(targetUserId),
          context.previousStatus
        );
      }
      // SHOW ERROR TOAST
      toast.error(error.message || "Failed to update follow status");
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // INVALIDATE RELATED QUERIES
      queryClient.invalidateQueries({
        queryKey: socialKeys.followStatus(data.targetUserId),
      });
      // INVALIDATE FOLLOWERS
      queryClient.invalidateQueries({
        queryKey: socialKeys.followers(data.targetUserId),
      });
      // INVALIDATE ALL PROFILE QUERIES TO UPDATE COUNTS
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.following ? "Following" : "Unfollowed");
    },
  });
}

// <== USE FOLLOWERS HOOK ==>
export function useFollowers(
  profileId: string,
  params?: OffsetPaginationParams
) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: socialKeys.followers(profileId),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH FOLLOWERS
      const result = await getFollowers(profileId, params);
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
    // ENABLED
    enabled: !!profileId,
  });
}

// <== USE FOLLOWING HOOK ==>
export function useFollowing(
  profileId: string,
  params?: OffsetPaginationParams
) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: socialKeys.following(profileId),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH FOLLOWING
      const result = await getFollowing(profileId, params);
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
    // ENABLED
    enabled: !!profileId,
  });
}

// <== USE SUGGESTED USERS HOOK ==>
export function useSuggestedUsers(limit: number = 10) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: socialKeys.suggested(limit),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH SUGGESTED USERS
      const result = await getSuggestedUsers(limit);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
