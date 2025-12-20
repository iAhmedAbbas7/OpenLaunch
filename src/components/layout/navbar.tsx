// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { UserMenu } from "@/components/auth/user-menu";
import { Menu, X, Loader2, LogOut } from "lucide-react";

// <== NAV LINKS ==>
const navLinks = [
  // HOME
  { href: "/", label: "Home" },
  // EXPLORER
  { href: "/explore", label: "Explore" },
  // LAUNCHES
  { href: "/launches", label: "Launches" },
  // ARTICLES
  { href: "/articles", label: "Articles" },
  // LEADERBOARD
  { href: "/leaderboard", label: "Leaderboard" },
];

// <== MOBILE SIGN OUT BUTTON COMPONENT ==>
const MobileSignOutButton = ({ onClose }: { onClose: () => void }) => {
  // STATE FOR LOADING
  const [isSigningOut, setIsSigningOut] = useState(false);
  // GET AUTH HOOK
  const { signOut } = useAuth();
  // <== HANDLE SIGN OUT ==>
  const handleSignOut = async () => {
    // PREVENT DOUBLE CLICK
    if (isSigningOut) return;
    // SET LOADING STATE
    setIsSigningOut(true);
    // CLOSE MOBILE MENU
    onClose();
    // SIGN OUT
    await signOut();
  };
  // RETURNING MOBILE SIGN OUT BUTTON
  return (
    <Button
      variant="ghost"
      className="w-full h-11 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      {isSigningOut ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      {isSigningOut ? "Signing Out..." : "Sign Out"}
    </Button>
  );
};

// <== NAVBAR COMPONENT ==>
export const Navbar = () => {
  // STATE FOR MOBILE MENU
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // STATE FOR SCROLL
  const [isScrolled, setIsScrolled] = useState(false);
  // GET AUTH HOOK
  const { isAuthenticated, isLoading } = useAuth();
  // <== HANDLE SCROLL ==>
  useEffect(() => {
    // HANDLE SCROLL FUNCTION
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    // ADD EVENT LISTENER
    window.addEventListener("scroll", handleScroll);
    // CLEANUP
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // RETURNING NAVBAR COMPONENT
  return (
    // HEADER
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      )}
    >
      {/* CONTAINER */}
      <div className="container mx-auto px-4">
        {/* NAVBAR CONTENT */}
        <nav className="flex items-center justify-between h-16 lg:h-18">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer transition-opacity duration-200 hover:opacity-80"
          >
            {/* LOGO ICON */}
            <Logo size={36} />
            {/* LOGO TEXT */}
            <span className="text-lg font-bold font-heading gradient-text">
              OpenLaunch
            </span>
          </Link>
          {/* DESKTOP NAV LINKS */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          {/* AUTH BUTTONS / USER MENU */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              // LOADING STATE
              <div className="w-20 h-9 rounded-md bg-secondary animate-pulse" />
            ) : isAuthenticated ? (
              // USER MENU
              <UserMenu />
            ) : (
              // AUTH BUTTONS
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-9 px-4 cursor-pointer border-border/60 bg-transparent hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="h-9 px-4 cursor-pointer">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
          {/* MOBILE: USER AVATAR + MENU BUTTON */}
          <div className="lg:hidden flex items-center gap-2">
            {/* MOBILE USER AVATAR (WHEN AUTHENTICATED) */}
            {!isLoading && isAuthenticated && <UserMenu />}
            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </button>
          </div>
        </nav>
      </div>
      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50">
          {/* MOBILE NAV LINKS */}
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* MOBILE AUTH SECTION */}
            <div className="pt-4 mt-4 border-t border-border/50 space-y-2">
              {isLoading ? (
                // LOADING STATE
                <div className="w-full h-11 rounded-md bg-secondary animate-pulse" />
              ) : isAuthenticated ? (
                // AUTHENTICATED - SHOW DASHBOARD AND SIGN OUT
                <>
                  <Button
                    variant="outline"
                    className="w-full h-11 cursor-pointer"
                    asChild
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </Button>
                  <MobileSignOutButton
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                </>
              ) : (
                // NOT AUTHENTICATED - SHOW SIGN IN/UP
                <>
                  <Button
                    variant="outline"
                    className="w-full h-11 cursor-pointer"
                    asChild
                  >
                    <Link
                      href="/sign-in"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full h-11 cursor-pointer" asChild>
                    <Link
                      href="/sign-up"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
