// <== IMPORTS ==>
import { db } from "./index";
import { categories, achievements } from "./schema";

// <== CATEGORIES SEED DATA ==>
const categoriesSeed = [
  // <== WEB APP ==>
  {
    slug: "web-app",
    name: "Web App",
    description: "Web-based applications and SaaS products",
    icon: "Globe",
    color: "#3B82F6",
    displayOrder: 1,
  },
  // <== MOBILE APP ==>
  {
    slug: "mobile-app",
    name: "Mobile App",
    description: "iOS and Android mobile applications",
    icon: "Smartphone",
    color: "#10B981",
    displayOrder: 2,
  },
  // <== API / BACKEND ==>
  {
    slug: "api-backend",
    name: "API / Backend",
    description: "Backend services, APIs, and microservices",
    icon: "Server",
    color: "#6366F1",
    displayOrder: 3,
  },
  // <== DEVELOPER TOOLS ==>
  {
    slug: "developer-tools",
    name: "Developer Tools",
    description: "Tools that help developers build better software",
    icon: "Wrench",
    color: "#F59E0B",
    displayOrder: 4,
  },
  // <== AI / ML ==>
  {
    slug: "ai-ml",
    name: "AI / ML",
    description: "Artificial intelligence and machine learning projects",
    icon: "Brain",
    color: "#EC4899",
    displayOrder: 5,
  },
  // <== OPEN SOURCE ==>
  {
    slug: "open-source",
    name: "Open Source",
    description: "Open source projects and contributions",
    icon: "GitBranch",
    color: "#22D3EE",
    displayOrder: 6,
  },
  // <== SAAS ==>
  {
    slug: "saas",
    name: "SaaS",
    description: "Software as a Service products",
    icon: "Cloud",
    color: "#8B5CF6",
    displayOrder: 7,
  },
  // <== BROWSER EXTENSION ==>
  {
    slug: "browser-extension",
    name: "Browser Extension",
    description: "Chrome, Firefox, and other browser extensions",
    icon: "Puzzle",
    color: "#F472B6",
    displayOrder: 8,
  },
  // <== CLI TOOL ==>
  {
    slug: "cli-tool",
    name: "CLI Tool",
    description: "Command line tools and utilities",
    icon: "Terminal",
    color: "#14B8A6",
    displayOrder: 9,
  },
  // <== LIBRARY / FRAMEWORK ==>
  {
    slug: "library-framework",
    name: "Library / Framework",
    description: "Reusable libraries and frameworks",
    icon: "Package",
    color: "#F97316",
    displayOrder: 10,
  },
  // <== DESIGN TOOL ==>
  {
    slug: "design-tool",
    name: "Design Tool",
    description: "Design and creative tools",
    icon: "Palette",
    color: "#E879F9",
    displayOrder: 11,
  },
  // <== DEVOPS ==>
  {
    slug: "devops",
    name: "DevOps",
    description: "DevOps, CI/CD, and infrastructure tools",
    icon: "Container",
    color: "#06B6D4",
    displayOrder: 12,
  },
  // <== DATABASE ==>
  {
    slug: "database",
    name: "Database",
    description: "Databases and data management tools",
    icon: "Database",
    color: "#84CC16",
    displayOrder: 13,
  },
  // <== SECURITY ==>
  {
    slug: "security",
    name: "Security",
    description: "Security tools and cybersecurity projects",
    icon: "Shield",
    color: "#EF4444",
    displayOrder: 14,
  },
  // <== EDUCATION ==>
  {
    slug: "education",
    name: "Education",
    description: "Educational tools and learning platforms",
    icon: "GraduationCap",
    color: "#A855F7",
    displayOrder: 15,
  },
];

// <== ACHIEVEMENTS SEED DATA ==>
const achievementsSeed = [
  // <== FIRST LAUNCH ==>
  {
    slug: "first-launch",
    name: "First Launch",
    description: "Launch your first project",
    icon: "🚀",
    points: 50,
    rarity: "common" as const,
    criteria: { type: "projects_launched", value: 1 },
  },
  // <== SERIAL LAUNCHER ==>
  {
    slug: "serial-launcher",
    name: "Serial Launcher",
    description: "Launch 5 projects",
    icon: "🎯",
    points: 100,
    rarity: "rare" as const,
    criteria: { type: "projects_launched", value: 5 },
  },
  // <== LAUNCH MASTER ==>
  {
    slug: "launch-master",
    name: "Launch Master",
    description: "Launch 10 projects",
    icon: "👑",
    points: 200,
    rarity: "epic" as const,
    criteria: { type: "projects_launched", value: 10 },
  },
  // <== LAUNCH LEGEND ==>
  {
    slug: "launch-legend",
    name: "Launch Legend",
    description: "Launch 25 projects",
    icon: "🏆",
    points: 500,
    rarity: "legendary" as const,
    criteria: { type: "projects_launched", value: 25 },
  },
  // <== FIRST UPVOTE ==>
  {
    slug: "first-upvote",
    name: "First Upvote",
    description: "Receive your first upvote",
    icon: "⬆️",
    points: 10,
    rarity: "common" as const,
    criteria: { type: "upvotes_received", value: 1 },
  },
  // <== RISING STAR ==>
  {
    slug: "rising-star",
    name: "Rising Star",
    description: "Receive 50 upvotes",
    icon: "⭐",
    points: 50,
    rarity: "common" as const,
    criteria: { type: "upvotes_received", value: 50 },
  },
  // <== POPULAR ==>
  {
    slug: "popular",
    name: "Popular",
    description: "Receive 100 upvotes",
    icon: "🌟",
    points: 100,
    rarity: "rare" as const,
    criteria: { type: "upvotes_received", value: 100 },
  },
  // <== TRENDING ==>
  {
    slug: "trending",
    name: "Trending",
    description: "Receive 500 upvotes",
    icon: "🔥",
    points: 200,
    rarity: "epic" as const,
    criteria: { type: "upvotes_received", value: 500 },
  },
  // <== VIRAL ==>
  {
    slug: "viral",
    name: "Viral",
    description: "Receive 1000 upvotes",
    icon: "💫",
    points: 500,
    rarity: "legendary" as const,
    criteria: { type: "upvotes_received", value: 1000 },
  },
  // <== FIRST POST ==>
  {
    slug: "first-post",
    name: "First Post",
    description: "Publish your first article",
    icon: "✍️",
    points: 30,
    rarity: "common" as const,
    criteria: { type: "articles_published", value: 1 },
  },
  // <== BLOGGER ==>
  {
    slug: "blogger",
    name: "Blogger",
    description: "Publish 5 articles",
    icon: "📝",
    points: 75,
    rarity: "rare" as const,
    criteria: { type: "articles_published", value: 5 },
  },
  // <== PROLIFIC WRITER ==>
  {
    slug: "prolific-writer",
    name: "Prolific Writer",
    description: "Publish 10 articles",
    icon: "📚",
    points: 150,
    rarity: "epic" as const,
    criteria: { type: "articles_published", value: 10 },
  },
  // <== FRIENDLY ==>
  {
    slug: "friendly",
    name: "Friendly",
    description: "Follow 10 users",
    icon: "👋",
    points: 20,
    rarity: "common" as const,
    criteria: { type: "following_count", value: 10 },
  },
  // <== NETWORKER ==>
  {
    slug: "networker",
    name: "Networker",
    description: "Gain 50 followers",
    icon: "🤝",
    points: 75,
    rarity: "rare" as const,
    criteria: { type: "followers_count", value: 50 },
  },
  // <== INFLUENCER ==>
  {
    slug: "influencer",
    name: "Influencer",
    description: "Gain 100 followers",
    icon: "📣",
    points: 200,
    rarity: "epic" as const,
    criteria: { type: "followers_count", value: 100 },
  },
  // <== CELEBRITY ==>
  {
    slug: "celebrity",
    name: "Celebrity",
    description: "Gain 500 followers",
    icon: "🌠",
    points: 500,
    rarity: "legendary" as const,
    criteria: { type: "followers_count", value: 500 },
  },
  // <== COMMENTER ==>
  {
    slug: "commenter",
    name: "Commenter",
    description: "Leave 10 comments",
    icon: "💬",
    points: 30,
    rarity: "common" as const,
    criteria: { type: "comments_made", value: 10 },
  },
  // <== HELPFUL ==>
  {
    slug: "helpful",
    name: "Helpful",
    description: "Receive 50 comment upvotes",
    icon: "🤝",
    points: 100,
    rarity: "rare" as const,
    criteria: { type: "comment_upvotes_received", value: 50 },
  },
  // <== WEEK STREAK ==>
  {
    slug: "week-streak",
    name: "Week Streak",
    description: "Maintain a 7-day login streak",
    icon: "📅",
    points: 50,
    rarity: "rare" as const,
    criteria: { type: "login_streak", value: 7 },
  },
  // <== MONTH STREAK ==>
  {
    slug: "month-streak",
    name: "Month Streak",
    description: "Maintain a 30-day login streak",
    icon: "🗓️",
    points: 200,
    rarity: "epic" as const,
    criteria: { type: "login_streak", value: 30 },
  },
  // <== YEAR STREAK ==>
  {
    slug: "year-streak",
    name: "Year Streak",
    description: "Maintain a 365-day login streak",
    icon: "🎊",
    points: 1000,
    rarity: "legendary" as const,
    criteria: { type: "login_streak", value: 365 },
  },
  // <== FEATURED ==>
  {
    slug: "featured",
    name: "Featured",
    description: "Get your project featured",
    icon: "🏆",
    points: 300,
    rarity: "legendary" as const,
    criteria: { type: "projects_featured", value: 1 },
  },
  // <== OPEN SOURCE HERO ==>
  {
    slug: "open-source-hero",
    name: "Open Source Hero",
    description: "Launch 3 open source projects",
    icon: "💚",
    points: 100,
    rarity: "rare" as const,
    criteria: { type: "open_source_projects", value: 3 },
  },
  // <== EARLY ADOPTER ==>
  {
    slug: "early-adopter",
    name: "Early Adopter",
    description: "Join OpenLaunch in its first month",
    icon: "🌱",
    points: 100,
    rarity: "rare" as const,
    criteria: { type: "joined_before", value: "2025-03-01" },
  },
];

// <== SEED CATEGORIES ==>
export const seedCategories = async () => {
  // LOG SEEDING CATEGORIES
  console.log("🌱 Seeding Categories...");
  // TRY TO SEED CATEGORIES
  try {
    // INSERT CATEGORIES (IGNORE CONFLICTS)
    for (const category of categoriesSeed) {
      // INSERT CATEGORY (IGNORE CONFLICTS)
      await db
        .insert(categories)
        .values(category)
        .onConflictDoNothing({ target: categories.slug });
    }
    // LOG SUCCESS
    console.log(`✅ Seeded ${categoriesSeed.length} Categories`);
  } catch (error) {
    // LOG ERROR
    console.error("❌ Failed to Seed Categories:", error);
    // THROW ERROR
    throw error;
  }
};

// <== SEED ACHIEVEMENTS ==>
export const seedAchievements = async () => {
  // LOG SEEDING ACHIEVEMENTS
  console.log("🌱 Seeding Achievements...");
  // TRY TO SEED ACHIEVEMENTS
  try {
    // INSERT ACHIEVEMENTS (IGNORE CONFLICTS)
    for (const achievement of achievementsSeed) {
      // INSERT ACHIEVEMENT (IGNORE CONFLICTS)
      await db
        .insert(achievements)
        .values(achievement)
        .onConflictDoNothing({ target: achievements.slug });
    }

    // LOG SUCCESS
    console.log(`✅ Seeded ${achievementsSeed.length} Achievements`);
  } catch (error) {
    // LOG ERROR
    console.error("❌ Failed to Seed Achievements:", error);
    // THROW ERROR
    throw error;
  }
};

// <== RUN SEED ==>
export const seed = async () => {
  // LOG STARTING SEED
  console.log("🚀 Starting Seed...\n");
  // SEED CATEGORIES
  await seedCategories();
  // SEED ACHIEVEMENTS
  await seedAchievements();
  // LOG SUCCESS
  console.log("\n🎉 Database Seeding Complete!");
};

// <== RUN SEED IF EXECUTED DIRECTLY ==>
if (require.main === module) {
  // RUN SEED
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      // LOG ERROR
      console.error("❌ Failed to Seed the Database:", error);
      // EXIT WITH ERROR CODE 1
      process.exit(1);
    });
}
