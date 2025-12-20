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
import { Logo } from "@/components/common/Logo";
import { UserMenu } from "@/components/auth/user-menu";
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
      <Card className="p-6">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between">
          {/* ICON */}
          <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
          {/* TREND */}
          {trend && (
            <span className="text-xs text-primary flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
        {/* VALUE */}
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </Card>
    </motion.div>
  );
};

// <== DASHBOARD PAGE COMPONENT ==>
const DashboardPage = () => {
  // GET AUTH HOOK
  const { user, profile, isLoading, isInitialized } = useAuth();
  // <== GET USERNAME ==>
  const username: string =
    profile?.username ??
    user?.userMetadata?.username ??
    user?.userMetadata?.preferredUsername ??
    "";
  // <== GET DISPLAY NAME (WITH PROPER FALLBACKS) ==>
  const displayName: string =
    profile?.displayName ??
    user?.userMetadata?.fullName ??
    user?.userMetadata?.name ??
    username ??
    "User";
  // <== GET AVATAR URL ==>
  const avatarUrl: string | undefined =
    profile?.avatarUrl ?? user?.userMetadata?.avatarUrl ?? undefined;
  // <== GET INITIALS (FALLBACK TO EMPTY IF NO NAME) ==>
  const initials = getInitials(displayName);
  // <== RENDER LOADING STATE ==>
  if (!isInitialized || isLoading) {
    // RETURNING SKELETON LOADING STATE
    return <DashboardSkeleton />;
  }
  // RETURNING DASHBOARD PAGE COMPONENT
  return (
    // DASHBOARD CONTAINER
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        {/* HEADER CONTENT */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer"
          >
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
          {/* USER MENU */}
          <UserMenu />
        </div>
      </header>
      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
        {/* WELCOME SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          {/* AVATAR */}
          <Avatar className="h-16 w-16">
            {/* AVATAR IMAGE */}
            <AvatarImage src={avatarUrl} alt={displayName} />
            {/* AVATAR FALLBACK - SHOW INITIALS OR USER ICON */}
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {initials || <User className="size-8" />}
            </AvatarFallback>
          </Avatar>
          {/* WELCOME TEXT */}
          <div>
            <h1 className="text-2xl font-bold font-heading">
              Welcome back, {displayName}!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your projects
            </p>
          </div>
        </motion.div>
        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* PROJECTS STAT */}
          <StatCard
            title="Total Projects"
            value={0}
            icon={<Rocket className="w-5 h-5 text-primary" />}
            delay={0.1}
          />
          {/* ARTICLES STAT */}
          <StatCard
            title="Published Articles"
            value={0}
            icon={<BookOpen className="w-5 h-5 text-primary" />}
            delay={0.2}
          />
          {/* FOLLOWERS STAT */}
          <StatCard
            title="Followers"
            value={profile?.followersCount ?? 0}
            icon={<Users className="w-5 h-5 text-primary" />}
            trend="+0%"
            delay={0.3}
          />
          {/* VIEWS STAT */}
          <StatCard
            title="Total Views"
            value={0}
            icon={<Eye className="w-5 h-5 text-primary" />}
            trend="+0%"
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
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          {/* ACTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LAUNCH PROJECT */}
            <Card className="p-6 hover:border-primary/50 transition-colors group cursor-pointer">
              <Link href="/dashboard/projects/new" className="block">
                {/* CARD CONTENT */}
                <div className="flex items-center justify-between mb-4">
                  {/* ICON */}
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  {/* ARROW */}
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {/* TITLE */}
                <h3 className="font-semibold mb-1">Launch a Project</h3>
                {/* DESCRIPTION */}
                <p className="text-sm text-muted-foreground">
                  Share your latest creation with the community
                </p>
              </Link>
            </Card>
            {/* WRITE ARTICLE */}
            <Card className="p-6 hover:border-primary/50 transition-colors group cursor-pointer">
              <Link href="/dashboard/articles/new" className="block">
                {/* CARD CONTENT */}
                <div className="flex items-center justify-between mb-4">
                  {/* ICON */}
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  {/* ARROW */}
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {/* TITLE */}
                <h3 className="font-semibold mb-1">Write an Article</h3>
                {/* DESCRIPTION */}
                <p className="text-sm text-muted-foreground">
                  Share your knowledge and experiences
                </p>
              </Link>
            </Card>
            {/* VIEW ACHIEVEMENTS */}
            <Card className="p-6 hover:border-primary/50 transition-colors group cursor-pointer">
              <Link href="/dashboard/achievements" className="block">
                {/* CARD CONTENT */}
                <div className="flex items-center justify-between mb-4">
                  {/* ICON */}
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  {/* ARROW */}
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {/* TITLE */}
                <h3 className="font-semibold mb-1">View Achievements</h3>
                {/* DESCRIPTION */}
                <p className="text-sm text-muted-foreground">
                  Track your progress and unlock rewards
                </p>
              </Link>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// <== EXPORTING DASHBOARD PAGE ==>
export default DashboardPage;
