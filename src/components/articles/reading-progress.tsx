// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// <== READING PROGRESS PROPS ==>
interface ReadingProgressProps {
  // <== CLASS NAME ==>
  className?: string;
}

// <== READING PROGRESS COMPONENT ==>
export const ReadingProgress = ({ className }: ReadingProgressProps) => {
  // PROGRESS STATE
  const [progress, setProgress] = useState(0);
  // SCROLL HANDLER
  useEffect(() => {
    // SCROLL HANDLER
    const handleScroll = () => {
      // GET DOCUMENT HEIGHT
      const docHeight = document.documentElement.scrollHeight;
      // GET VIEWPORT HEIGHT
      const viewportHeight = window.innerHeight;
      // GET SCROLL POSITION
      const scrollTop = window.scrollY;
      // CALCULATE SCROLLABLE HEIGHT
      const scrollableHeight = docHeight - viewportHeight;
      // CALCULATE PROGRESS
      if (scrollableHeight > 0) {
        // CALCULATE PROGRESS
        const currentProgress = Math.min(
          100,
          Math.max(0, (scrollTop / scrollableHeight) * 100)
        );
        // SET PROGRESS
        setProgress(currentProgress);
      }
    };
    // ADD SCROLL LISTENER
    window.addEventListener("scroll", handleScroll, { passive: true });
    // INITIAL CHECK
    handleScroll();
    // CLEANUP
    return () => {
      // REMOVE SCROLL LISTENER
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // RETURN READING PROGRESS COMPONENT
  return (
    // PROGRESS BAR CONTAINER
    <div
      className={cn(
        "fixed top-0 left-0 right-0 h-1 bg-secondary z-50",
        className
      )}
    >
      {/* PROGRESS BAR */}
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

// <== EXPORTING READING PROGRESS ==>
export default ReadingProgress;
