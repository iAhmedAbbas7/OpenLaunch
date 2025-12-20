// <== IMPORTS ==>
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

// <== AUTH LAYOUT PROPS ==>
interface AuthLayoutProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== AUTH LAYOUT COMPONENT ==>
const AuthLayout = ({ children }: AuthLayoutProps) => {
  // RETURNING AUTH LAYOUT COMPONENT
  return (
    // MAIN CONTAINER - FIXED OVERFLOW ISSUES
    <div className="relative min-h-dvh flex flex-col bg-background overflow-x-hidden">
      {/* BACKGROUND GRADIENT - CONTAINED WITHIN VIEWPORT */}
      <div className="fixed inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
      {/* SUBTLE GRID PATTERN */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* GLOW ORBS - POSITIONED SAFELY */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
      {/* MAIN CONTENT - CENTERED VERTICALLY AND HORIZONTALLY */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* LOGO - CENTERED ABOVE FORM */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 sm:gap-3 mb-8 cursor-pointer transition-opacity duration-200 hover:opacity-80"
        >
          {/* LOGO ICON */}
          <Logo
            size={40}
            className="transition-transform duration-300 hover:scale-105"
          />
          {/* LOGO TEXT */}
          <span className="text-xl sm:text-2xl font-bold font-heading gradient-text">
            OpenLaunch
          </span>
        </Link>
        {/* FORM CHILDREN */}
        {children}
      </main>
      {/* FOOTER */}
      <footer className="relative z-10 w-full px-4 py-4 sm:py-6 text-center">
        {/* FOOTER TEXT */}
        <p className="text-xs sm:text-sm text-muted-foreground/60">
          © {new Date().getFullYear()} OpenLaunch. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

// <== EXPORTING AUTH LAYOUT ==>
export default AuthLayout;
