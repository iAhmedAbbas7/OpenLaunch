// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// <== SCROLL TO TOP COMPONENT ==>
export const ScrollToTop = () => {
  // GET CURRENT PATHNAME
  const pathname = usePathname();
  // <== SCROLL TO TOP ON ROUTE CHANGE ==>
  useEffect(() => {
    // SCROLL TO TOP INSTANTLY
    window.scrollTo(0, 0);
  }, [pathname]);
  // RETURN NULL (NO UI)
  return null;
};
