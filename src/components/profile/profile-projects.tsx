// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import { Folder, ArrowUpRight } from "lucide-react";

// <== PROFILE PROJECTS PROPS ==>
interface ProfileProjectsProps {
  // <== PROFILE ID ==>
  profileId: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROFILE PROJECTS COMPONENT ==>
export const ProfileProjects = ({
  profileId,
  className,
}: ProfileProjectsProps) => {
  // FETCH PROJECTS
  const { data, isLoading, error } = useProjects({ ownerId: profileId });
  // HANDLE LOADING
  if (isLoading) {
    // RETURN PROFILE PROJECTS SKELETON
    return <ProfileProjectsSkeleton className={className} />;
  }
  // HANDLE ERROR
  if (error) {
    // RETURN ERROR MESSAGE
    return (
      <div className={cn("text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground", className)}>
        Failed to load projects
      </div>
    );
  }
  // HANDLE EMPTY
  if (!data || data.items.length === 0) {
    // RETURN EMPTY MESSAGE
    return (
      <div className={cn("text-center py-8 sm:py-12", className)}>
        <Folder className="size-10 sm:size-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-muted-foreground">No projects yet</p>
      </div>
    );
  }
  // RETURN PROFILE PROJECTS COMPONENT
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", className)}>
      {data.items.map((project) => (
        <Card
          key={project.id}
          className="p-3 sm:p-4 hover:bg-secondary/50 transition-all duration-200 group"
        >
          <Link href={`/projects/${project.slug}`} className="block">
            {/* HEADER */}
            <div className="flex items-start gap-2.5 sm:gap-3">
              {/* LOGO */}
              {project.logoUrl ? (
                <div className="size-10 sm:size-12 relative shrink-0">
                  <Image
                    src={project.logoUrl}
                    alt={project.name}
                    fill
                    sizes="(max-width: 640px) 40px, 48px"
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="size-10 sm:size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Folder className="size-4 sm:size-6 text-primary" />
                </div>
              )}
              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="text-sm sm:text-base font-semibold font-heading truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <ArrowUpRight className="size-3.5 sm:size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5 sm:mt-1">
                  {project.tagline}
                </p>
              </div>
            </div>
            {/* TECH STACK */}
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2.5 sm:mt-3">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                    +{project.techStack.length - 3}
                  </span>
                )}
              </div>
            )}
            {/* STATS */}
            <div className="flex items-center gap-3 sm:gap-4 mt-2.5 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <span className="text-primary font-medium">▲</span>
                {project.upvotesCount}
              </span>
              <span>{project.commentsCount} comments</span>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
};

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== PROJECT CARD SKELETON ==>
const ProjectCardSkeleton = () => {
  return (
    <Card className="p-3 sm:p-4">
      {/* HEADER SKELETON */}
      <div className="flex items-start gap-2.5 sm:gap-3">
        {/* LOGO SKELETON */}
        <Skeleton className="size-10 sm:size-12 rounded-lg shrink-0" />
        {/* INFO SKELETON */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          {/* NAME SKELETON */}
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
          {/* TAGLINE SKELETON */}
          <Skeleton className="h-3 sm:h-4 w-full" />
        </div>
      </div>
      {/* TECH STACK SKELETON */}
      <div className="flex gap-1 sm:gap-1.5 mt-2.5 sm:mt-3">
        <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded-full" />
        <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded-full" />
        <Skeleton className="hidden sm:block h-5 w-16 rounded-full" />
      </div>
      {/* STATS SKELETON */}
      <div className="flex gap-3 sm:gap-4 mt-2.5 sm:mt-3">
        <Skeleton className="h-3 sm:h-4 w-8 sm:w-10" />
        <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
      </div>
    </Card>
  );
};

// <== PROFILE PROJECTS SKELETON ==>
export const ProfileProjectsSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURN PROFILE PROJECTS SKELETON
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
};
