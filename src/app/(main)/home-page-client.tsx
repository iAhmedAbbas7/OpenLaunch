// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Rocket,
  Github,
  Users,
  Trophy,
  Zap,
  MessageSquare,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Code2,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// <== FEATURES DATA ==>
const features = [
  // FEATURE 1
  {
    icon: Rocket,
    title: "Launch Projects",
    description:
      "Share your projects with the developer community and get valuable feedback from day one.",
  },
  // FEATURE 2
  {
    icon: Github,
    title: "GitHub Integration",
    description:
      "Connect your GitHub to automatically sync repositories, showcase code, and track contributions.",
  },
  // FEATURE 3
  {
    icon: Users,
    title: "Build Community",
    description:
      "Follow developers, engage in discussions, and grow your network with like-minded builders.",
  },
  // FEATURE 4
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "Earn achievements, climb leaderboards, and maintain streaks as you contribute to the community.",
  },
  // FEATURE 5
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description:
      "Connect with other developers through direct messages and group conversations.",
  },
  // FEATURE 6
  {
    icon: BookOpen,
    title: "Write Articles",
    description:
      "Share your knowledge through articles with full SEO optimization and syntax highlighting.",
  },
];

// <== STATS DATA ==>
const stats = [
  // STAT 1
  { value: "10K+", label: "Developers" },
  // STAT 2
  { value: "5K+", label: "Projects" },
  // STAT 3
  { value: "50K+", label: "Upvotes" },
  // STAT 4
  { value: "100K+", label: "Connections" },
];

// <== HOME PAGE CLIENT COMPONENT ==>
export const HomePageClient = () => {
  // RETURNING HOME PAGE COMPONENT
  return (
    // PAGE CONTAINER
    <>
      {/* HERO SECTION */}
      <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        {/* BACKGROUND ELEMENTS */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] translate-x-1/2 pointer-events-none" />
        {/* GRID PATTERN */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* CONTAINER */}
        <div className="container mx-auto px-4 relative z-10">
          {/* HERO CONTENT */}
          <div className="max-w-4xl mx-auto text-center">
            {/* BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Now in Public Beta
              </span>
            </motion.div>
            {/* HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading tracking-tight leading-[1.1]"
            >
              Where Developers <span className="gradient-text">Launch</span>{" "}
              Their <span className="gradient-text">Dreams</span>
            </motion.h1>
            {/* SUB-HEADLINE */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              The ultimate hub to share your projects, connect with fellow
              developers, write articles, and grow your reputation in the
              developer community.
            </motion.p>
            {/* CTA BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                asChild
                className="h-12 px-8 text-base cursor-pointer"
              >
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 px-8 text-base cursor-pointer"
              >
                <Link href="/explore">Explore Projects</Link>
              </Button>
            </motion.div>
            {/* TECH BADGES */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-3"
            >
              {["Next.js", "React", "TypeScript", "Tailwind", "Supabase"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 text-xs font-mono rounded-full bg-secondary text-secondary-foreground border border-border/50"
                  >
                    {tech}
                  </span>
                )
              )}
            </motion.div>
          </div>
        </div>
      </section>
      {/* STATS SECTION */}
      <section className="py-16 border-y border-border/50 bg-secondary/30">
        {/* CONTAINER */}
        <div className="container mx-auto px-4">
          {/* STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading gradient-text">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* FEATURES SECTION */}
      <section className="py-20 lg:py-28">
        {/* CONTAINER */}
        <div className="container mx-auto px-4">
          {/* SECTION HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
              Everything You Need to{" "}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built by developers, for developers. Every feature is designed to
              help you grow and connect.
            </p>
          </motion.div>
          {/* FEATURES GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* SMOKE/GLOW EFFECT - APPEARS ON HOVER */}
                <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/0 via-primary/0 to-accent/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-primary/30 group-hover:via-accent/20 group-hover:to-primary/30 group-hover:opacity-100" />
                <div className="absolute -inset-1 rounded-2xl bg-linear-to-br from-primary/0 to-accent/0 opacity-0 blur-2xl transition-all duration-700 group-hover:from-primary/20 group-hover:to-accent/20 group-hover:opacity-100 group-hover:animate-pulse" />
                {/* CARD */}
                <Card className="relative p-6 h-full bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
                  {/* ICON */}
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-primary/20">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  {/* TITLE */}
                  <h3 className="text-lg font-semibold mb-2 transition-colors duration-300 group-hover:text-primary">
                    {feature.title}
                  </h3>
                  {/* DESCRIPTION */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* HOW IT WORKS SECTION */}
      <section className="py-20 lg:py-28 bg-secondary/20 overflow-hidden">
        {/* CONTAINER */}
        <div className="container mx-auto px-4">
          {/* SECTION HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
              Launch in <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get your project in front of thousands of developers in minutes.
            </p>
          </motion.div>
          {/* STEPS CONTAINER WITH TIMELINE */}
          <div className="relative">
            {/* CONNECTING LINE - DESKTOP */}
            <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-[2px]">
              <div className="w-full h-full bg-linear-to-r from-primary/50 via-accent/50 to-primary/50 rounded-full" />
              {/* ANIMATED GLOW */}
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-primary via-accent to-primary rounded-full blur-sm"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            {/* STEPS GRID */}
            <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
              {/* STEP 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group"
              >
                <div className="relative flex flex-col items-center">
                  {/* STEP NUMBER */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10 size-[120px] rounded-3xl bg-linear-to-br from-card via-card to-secondary border border-border/50 flex items-center justify-center mb-6 shadow-xl shadow-primary/5 group-hover:border-primary/30 group-hover:shadow-primary/10 transition-all duration-500"
                  >
                    {/* ICON */}
                    <div className="relative size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <Code2 className="size-7 text-primary" />
                    </div>
                    {/* GLOW EFFECT ON HOVER */}
                    <div className="absolute inset-0 rounded-3xl bg-primary/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  </motion.div>
                  {/* CONTENT */}
                  <div className="text-center max-w-xs">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      Create Your Profile
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Sign up with GitHub and connect your repositories. Your
                      developer profile is created automatically.
                    </p>
                  </div>
                </div>
              </motion.div>
              {/* STEP 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="group"
              >
                <div className="relative flex flex-col items-center">
                  {/* STEP NUMBER */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10 size-[120px] rounded-3xl bg-linear-to-br from-card via-card to-secondary border border-border/50 flex items-center justify-center mb-6 shadow-xl shadow-primary/5 group-hover:border-primary/30 group-hover:shadow-primary/10 transition-all duration-500"
                  >
                    {/* ICON */}
                    <div className="relative size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <Rocket className="size-7 text-primary" />
                    </div>
                    {/* GLOW EFFECT ON HOVER */}
                    <div className="absolute inset-0 rounded-3xl bg-primary/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  </motion.div>
                  {/* CONTENT */}
                  <div className="text-center max-w-xs">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      Launch Your Project
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Add your project details, screenshots, and schedule your
                      launch day to maximize visibility.
                    </p>
                  </div>
                </div>
              </motion.div>
              {/* STEP 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group"
              >
                <div className="relative flex flex-col items-center">
                  {/* STEP NUMBER */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10 size-[120px] rounded-3xl bg-linear-to-br from-card via-card to-secondary border border-border/50 flex items-center justify-center mb-6 shadow-xl shadow-primary/5 group-hover:border-primary/30 group-hover:shadow-primary/10 transition-all duration-500"
                  >
                    {/* ICON */}
                    <div className="relative size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <TrendingUp className="size-7 text-primary" />
                    </div>
                    {/* GLOW EFFECT ON HOVER */}
                    <div className="absolute inset-0 rounded-3xl bg-primary/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  </motion.div>
                  {/* CONTENT */}
                  <div className="text-center max-w-xs">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      Grow & Connect
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Get upvotes, feedback, and connect with developers. Build
                      your reputation and grow your network.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA SECTION */}
      <section className="py-20 lg:py-28">
        {/* CONTAINER */}
        <div className="container mx-auto px-4">
          {/* CTA CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative max-w-4xl mx-auto text-center p-8 sm:p-12 lg:p-16 rounded-3xl bg-linear-to-br from-primary/10 via-background to-accent/10 border border-border/50 overflow-hidden"
          >
            {/* GLOW */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            {/* CONTENT */}
            <div className="relative z-10">
              {/* ICON */}
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Globe className="size-8 text-primary" />
              </div>
              {/* HEADLINE */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
                Ready to <span className="gradient-text">Launch</span>?
              </h2>
              {/* SUB-HEADLINE */}
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Join thousands of developers who are already sharing their
                projects and growing their network on OpenLaunch.
              </p>
              {/* CTA BUTTON */}
              <Button
                size="lg"
                asChild
                className="mt-8 h-12 px-8 text-base cursor-pointer"
              >
                <Link href="/sign-up">
                  Start Building Today
                  <Zap className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
