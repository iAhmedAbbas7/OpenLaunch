// <== IMPORTS ==>
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

// <== MERGE CLASS NAMES WITH TAILWIND CSS CONFLICT RESOLUTION ==>
export function cn(...inputs: ClassValue[]) {
  // RETURNING MERGED CLASS NAMES
  return twMerge(clsx(inputs));
}

// <== FORMAT A DATE TO RELATIVE TIME ==>
export function formatRelativeTime(date: Date | string): string {
  // CALCULATING THE DIFFERENCE BETWEEN THE CURRENT DATE AND THE DATE TO FORMAT
  const now = new Date();
  // CONVERTING THE DATE TO FORMAT TO A DATE OBJECT
  const then = new Date(date);
  // CALCULATING THE DIFFERENCE IN SECONDS
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  // DEFINING THE INTERVALS
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  // ITERATING THROUGH THE INTERVALS
  for (const interval of intervals) {
    // CALCULATING THE COUNT OF THE INTERVAL
    const count = Math.floor(seconds / interval.seconds);
    // CHECKING IF THE COUNT IS GREATER THAN OR EQUAL TO 1
    if (count >= 1) {
      // RETURNING THE FORMATTED RELATIVE TIME
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }
  // RETURNING "JUST NOW" IF THE DATE IS WITHIN THE LAST 60 SECONDS
  return "just now";
}

// <== FORMAT A DATE TO A READABLE STRING ==>
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  // RETURNING THE FORMATTED DATE
  return new Date(date).toLocaleDateString("en-US", options);
}

// <== FORMAT A DATE TO ISO STRING (YYYY-MM-DD) ==>
export function formatDateISO(date: Date | string): string {
  // RETURNING THE FORMATTED DATE
  return new Date(date).toISOString().split("T")[0];
}

// <== FORMAT A NUMBER WITH COMPACT NOTATION ==>
export function formatNumber(num: number): string {
  // CHECKING IF THE NUMBER IS GREATER THAN OR EQUAL TO 1,000,000
  if (num >= 1000000) {
    // RETURNING THE FORMATTED NUMBER
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  // CHECKING IF THE NUMBER IS GREATER THAN OR EQUAL TO 1,000
  if (num >= 1000) {
    // RETURNING THE FORMATTED NUMBER
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  // RETURNING THE FORMATTED NUMBER
  return num.toString();
}

// <== FORMAT A NUMBER WITH THOUSAND SEPARATORS ==>
export function formatNumberWithCommas(num: number): string {
  // RETURNING THE FORMATTED NUMBER
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// <== CONVERT A STRING TO A URL-FRIENDLY SLUG ==>
export function slugify(text: string): string {
  // RETURNING THE SLUGIFIED TEXT
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// <== TRUNCATE A STRING TO A MAXIMUM LENGTH WITH ELLIPSIS ==>
export function truncate(text: string, maxLength: number): string {
  // CHECKING IF THE TEXT IS SHORTER THAN THE MAXIMUM LENGTH
  if (text.length <= maxLength) return text;
  // RETURNING THE TRUNCATED TEXT
  return text.slice(0, maxLength - 3) + "...";
}

// <== CAPITALIZE THE FIRST LETTER OF EACH WORD ==>
export function capitalize(text: string): string {
  // RETURNING THE CAPITALIZED TEXT
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

// <== GENERATE INITIALS FROM A NAME ==>
export function getInitials(name: string, maxLength = 2): string {
  // RETURNING THE INITIALS
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, maxLength);
}

// <== CALCULATE READING TIME FOR AN ARTICLE ==>
export function calculateReadingTime(text: string): number {
  // DEFINING THE WORDS PER MINUTE
  const wordsPerMinute = 200;
  // CALCULATING THE WORDS IN THE TEXT
  const words = text.trim().split(/\s+/).length;
  // RETURNING THE READING TIME
  return Math.ceil(words / wordsPerMinute);
}

// <== GET THE ABSOLUTE URL FOR A PATH ==>
export function absoluteUrl(path: string): string {
  // DEFINING THE BASE URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // RETURNING THE ABSOLUTE URL
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

// <== EXTRACT DOMAIN FROM A URL ==>
export function getDomain(url: string): string {
  // TRYING TO CONVERT THE URL TO A URL OBJECT AND RETURNING THE DOMAIN
  try {
    // CONVERTING THE URL TO A URL OBJECT AND RETURNING THE DOMAIN
    return new URL(url).hostname;
  } catch {
    // RETURNING THE URL IF IT IS NOT A VALID URL
    return url;
  }
}

// <== CHECK IF A URL IS EXTERNAL ==>
export function isExternalUrl(url: string): boolean {
  // CHECKING IF THE URL STARTS WITH "http"
  if (!url.startsWith("http")) return false;
  // TRYING TO CONVERT THE URL TO A URL OBJECT AND RETURNING THE HOSTNAME
  try {
    // CONVERTING THE URL TO A URL OBJECT AND RETURNING THE HOSTNAME
    const urlHost = new URL(url).hostname;
    // CONVERTING THE APP URL TO A URL OBJECT AND RETURNING THE HOSTNAME
    const appHost = new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).hostname;
    // RETURNING TRUE IF THE URL HOSTNAME IS NOT THE SAME AS THE APP HOSTNAME
    return urlHost !== appHost;
  } catch {
    // RETURNING FALSE IF THE URL IS NOT A VALID URL
    return false;
  }
}

// <== CHECK IF A STRING IS A VALID EMAIL ==>
export function isValidEmail(email: string): boolean {
  // DEFINING THE EMAIL REGEX
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // RETURNING TRUE IF THE EMAIL IS VALID
  return emailRegex.test(email);
}

// <== CHECK IF A STRING IS A VALID URL ==>
export function isValidUrl(url: string): boolean {
  // TRYING TO CONVERT THE URL TO A URL OBJECT AND RETURNING TRUE IF IT IS A VALID URL
  try {
    // CONVERTING THE URL TO A URL OBJECT AND RETURNING TRUE IF IT IS A VALID URL
    new URL(url);
    return true;
  } catch {
    // RETURNING FALSE IF THE URL IS NOT A VALID URL
    return false;
  }
}

// <== CHECK IF A STRING IS A VALID GITHUB URL ==>
export function isGitHubUrl(url: string): boolean {
  // TRYING TO CONVERT THE URL TO A URL OBJECT AND RETURNING TRUE IF IT IS A VALID GITHUB URL
  try {
    // CONVERTING THE URL TO A URL OBJECT AND RETURNING TRUE IF IT IS A VALID GITHUB URL
    const parsed = new URL(url);
    // RETURNING TRUE IF THE URL HOSTNAME IS "github.com"
    return parsed.hostname === "github.com";
  } catch {
    // RETURNING FALSE IF THE URL IS NOT A VALID GITHUB URL
    return false;
  }
}

// <== REMOVE DUPLICATES FROM AN ARRAY ==>
export function unique<T>(array: T[]): T[] {
  // RETURNING THE UNIQUE ARRAY
  return [...new Set(array)];
}

// <== SHUFFLE AN ARRAY RANDOMLY ==>
export function shuffle<T>(array: T[]): T[] {
  // CREATING A SHUFFLED ARRAY
  const shuffled = [...array];
  // ITERATING THROUGH THE SHUFFLED ARRAY
  for (let i = shuffled.length - 1; i > 0; i--) {
    // GENERATING A RANDOM INDEX
    const j = Math.floor(Math.random() * (i + 1));
    // SWAPPING THE ELEMENTS
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // RETURNING THE SHUFFLED ARRAY
  return shuffled;
}

// <== GROUP ARRAY ITEMS BY A KEY ==>
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  // RETURNING THE GROUPED ARRAY
  return array.reduce((acc, item) => {
    // GETTING THE KEY FOR THE ITEM
    const key = keyFn(item);
    // CHECKING IF THE KEY EXISTS IN THE ACCUMULATOR
    if (!acc[key]) acc[key] = [];
    // PUSHING THE ITEM TO THE ACCUMULATOR
    acc[key].push(item);
    // RETURNING THE ACCUMULATOR
    return acc;
  }, {} as Record<K, T[]>);
}

// <== DELAY EXECUTION FOR A SPECIFIED TIME ==>
export function sleep(ms: number): Promise<void> {
  // RETURNING A PROMISE THAT RESOLVES AFTER THE SPECIFIED TIME
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// <== DEBOUNCE A FUNCTION ==>
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  // DEFINING THE TIMEOUT
  let timeout: NodeJS.Timeout | null = null;
  // RETURNING THE DEBOUNCED FUNCTION
  return (...args: Parameters<T>) => {
    // CLEARING THE TIMEOUT IF IT EXISTS
    if (timeout) clearTimeout(timeout);
    // SETTING THE TIMEOUT
    timeout = setTimeout(() => func(...args), wait);
  };
}

// <== SAFE JSON PARSE ==>
export function safeJsonParse<T>(json: string, fallback: T): T {
  // TRYING TO PARSE THE JSON AND RETURNING THE PARSED JSON
  try {
    // PARSING THE JSON AND RETURNING THE PARSED JSON
    return JSON.parse(json);
  } catch {
    // RETURNING THE FALLBACK IF THE JSON IS NOT VALID
    return fallback;
  }
}

// <== EXTRACT ERROR MESSAGE FROM UNKNOWN ERROR ==>
export function getErrorMessage(error: unknown): string {
  // CHECKING IF THE ERROR IS AN INSTANCE OF ERROR AND RETURNING THE ERROR MESSAGE
  if (error instanceof Error) return error.message;
  // CHECKING IF THE ERROR IS A STRING AND RETURNING THE ERROR
  if (typeof error === "string") return error;
  // RETURNING "AN UNEXPECTED ERROR OCCURRED" IF THE ERROR IS NOT A VALID ERROR
  return "An unexpected error occurred";
}
