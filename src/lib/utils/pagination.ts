// <== PAGINATION UTILITIES ==>
import type {
  CursorPaginationParams,
  CursorPaginatedResult,
  OffsetPaginationParams,
  OffsetPaginatedResult,
} from "@/types/database";

// <== DEFAULT PAGE SIZE ==>
export const DEFAULT_PAGE_SIZE = 20;
// <== MAX PAGE SIZE ==>
export const MAX_PAGE_SIZE = 100;

// <== NORMALIZE OFFSET PAGINATION PARAMS ==>
export function normalizeOffsetParams(
  params: OffsetPaginationParams
): Required<OffsetPaginationParams> {
  // GET PAGE AND LIMIT
  const page = Math.max(1, params.page ?? 1);
  // GET LIMIT AND CLAMP TO MAX
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE)
  );
  // RETURN NORMALIZED PARAMS
  return { page, limit };
}

// <== NORMALIZE CURSOR PAGINATION PARAMS ==>
export function normalizeCursorParams(params: CursorPaginationParams): {
  cursor: string | undefined;
  limit: number;
} {
  // GET CURSOR
  const cursor = params.cursor;
  // GET LIMIT AND CLAMP TO MAX
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE)
  );
  // RETURN NORMALIZED PARAMS
  return { cursor, limit };
}

// <== CALCULATE OFFSET FROM PAGE ==>
export function calculateOffset(page: number, limit: number): number {
  // CALCULATE OFFSET
  return (page - 1) * limit;
}

// <== BUILD OFFSET PAGINATED RESULT ==>
export function buildOffsetPaginatedResult<T>(
  items: T[],
  total: number,
  params: Required<OffsetPaginationParams>
): OffsetPaginatedResult<T> {
  // CALCULATE TOTAL PAGES
  const totalPages = Math.ceil(total / params.limit);
  // RETURN PAGINATED RESULT
  return {
    items,
    total,
    page: params.page,
    totalPages,
    hasMore: params.page < totalPages,
  };
}

// <== BUILD CURSOR PAGINATED RESULT ==>
export function buildCursorPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number
): CursorPaginatedResult<T> {
  // CHECK IF HAS MORE ITEMS
  const hasMore = items.length > limit;
  // TRIM ITEMS IF NEEDED
  const trimmedItems = hasMore ? items.slice(0, limit) : items;
  // GET NEXT CURSOR
  const nextCursor = hasMore
    ? trimmedItems[trimmedItems.length - 1]?.id ?? null
    : null;
  // RETURN PAGINATED RESULT
  return {
    items: trimmedItems,
    nextCursor,
    hasMore,
  };
}

// <== ENCODE CURSOR ==>
export function encodeCursor(data: Record<string, unknown>): string {
  // ENCODE CURSOR AS BASE64
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

// <== DECODE CURSOR ==>
export function decodeCursor<T = Record<string, unknown>>(
  cursor: string
): T | null {
  // TRY TO DECODE CURSOR
  try {
    // RETURN DECODED CURSOR
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8")) as T;
  } catch {
    // RETURN NULL IF DECODING FAILS
    return null;
  }
}

// <== PAGINATION INFO TYPE ==>
export interface PaginationInfo {
  // <== CURRENT PAGE ==>
  currentPage: number;
  // <== TOTAL PAGES ==>
  totalPages: number;
  // <== TOTAL ITEMS ==>
  totalItems: number;
  // <== ITEMS PER PAGE ==>
  itemsPerPage: number;
  // <== HAS PREVIOUS PAGE ==>
  hasPreviousPage: boolean;
  // <== HAS NEXT PAGE ==>
  hasNextPage: boolean;
  // <== START INDEX ==>
  startIndex: number;
  // <== END INDEX ==>
  endIndex: number;
}

// <== GET PAGINATION INFO ==>
export function getPaginationInfo(
  total: number,
  page: number,
  limit: number
): PaginationInfo {
  // CALCULATE TOTAL PAGES
  const totalPages = Math.ceil(total / limit);
  // CALCULATE START INDEX
  const startIndex = (page - 1) * limit + 1;
  // CALCULATE END INDEX
  const endIndex = Math.min(page * limit, total);
  // RETURN PAGINATION INFO
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    startIndex: total > 0 ? startIndex : 0,
    endIndex,
  };
}

// <== GENERATE PAGE NUMBERS FOR UI ==>
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7
): (number | "ellipsis")[] {
  // IF TOTAL PAGES IS LESS THAN MAX VISIBLE, RETURN ALL PAGES
  if (totalPages <= maxVisible) {
    // RETURN ALL PAGES
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  // CALCULATE HALF OF MAX VISIBLE
  const half = Math.floor(maxVisible / 2);
  // INITIALIZE PAGES ARRAY
  const pages: (number | "ellipsis")[] = [];
  // ALWAYS SHOW FIRST PAGE
  pages.push(1);
  // DETERMINE START AND END OF MIDDLE SECTION
  let start = Math.max(2, currentPage - half + 1);
  // CALCULATE END
  let end = Math.min(totalPages - 1, currentPage + half - 1);
  // ADJUST IF TOO CLOSE TO START
  if (currentPage <= half) {
    // ADJUST IF TOO CLOSE TO START
    end = maxVisible - 2;
  }
  // ADJUST IF TOO CLOSE TO END
  if (currentPage > totalPages - half) {
    // ADJUST IF TOO CLOSE TO END
    start = totalPages - maxVisible + 3;
  }
  // ADD ELLIPSIS IF NEEDED BEFORE MIDDLE SECTION
  if (start > 2) {
    // ADD ELLIPSIS IF NEEDED BEFORE MIDDLE SECTION
    pages.push("ellipsis");
  }
  // ADD MIDDLE PAGES
  for (let i = start; i <= end; i++) {
    // ADD MIDDLE PAGES
    pages.push(i);
  }
  // ADD ELLIPSIS IF NEEDED AFTER MIDDLE SECTION
  if (end < totalPages - 1) {
    // ADD ELLIPSIS IF NEEDED AFTER MIDDLE SECTION
    pages.push("ellipsis");
  }
  // ALWAYS SHOW LAST PAGE
  pages.push(totalPages);
  // RETURN PAGES ARRAY
  return pages;
}
