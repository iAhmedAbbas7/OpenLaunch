// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useState } from "react";
import { getQueryClient } from "@/lib/query/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// <== QUERY PROVIDER PROPS ==>
interface QueryProviderProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== QUERY PROVIDER COMPONENT ==>
export const QueryProvider = ({ children }: QueryProviderProps) => {
  // GET OR CREATE QUERY CLIENT
  const [queryClient] = useState(() => getQueryClient());
  // RETURNING QUERY PROVIDER COMPONENT
  return (
    // QUERY CLIENT PROVIDER
    <QueryClientProvider client={queryClient}>
      {/* CHILDREN */}
      {children}
      {/* REACT QUERY DEVTOOLS - ONLY IN DEVELOPMENT */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
};
