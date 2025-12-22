// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectGrid, ProjectGridSkeleton } from "@/components/projects";
import { useTrendingProjects, useFeaturedProjects } from "@/hooks/use-projects";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Rocket,
  Flame,
  Star,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// <== LAUNCHES PAGE CLIENT COMPONENT ==>
export const LaunchesPageClient = () => {
  // TAB STATE
  const [activeTab, setActiveTab] = useState("today");
  // GET TRENDING PROJECTS (TODAY'S LAUNCHES)
  const { data: trendingProjects, isLoading: isTrendingLoading } =
    useTrendingProjects(20);
  // GET FEATURED PROJECTS
  const { data: featuredProjects, isLoading: isFeaturedLoading } =
    useFeaturedProjects(10);
  // TODAY'S DATE
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  // RETURN LAUNCHES PAGE CLIENT COMPONENT
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON */}
          <div className="size-12 sm:size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Rocket className="size-6 sm:size-7 text-primary" />
          </div>
          {/* TEXT */}
          <div className="min-w-0">
            {/* BADGE */}
            <Badge variant="secondary" className="mb-2 text-xs">
              <Sparkles className="size-3 mr-1" />
              {today}
            </Badge>
            {/* HEADING */}
            <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-1">
              Today&apos;s Launches
            </h1>
            {/* SUBTEXT */}
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover the latest projects launched by developers around the
              world
            </p>
          </div>
        </div>
      </motion.div>

      {/* FEATURED SECTION */}
      {(isFeaturedLoading ||
        (featuredProjects && featuredProjects.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl bg-linear-to-b from-primary/5 to-transparent border border-border/50"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Star className="size-4 sm:size-5 text-yellow-500" />
              <h2 className="text-base sm:text-xl font-semibold font-heading">
                Featured Projects
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              <Link href="/explore?status=featured">
                View All
                <ArrowRight className="size-3.5 sm:size-4 ml-1 sm:ml-2" />
              </Link>
            </Button>
          </div>
          {isFeaturedLoading ? (
            <ProjectGridSkeleton columns={2} count={4} />
          ) : (
            <ProjectGrid projects={featuredProjects!.slice(0, 4)} columns={2} />
          )}
        </motion.div>
      )}

      {/* TABS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 sm:space-y-6"
        >
          <TabsList className="bg-secondary/50 h-9 sm:h-10">
            <TabsTrigger
              value="today"
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <Flame className="size-3.5 sm:size-4" />
              Today
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <Calendar className="size-3.5 sm:size-4" />
              This Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <Calendar className="size-3.5 sm:size-4" />
              This Month
            </TabsTrigger>
          </TabsList>
          {/* TODAY'S LAUNCHES */}
          <TabsContent value="today">
            {isTrendingLoading ? (
              <ProjectGridSkeleton columns={2} count={6} />
            ) : trendingProjects && trendingProjects.length > 0 ? (
              <ProjectGrid projects={trendingProjects} columns={2} />
            ) : (
              <EmptyLaunches />
            )}
          </TabsContent>
          {/* THIS WEEK'S LAUNCHES */}
          <TabsContent value="week">
            {isTrendingLoading ? (
              <ProjectGridSkeleton columns={2} count={6} />
            ) : trendingProjects && trendingProjects.length > 0 ? (
              <ProjectGrid projects={trendingProjects} columns={2} />
            ) : (
              <EmptyLaunches />
            )}
          </TabsContent>
          {/* THIS MONTH'S LAUNCHES */}
          <TabsContent value="month">
            {isTrendingLoading ? (
              <ProjectGridSkeleton columns={2} count={6} />
            ) : trendingProjects && trendingProjects.length > 0 ? (
              <ProjectGrid projects={trendingProjects} columns={2} />
            ) : (
              <EmptyLaunches />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

// <== EMPTY LAUNCHES COMPONENT ==>
const EmptyLaunches = () => {
  // RETURNING EMPTY LAUNCHES COMPONENT
  return (
    <Card className="p-8 sm:p-12 text-center">
      <div className="p-3 sm:p-4 rounded-full bg-secondary w-fit mx-auto mb-3 sm:mb-4">
        <Rocket className="size-6 sm:size-8 text-muted-foreground" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-2">
        No launches yet
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto">
        Be the first to launch a project today!
      </p>
      <Button asChild size="sm" className="sm:size-default">
        <Link href="/dashboard/projects/new">Launch Your Project</Link>
      </Button>
    </Card>
  );
};
