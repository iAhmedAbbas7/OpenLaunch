// <== IMPORTS ==>
import { ProjectGridSkeleton } from "@/components/projects";

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== EXPLORE LOADING ==>
const ExploreLoading = () => {
  // RETURN EXPLORE LOADING SKELETON
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER SKELETON */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON SKELETON */}
          <Skeleton className="size-12 sm:size-14 rounded-xl shrink-0" />
          {/* TEXT SKELETON */}
          <div className="min-w-0 space-y-2">
            {/* BADGE SKELETON */}
            <Skeleton className="h-5 w-28 sm:w-32 rounded-full" />
            {/* HEADING SKELETON */}
            <Skeleton className="h-7 sm:h-9 w-40 sm:w-52" />
            {/* SUBTEXT SKELETON */}
            <Skeleton className="h-4 sm:h-5 w-56 sm:w-80 max-w-full" />
          </div>
        </div>
      </div>

      {/* FILTERS SKELETON */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Skeleton className="flex-1 h-10 sm:h-11" />
          <Skeleton className="w-full sm:w-44 h-10 sm:h-11" />
          <Skeleton className="w-full sm:w-32 h-10 sm:h-11" />
        </div>
      </div>

      {/* PROJECTS SKELETON */}
      <ProjectGridSkeleton columns={2} count={6} />
    </div>
  );
};

// <== EXPORTING EXPLORE LOADING SKELETON ==>
export default ExploreLoading;
