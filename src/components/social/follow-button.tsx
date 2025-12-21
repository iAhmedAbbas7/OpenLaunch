// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { useFollow, useFollowStatus } from "@/hooks/use-follow";

// <== FOLLOW BUTTON PROPS ==>
interface FollowButtonProps {
  // <== TARGET USER ID ==>
  targetUserId: string;
  // <== TARGET USERNAME (FOR DISPLAY) ==>
  targetUsername?: string;
  // <== VARIANT ==>
  variant?: "default" | "outline" | "ghost";
  // <== SIZE ==>
  size?: "default" | "sm" | "lg" | "icon";
  // <== CLASS NAME ==> ==>
  className?: string;
  // <== SHOW TEXT ==>
  showText?: boolean;
}

// <== FOLLOW BUTTON COMPONENT ==>
export const FollowButton = ({
  targetUserId,
  targetUsername,
  variant = "default",
  size = "default",
  className,
  showText = true,
}: FollowButtonProps) => {
  // GET AUTH STATE
  const { user, profile } = useAuthStore();
  // GET FOLLOW STATUS
  const { data: followStatus, isLoading: isLoadingStatus } =
    useFollowStatus(targetUserId);
  // GET FOLLOW MUTATION
  const { mutate: toggleFollow, isPending: isToggling } = useFollow();
  // CHECK IF IS OWN PROFILE
  const isOwnProfile = profile?.id === targetUserId;
  // CHECK IF FOLLOWING
  const isFollowing = followStatus?.isFollowing ?? false;
  // IS LOADING
  const isLoading = isLoadingStatus || isToggling;
  // <== HANDLE FOLLOW CLICK ==>
  const handleClick = () => {
    // CHECK IF AUTHENTICATED
    if (!user) {
      // REDIRECT TO SIGN IN (OR SHOW MODAL)
      window.location.href = `/sign-in?next=/u/${targetUsername}`;
      return;
    }
    // TOGGLE FOLLOW
    toggleFollow(targetUserId);
  };
  // DON'T SHOW FOR OWN PROFILE
  if (isOwnProfile) {
    // RETURN NULL
    return null;
  }
  // RETURNING FOLLOW BUTTON
  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      className={cn(
        "gap-2 transition-all duration-200",
        isFollowing &&
          "hover:border-destructive hover:text-destructive hover:bg-destructive/10",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {/* LOADING SPINNER */}
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="size-4" />
      ) : (
        <UserPlus className="size-4" />
      )}
      {/* BUTTON TEXT */}
      {showText && <span>{isFollowing ? "Following" : "Follow"}</span>}
    </Button>
  );
};
