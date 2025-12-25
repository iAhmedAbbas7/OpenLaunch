// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// <== ROUTES TO EXCLUDE FROM SCROLL TO TOP ==>
const EXCLUDED_ROUTES = ["/messages"];

// <== SCROLL TO TOP COMPONENT ==>
export const ScrollToTop = () => {
  // GET CURRENT PATHNAME
  const pathname = usePathname();
  // <== SCROLL TO TOP ON ROUTE CHANGE ==>
  useEffect(() => {
    // SKIP IF ROUTE IS EXCLUDED (E.G. MESSAGES HAS ITS OWN SCROLL)
    const isExcluded = EXCLUDED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    // SKIP IF ROUTE IS EXCLUDED
    if (isExcluded) return;
    // SCROLL TO TOP INSTANTLY
    window.scrollTo(0, 0);
  }, [pathname]);
  // RETURN NULL (NO UI)
  return null;
};
