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
import { useLaunchesByPeriod, useFeaturedProjects } from "@/hooks/use-projects";
import type { LaunchPeriod } from "@/lib/validations/projects";
import {
  Rocket,
  Flame,
  Star,
  Calendar,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// <== TAB OPTIONS ==>
const tabOptions: {
  value: LaunchPeriod;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "today",
    label: "Today",
    icon: <Flame className="size-3.5 sm:size-4" />,
  },
  {
    value: "week",
    label: "This Week",
    icon: <Calendar className="size-3.5 sm:size-4" />,
  },
  {
    value: "month",
    label: "This Month",
    icon: <Calendar className="size-3.5 sm:size-4" />,
  },
];

// <== LAUNCHES PAGE CLIENT COMPONENT ==>
export const LaunchesPageClient = () => {
  // TAB STATE
  const [activeTab, setActiveTab] = useState<LaunchPeriod>("today");
  // GET LAUNCHES BY PERIOD
  const {
    data: launches,
    isLoading: isLaunchesLoading,
    isFetching: isLaunchesFetching,
    refetch: refetchLaunches,
  } = useLaunchesByPeriod(activeTab, 20);
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
  // GET TAB LABEL
  const getTabLabel = () => {
    switch (activeTab) {
      case "today":
        return "Today's";
      case "week":
        return "This Week's";
      case "month":
        return "This Month's";
      default:
        return "Today's";
    }
  };
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
          <div className="flex-1 min-w-0">
            {/* BADGE */}
            <Badge variant="secondary" className="mb-2 text-xs">
              <Sparkles className="size-3 mr-1" />
              {today}
            </Badge>
            {/* HEADING */}
            <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-1">
              {getTabLabel()} Launches
            </h1>
            {/* SUBTEXT */}
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover the latest projects launched by developers around the
              world
            </p>
          </div>
          {/* REFRESH BUTTON */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchLaunches()}
            disabled={isLaunchesFetching}
            className="size-9 sm:size-10 shrink-0"
          >
            <RefreshCw
              className={`size-4 sm:size-5 ${
                isLaunchesFetching ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </motion.div>
      {/* FEATURED SECTION - ALWAYS SHOW (WITH EMPTY STATE) */}
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
            {!isFeaturedLoading && featuredProjects && (
              <Badge variant="secondary" className="text-xs">
                {featuredProjects.length}
              </Badge>
            )}
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
        ) : featuredProjects && featuredProjects.length > 0 ? (
          <ProjectGrid projects={featuredProjects.slice(0, 4)} columns={2} />
        ) : (
          <EmptyFeatured />
        )}
      </motion.div>
      {/* PERIOD TABS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* TAB BUTTONS */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-secondary/50 rounded-lg w-fit mb-4 sm:mb-6">
          {tabOptions.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.value)}
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
        {/* LAUNCHES CONTENT */}
        {isLaunchesLoading ? (
          <ProjectGridSkeleton columns={2} count={6} />
        ) : launches && launches.length > 0 ? (
          <ProjectGrid projects={launches} columns={2} />
        ) : (
          <EmptyLaunches period={activeTab} />
        )}
      </motion.div>
    </div>
  );
};

// <== EMPTY FEATURED COMPONENT ==>
const EmptyFeatured = () => {
  // RETURNING EMPTY FEATURED COMPONENT
  return (
    <Card className="p-6 sm:p-8 text-center border-dashed">
      <div className="p-3 rounded-full bg-yellow-500/10 w-fit mx-auto mb-3">
        <Star className="size-5 sm:size-6 text-yellow-500" />
      </div>
      <h3 className="text-sm sm:text-base font-semibold mb-1.5">
        No featured projects yet
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
        Featured projects are handpicked by our team for exceptional quality and
        innovation. Check back soon!
      </p>
    </Card>
  );
};

// <== EMPTY LAUNCHES COMPONENT ==>
const EmptyLaunches = ({ period }: { period: LaunchPeriod }) => {
  // GET PERIOD TEXT
  const getPeriodText = () => {
    switch (period) {
      case "today":
        return "today";
      case "week":
        return "this week";
      case "month":
        return "this month";
      default:
        return "today";
    }
  };
  // RETURNING EMPTY LAUNCHES COMPONENT
  return (
    <Card className="p-8 sm:p-12 text-center">
      <div className="p-3 sm:p-4 rounded-full bg-secondary w-fit mx-auto mb-3 sm:mb-4">
        <Rocket className="size-6 sm:size-8 text-muted-foreground" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-2">
        No launches {getPeriodText()}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto">
        Be the first to launch a project {getPeriodText()}!
      </p>
      <Button asChild size="sm" className="sm:size-default">
        <Link href="/dashboard/projects/new">Launch Your Project</Link>
      </Button>
    </Card>
  );
};
