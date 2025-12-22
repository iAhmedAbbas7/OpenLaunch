// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON BASE COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== STAT CARD SKELETON COMPONENT ==>
const StatCardSkeleton = () => {
  // RETURNING STAT CARD SKELETON
  return (
    <Card className="p-4 sm:p-6">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between">
        {/* ICON SKELETON */}
        <Skeleton className="size-7 sm:size-9 rounded-lg" />
        {/* TREND SKELETON */}
        <Skeleton className="w-10 sm:w-12 h-3 sm:h-4 rounded" />
      </div>
      {/* VALUE AND TITLE */}
      <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
        {/* VALUE SKELETON */}
        <Skeleton className="w-12 sm:w-16 h-6 sm:h-7 rounded" />
        {/* TITLE SKELETON */}
        <Skeleton className="w-20 sm:w-24 h-3 sm:h-4 rounded" />
      </div>
    </Card>
  );
};

// <== QUICK ACTION CARD SKELETON COMPONENT ==>
const QuickActionSkeleton = () => {
  // RETURNING QUICK ACTION SKELETON
  return (
    <Card className="p-4 sm:p-6">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        {/* ICON SKELETON */}
        <Skeleton className="size-9 sm:size-12 rounded-lg" />
        {/* ARROW SKELETON */}
        <Skeleton className="size-4 sm:size-5 rounded" />
      </div>
      {/* TITLE SKELETON */}
      <Skeleton className="w-28 sm:w-32 h-4 sm:h-5 mb-1.5 sm:mb-2 rounded" />
      {/* DESCRIPTION SKELETON */}
      <Skeleton className="w-full h-3 sm:h-4 rounded" />
    </Card>
  );
};

// <== DASHBOARD SKELETON COMPONENT ==>
export const DashboardSkeleton = () => {
  // RETURNING DASHBOARD SKELETON COMPONENT
  return (
    // DASHBOARD CONTAINER
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* WELCOME SECTION SKELETON */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* AVATAR SKELETON */}
        <Skeleton className="size-12 sm:size-16 rounded-full shrink-0" />
        {/* WELCOME TEXT SKELETON */}
        <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
          {/* TITLE SKELETON */}
          <Skeleton className="w-48 sm:w-64 lg:w-80 max-w-full h-6 sm:h-8 rounded" />
          {/* SUBTITLE SKELETON */}
          <Skeleton className="w-56 sm:w-72 max-w-full h-4 sm:h-5 rounded" />
        </div>
      </div>

      {/* STATS GRID SKELETON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* QUICK ACTIONS SKELETON */}
      <div>
        {/* SECTION TITLE SKELETON */}
        <Skeleton className="w-24 sm:w-32 h-5 sm:h-6 mb-3 sm:mb-4 rounded" />
        {/* ACTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING COMPONENTS ==>
export { Skeleton };
