// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== SUMMARY CARD SKELETON ==>
const SummaryCardSkeleton = () => {
  // RETURNING SUMMARY CARD SKELETON
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="size-12 sm:size-14 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-6 sm:h-7 w-16 sm:w-20" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
        </div>
      </div>
    </Card>
  );
};

// <== ACHIEVEMENT CARD SKELETON ==>
const AchievementCardSkeleton = () => {
  // RETURNING ACHIEVEMENT CARD SKELETON
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start gap-3">
        {/* ICON SKELETON */}
        <Skeleton className="size-10 sm:size-14 rounded-xl shrink-0" />
        {/* INFO SKELETON */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
            <Skeleton className="h-5 w-14 sm:w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-full max-w-[200px] sm:max-w-[280px]" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
          </div>
          <Skeleton className="h-1.5 w-full mt-2" />
        </div>
      </div>
    </Card>
  );
};

// <== MY ACHIEVEMENTS LOADING ==>
const MyAchievementsLoading = () => {
  // RETURN MY ACHIEVEMENTS LOADING SKELETON
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* LEFT SIDE - ICON + TEXT */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON SKELETON */}
          <Skeleton className="size-12 sm:size-14 rounded-xl shrink-0" />
          {/* TEXT SKELETON */}
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <Skeleton className="h-7 sm:h-9 w-40 sm:w-48" />
            <Skeleton className="h-4 sm:h-5 w-56 sm:w-72 max-w-full" />
          </div>
        </div>
        {/* RIGHT SIDE - BUTTON SKELETON */}
        <Skeleton className="h-9 sm:h-10 w-full sm:w-40" />
      </div>
      {/* SUMMARY CARDS SKELETON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
      {/* PROGRESS CARDS SKELETON */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* LEVEL PROGRESS SKELETON */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </Card>
        {/* STREAK SKELETON */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 sm:size-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
      </div>
      {/* FILTER TABS SKELETON */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 sm:h-9 w-20 sm:w-24 rounded-md" />
        ))}
      </div>
      {/* ACHIEVEMENTS GRID SKELETON */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <AchievementCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// <== EXPORTING MY ACHIEVEMENTS LOADING SKELETON ==>
export default MyAchievementsLoading;
