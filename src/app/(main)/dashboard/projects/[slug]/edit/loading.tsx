// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== EDIT PROJECT LOADING ==>
const EditProjectLoading = () => {
  // RETURN EDIT PROJECT LOADING SKELETON
  return (
    <div className="min-h-screen pb-16">
      {/* HEADER */}
      <section className="py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          {/* BACK LINK SKELETON */}
          <div className="h-5 w-40 bg-secondary rounded animate-pulse mb-4" />
          {/* TITLE SKELETON */}
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-secondary animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-56 bg-secondary rounded animate-pulse" />
              <div className="h-5 w-48 bg-secondary rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      {/* FORM SKELETON */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* PROGRESS INDICATOR SKELETON */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="size-10 rounded-full bg-secondary animate-pulse" />
                    {i < 3 && (
                      <div className="w-12 md:w-24 h-1 mx-2 bg-secondary rounded animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center space-y-2">
                <div className="h-6 w-32 mx-auto bg-secondary rounded animate-pulse" />
                <div className="h-4 w-48 mx-auto bg-secondary rounded animate-pulse" />
              </div>
            </div>
            {/* FORM CARD SKELETON */}
            <Card className="p-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
                  <div className="h-10 w-full bg-secondary rounded animate-pulse" />
                </div>
              ))}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
                <div className="h-32 w-full bg-secondary rounded animate-pulse" />
              </div>
            </Card>
            {/* NAVIGATION SKELETON */}
            <div className="flex items-center justify-between mt-6">
              <div className="h-10 w-24 bg-secondary rounded animate-pulse" />
              <div className="h-10 w-24 bg-secondary rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditProjectLoading;
