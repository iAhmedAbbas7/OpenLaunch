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

// <== ARTICLE DETAIL LOADING ==>
const ArticleDetailLoading = () => {
  // RETURN ARTICLE DETAIL LOADING SKELETON
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* BACK LINK SKELETON */}
      <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-4 sm:mb-6" />
      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 sm:gap-8">
        {/* ARTICLE MAIN */}
        <main className="space-y-4 sm:space-y-6">
          {/* HEADER SKELETON */}
          <div className="space-y-4 sm:space-y-6">
            {/* COVER IMAGE SKELETON */}
            <Skeleton className="aspect-video sm:aspect-21/9 rounded-lg sm:rounded-xl" />
            {/* TAGS SKELETON */}
            <div className="flex gap-1.5 sm:gap-2">
              <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full" />
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
              <Skeleton className="h-5 sm:h-6 w-12 sm:w-14 rounded-full" />
            </div>
            {/* TITLE SKELETON */}
            <div className="space-y-2 sm:space-y-3">
              <Skeleton className="h-8 sm:h-10 md:h-12 w-full" />
              <Skeleton className="h-8 sm:h-10 md:h-12 w-3/4" />
            </div>
            {/* SUBTITLE SKELETON */}
            <Skeleton className="h-5 sm:h-6 w-2/3" />
            {/* AUTHOR AND META SKELETON */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 sm:pt-4 border-t">
              {/* AUTHOR SKELETON */}
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 sm:size-12 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                </div>
              </div>
              {/* META SKELETON */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
                <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
              </div>
            </div>
            {/* STATS BAR SKELETON */}
            <div className="flex items-center gap-4 sm:gap-6 py-3 sm:py-4 border-y">
              <Skeleton className="h-4 sm:h-5 w-14 sm:w-16" />
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
            </div>
          </div>
          {/* ACTIONS BAR - MOBILE SKELETON */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 sm:h-9 w-16 sm:w-20" />
            <Skeleton className="h-8 sm:h-9 w-16 sm:w-20" />
            <Skeleton className="h-8 sm:h-9 w-16 sm:w-20" />
            <Skeleton className="h-8 sm:h-9 w-8 sm:w-9 ml-auto" />
          </div>
          {/* CONTENT SKELETON */}
          <div className="space-y-4 sm:space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-4/5" />
              </div>
            ))}
            <Skeleton className="h-6 sm:h-7 w-3/5" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i + 3} className="space-y-2">
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-3/4" />
              </div>
            ))}
            <Skeleton className="h-32 sm:h-40 w-full rounded-lg" />
          </div>
        </main>
        {/* SIDEBAR SKELETON */}
        <aside className="hidden lg:block space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* ACTIONS CARD SKELETON */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9 ml-auto" />
              </div>
            </div>
            {/* TOC CARD SKELETON */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <Skeleton className="size-5" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5 ml-3" />
                <Skeleton className="h-4 w-3/4 ml-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 ml-3" />
              </div>
            </div>
            {/* AUTHOR CARD SKELETON */}
            <div className="rounded-lg border p-4">
              <Skeleton className="h-4 w-28 mb-3" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-12 w-full mt-3" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// <== EXPORTING ARTICLE DETAIL LOADING ==>
export default ArticleDetailLoading;
