// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Plus,
  Folder,
  Eye,
  MessageSquare,
  ChevronUp,
  Pencil,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Github,
  FolderOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";

// <== MY PROJECTS CLIENT COMPONENT ==>
export const MyProjectsClient = () => {
  // GET AUTH
  const { profile } = useAuth();
  // GET PROJECTS
  const { data, isLoading, error } = useProjects({
    ownerId: profile?.id,
    status: undefined,
  });
  // PROJECTS
  const projects = data?.items ?? [];
  // RETURN MY PROJECTS PAGE
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8"
      >
        {/* LEFT SIDE - ICON + TEXT */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON */}
          <div className="size-12 sm:size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FolderOpen className="size-6 sm:size-7 text-primary" />
          </div>
          {/* TEXT */}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-1">
              My Projects
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage and track your launched projects
            </p>
          </div>
        </div>
        {/* RIGHT SIDE - BUTTONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            <Link href="/dashboard/projects/import">
              <Github className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Import from</span> GitHub
            </Link>
          </Button>
          <Button size="sm" asChild className="h-9 sm:h-10 text-xs sm:text-sm">
            <Link href="/dashboard/projects/new">
              <Plus className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">New</span> Project
            </Link>
          </Button>
        </div>
      </motion.div>
      {/* LOADING STATE */}
      {isLoading && <MyProjectsSkeleton />}
      {/* ERROR STATE */}
      {error && (
        <Card className="p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-destructive mb-3 sm:mb-4">
            {error.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="sm:size-default"
          >
            Try Again
          </Button>
        </Card>
      )}
      {/* EMPTY STATE */}
      {!isLoading && !error && projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 sm:p-12 text-center">
            <div className="p-3 sm:p-4 rounded-full bg-secondary w-fit mx-auto mb-3 sm:mb-4">
              <Folder className="size-6 sm:size-8 text-muted-foreground" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              No projects yet
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto">
              Launch your first project and share it with the developer
              community!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full sm:w-auto sm:size-default"
              >
                <Link href="/dashboard/projects/import">
                  <Github className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
                  Import from GitHub
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="w-full sm:w-auto sm:size-default"
              >
                <Link href="/dashboard/projects/new">
                  <Plus className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
                  Create Your First Project
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
      {/* PROJECTS LIST */}
      {!isLoading && !error && projects.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-3 sm:p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  {/* LOGO */}
                  <Link href={`/projects/${project.slug}`} className="shrink-0">
                    {project.logoUrl ? (
                      <div className="size-10 sm:size-14 relative">
                        <Image
                          src={project.logoUrl}
                          alt={project.name}
                          fill
                          sizes="(max-width: 640px) 40px, 56px"
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-10 sm:size-14 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Folder className="size-4 sm:size-6 text-primary" />
                      </div>
                    )}
                  </Link>
                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-sm sm:text-base font-semibold hover:text-primary transition-colors truncate"
                      >
                        {project.name}
                      </Link>
                      <Badge
                        variant={
                          project.status === "featured"
                            ? "default"
                            : project.status === "launched"
                            ? "secondary"
                            : "outline"
                        }
                        className="shrink-0 text-[10px] sm:text-xs h-5"
                      >
                        {project.status === "featured"
                          ? "Featured"
                          : project.status === "launched"
                          ? "Live"
                          : project.status === "pending"
                          ? "Pending"
                          : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      {project.tagline}
                    </p>
                    {/* STATS */}
                    <div className="flex items-center gap-3 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <ChevronUp className="size-3 sm:size-4" />
                        {project.upvotesCount}
                      </span>
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <MessageSquare className="size-3 sm:size-4" />
                        {project.commentsCount}
                      </span>
                      <span className="hidden sm:flex items-center gap-1">
                        <Eye className="size-4" />0 views
                      </span>
                    </div>
                  </div>
                  {/* ACTIONS */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* EDIT BUTTON - HIDDEN ON MOBILE, SHOWN ON SM+ */}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="hidden sm:inline-flex h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      <Link href={`/dashboard/projects/${project.slug}/edit`}>
                        <Pencil className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
                        Edit
                      </Link>
                    </Button>
                    {/* MORE ACTIONS DROPDOWN */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 sm:size-9"
                        >
                          <MoreHorizontal className="size-3.5 sm:size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* EDIT - SHOWN IN DROPDOWN ON MOBILE */}
                        <DropdownMenuItem asChild className="sm:hidden">
                          <Link
                            href={`/dashboard/projects/${project.slug}/edit`}
                          >
                            <Pencil className="size-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.slug}`}>
                            <ExternalLink className="size-4 mr-2" />
                            View Project
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== PROJECT CARD SKELETON ==>
const ProjectCardSkeleton = () => {
  // RETURNING PROJECT CARD SKELETON COMPONENT
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        {/* LOGO SKELETON */}
        <Skeleton className="size-10 sm:size-14 rounded-lg shrink-0" />
        {/* INFO SKELETON */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Skeleton className="h-4 sm:h-5 w-28 sm:w-40" />
            <Skeleton className="h-5 w-12 sm:w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64 max-w-full" />
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
            <Skeleton className="hidden sm:block h-4 w-16" />
          </div>
        </div>
        {/* ACTIONS SKELETON */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Skeleton className="hidden sm:block h-8 sm:h-9 w-16 sm:w-20" />
          <Skeleton className="size-8 sm:size-9 rounded-md" />
        </div>
      </div>
    </Card>
  );
};

// <== MY PROJECTS SKELETON ==>
const MyProjectsSkeleton = () => {
  // RETURN MY PROJECTS SKELETON
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
};
