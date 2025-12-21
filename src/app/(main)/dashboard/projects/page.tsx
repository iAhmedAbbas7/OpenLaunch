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

// <== MY PROJECTS PAGE ==>
const MyProjectsPage = () => {
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
    <div className="container mx-auto px-4 py-8">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold font-heading">My Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your launched projects
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="size-4 mr-2" />
            New Project
          </Link>
        </Button>
      </motion.div>
      {/* LOADING STATE */}
      {isLoading && <MyProjectsSkeleton />}
      {/* ERROR STATE */}
      {error && (
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">{error.message}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
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
          <Card className="p-12 text-center">
            <div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
              <Folder className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Launch your first project and share it with the developer
              community!
            </p>
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="size-4 mr-2" />
                Create Your First Project
              </Link>
            </Button>
          </Card>
        </motion.div>
      )}
      {/* PROJECTS LIST */}
      {!isLoading && !error && projects.length > 0 && (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4">
                  {/* LOGO */}
                  <Link href={`/projects/${project.slug}`} className="shrink-0">
                    {project.logoUrl ? (
                      <div className="size-14 relative">
                        <Image
                          src={project.logoUrl}
                          alt={project.name}
                          fill
                          sizes="56px"
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-14 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Folder className="size-6 text-primary" />
                      </div>
                    )}
                  </Link>
                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="font-semibold hover:text-primary transition-colors truncate"
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
                        className="shrink-0"
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
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {project.tagline}
                    </p>
                    {/* STATS */}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ChevronUp className="size-4" />
                        {project.upvotesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-4" />
                        {project.commentsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-4" />0 views
                      </span>
                    </div>
                  </div>
                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.slug}/edit`}>
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-9">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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

// <== MY PROJECTS SKELETON ==>
const MyProjectsSkeleton = () => {
  // RETURN MY PROJECTS SKELETON
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            {/* LOGO SKELETON */}
            <div className="size-14 rounded-lg bg-secondary animate-pulse shrink-0" />
            {/* INFO SKELETON */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-40 bg-secondary rounded animate-pulse" />
                <div className="h-5 w-16 bg-secondary rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-64 bg-secondary rounded animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-12 bg-secondary rounded animate-pulse" />
                <div className="h-4 w-12 bg-secondary rounded animate-pulse" />
                <div className="h-4 w-16 bg-secondary rounded animate-pulse" />
              </div>
            </div>
            {/* ACTIONS SKELETON */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-20 bg-secondary rounded animate-pulse" />
              <div className="size-9 bg-secondary rounded animate-pulse" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MyProjectsPage;
