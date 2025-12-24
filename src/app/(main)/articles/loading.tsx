// <== SKELETON COMPONENT ==>
const Skeleton = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  // RETURN SKELETON
  return (
    <div
      className={`bg-secondary rounded animate-pulse ${className}`}
      style={style}
    />
  );
};

// <== ARTICLE CARD SKELETON ==>
const ArticleCardSkeleton = () => {
  // RETURN ARTICLE CARD SKELETON
  return (
    <div className="rounded-lg border overflow-hidden">
      {/* COVER IMAGE SKELETON */}
      <Skeleton className="aspect-video rounded-none" />
      {/* CONTENT SKELETON */}
      <div className="p-3 sm:p-4">
        {/* TAGS SKELETON */}
        <div className="flex gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <Skeleton className="h-4 sm:h-5 w-12 sm:w-14 rounded" />
          <Skeleton className="h-4 sm:h-5 w-14 sm:w-16 rounded" />
        </div>
        {/* TITLE SKELETON */}
        <Skeleton className="h-4 sm:h-5 w-full mb-1 sm:mb-2" />
        <Skeleton className="h-4 sm:h-5 w-3/4 mb-3 sm:mb-4" />
        {/* SUBTITLE SKELETON */}
        <Skeleton className="h-3 sm:h-4 w-full mb-1" />
        <Skeleton className="h-3 sm:h-4 w-4/5 mb-3 sm:mb-4" />
        {/* AUTHOR SKELETON */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 sm:size-7 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 mb-1" />
            <Skeleton className="h-2.5 sm:h-3 w-32 sm:w-36" />
          </div>
        </div>
        {/* STATS SKELETON */}
        <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
          <Skeleton className="h-3 sm:h-4 w-8 sm:w-10" />
          <Skeleton className="h-3 sm:h-4 w-8 sm:w-10" />
          <Skeleton className="h-3 sm:h-4 w-8 sm:w-10" />
          <Skeleton className="h-3 sm:h-4 w-8 sm:w-10 ml-auto" />
        </div>
      </div>
    </div>
  );
};

// <== ARTICLES LOADING SKELETON ==>
const ArticlesLoading = () => {
  // RETURN ARTICLES LOADING SKELETON
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER SKELETON */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Skeleton className="size-10 sm:size-12 rounded-xl shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
              <Skeleton className="h-6 sm:h-7 md:h-8 w-28 sm:w-32" />
              <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 sm:h-4 w-64 sm:w-80" />
          </div>
          <Skeleton className="size-8 sm:size-9 rounded-md shrink-0 ml-auto" />
        </div>
      </div>
      {/* FILTERS SKELETON */}
      <div className="space-y-3 sm:space-y-4">
        {/* SEARCH AND SORT ROW */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-10 flex-1" />
          <Skeleton className="h-9 sm:h-10 w-full sm:w-44" />
          <Skeleton className="h-9 sm:hidden" />
        </div>
        {/* TAGS ROW - DESKTOP */}
        <div className="hidden sm:flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-5 sm:h-6 rounded-full"
              style={{ width: `${60 + ((i * 12) % 40)}px` }}
            />
          ))}
        </div>
      </div>
      {/* ARTICLES GRID SKELETON */}
      <div className="mt-6 sm:mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING ARTICLES LOADING ==>
export default ArticlesLoading;
