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

// <== NOTIFICATION ITEM SKELETON ==>
const NotificationItemSkeleton = () => {
  // RETURN NOTIFICATION ITEM SKELETON
  return (
    <div className="flex items-start gap-3 p-3 sm:p-4">
      {/* AVATAR SKELETON */}
      <Skeleton className="size-10 rounded-full shrink-0" />
      {/* CONTENT SKELETON */}
      <div className="flex-1 min-w-0">
        {/* TITLE SKELETON */}
        <Skeleton className="h-4 w-3/4 mb-1.5" />
        {/* BODY SKELETON */}
        <Skeleton className="h-3 w-full mb-1" />
        {/* TIME SKELETON */}
        <Skeleton className="h-2.5 w-16 mt-1.5" />
      </div>
    </div>
  );
};

// <== NOTIFICATIONS LOADING SKELETON ==>
const NotificationsLoading = () => {
  // RETURN NOTIFICATIONS LOADING SKELETON
  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER SKELETON */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON SKELETON */}
          <Skeleton className="size-12 sm:size-14 rounded-xl shrink-0" />
          {/* TEXT SKELETON */}
          <div className="flex-1">
            {/* BADGE SKELETON */}
            <Skeleton className="h-5 w-14 rounded-full mb-2" />
            {/* HEADING SKELETON */}
            <Skeleton className="h-7 sm:h-8 w-40 mb-1.5" />
            {/* SUBTEXT SKELETON */}
            <Skeleton className="h-4 w-56" />
          </div>
          {/* REFRESH BUTTON SKELETON */}
          <Skeleton className="size-8 sm:size-9 rounded-md shrink-0" />
        </div>
      </div>
      {/* FILTERS SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        {/* FILTER TABS SKELETON */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        {/* ACTIONS SKELETON */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
      {/* NOTIFICATIONS LIST SKELETON */}
      <div className="rounded-lg border overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <NotificationItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING NOTIFICATIONS LOADING ==>
export default NotificationsLoading;
