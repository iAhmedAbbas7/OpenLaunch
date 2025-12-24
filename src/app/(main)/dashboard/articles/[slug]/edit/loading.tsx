// <== SKELETON COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== EDIT ARTICLE LOADING ==>
const EditArticleLoading = () => {
  // RETURN EDIT ARTICLE LOADING SKELETON
  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* BACK LINK SKELETON */}
      <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 mb-4 sm:mb-6" />
      {/* HEADER SKELETON */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Skeleton className="size-10 sm:size-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-6 sm:h-7 md:h-8 w-32 sm:w-40 mb-1 sm:mb-1.5" />
          <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-64" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-8 sm:h-9 w-16 sm:w-20" />
          <Skeleton className="h-8 sm:h-9 w-20 sm:w-24" />
        </div>
      </div>
      {/* FORM SKELETON */}
      <div className="space-y-4 sm:space-y-6">
        {/* COVER IMAGE SKELETON */}
        <div className="rounded-lg border p-3 sm:p-4">
          <Skeleton className="h-4 w-24 mb-2 sm:mb-3" />
          <Skeleton className="aspect-video rounded-lg" />
        </div>
        {/* TITLE SKELETON */}
        <div className="rounded-lg border p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 sm:h-12 w-full" />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 sm:h-10 w-full" />
          </div>
        </div>
        {/* CONTENT EDITOR SKELETON */}
        <div className="rounded-lg border p-3 sm:p-4">
          <Skeleton className="h-4 w-16 mb-2 sm:mb-3" />
          <Skeleton className="h-10 sm:h-12 w-full mb-2 rounded-t-lg rounded-b-none" />
          <Skeleton className="h-64 sm:h-80 w-full rounded-t-none rounded-b-lg" />
        </div>
        {/* TAGS SKELETON */}
        <div className="rounded-lg border p-3 sm:p-4">
          <Skeleton className="h-4 w-12 mb-2 sm:mb-3" />
          <div className="flex gap-1.5 mb-2">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <Skeleton className="h-8 sm:h-9 w-full" />
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING EDIT ARTICLE LOADING ==>
export default EditArticleLoading;
