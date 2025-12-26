// <== IMPORTS ==>
import type { ReactNode } from "react";

// <== MESSAGES LAYOUT PROPS ==>
interface MessagesLayoutProps {
  // <== CHILDREN ==>
  children: ReactNode;
}

// <== MESSAGES LAYOUT COMPONENT ==>
export default function MessagesLayout({ children }: MessagesLayoutProps) {
  // RETURN MESSAGES LAYOUT - FULL HEIGHT
  return (
    <div className="flex-1 min-h-0 w-full flex overflow-hidden">{children}</div>
  );
}
