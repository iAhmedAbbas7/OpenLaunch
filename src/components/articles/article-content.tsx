// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";

// <== ARTICLE CONTENT PROPS ==>
interface ArticleContentProps {
  // <== CONTENT HTML ==>
  content: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== ARTICLE CONTENT COMPONENT ==>
export const ArticleContent = ({ content, className }: ArticleContentProps) => {
  // RETURNING COMPONENT
  return (
    <div
      className={cn(
        "prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none",
        "prose-headings:scroll-mt-20 prose-headings:font-bold",
        "prose-h1:text-2xl sm:prose-h1:text-3xl lg:prose-h1:text-4xl",
        "prose-h2:text-xl sm:prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:border-b prose-h2:pb-2 prose-h2:mb-4",
        "prose-h3:text-lg sm:prose-h3:text-xl lg:prose-h3:text-2xl",
        "prose-h4:text-base sm:prose-h4:text-lg",
        "prose-p:text-sm sm:prose-p:text-base lg:prose-p:text-lg",
        "prose-p:leading-relaxed",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-li:text-sm sm:prose-li:text-base lg:prose-li:text-lg",
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-code:text-xs sm:prose-code:text-sm",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
        "prose-pre:bg-secondary prose-pre:border prose-pre:rounded-lg",
        "prose-pre:text-xs sm:prose-pre:text-sm",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary",
        "prose-blockquote:bg-secondary/50 prose-blockquote:py-1 prose-blockquote:px-4",
        "prose-blockquote:not-italic prose-blockquote:rounded-r",
        "prose-img:rounded-lg prose-img:shadow-lg",
        "prose-table:text-xs sm:prose-table:text-sm",
        "prose-th:bg-secondary prose-th:font-semibold",
        "prose-td:border prose-th:border",
        "prose-hr:border-border",
        "prose-strong:text-foreground prose-em:text-muted-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// <== ARTICLE CONTENT SKELETON ==>
export const ArticleContentSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURNING SKELETON
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* PARAGRAPH SKELETONS */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 sm:h-5 w-full bg-secondary rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-full bg-secondary rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-4/5 bg-secondary rounded animate-pulse" />
        </div>
      ))}
      {/* HEADING SKELETON */}
      <div className="h-6 sm:h-7 w-3/5 bg-secondary rounded animate-pulse mt-6 sm:mt-8" />
      {/* MORE PARAGRAPHS */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i + 3} className="space-y-2">
          <div className="h-4 sm:h-5 w-full bg-secondary rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-full bg-secondary rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-3/4 bg-secondary rounded animate-pulse" />
        </div>
      ))}
      {/* CODE BLOCK SKELETON */}
      <div className="h-32 sm:h-40 w-full bg-secondary rounded-lg animate-pulse" />
      {/* MORE PARAGRAPHS */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i + 5} className="space-y-2">
          <div className="h-4 sm:h-5 w-full bg-secondary rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-5/6 bg-secondary rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};

// <== EXPORTING ARTICLE CONTENT ==>
export default ArticleContent;
