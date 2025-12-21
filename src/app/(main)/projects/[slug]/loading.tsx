// <== IMPORTS ==>
import { Card } from "@/components/ui/card";
import { ProjectHeaderSkeleton } from "@/components/projects";

// <== PROJECT LOADING SKELETON ==>
const ProjectLoading = () => {
  // RETURN PROJECT LOADING SKELETON
  return (
    <div className="min-h-screen pb-16">
      {/* BACK LINK SKELETON */}
      <section className="py-4 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="h-5 w-32 bg-secondary rounded animate-pulse" />
        </div>
      </section>
      {/* MAIN CONTENT */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* MAIN COLUMN */}
            <div className="lg:col-span-2 space-y-8">
              {/* HEADER */}
              <ProjectHeaderSkeleton />
              {/* DESCRIPTION */}
              <Card className="p-6">
                <div className="h-6 w-40 bg-secondary rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
                </div>
              </Card>
              {/* GALLERY */}
              <Card className="p-6">
                <div className="h-6 w-32 bg-secondary rounded animate-pulse mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-lg bg-secondary animate-pulse"
                    />
                  ))}
                </div>
              </Card>
            </div>
            {/* SIDEBAR */}
            <div className="space-y-6">
              {/* TECH STACK */}
              <Card className="p-6">
                <div className="h-6 w-28 bg-secondary rounded animate-pulse mb-4" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-16 bg-secondary rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </Card>
              {/* PROJECT INFO */}
              <Card className="p-6">
                <div className="h-6 w-28 bg-secondary rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
                      <div className="h-4 w-16 bg-secondary rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectLoading;
