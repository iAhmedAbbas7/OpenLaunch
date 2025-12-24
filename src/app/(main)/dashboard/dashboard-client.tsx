// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Rocket,
  BookOpen,
  Trophy,
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

// <== STAT CARD PROPS ==>
interface StatCardProps {
  // <== TITLE ==>
  title: string;
  // <== VALUE ==>
  value: string | number;
  // <== ICON ==>
  icon: React.ReactNode;
  // <== TREND ==>
  trend?: string;
  // <== DELAY ==>
  delay?: number;
}

// <== STAT CARD COMPONENT ==>
const StatCard = ({ title, value, icon, trend, delay = 0 }: StatCardProps) => {
  // RETURNING STAT CARD COMPONENT
  return (
    // MOTION CARD
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* CARD */}
      <Card className="p-4 sm:p-6">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between">
          {/* ICON */}
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">{icon}</div>
          {/* TREND */}
          {trend && (
            <span className="text-[10px] sm:text-xs text-primary flex items-center gap-0.5 sm:gap-1">
              <TrendingUp className="size-2.5 sm:size-3" />
              {trend}
            </span>
          )}
        </div>
        {/* VALUE */}
        <div className="mt-3 sm:mt-4">
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
        </div>
      </Card>
    </motion.div>
  );
};

// <== QUICK ACTION CARD PROPS ==>
interface QuickActionCardProps {
  // <== HREF ==>
  href: string;
  // <== ICON ==>
  icon: React.ReactNode;
  // <== TITLE ==>
  title: string;
  // <== DESCRIPTION ==>
  description: string;
  // <== DELAY ==>
  delay?: number;
}

// <== QUICK ACTION CARD COMPONENT ==>
const QuickActionCard = ({
  href,
  icon,
  title,
  description,
  delay = 0,
}: QuickActionCardProps) => {
  // RETURNING QUICK ACTION CARD COMPONENT
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-4 sm:p-6 hover:border-primary/50 transition-colors group cursor-pointer">
        <Link href={href} className="block">
          {/* CARD CONTENT */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {/* ICON */}
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10">{icon}</div>
            {/* ARROW */}
            <ArrowUpRight className="size-4 sm:size-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          {/* TITLE */}
          <h3 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">
            {title}
          </h3>
          {/* DESCRIPTION */}
          <p className="text-xs sm:text-sm text-muted-foreground">
            {description}
          </p>
        </Link>
      </Card>
    </motion.div>
  );
};

// <== DASHBOARD CLIENT COMPONENT ==>
export const DashboardClient = () => {
  // GET AUTH HOOK
  const { user, profile, isLoading, isInitialized } = useAuth();
  // GET DASHBOARD STATS
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  // GET USERNAME
  const username: string =
    profile?.username ??
    user?.userMetadata?.username ??
    user?.userMetadata?.preferredUsername ??
    "";
  // GET DISPLAY NAME (WITH PROPER FALLBACKS)
  const displayName: string =
    profile?.displayName ??
    user?.userMetadata?.fullName ??
    user?.userMetadata?.name ??
    username ??
    "User";
  // GET AVATAR URL
  const avatarUrl: string | undefined =
    profile?.avatarUrl ?? user?.userMetadata?.avatarUrl ?? undefined;
  // GET INITIALS (FALLBACK TO EMPTY IF NO NAME)
  const initials = getInitials(displayName);
  // RENDER LOADING STATE
  if (!isInitialized || isLoading || statsLoading) {
    // RETURNING SKELETON LOADING STATE
    return <DashboardSkeleton />;
  }
  // RETURNING DASHBOARD PAGE COMPONENT
  return (
    // DASHBOARD CONTAINER
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* WELCOME SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        {/* AVATAR */}
        <Avatar className="size-12 sm:size-16">
          {/* AVATAR IMAGE */}
          <AvatarImage src={avatarUrl} alt={displayName} />
          {/* AVATAR FALLBACK - SHOW INITIALS OR USER ICON */}
          <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-xl">
            {initials || <User className="size-5 sm:size-8" />}
          </AvatarFallback>
        </Avatar>
        {/* WELCOME TEXT */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading truncate">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects
          </p>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* PROJECTS STAT */}
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects ?? 0}
          icon={<Rocket className="size-4 sm:size-5 text-primary" />}
          delay={0.1}
        />
        {/* ARTICLES STAT */}
        <StatCard
          title="Published Articles"
          value={stats?.publishedArticles ?? 0}
          icon={<BookOpen className="size-4 sm:size-5 text-primary" />}
          delay={0.2}
        />
        {/* FOLLOWERS STAT */}
        <StatCard
          title="Followers"
          value={stats?.followersCount ?? profile?.followersCount ?? 0}
          icon={<Users className="size-4 sm:size-5 text-primary" />}
          delay={0.3}
        />
        {/* VIEWS STAT */}
        <StatCard
          title="Total Views"
          value={stats?.totalViews ?? 0}
          icon={<Eye className="size-4 sm:size-5 text-primary" />}
          delay={0.4}
        />
      </div>

      {/* QUICK ACTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* SECTION TITLE */}
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Quick Actions
        </h2>
        {/* ACTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* LAUNCH PROJECT */}
          <QuickActionCard
            href="/dashboard/projects/new"
            icon={<Rocket className="size-5 sm:size-6 text-primary" />}
            title="Launch a Project"
            description="Share your latest creation with the community"
            delay={0.55}
          />
          {/* WRITE ARTICLE */}
          <QuickActionCard
            href="/dashboard/articles/new"
            icon={<BookOpen className="size-5 sm:size-6 text-primary" />}
            title="Write an Article"
            description="Share your knowledge and experiences"
            delay={0.6}
          />
          {/* VIEW ACHIEVEMENTS */}
          <QuickActionCard
            href="/dashboard/achievements"
            icon={<Trophy className="size-5 sm:size-6 text-primary" />}
            title="View Achievements"
            description="Track your progress and unlock rewards"
            delay={0.65}
          />
        </div>
      </motion.div>
    </div>
  );
};
