// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { Users, UserCheck } from "lucide-react";
import { useFollowers, useFollowing } from "@/hooks/use-follow";
import { UserCard, UserCardSkeleton } from "@/components/social/user-card";

// <== PROFILE FOLLOWERS PROPS ==>
interface ProfileFollowersProps {
  // <== PROFILE ID ==>
  profileId: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROFILE FOLLOWERS COMPONENT ==>
export const ProfileFollowers = ({
  profileId,
  className,
}: ProfileFollowersProps) => {
  // FETCH FOLLOWERS
  const { data, isLoading, error } = useFollowers(profileId);
  // HANDLE LOADING
  if (isLoading) {
    // RETURN PROFILE FOLLOWERS SKELETON
    return <ProfileFollowersSkeleton className={className} />;
  }
  // HANDLE ERROR
  if (error) {
    // RETURN ERROR MESSAGE
    return (
      <div className={cn("text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground", className)}>
        Failed to load followers
      </div>
    );
  }
  // HANDLE EMPTY
  if (!data || data.items.length === 0) {
    // RETURN EMPTY MESSAGE
    return (
      <div className={cn("text-center py-8 sm:py-12", className)}>
        <Users className="size-10 sm:size-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-muted-foreground">No followers yet</p>
      </div>
    );
  }
  // RETURN PROFILE FOLLOWERS COMPONENT
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", className)}>
      {data.items.map((user) => (
        <UserCard key={user.id} user={user} showBio showReputation />
      ))}
    </div>
  );
};

// <== PROFILE FOLLOWING PROPS ==>
interface ProfileFollowingProps {
  // <== PROFILE ID ==>
  profileId: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROFILE FOLLOWING COMPONENT ==>
export const ProfileFollowing = ({
  profileId,
  className,
}: ProfileFollowingProps) => {
  // FETCH FOLLOWING
  const { data, isLoading, error } = useFollowing(profileId);
  // HANDLE LOADING
  if (isLoading) {
    // RETURN PROFILE FOLLOWERS SKELETON
    return <ProfileFollowersSkeleton className={className} />;
  }
  // HANDLE ERROR
  if (error) {
    // RETURN ERROR MESSAGE
    return (
      <div className={cn("text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground", className)}>
        Failed to load following
      </div>
    );
  }
  // HANDLE EMPTY
  if (!data || data.items.length === 0) {
    // RETURN EMPTY MESSAGE
    return (
      <div className={cn("text-center py-8 sm:py-12", className)}>
        <UserCheck className="size-10 sm:size-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-muted-foreground">Not following anyone yet</p>
      </div>
    );
  }
  // RETURN PROFILE FOLLOWING COMPONENT
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", className)}>
      {data.items.map((user) => (
        <UserCard key={user.id} user={user} showBio showReputation />
      ))}
    </div>
  );
};

// <== PROFILE FOLLOWERS SKELETON ==>
export const ProfileFollowersSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURN PROFILE FOLLOWERS SKELETON
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
};
