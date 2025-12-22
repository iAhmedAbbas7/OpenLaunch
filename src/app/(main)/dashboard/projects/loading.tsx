// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== PROJECT CARD SKELETON ==>
const ProjectCardSkeleton = () => {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        {/* LOGO SKELETON */}
        <Skeleton className="size-10 sm:size-14 rounded-lg shrink-0" />
        {/* INFO SKELETON */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Skeleton className="h-4 sm:h-5 w-28 sm:w-40" />
            <Skeleton className="h-5 w-12 sm:w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64 max-w-full" />
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
            <Skeleton className="hidden sm:block h-4 w-16" />
          </div>
        </div>
        {/* ACTIONS SKELETON */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Skeleton className="hidden sm:block h-8 sm:h-9 w-16 sm:w-20" />
          <Skeleton className="size-8 sm:size-9 rounded-md" />
        </div>
      </div>
    </Card>
  );
};

// <== MY PROJECTS LOADING ==>
const MyProjectsLoading = () => {
  // RETURN MY PROJECTS LOADING SKELETON
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
            <Skeleton className="h-7 sm:h-9 w-36 sm:w-44" />
            <Skeleton className="h-4 sm:h-5 w-48 sm:w-64 max-w-full" />
          </div>
        </div>
        {/* RIGHT SIDE - BUTTONS SKELETON */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-40" />
          <Skeleton className="h-9 sm:h-10 w-20 sm:w-32" />
        </div>
      </div>
      {/* PROJECTS LIST SKELETON */}
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// <== EXPORTING MY PROJECTS LOADING SKELETON ==>
export default MyProjectsLoading;
