// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/common/Logo";

// <== HOME COMPONENT ==>
const Home = () => {
  // RETURNING HOME PAGE COMPONENT
  return (
    // HOME PAGE CONTAINER
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* ANIMATED GRADIENT MESH BACKGROUND */}
      <div className="absolute inset-0 gradient-mesh" />
      {/* ANIMATED GLOW ORBS - POSITIONED FAR FROM CENTER, LOW OPACITY */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      {/* ANIMATED GLOW ORBS - POSITIONED BOTTOM RIGHT, LOW OPACITY */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
        {/* LOGO ANIMATION */}
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="relative"
        >
          {/* ANIMATED GLOW ORBS - POSITIONED INSIDE THE LOGO, LOW OPACITY */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse scale-150" />
          {/* LOGO */}
          <Logo size={120} className="relative drop-shadow-2xl" />
        </motion.div>
        {/* MAIN TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          {/* MAIN TITLE */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight font-heading">
            {/* GRADIENT TEXT */}
            <span className="gradient-text">Open</span>
            {/* TEXT */}
            <span className="text-foreground">Launch</span>
          </h1>
          {/* MAIN DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground text-center max-w-md"
          >
            The developer hub to launch, share, and discover amazing projects
          </motion.p>
        </motion.div>
        {/* STATUS BADGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass"
        >
          {/* SPARKLES ICON */}
          <Sparkles className="w-4 h-4 text-accent" />
          {/* STATUS TEXT */}
          <span className="text-sm font-medium text-muted-foreground">
            Project initialized successfully
          </span>
          {/* PING ANIMATION */}
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        </motion.div>
        {/* TECH STACK BADGES */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-4"
        >
          {/* TECH STACK BADGES */}
          {[
            "Next.js 16",
            "React 19",
            "TypeScript",
            "Tailwind v4",
            "shadcn/ui",
          ].map((tech, index) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="px-3 py-1 text-xs font-mono rounded-full bg-secondary text-secondary-foreground border border-border"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      </div>
      {/* BOTTOM GRADIENT FADE */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Home;
