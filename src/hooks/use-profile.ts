// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  getProfileByUsername,
  getProfileWithStats,
  updateProfile,
  getCurrentUserProfile,
  isUsernameAvailable,
} from "@/server/actions/profiles";
import { toast } from "sonner";
import { profileKeys, queryOptions } from "@/lib/query";
import type { UpdateProfileInput } from "@/lib/validations/profiles";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// <== USE PROFILE HOOK ==>
export function useProfile(username: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: profileKeys.detail(username),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH PROFILE
      const result = await getProfileByUsername(username);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    ...queryOptions.profile,
    // ENABLED
    enabled: !!username,
  });
}

// <== USE PROFILE WITH STATS HOOK ==>
export function useProfileWithStats(username: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: profileKeys.stats(username),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH PROFILE WITH STATS
      const result = await getProfileWithStats(username);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    ...queryOptions.profile,
    // ENABLED
    enabled: !!username,
  });
}

// <== USE CURRENT USER PROFILE HOOK ==>
export function useCurrentUserProfile() {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: profileKeys.me(),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH CURRENT USER PROFILE
      const result = await getCurrentUserProfile();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    ...queryOptions.profile,
  });
}

// <== USE UPDATE PROFILE MUTATION ==>
export function useUpdateProfile() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (data: UpdateProfileInput) => {
      // UPDATE PROFILE
      const result = await updateProfile(data);
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
      // INVALIDATE PROFILE QUERIES
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      // INVALIDATE PROFILE DETAIL
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(data.username),
      });
      // INVALIDATE PROFILE STATS
      queryClient.invalidateQueries({
        queryKey: profileKeys.stats(data.username),
      });
      // SHOW SUCCESS TOAST
      toast.success("Profile updated successfully");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// <== USE USERNAME AVAILABILITY HOOK ==>
export function useUsernameAvailable(username: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: profileKeys.usernameAvailable(username),
    // QUERY FUNCTION
    queryFn: async () => {
      // CHECK USERNAME AVAILABILITY
      const result = await isUsernameAvailable(username);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 10 * 1000,
    // ENABLED
    enabled: !!username && username.length >= 3,
  });
}
