// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// <== ANIMATION VARIANTS ==>
const cardVariants = {
  // INITIAL STATE
  hidden: {
    // OPACITY
    opacity: 0,
    // Y POSITION
    y: 30,
    // SCALE
    scale: 0.95,
  },
  // ANIMATED STATE
  visible: {
    // OPACITY
    opacity: 1,
    // Y POSITION
    y: 0,
    // SCALE
    scale: 1,
    // TRANSITION
    transition: {
      // DURATION
      duration: 0.5,
      // EASE
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      // STAGGER CHILDREN
      staggerChildren: 0.1,
      // DELAY CHILDREN
      delayChildren: 0.2,
    },
  },
};

// <== CHILD ANIMATION VARIANTS ==>
const childVariants = {
  // INITIAL STATE
  hidden: {
    // OPACITY
    opacity: 0,
    // Y POSITION
    y: 20,
  },
  // ANIMATED STATE
  visible: {
    // OPACITY
    opacity: 1,
    // Y POSITION
    y: 0,
    // TRANSITION
    transition: {
      // DURATION
      duration: 0.4,
      // EASE
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// <== AUTH CARD PROPS ==>
interface AuthCardProps {
  // CHILDREN
  children: React.ReactNode;
  // CLASS NAME
  className?: string;
}

// <== AUTH CARD COMPONENT ==>
export const AuthCard = ({ children, className }: AuthCardProps) => {
  // RETURNING AUTH CARD COMPONENT
  return (
    // MOTION CARD CONTAINER
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-full max-w-[420px] p-6 sm:p-8 rounded-2xl",
        "bg-card/80 backdrop-blur-xl",
        "border border-border/50",
        "shadow-2xl shadow-black/20",
        className
      )}
    >
      {/* CHILDREN */}
      {children}
    </motion.div>
  );
};

// <== AUTH CARD HEADER PROPS ==>
interface AuthCardHeaderProps {
  // TITLE
  title: string;
  // DESCRIPTION
  description?: string;
}

// <== AUTH CARD HEADER COMPONENT ==>
export const AuthCardHeader = ({ title, description }: AuthCardHeaderProps) => {
  // RETURNING AUTH CARD HEADER COMPONENT
  return (
    // MOTION HEADER CONTAINER
    <motion.div
      variants={childVariants}
      className="space-y-1.5 text-center mb-6 sm:mb-8"
    >
      {/* TITLE */}
      <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">
        {title}
      </h1>
      {/* DESCRIPTION */}
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </motion.div>
  );
};

// <== AUTH CARD FOOTER PROPS ==>
interface AuthCardFooterProps {
  // CHILDREN
  children: React.ReactNode;
}

// <== AUTH CARD FOOTER COMPONENT ==>
export const AuthCardFooter = ({ children }: AuthCardFooterProps) => {
  // RETURNING AUTH CARD FOOTER COMPONENT
  return (
    // MOTION FOOTER CONTAINER
    <motion.div
      variants={childVariants}
      className="mt-6 text-center text-sm text-muted-foreground"
    >
      {/* CHILDREN */}
      {children}
    </motion.div>
  );
};

// <== AUTH FORM SECTION COMPONENT ==>
interface AuthFormSectionProps {
  // CHILDREN
  children: React.ReactNode;
  // CLASS NAME
  className?: string;
}

// <== AUTH FORM SECTION COMPONENT ==>
export const AuthFormSection = ({
  children,
  className,
}: AuthFormSectionProps) => {
  // RETURNING AUTH FORM SECTION COMPONENT
  return (
    // MOTION DIV
    <motion.div variants={childVariants} className={className}>
      {/* CHILDREN */}
      {children}
    </motion.div>
  );
};

// <== EXPORTING ANIMATION VARIANTS FOR REUSE ==>
export { childVariants };
