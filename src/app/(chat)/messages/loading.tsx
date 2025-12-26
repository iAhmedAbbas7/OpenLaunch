// <== IMPORTS ==>
import { MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// <== MESSAGES LOADING COMPONENT ==>
export default function MessagesLoading() {
  // RETURN LOADING STATE
  return (
    <div className="flex h-full w-full bg-background">
      {/* SIDEBAR SKELETON */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-card/50 shrink-0">
        {/* HEADER SKELETON */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-muted-foreground" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
        {/* LIST SKELETON */}
        <div className="p-2 space-y-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="size-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* MAIN CONTENT SKELETON */}
      <div className="flex-1 hidden md:flex flex-col items-center justify-center">
        <Skeleton className="size-24 rounded-full mb-6" />
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
