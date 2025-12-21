// <== REACT QUERY CLIENT CONFIGURATION ==>
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

// <== CREATE QUERY CLIENT ==>
function makeQueryClient() {
  // CREATE QUERY CLIENT
  return new QueryClient({
    defaultOptions: {
      // <== QUERIES ==>
      queries: {
        // <== STALE TIME - DATA IS FRESH FOR 1 MINUTE ==>
        staleTime: 60 * 1000,
        // <== GC TIME - CACHED DATA IS KEPT FOR 5 MINUTES ==>
        gcTime: 5 * 60 * 1000,
        // <== RETRY - RETRY FAILED REQUESTS 1 TIME ==>
        retry: 1,
        // <== REFETCH ON WINDOW FOCUS ==>
        refetchOnWindowFocus: false,
        // <== REFETCH ON RECONNECT ==>
        refetchOnReconnect: true,
        // <== REFETCH ON MOUNT IF STALE ==>
        refetchOnMount: true,
      },
      // <== MUTATIONS ==>
      mutations: {
        // <== RETRY MUTATIONS ONCE ==>
        retry: 1,
      },
      // <== DEHYDRATION ==>
      dehydrate: {
        // <== INCLUDE PENDING QUERIES IN DEHYDRATION ==>
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

// <== BROWSER QUERY CLIENT (SINGLETON) ==>
let browserQueryClient: QueryClient | undefined = undefined;

// <== GET QUERY CLIENT ==>
export function getQueryClient() {
  // SERVER: ALWAYS CREATE A NEW QUERY CLIENT
  if (isServer) {
    // CREATE NEW QUERY CLIENT
    return makeQueryClient();
  }
  // BROWSER: REUSE EXISTING CLIENT OR CREATE NEW ONE
  if (!browserQueryClient) {
    // CREATE NEW QUERY CLIENT
    browserQueryClient = makeQueryClient();
  }
  // RETURN QUERY CLIENT
  return browserQueryClient;
}

// <== QUERY CLIENT OPTIONS FOR SPECIFIC USE CASES ==>
export const queryOptions = {
  // <== PROFILE QUERIES - LONGER STALE TIME ==>
  profile: {
    // <== STALE TIME - DATA IS FRESH FOR 5 MINUTES ==>
    staleTime: 5 * 60 * 1000,
    // <== GC TIME - CACHED DATA IS KEPT FOR 10 MINUTES ==>
    gcTime: 10 * 60 * 1000,
  },
  // <== PROJECT LIST QUERIES - SHORTER STALE TIME ==>
  projectList: {
    // <== STALE TIME - DATA IS FRESH FOR 30 SECONDS ==>
    staleTime: 30 * 1000,
    // <== GC TIME - CACHED DATA IS KEPT FOR 5 MINUTES ==>
    gcTime: 5 * 60 * 1000,
  },
  // <== PROJECT DETAIL QUERIES ==>
  projectDetail: {
    // <== STALE TIME - DATA IS FRESH FOR 1 MINUTE ==>
    staleTime: 60 * 1000,
    // <== GC TIME - CACHED DATA IS KEPT FOR 10 MINUTES ==>
    gcTime: 10 * 60 * 1000,
  },
  // <== TRENDING/FEATURED - VERY SHORT STALE TIME ==>
  trending: {
    // <== STALE TIME - DATA IS FRESH FOR 15 SECONDS ==>
    staleTime: 15 * 1000,
    // <== GC TIME - CACHED DATA IS KEPT FOR 1 MINUTE ==>
    gcTime: 60 * 1000,
  },
  // <== STATIC DATA (CATEGORIES) - VERY LONG STALE TIME ==>
  static: {
    // <== STALE TIME - DATA IS FRESH FOR 1 HOUR ==>
    staleTime: 60 * 60 * 1000,
    // <== GC TIME - CACHED DATA IS KEPT FOR 24 HOURS ==>
    gcTime: 24 * 60 * 60 * 1000,
  },
  // <== REAL-TIME DATA (NOTIFICATIONS, MESSAGES) ==>
  realtime: {
    // <== STALE TIME - DATA IS ALWAYS STALE ==>
    staleTime: 0,
    // <== GC TIME - CACHED DATA IS KEPT FOR 5 MINUTES ==>
    gcTime: 5 * 60 * 1000,
    // <== REFETCH INTERVAL - REFETCH EVERY 30 SECONDS ==>
    refetchInterval: 30 * 1000,
  },
  // <== INFINITE QUERIES (PAGINATION) ==>
  infinite: {
    // <== STALE TIME - DATA IS FRESH FOR 30 SECONDS ==>
    staleTime: 30 * 1000,
    // <== GC TIME - CACHED DATA IS KEPT FOR 5 MINUTES ==>
    gcTime: 5 * 60 * 1000,
    // <== REFETCH ON WINDOW FOCUS ==>
    refetchOnWindowFocus: false,
  },
};
