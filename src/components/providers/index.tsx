// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { AuthProvider } from "./auth-provider";

// <== PROVIDERS PROPS ==>
interface ProvidersProps {
  // CHILDREN
  children: React.ReactNode;
}

// <== PROVIDERS COMPONENT ==>
export const Providers = ({ children }: ProvidersProps) => {
  // RETURNING PROVIDERS COMPONENT
  return (
    // AUTH PROVIDER
    <AuthProvider>{children}</AuthProvider>
  );
};
