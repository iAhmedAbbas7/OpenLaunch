// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== PROFILE HEADER SKELETON ==>
const ProfileHeaderSkeleton = () => {
  return (
    <div className="relative">
      {/* BANNER SKELETON */}
      <Skeleton className="h-32 sm:h-48 md:h-64 w-full rounded-xl" />
      {/* PROFILE INFO CONTAINER */}
      <div className="relative px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
        {/* AVATAR SKELETON */}
        <div className="absolute -top-10 sm:-top-14 md:-top-16 left-3 sm:left-4 md:left-6">
          <Skeleton className="size-20 sm:size-28 md:size-32 rounded-full ring-3 sm:ring-4 ring-background" />
        </div>
        {/* ACTION BUTTON SKELETON */}
        <div className="flex justify-end pt-3 sm:pt-4">
          <Skeleton className="h-8 sm:h-9 md:h-10 w-20 sm:w-28 md:w-32 rounded-md" />
        </div>
        {/* INFO SKELETON */}
        <div className="mt-8 sm:mt-6 md:mt-4 space-y-2 sm:space-y-3">
          {/* NAME SKELETON */}
          <Skeleton className="h-6 sm:h-7 md:h-8 w-36 sm:w-44 md:w-48" />
          {/* USERNAME SKELETON */}
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-28 md:w-32" />
          {/* BIO SKELETON */}
          <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4">
            <Skeleton className="h-3 sm:h-4 w-full max-w-md" />
            <Skeleton className="h-3 sm:h-4 w-4/5 max-w-sm" />
          </div>
          {/* META INFO SKELETON */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          </div>
          {/* STATS SKELETON */}
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 mt-4 sm:mt-6">
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
            <Skeleton className="h-5 sm:h-6 w-14 sm:w-18" />
            <Skeleton className="hidden sm:block h-6 w-16" />
            <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

// <== TAB SKELETON ==>
const TabSkeleton = () => {
  // RETURNING TAB SKELETON COMPONENT
  return (
    <Skeleton className="h-6 sm:h-8 md:h-10 w-12 sm:w-16 md:w-24 rounded-md sm:rounded-lg" />
  );
};

// <== PROJECT CARD SKELETON ==>
const ProjectCardSkeleton = () => {
  // RETURNING PROJECT CARD SKELETON COMPONENT
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* LOGO SKELETON */}
        <Skeleton className="size-10 sm:size-12 rounded-lg shrink-0" />
        {/* INFO SKELETON */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <Skeleton className="h-4 sm:h-5 w-28 sm:w-40" />
          <Skeleton className="h-3 sm:h-4 w-full max-w-xs" />
          <div className="flex gap-3 sm:gap-4">
            <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
            <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
          </div>
        </div>
      </div>
    </Card>
  );
};

// <== LOADING COMPONENT ==>
const ProfileLoading = () => {
  // RETURNING PROFILE LOADING COMPONENT
  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* PROFILE HEADER SKELETON */}
      <ProfileHeaderSkeleton />

      {/* TABS SKELETON */}
      <div className="mt-6 sm:mt-8">
        {/* TAB LIST SKELETON */}
        <div className="w-full p-0.5 sm:p-1 bg-secondary/30 rounded-lg sm:rounded-xl flex flex-wrap gap-0.5 sm:gap-1">
          <TabSkeleton />
          <TabSkeleton />
          <TabSkeleton />
          <TabSkeleton />
          <TabSkeleton />
          <TabSkeleton />
        </div>

        {/* TAB CONTENT SKELETON */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING PROFILE LOADING COMPONENT ==>
export default ProfileLoading;
