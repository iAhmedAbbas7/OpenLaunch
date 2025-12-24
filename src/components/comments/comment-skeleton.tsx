// <== COMMENT SKELETON ==>

// <== IMPORTS ==>
import { cn } from "@/lib/utils";

// <== SKELETON COMPONENT ==>
const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("bg-secondary rounded animate-pulse", className)}
      {...props}
    />
  );
};

// <== COMMENT SKELETON PROPS ==>
interface CommentSkeletonProps {
  // <== IS REPLY ==>
  isReply?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== COMMENT SKELETON COMPONENT ==>
export const CommentSkeleton = ({
  isReply = false,
  className,
}: CommentSkeletonProps) => {
  // RETURN COMMENT SKELETON
  return (
    <div className={cn("flex gap-3", className)}>
      {/* AVATAR */}
      <Skeleton
        className={cn("rounded-full shrink-0", isReply ? "size-6" : "size-8")}
      />
      {/* CONTENT */}
      <div className="flex-1 space-y-2">
        {/* HEADER */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        {/* CONTENT LINES */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* ACTIONS */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-12" />
          {!isReply && <Skeleton className="h-6 w-14" />}
        </div>
      </div>
    </div>
  );
};

// <== COMMENTS LIST SKELETON PROPS ==>
interface CommentsListSkeletonProps {
  // <== COUNT ==>
  count?: number;
  // <== SHOW REPLIES ==>
  showReplies?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== COMMENTS LIST SKELETON COMPONENT ==>
export const CommentsListSkeleton = ({
  count = 3,
  showReplies = true,
  className,
}: CommentsListSkeletonProps) => {
  // RETURN COMMENTS LIST SKELETON
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          {/* MAIN COMMENT */}
          <CommentSkeleton />
          {/* REPLIES */}
          {showReplies && i === 0 && (
            <div className="ml-8 sm:ml-11 space-y-3">
              <CommentSkeleton isReply />
              <CommentSkeleton isReply />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// <== COMMENT FORM SKELETON COMPONENT ==>
export const CommentFormSkeleton = ({ className }: { className?: string }) => {
  // RETURN COMMENT FORM SKELETON
  return (
    <div className={cn("flex gap-3", className)}>
      {/* AVATAR */}
      <Skeleton className="size-8 rounded-full shrink-0" />
      {/* FORM */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING COMMENT SKELETONS ==>
export default CommentSkeleton;
