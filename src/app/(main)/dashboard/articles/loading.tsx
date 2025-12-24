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
    <div className="rounded-lg border p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        {/* THUMBNAIL SKELETON */}
        <Skeleton className="hidden sm:block w-32 md:w-40 aspect-video shrink-0" />
        {/* CONTENT SKELETON */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
              </div>
              <Skeleton className="h-3 sm:h-4 w-3/4" />
            </div>
            <Skeleton className="size-7 sm:size-8 shrink-0" />
          </div>
          {/* META SKELETON */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
            <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
            <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
          </div>
          {/* TAGS SKELETON */}
          <div className="flex gap-1 mt-2">
            <Skeleton className="h-4 sm:h-5 w-12 sm:w-14" />
            <Skeleton className="h-4 sm:h-5 w-14 sm:w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

// <== MY ARTICLES LOADING ==>
const MyArticlesLoading = () => {
  // RETURN MY ARTICLES LOADING
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER SKELETON */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="size-10 sm:size-12 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
              <Skeleton className="h-6 sm:h-7 md:h-8 w-32 sm:w-40" />
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-56" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Skeleton className="size-8 sm:size-9" />
            <Skeleton className="h-8 sm:h-9 w-20 sm:w-28" />
          </div>
        </div>
      </div>
      {/* ARTICLES LIST SKELETON */}
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// <== EXPORTING MY ARTICLES LOADING ==>
export default MyArticlesLoading;
