// <== IMPORTS ==>
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

// <== SPACE GROTESK - MODERN, TECHY DISPLAY FONT FOR HEADINGS ==>
const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

// <== INTER - HIGHLY READABLE BODY FONT ==>
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// <== JETBRAINS MONO - DEVELOPER-FAVORITE MONOSPACE FONT ==>
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// <== METADATA ==>
export const metadata: Metadata = {
  // TITLE
  title: {
    default: "OpenLaunch",
    template: "OpenLaunch | %s",
  },
  // DESCRIPTION
  description:
    "The Developer Hub to Launch, Share, and Discover Amazing Projects!",
  // KEYWORDS
  keywords: [
    "developer",
    "projects",
    "launch",
    "open source",
    "startup",
    "indie hacker",
  ],
  // AUTHORS
  authors: [{ name: "OpenLaunch" }],
  // CREATOR
  creator: "OpenLaunch",
  // OPEN GRAPH
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openlaunch.dev",
    title: "OpenLaunch",
    description:
      "The Developer Hub to Launch, Share, and Discover Amazing Projects!",
    siteName: "OpenLaunch",
  },
  // TWITTER
  twitter: {
    card: "summary_large_image",
    title: "OpenLaunch",
    description:
      "The Developer Hub to Launch, Share, and Discover Amazing Projects!",
  },
};

// <== ROOT LAYOUT ==>
const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // RETURNING ROOT LAYOUT
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <ScrollToTop />
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
