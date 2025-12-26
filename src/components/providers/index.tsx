// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useTheme } from "next-themes";
import { AuthProvider } from "./auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { GlobalMessagesProvider } from "./messages-provider";

// <== PROVIDERS PROPS ==>
interface ProvidersProps {
  // CHILDREN
  children: React.ReactNode;
}

// <== PROVIDERS COMPONENT ==>
export const Providers = ({ children }: ProvidersProps) => {
  // RETURNING PROVIDERS COMPONENT
  return (
    // QUERY PROVIDER (OUTERMOST FOR CACHING)
    <QueryProvider>
      {/* THEME PROVIDER */}
      <ThemeProvider>
        {/* AUTH PROVIDER */}
        <AuthProvider>
          {/* GLOBAL MESSAGES PROVIDER - HANDLES REAL-TIME SUBSCRIPTIONS */}
          <GlobalMessagesProvider>
            {/* CHILDREN */}
            {children}
            {/* TOASTER FOR NOTIFICATIONS */}
            <ToasterWithTheme />
          </GlobalMessagesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};

// <== TOASTER WITH THEME ==>
const ToasterWithTheme = () => {
  // GET THEME
  const { resolvedTheme } = useTheme();
  // RETURNING TOASTER COMPONENT
  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        className: "font-sans",
        classNames: {
          success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
          error: "bg-destructive/10 border-destructive/20 text-destructive",
          info: "bg-primary/10 border-primary/20 text-primary",
          warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
        },
      }}
      richColors
      expand={false}
    />
  );
};

// <== EXPORTING AUTH PROVIDER ==>
export { AuthProvider } from "./auth-provider";
// <== EXPORTING QUERY PROVIDER ==>
export { QueryProvider } from "./query-provider";
// <== EXPORTING THEME PROVIDER ==>
export { ThemeProvider } from "./theme-provider";
