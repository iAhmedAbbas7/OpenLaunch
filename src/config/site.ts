// <== SITE CONFIG ==>
export const siteConfig = {
  // NAME
  name: "OpenLaunch",
  // DESCRIPTION
  description:
    "The Developer Hub to Launch, Share, and Discover Amazing Projects!",
  // URL
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // OG IMAGE
  ogImage: "/og.png",
  // LINKS
  links: {
    // GITHUB
    github: "https://github.com/openlaunch",
    // TWITTER
    twitter: "https://twitter.com/openlaunch",
  },
  // MAIN NAV
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Explore", href: "/explore" },
    { title: "Launches", href: "/launches" },
    { title: "Articles", href: "/articles" },
    { title: "Leaderboard", href: "/leaderboard" },
  ],
  // CATEGORIES
  categories: [
    { slug: "saas", name: "SaaS", icon: "Cloud" },
    { slug: "ai-ml", name: "AI / ML", icon: "Brain" },
    { slug: "web-app", name: "Web App", icon: "Globe" },
    { slug: "cli", name: "CLI Tool", icon: "Terminal" },
    { slug: "devops", name: "DevOps", icon: "Container" },
    { slug: "security", name: "Security", icon: "Shield" },
    { slug: "api", name: "API / Backend", icon: "Server" },
    { slug: "database", name: "Database", icon: "Database" },
    { slug: "design", name: "Design Tool", icon: "Palette" },
    { slug: "open-source", name: "Open Source", icon: "Github" },
    { slug: "dev-tools", name: "Developer Tools", icon: "Wrench" },
    { slug: "mobile-app", name: "Mobile App", icon: "Smartphone" },
    { slug: "education", name: "Education", icon: "GraduationCap" },
    { slug: "extension", name: "Browser Extension", icon: "Puzzle" },
    { slug: "library", name: "Library / Framework", icon: "Package" },
  ],
  // TECH STACK
  techStack: [
    "React",
    "Next.js",
    "Vue",
    "Nuxt",
    "Svelte",
    "SvelteKit",
    "Node.js",
    "Express",
    "Fastify",
    "Hono",
    "Python",
    "Django",
    "FastAPI",
    "Flask",
    "Go",
    "Rust",
    "Ruby",
    "Rails",
    "TypeScript",
    "JavaScript",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Supabase",
    "Firebase",
    "Tailwind CSS",
    "shadcn/ui",
    "Chakra UI",
    "Material UI",
    "GraphQL",
    "REST API",
    "tRPC",
    "Docker",
    "Kubernetes",
    "AWS",
    "Vercel",
    "Railway",
    "OpenAI",
    "Anthropic",
    "LangChain",
    "Gemini",
  ],
} as const;

// <== EXPORTING SITE CONFIG TYPE ==>
export type SiteConfig = typeof siteConfig;
