// <== IMPORTS ==>
import { ProfileHeaderSkeleton } from "@/components/profile";

// <== LOADING COMPONENT ==>
const ProfileLoading = () => {
  // RETURNING LOADING SKELETON
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* PROFILE HEADER SKELETON */}
      <ProfileHeaderSkeleton />
      {/* TABS SKELETON */}
      <div className="mt-8">
        <div className="h-12 w-full bg-secondary/30 rounded-xl animate-pulse" />
        {/* TAB CONTENT SKELETON */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-secondary/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileLoading;
