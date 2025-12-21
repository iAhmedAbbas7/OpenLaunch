// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useQuery } from "@tanstack/react-query";
import { categoryKeys, queryOptions } from "@/lib/query";
import { getCategories } from "@/server/actions/categories";

// <== USE CATEGORIES HOOK ==>
export function useCategories() {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: categoryKeys.list(),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH CATEGORIES
      const result = await getCategories();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS - CATEGORIES ARE STATIC
    ...queryOptions.static,
  });
}
