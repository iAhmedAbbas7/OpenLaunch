// <== IMPORTS ==>
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { Github, Twitter } from "lucide-react";

// <== FOOTER LINKS ==>
const footerLinks = {
  // PRODUCT LINKS
  product: [
    // EXPLORER
    { href: "/explore", label: "Explore" },
    // LAUNCHES
    { href: "/launches", label: "Launches" },
    // ARTICLES
    { href: "/articles", label: "Articles" },
    // LEADERBOARD
    { href: "/leaderboard", label: "Leaderboard" },
  ],
  // RESOURCES LINKS
  resources: [
    // DOCUMENTATION
    { href: "/docs", label: "Documentation" },
    // API
    { href: "/api", label: "API" },
    // BLOG
    { href: "/blog", label: "Blog" },
    // CHANGELOG
    { href: "/changelog", label: "Changelog" },
  ],
  // COMPANY LINKS
  company: [
    // ABOUT
    { href: "/about", label: "About" },
    // CONTACT
    { href: "/contact", label: "Contact" },
    // CAREERS
    { href: "/careers", label: "Careers" },
    // BRAND
    { href: "/brand", label: "Brand" },
  ],
  // LEGAL LINKS
  legal: [
    // PRIVACY
    { href: "/privacy", label: "Privacy" },
    // TERMS
    { href: "/terms", label: "Terms" },
    // COOKIES
    { href: "/cookies", label: "Cookies" },
  ],
};

// <== FOOTER COMPONENT ==>
export const Footer = () => {
  // RETURNING FOOTER COMPONENT
  return (
    // FOOTER
    <footer className="border-t border-border/50 bg-background/50">
      {/* CONTAINER */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* FOOTER GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* BRAND SECTION */}
          <div className="col-span-2">
            {/* LOGO */}
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 cursor-pointer transition-opacity duration-200 hover:opacity-80"
            >
              <Logo size={32} />
              <span className="text-lg font-bold font-heading gradient-text">
                OpenLaunch
              </span>
            </Link>
            {/* DESCRIPTION */}
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              The developer hub to launch, share, and discover amazing projects.
              Join our community today.
            </p>
            {/* SOCIAL LINKS */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com/openlaunch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </a>
              <a
                href="https://twitter.com/openlaunch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </a>
            </div>
          </div>
          {/* PRODUCT LINKS */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* RESOURCES LINKS */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* COMPANY LINKS */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* LEGAL LINKS */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* BOTTOM BAR */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* COPYRIGHT */}
          <p className="text-sm text-muted-foreground/60">
            © {new Date().getFullYear()} OpenLaunch. All rights reserved.
          </p>
          {/* BUILT WITH */}
          <p className="text-sm text-muted-foreground/60">
            Built with <span className="text-primary">♥</span> for developers
          </p>
        </div>
      </div>
    </footer>
  );
};
