// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";

// <== TOC ITEM TYPE ==>
interface TocItem {
  // <== ID ==>
  id: string;
  // <== TEXT ==>
  text: string;
  // <== LEVEL (H2, H3, H4) ==>
  level: number;
}

// <== TABLE OF CONTENTS PROPS ==>
interface TableOfContentsProps {
  // <== CONTENT HTML ==>
  content: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== EXTRACT HEADINGS FROM HTML ==>
function extractHeadings(html: string): TocItem[] {
  // MATCH H2, H3, H4 HEADINGS
  const regex = /<h([2-4])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi;
  // RESULTS ARRAY
  const headings: TocItem[] = [];
  // MATCH ITERATOR
  let match;
  // EXTRACT HEADINGS
  while ((match = regex.exec(html)) !== null) {
    // PARSE LEVEL
    const level = parseInt(match[1], 10);
    // PARSE ID
    const id = match[2] || "";
    // PARSE TEXT
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    // ONLY ADD IF WE HAVE TEXT
    if (text) {
      // PUSH HEADING
      headings.push({
        id: id || text.toLowerCase().replace(/\s+/g, "-"),
        text,
        level,
      });
    }
  }
  // RETURN HEADINGS
  return headings;
}

// <== TABLE OF CONTENTS COMPONENT ==>
export const TableOfContents = ({
  content,
  className,
}: TableOfContentsProps) => {
  // ACTIVE HEADING STATE
  const [activeId, setActiveId] = useState<string>("");
  // EXTRACT HEADINGS FROM CONTENT
  const headings = useMemo(() => extractHeadings(content), [content]);
  // INTERSECTION OBSERVER FOR ACTIVE HEADING
  useEffect(() => {
    // RETURN IF NO HEADINGS
    if (headings.length === 0) return;
    // CREATE OBSERVER
    const observer = new IntersectionObserver(
      (entries) => {
        // ITERATE OVER ENTRIES
        entries.forEach((entry) => {
          // IF INTERSECTING, SET ACTIVE ID
          if (entry.isIntersecting) {
            // SET ACTIVE ID
            setActiveId(entry.target.id);
          }
        });
        // RETURN OBSERVER
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      }
    );
    // OBSERVE HEADINGS
    headings.forEach((heading) => {
      // GET ELEMENT BY ID
      const element = document.getElementById(heading.id);
      // ONLY OBSERVE IF ELEMENT EXISTS
      if (element) {
        // OBSERVE ELEMENT
        observer.observe(element);
      }
    });
    // CLEANUP
    return () => {
      // DISCONNECT OBSERVER
      observer.disconnect();
    };
  }, [headings]);
  // SCROLL TO HEADING
  const scrollToHeading = (id: string) => {
    // GET ELEMENT BY ID
    const element = document.getElementById(id);
    // ONLY SCROLL IF ELEMENT EXISTS
    if (element) {
      // CALCULATE OFFSET
      const offset = 80;
      // GET ELEMENT POSITION
      const elementPosition = element.getBoundingClientRect().top;
      // CALCULATE OFFSET POSITION
      const offsetPosition = elementPosition + window.scrollY - offset;
      // SCROLL TO POSITION
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };
  // RETURN NULL IF NO HEADINGS
  if (headings.length === 0) {
    // RETURN NULL
    return null;
  }
  // RETURN TABLE OF CONTENTS COMPONENT
  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
        <List className="size-4 sm:size-5 text-primary" />
        <h3 className="font-semibold text-sm sm:text-base">
          Table of Contents
        </h3>
      </div>
      {/* TOC LIST */}
      <nav className="space-y-0.5 sm:space-y-1 max-h-64 sm:max-h-80 overflow-y-auto scrollbar-thin">
        {/* ITERATE OVER HEADINGS */}
        {headings.map((heading, index) => {
          // CHECK IF HEADING IS ACTIVE
          const isActive = activeId === heading.id;
          // CALCULATE INDENTATION
          const indent = (heading.level - 2) * 12;
          // RETURN BUTTON
          return (
            <motion.button
              key={`${heading.id}-${index}`}
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "block w-full text-left py-1 sm:py-1.5 text-xs sm:text-sm transition-all duration-200 rounded px-2 hover:bg-secondary/50",
                isActive
                  ? "text-primary font-medium bg-primary/10"
                  : "text-muted-foreground"
              )}
              style={{ paddingLeft: `${8 + indent}px` }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {heading.text}
            </motion.button>
          );
        })}
      </nav>
    </Card>
  );
};

// <== TABLE OF CONTENTS SKELETON ==>
export const TableOfContentsSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURNING SKELETON
  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      {/* HEADER SKELETON */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
        <div className="size-4 sm:size-5 bg-secondary rounded animate-pulse" />
        <div className="h-4 sm:h-5 w-28 sm:w-32 bg-secondary rounded animate-pulse" />
      </div>
      {/* TOC LIST SKELETON */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="h-3 sm:h-4 w-full bg-secondary rounded animate-pulse" />
        <div className="h-3 sm:h-4 w-4/5 bg-secondary rounded animate-pulse ml-3" />
        <div className="h-3 sm:h-4 w-3/4 bg-secondary rounded animate-pulse ml-3" />
        <div className="h-3 sm:h-4 w-full bg-secondary rounded animate-pulse" />
        <div className="h-3 sm:h-4 w-5/6 bg-secondary rounded animate-pulse ml-3" />
        <div className="h-3 sm:h-4 w-full bg-secondary rounded animate-pulse" />
      </div>
    </Card>
  );
};

// <== EXPORTING TABLE OF CONTENTS ==>
export default TableOfContents;
