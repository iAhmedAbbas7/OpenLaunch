// <== IMPORTS ==>
import { ProjectGridSkeleton } from "@/components/projects";

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== LAUNCHES LOADING ==>
const LaunchesLoading = () => {
  // RETURN LAUNCHES LOADING SKELETON
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER SKELETON */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON SKELETON */}
          <Skeleton className="size-12 sm:size-14 rounded-xl shrink-0" />
          {/* TEXT SKELETON */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* BADGE SKELETON */}
            <Skeleton className="h-5 w-40 sm:w-52 rounded-full" />
            {/* HEADING SKELETON */}
            <Skeleton className="h-7 sm:h-9 w-44 sm:w-56" />
            {/* SUBTEXT SKELETON */}
            <Skeleton className="h-4 sm:h-5 w-56 sm:w-80 max-w-full" />
          </div>
          {/* REFRESH BUTTON SKELETON */}
          <Skeleton className="size-9 sm:size-10 rounded-md shrink-0" />
        </div>
      </div>
      {/* FEATURED SECTION SKELETON */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border border-border/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 sm:size-5 rounded" />
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <Skeleton className="h-8 sm:h-9 w-16 sm:w-20 rounded" />
        </div>
        <ProjectGridSkeleton columns={2} count={4} />
      </div>
      {/* TABS SKELETON */}
      <div className="p-1 w-fit mb-4 sm:mb-6 bg-secondary/50 rounded-lg">
        <div className="flex gap-1 sm:gap-2">
          <Skeleton className="h-8 sm:h-9 w-16 sm:w-20 rounded" />
          <Skeleton className="h-8 sm:h-9 w-20 sm:w-24 rounded" />
          <Skeleton className="h-8 sm:h-9 w-20 sm:w-24 rounded" />
        </div>
      </div>
      {/* PROJECTS SKELETON */}
      <ProjectGridSkeleton columns={2} count={6} />
    </div>
  );
};

// <== EXPORTING LAUNCHES LOADING SKELETON ==>
export default LaunchesLoading;
