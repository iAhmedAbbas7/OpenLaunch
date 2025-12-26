// <== DATABASE TYPES ==>
import type {
  Profile,
  Project,
  Article,
  Comment,
  Conversation,
  Message,
  Notification,
  Achievement,
  Activity,
  Category,
  ProjectMedia,
  ProjectContributor,
} from "@/lib/db/schema";

// <== PROFILE TYPES ==>
export interface ProfileWithStats extends Profile {
  // <== PROJECTS COUNT ==>
  projectsCount: number;
  // <== ARTICLES COUNT ==>
  articlesCount: number;
  // <== TOTAL UPVOTES RECEIVED ==>
  totalUpvotesReceived: number;
}

// <== PUBLIC PROFILE TYPES ==>
export type PublicProfile = Omit<Profile, "githubAccessToken" | "email">;

// <== PROFILE PREVIEW TYPES ==>
export interface ProfilePreview {
  // <== ID ==>
  id: string;
  // <== USERNAME ==>
  username: string;
  // <== DISPLAY NAME ==>
  displayName: string | null;
  // <== AVATAR URL ==>
  avatarUrl: string | null;
  // <== BIO ==>
  bio: string | null;
  // <== IS VERIFIED ==>
  isVerified: boolean;
  // <== REPUTATION SCORE ==>
  reputationScore: number;
}

// <== PROJECT TYPES ==>
export interface ProjectWithOwner extends Project {
  // <== OWNER ==>
  owner: ProfilePreview;
}

// <== PROJECT WITH ALL RELATIONS ==>
export interface ProjectWithDetails extends Project {
  // <== OWNER ==>
  owner: ProfilePreview;
  // <== MEDIA ==>
  media: ProjectMedia[];
  // <== CONTRIBUTORS ==>
  contributors: (ProjectContributor & { user: ProfilePreview })[];
  // <== CATEGORIES ==>
  categories: Category[];
}

// <== PROJECT PREVIEW TYPES ==>
export interface ProjectPreview {
  // <== ID ==>
  id: string;
  // <== SLUG ==>
  slug: string;
  // <== NAME ==>
  name: string;
  // <== TAGLINE ==>
  tagline: string;
  // <== LOGO URL ==>
  logoUrl: string | null;
  // <== UPVOTES COUNT ==>
  upvotesCount: number;
  // <== COMMENTS COUNT ==>
  commentsCount: number;
  // <== TECH STACK ==>
  techStack: string[];
  // <== OWNER ==>
  owner: ProfilePreview;
  // <== LAUNCH DATE ==>
  launchDate: Date | null;
  // <== STATUS ==>
  status: Project["status"];
}

// <== ARTICLE TYPES ==>
export interface ArticleWithAuthor extends Article {
  // <== AUTHOR ==>
  author: ProfilePreview;
}

// <== ARTICLE PREVIEW TYPES ==>
export interface ArticlePreview {
  // <== ID ==>
  id: string;
  // <== SLUG ==>
  slug: string;
  // <== TITLE ==>
  title: string;
  // <== SUBTITLE ==>
  subtitle: string | null;
  // <== COVER IMAGE URL ==>
  coverImageUrl: string | null;
  // <== READING TIME MINUTES ==>
  readingTimeMinutes: number;
  // <== LIKES COUNT ==>
  likesCount: number;
  // <== COMMENTS COUNT ==>
  commentsCount: number;
  // <== TAGS ==>
  tags: string[];
  // <== AUTHOR ==>
  author: ProfilePreview;
  // <== PUBLISHED AT ==>
  publishedAt: Date | null;
}

// <== COMMENT TYPES ==>
export interface CommentWithAuthor extends Comment {
  // <== AUTHOR ==>
  author: ProfilePreview;
}

// <== COMMENT WITH NESTED REPLIES ==>
export interface CommentWithReplies extends CommentWithAuthor {
  // <== REPLIES ==>
  replies: CommentWithAuthor[];
}

// <== MESSAGE STATUS TYPE ==>
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

// <== PARTICIPANT WITH PROFILE ==>
export interface ParticipantWithProfile {
  // <== ID ==>
  id: string;
  // <== USER ID ==>
  userId: string;
  // <== ROLE ==>
  role: "owner" | "admin" | "member";
  // <== LAST READ AT ==>
  lastReadAt: Date | null;
  // <== IS MUTED ==>
  isMuted: boolean;
  // <== CLEARED AT - FOR CLEAR CHAT FEATURE ==>
  clearedAt: Date | null;
  // <== DELETED AT - FOR SOFT DELETE CONVERSATION FEATURE ==>
  deletedAt: Date | null;
  // <== FIRST UNREAD MESSAGE ID - FOR UNREAD DIVIDER FEATURE ==>
  firstUnreadMessageId: string | null;
  // <== USER ==>
  user: ProfilePreview;
}

// <== CONVERSATION WITH PARTICIPANTS AND LAST MESSAGE ==>
export interface ConversationWithParticipants extends Conversation {
  // <== PARTICIPANTS ==>
  participants: ParticipantWithProfile[];
  // <== UNREAD COUNT (FOR BADGE) ==>
  unreadCount: number;
  // <== FIRST UNREAD MESSAGE ID (FOR DIVIDER - SERVER PERSISTED) ==>
  firstUnreadMessageId: string | null;
  // <== UNREAD COUNT FOR DIVIDER (CALCULATED FROM FIRST UNREAD MESSAGE) ==>
  unreadCountForDivider: number;
}

// <== MESSAGE WITH SENDER PROFILE ==>
export interface MessageWithSender extends Message {
  // <== SENDER ==>
  sender: ProfilePreview;
}

// <== NOTIFICATION DATA PAYLOADS BY TYPE ==>
export interface NotificationData {
  // <== NEW FOLLOWER ==>
  new_follower: {
    // <== FOLLOWER ID ==>
    followerId: string;
    // <== FOLLOWER USERNAME ==>
    followerUsername: string;
  };
  // <== PROJECT UPVOTED ==>
  project_upvoted: {
    // <== PROJECT ID ==>
    projectId: string;
    // <== PROJECT NAME ==>
    projectName: string;
    // <== UPVOTER ID ==>
    upvoterId: string;
  };
  // <== COMMENT RECEIVED ==>
  comment_received: {
    // <== COMMENT ID ==>
    commentId: string;
    // <== PROJECT ID ==>
    projectId?: string;
    // <== ARTICLE ID ==>
    articleId?: string;
    // <== COMMENTER ID ==>
    commenterId: string;
  };
  // <== COMMENT REPLY ==>
  comment_reply: {
    // <== COMMENT ID ==>
    commentId: string;
    // <== PARENT COMMENT ID ==>
    parentCommentId: string;
    // <== REPLIER ID ==>
    replierId: string;
  };
  // <== ARTICLE LIKED ==>
  article_liked: {
    // <== ARTICLE ID ==>
    articleId: string;
    // <== ARTICLE TITLE ==>
    articleTitle: string;
    // <== LIKER ID ==>
    likerId: string;
  };
  // <== ACHIEVEMENT UNLOCKED ==>
  achievement_unlocked: {
    // <== ACHIEVEMENT ID ==>
    achievementId: string;
    // <== ACHIEVEMENT NAME ==>
    achievementName: string;
  };
  // <== PROJECT FEATURED ==>
  project_featured: {
    // <== PROJECT ID ==>
    projectId: string;
    // <== PROJECT NAME ==>
    projectName: string;
  };
  // <== MESSAGE RECEIVED ==>
  message_received: {
    // <== CONVERSATION ID ==>
    conversationId: string;
    // <== SENDER ID ==>
    senderId: string;
  };
}

// <== TYPED NOTIFICATION ==>
export type TypedNotification<T extends keyof NotificationData> = Omit<
  Notification,
  "data" | "type"
> & {
  // <== TYPE ==>
  type: T;
  // <== DATA ==>
  data: NotificationData[T];
};

// <== ACHIEVEMENT CRITERIA TYPES ==>
export interface AchievementCriteria {
  // <== TYPE ==>
  type:
    | "projects_launched"
    | "upvotes_received"
    | "articles_published"
    | "followers_count"
    | "following_count"
    | "comments_made"
    | "comment_upvotes_received"
    | "login_streak"
    | "projects_featured"
    | "open_source_projects"
    | "joined_before";
  // <== VALUE ==>
  value: number | string;
}

// <== ACHIEVEMENT WITH UNLOCK STATUS ==>
export interface AchievementWithStatus extends Achievement {
  // <== IS UNLOCKED ==>
  isUnlocked: boolean;
  // <== UNLOCKED AT ==>
  unlockedAt: Date | null;
  // <== PROGRESS ==>
  progress: number;
}

// <== ACTIVITY TYPES ==>
export interface ActivityWithDetails extends Activity {
  // <== USER ==>
  user: ProfilePreview;
  // <== TARGET ==>
  target:
    | { type: "project"; data: ProjectPreview }
    | { type: "article"; data: ArticlePreview }
    | { type: "user"; data: ProfilePreview }
    | null;
}

// <== CURSOR-BASED PAGINATION PARAMS ==>
export interface CursorPaginationParams {
  // <== CURSOR ==>
  cursor?: string;
  // <== LIMIT ==>
  limit?: number;
}

// <== CURSOR-BASED PAGINATION RESULT ==>
export interface CursorPaginatedResult<T> {
  // <== ITEMS ==>
  items: T[];
  // <== NEXT CURSOR ==>
  nextCursor: string | null;
  // <== HAS MORE ==>
  hasMore: boolean;
}

// <== OFFSET-BASED PAGINATION PARAMS ==>
export interface OffsetPaginationParams {
  // <== PAGE ==>
  page?: number;
  // <== LIMIT ==>
  limit?: number;
}

// <== OFFSET-BASED PAGINATION RESULT ==>
export interface OffsetPaginatedResult<T> {
  // <== ITEMS ==>
  items: T[];
  // <== TOTAL ==>
  total: number;
  // <== PAGE ==>
  page: number;
  // <== TOTAL PAGES ==>
  totalPages: number;
  // <== HAS MORE ==>
  hasMore: boolean;
}

// <== PROJECT FILTERS ==>
export interface ProjectFilters {
  // <== STATUS ==>
  status?: Project["status"];
  // <== CATEGORY ID ==>
  categoryId?: string;
  // <== TECH STACK ==>
  techStack?: string[];
  // <== OWNER ID ==>
  ownerId?: string;
  // <== IS OPEN SOURCE ==>
  isOpenSource?: boolean;
  // <== SEARCH ==>
  search?: string;
}

// <== PROJECT SORT OPTIONS ==>
export type ProjectSortBy =
  | "newest"
  | "oldest"
  | "popular"
  | "trending"
  | "most_commented";

// <== ARTICLE FILTERS ==>
export interface ArticleFilters {
  // <== AUTHOR ID ==>
  authorId?: string;
  // <== TAGS ==>
  tags?: string[];
  // <== IS PUBLISHED ==>
  isPublished?: boolean;
  // <== SEARCH ==>
  search?: string;
}

// <== ARTICLE SORT OPTIONS ==>
export type ArticleSortBy =
  | "newest"
  | "oldest"
  | "popular"
  | "most_commented"
  | "trending";

// <== API SUCCESS RESPONSE ==>
export interface ApiSuccessResponse<T> {
  // <== SUCCESS ==>
  success: true;
  // <== DATA ==>
  data: T;
}

// <== API ERROR RESPONSE ==>
export interface ApiErrorResponse {
  // <== SUCCESS ==>
  success: false;
  // <== ERROR ==>
  error: {
    // <== CODE ==>
    code: string;
    // <== MESSAGE ==>
    message: string;
    // <== DETAILS ==>
    details?: Record<string, string[]>;
  };
}

// <== COMBINED API RESPONSE TYPE ==>
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// <== MAKE SPECIFIC FIELDS OPTIONAL ==>
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// <== MAKE SPECIFIC FIELDS REQUIRED ==>
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

// <== EXTRACT ARRAY ELEMENT TYPE ==>
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;
