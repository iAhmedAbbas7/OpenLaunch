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
import { Rocket, Flame, Star, Calendar, ArrowRight } from "lucide-react";
import { useTrendingProjects, useFeaturedProjects } from "@/hooks/use-projects";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    <div className="min-h-screen">
      {/* HEADER */}
      <section className="py-8 md:py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Rocket className="size-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs">
                {today}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">
              Today&apos;s Launches
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover the latest projects launched by developers around the
              world
            </p>
          </motion.div>
        </div>
      </section>
      {/* FEATURED SECTION */}
      {(isFeaturedLoading ||
        (featuredProjects && featuredProjects.length > 0)) && (
        <section className="py-8 bg-linear-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Star className="size-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold font-heading">
                    Featured Projects
                  </h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/explore?status=featured">
                    View All
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </div>
              {isFeaturedLoading ? (
                <ProjectGridSkeleton columns={2} count={4} />
              ) : (
                <ProjectGrid
                  projects={featuredProjects!.slice(0, 4)}
                  columns={2}
                />
              )}
            </motion.div>
          </div>
        </section>
      )}
      {/* MAIN CONTENT */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* TABS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="today" className="gap-2">
                  <Flame className="size-4" />
                  Today
                </TabsTrigger>
                <TabsTrigger value="week" className="gap-2">
                  <Calendar className="size-4" />
                  This Week
                </TabsTrigger>
                <TabsTrigger value="month" className="gap-2">
                  <Calendar className="size-4" />
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
      </section>
    </div>
  );
};

// <== EMPTY LAUNCHES COMPONENT ==>
const EmptyLaunches = () => {
  return (
    <Card className="p-12 text-center">
      <div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
        <Rocket className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No launches yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Be the first to launch a project today!
      </p>
      <Button asChild>
        <Link href="/dashboard/projects/new">Launch Your Project</Link>
      </Button>
    </Card>
  );
};
