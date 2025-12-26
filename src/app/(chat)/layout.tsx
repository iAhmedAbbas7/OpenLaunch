// <== IMPORTS ==>
import type { ReactNode } from "react";

// <== CHAT LAYOUT PROPS ==>
interface ChatLayoutProps {
  // <== CHILDREN ==>
  children: ReactNode;
}

// <== CHAT LAYOUT COMPONENT ==>
export default function ChatLayout({ children }: ChatLayoutProps) {
  // RETURN FULL VIEWPORT LAYOUT WITHOUT NAVBAR/FOOTER
  return (
    <div className="h-dvh w-full flex flex-col bg-background overflow-hidden">
      {children}
    </div>
  );
}
