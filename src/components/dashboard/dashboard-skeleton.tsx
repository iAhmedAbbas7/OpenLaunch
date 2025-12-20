// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

// <== SKELETON ANIMATION VARIANTS ==>
const shimmer = {
  // INITIAL STATE
  initial: {
    // BACKGROUND POSITION
    backgroundPosition: "-200% 0",
  },
  // ANIMATED STATE
  animate: {
    // BACKGROUND POSITION
    backgroundPosition: "200% 0",
    // TRANSITION
    transition: {
      // REPEAT INFINITY
      repeat: Infinity,
      // DURATION
      duration: 1.5,
      // EASE
      ease: "linear" as const,
    },
  },
};

// <== SKELETON BASE PROPS ==>
interface SkeletonProps {
  // CLASS NAME
  className?: string;
}

// <== SKELETON BASE COMPONENT ==>
const Skeleton = ({ className }: SkeletonProps) => {
  // RETURNING SKELETON COMPONENT
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      className={cn(
        "rounded-md bg-linear-to-r from-secondary/40 via-secondary/70 to-secondary/40",
        "bg-size-[200%_100%]",
        className
      )}
    />
  );
};

// <== STAT CARD SKELETON COMPONENT ==>
const StatCardSkeleton = ({ delay = 0 }: { delay?: number }) => {
  // RETURNING STAT CARD SKELETON
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* CARD */}
      <Card className="p-6">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between">
          {/* ICON SKELETON */}
          <Skeleton className="w-10 h-10 rounded-lg" />
          {/* TREND SKELETON */}
          <Skeleton className="w-12 h-4 rounded" />
        </div>
        {/* VALUE AND TITLE */}
        <div className="mt-4 space-y-2">
          {/* VALUE SKELETON */}
          <Skeleton className="w-16 h-7 rounded" />
          {/* TITLE SKELETON */}
          <Skeleton className="w-24 h-4 rounded" />
        </div>
      </Card>
    </motion.div>
  );
};

// <== QUICK ACTION CARD SKELETON COMPONENT ==>
const QuickActionSkeleton = ({ delay = 0 }: { delay?: number }) => {
  // RETURNING QUICK ACTION SKELETON
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* CARD */}
      <Card className="p-6">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between mb-4">
          {/* ICON SKELETON */}
          <Skeleton className="w-12 h-12 rounded-lg" />
          {/* ARROW SKELETON */}
          <Skeleton className="w-5 h-5 rounded" />
        </div>
        {/* TITLE SKELETON */}
        <Skeleton className="w-32 h-5 mb-2 rounded" />
        {/* DESCRIPTION SKELETON */}
        <Skeleton className="w-full h-4 rounded" />
      </Card>
    </motion.div>
  );
};

// <== DASHBOARD SKELETON COMPONENT ==>
export const DashboardSkeleton = () => {
  // RETURNING DASHBOARD SKELETON COMPONENT
  return (
    // DASHBOARD CONTAINER
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        {/* HEADER CONTENT */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* LOGO ICON */}
            <Logo
              size={32}
              className="transition-transform group-hover:scale-110"
            />
            {/* LOGO TEXT */}
            <span className="text-lg font-bold font-heading gradient-text">
              OpenLaunch
            </span>
          </Link>
          {/* USER MENU SKELETON */}
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </header>
      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
        {/* WELCOME SECTION SKELETON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          {/* AVATAR SKELETON */}
          <Skeleton className="w-16 h-16 rounded-full shrink-0" />
          {/* WELCOME TEXT SKELETON */}
          <div className="space-y-2 flex-1">
            {/* TITLE SKELETON */}
            <Skeleton className="w-64 max-w-full h-8 rounded" />
            {/* SUBTITLE SKELETON */}
            <Skeleton className="w-80 max-w-full h-5 rounded" />
          </div>
        </motion.div>
        {/* STATS GRID SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* STAT CARDS */}
          <StatCardSkeleton delay={0.1} />
          <StatCardSkeleton delay={0.15} />
          <StatCardSkeleton delay={0.2} />
          <StatCardSkeleton delay={0.25} />
        </div>
        {/* QUICK ACTIONS SKELETON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* SECTION TITLE SKELETON */}
          <Skeleton className="w-32 h-6 mb-4 rounded" />
          {/* ACTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* QUICK ACTION CARDS */}
            <QuickActionSkeleton delay={0.35} />
            <QuickActionSkeleton delay={0.4} />
            <QuickActionSkeleton delay={0.45} />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// <== EXPORTING COMPONENTS ==>
export { Skeleton };
