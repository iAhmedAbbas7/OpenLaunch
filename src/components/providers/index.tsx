// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

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
          {/* CHILDREN */}
          {children}
          {/* TOASTER FOR NOTIFICATIONS */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "font-sans",
              classNames: {
                success:
                  "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                error:
                  "bg-destructive/10 border-destructive/20 text-destructive",
                info: "bg-primary/10 border-primary/20 text-primary",
                warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
              },
            }}
            richColors
            closeButton
            expand={false}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};

// <== EXPORTING AUTH PROVIDER ==>
export { AuthProvider } from "./auth-provider";
// <== EXPORTING QUERY PROVIDER ==>
export { QueryProvider } from "./query-provider";
// <== EXPORTING THEME PROVIDER ==>
export { ThemeProvider } from "./theme-provider";
