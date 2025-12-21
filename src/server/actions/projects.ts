// <== SERVER ACTIONS FOR PROJECTS ==>
"use server";

// <== IMPORTS ==>
import {
  eq,
  and,
  or,
  ilike,
  desc,
  asc,
  sql,
  count,
  inArray,
} from "drizzle-orm";
import {
  projects,
  profiles,
  upvotes,
  bookmarks,
  categories,
} from "@/lib/db/schema";
import type {
  ApiResponse,
  ProjectWithDetails,
  ProjectPreview,
  OffsetPaginationParams,
  OffsetPaginatedResult,
  ProfilePreview,
} from "@/types/database";
import {
  normalizeOffsetParams,
  calculateOffset,
  buildOffsetPaginatedResult,
} from "@/lib/utils/pagination";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectSortBy,
  type ProjectFiltersInput,
} from "@/lib/validations/projects";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Project, NewProject } from "@/lib/db/schema";

// <== GENERATE UNIQUE SLUG ==>
async function generateUniqueSlug(name: string): Promise<string> {
  // GENERATE BASE SLUG
  const baseSlug = slugify(name);
  // CHECK IF SLUG EXISTS
  let slug = baseSlug;
  // COUNTER FOR UNIQUE SLUG
  let counter = 1;
  // LOOP UNTIL UNIQUE SLUG IS FOUND
  while (true) {
    // CHECK IF SLUG EXISTS
    const existing = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
    });
    // RETURN SLUG IF UNIQUE
    if (!existing) {
      // RETURN SLUG IF UNIQUE
      return slug;
    }
    // INCREMENT COUNTER AND TRY AGAIN
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// <== GET OWNER PREVIEW ==>
async function getOwnerPreview(
  ownerId: string
): Promise<ProfilePreview | null> {
  // TRY TO FETCH OWNER
  const owner = await db.query.profiles.findFirst({
    where: eq(profiles.id, ownerId),
  });
  // RETURN NULL IF NOT FOUND
  if (!owner) return null;
  // RETURN PROFILE PREVIEW
  return {
    id: owner.id,
    username: owner.username,
    displayName: owner.displayName,
    avatarUrl: owner.avatarUrl,
    bio: owner.bio,
    isVerified: owner.isVerified,
    reputationScore: owner.reputationScore,
  };
}

// <== CREATE PROJECT ==>
export async function createProject(
  input: CreateProjectInput
): Promise<ApiResponse<Project>> {
  // TRY TO CREATE PROJECT
  try {
    // VALIDATE INPUT
    const validatedFields = createProjectSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
          details: validatedFields.error.flatten().fieldErrors as Record<
            string,
            string[]
          >,
        },
      };
    }
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a project",
        },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // GENERATE UNIQUE SLUG
    const slug = await generateUniqueSlug(validatedFields.data.name);
    // BUILD PROJECT DATA
    const projectData: NewProject = {
      ownerId: profile.id,
      slug,
      name: validatedFields.data.name,
      tagline: validatedFields.data.tagline,
      description: validatedFields.data.description ?? null,
      logoUrl: validatedFields.data.logoUrl ?? null,
      bannerUrl: validatedFields.data.bannerUrl ?? null,
      websiteUrl: validatedFields.data.websiteUrl || null,
      githubUrl: validatedFields.data.githubUrl || null,
      demoUrl: validatedFields.data.demoUrl || null,
      isOpenSource: validatedFields.data.isOpenSource,
      license: validatedFields.data.license ?? null,
      techStack: validatedFields.data.techStack,
      categoryIds: validatedFields.data.categoryIds,
      launchDate: validatedFields.data.launchDate ?? null,
      status: validatedFields.data.status,
    };
    // INSERT PROJECT
    const [newProject] = await db
      .insert(projects)
      .values(projectData)
      .returning();
    // CHECK IF PROJECT WAS CREATED
    if (!newProject) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create project",
        },
      };
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: newProject,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error creating project:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create project",
      },
    };
  }
}

// <== UPDATE PROJECT ==>
export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<ApiResponse<Project>> {
  // TRY TO UPDATE PROJECT
  try {
    // VALIDATE INPUT
    const validatedFields = updateProjectSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
          details: validatedFields.error.flatten().fieldErrors as Record<
            string,
            string[]
          >,
        },
      };
    }
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a project",
        },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // FETCH PROJECT
    const existingProject = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    // CHECK IF PROJECT EXISTS
    if (!existingProject) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Project not found",
        },
      };
    }
    // CHECK IF USER IS PROJECT OWNER
    if (existingProject.ownerId !== profile.id) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to update this project",
        },
      };
    }
    // BUILD UPDATE DATA
    const updateData: Partial<Project> = {
      ...validatedFields.data,
      websiteUrl: validatedFields.data.websiteUrl || null,
      githubUrl: validatedFields.data.githubUrl || null,
      demoUrl: validatedFields.data.demoUrl || null,
      updatedAt: new Date(),
    };
    // UPDATE SLUG IF NAME CHANGED
    if (
      validatedFields.data.name &&
      validatedFields.data.name !== existingProject.name
    ) {
      updateData.slug = await generateUniqueSlug(validatedFields.data.name);
    }
    // UPDATE PROJECT
    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();
    // CHECK IF PROJECT WAS UPDATED
    if (!updatedProject) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Project not found",
        },
      };
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: updatedProject,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error updating project:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update project",
      },
    };
  }
}

// <== DELETE PROJECT ==>
export async function deleteProject(
  projectId: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  // TRY TO DELETE PROJECT
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a project",
        },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // FETCH PROJECT
    const existingProject = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    // CHECK IF PROJECT EXISTS
    if (!existingProject) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Project not found",
        },
      };
    }
    // CHECK IF USER IS PROJECT OWNER
    if (existingProject.ownerId !== profile.id) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to delete this project",
        },
      };
    }
    // DELETE PROJECT
    await db.delete(projects).where(eq(projects.id, projectId));
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting project:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete project",
      },
    };
  }
}

// <== GET PROJECT BY SLUG ==>
export async function getProjectBySlug(
  slug: string
): Promise<ApiResponse<ProjectWithDetails>> {
  // TRY TO FETCH PROJECT
  try {
    // FETCH PROJECT
    const project = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
      with: {
        media: {
          orderBy: (media, { asc }) => [asc(media.displayOrder)],
        },
        contributors: {
          with: {
            user: true,
          },
        },
      },
    });
    // CHECK IF PROJECT EXISTS
    if (!project) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Project not found",
        },
      };
    }
    // GET OWNER PREVIEW
    const owner = await getOwnerPreview(project.ownerId);
    // CHECK IF OWNER EXISTS
    if (!owner) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Project owner not found",
        },
      };
    }
    // FETCH CATEGORIES
    const projectCategories =
      project.categoryIds && project.categoryIds.length > 0
        ? await db.query.categories.findMany({
            where: inArray(categories.id, project.categoryIds),
          })
        : [];
    // BUILD PROJECT WITH DETAILS
    const contributorsWithPreview = project.contributors.map((contributor) => {
      // CAST TO UNKNOWN FIRST TO ACCESS NESTED USER RELATION
      const contributorData = contributor as unknown as {
        id: string;
        projectId: string;
        userId: string;
        role: string;
        addedAt: Date;
        user: {
          id: string;
          username: string;
          displayName: string | null;
          avatarUrl: string | null;
          bio: string | null;
          isVerified: boolean;
          reputationScore: number;
        };
      };
      // RETURN CONTRIBUTOR WITH PREVIEW
      return {
        ...contributor,
        user: {
          id: contributorData.user.id,
          username: contributorData.user.username,
          displayName: contributorData.user.displayName,
          avatarUrl: contributorData.user.avatarUrl,
          bio: contributorData.user.bio,
          isVerified: contributorData.user.isVerified,
          reputationScore: contributorData.user.reputationScore,
        },
      };
    });
    // BUILD PROJECT WITH DETAILS
    const projectWithDetails: ProjectWithDetails = {
      ...project,
      owner,
      media: project.media,
      contributors: contributorsWithPreview,
      categories: projectCategories,
    };
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: projectWithDetails,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching project by slug:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch project",
      },
    };
  }
}

// <== GET PROJECTS ==>
export async function getProjects(
  params: ProjectFiltersInput & {
    sortBy?: ProjectSortBy;
  } & OffsetPaginationParams = {}
): Promise<ApiResponse<OffsetPaginatedResult<ProjectPreview>>> {
  // TRY TO FETCH PROJECTS
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams(params);
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // BUILD WHERE CONDITIONS
    const whereConditions = [];
    // ADD STATUS FILTER
    if (params.status) {
      // ADD STATUS FILTER
      whereConditions.push(eq(projects.status, params.status));
    } else {
      // DEFAULT TO LAUNCHED AND FEATURED
      whereConditions.push(
        or(eq(projects.status, "launched"), eq(projects.status, "featured"))
      );
    }
    // ADD OWNER ID FILTER
    if (params.ownerId) {
      // ADD OWNER ID FILTER
      whereConditions.push(eq(projects.ownerId, params.ownerId));
    }
    // ADD CATEGORY FILTER
    if (params.categoryId) {
      // ADD CATEGORY ID FILTER
      whereConditions.push(
        sql`${params.categoryId} = ANY(${projects.categoryIds})`
      );
    }
    // ADD TECH STACK FILTER
    if (params.techStack && params.techStack.length > 0) {
      // ADD TECH STACK FILTER
      whereConditions.push(sql`${projects.techStack} && ${params.techStack}`);
    }
    // ADD OPEN SOURCE FILTER
    if (params.isOpenSource !== undefined) {
      // ADD OPEN SOURCE FILTER
      whereConditions.push(eq(projects.isOpenSource, params.isOpenSource));
    }
    // ADD SEARCH FILTER
    if (params.search) {
      // ADD SEARCH FILTER
      whereConditions.push(
        or(
          ilike(projects.name, `%${params.search}%`),
          ilike(projects.tagline, `%${params.search}%`)
        )
      );
    }
    // BUILD ORDER BY
    let orderByClause;
    // SWITCH BETWEEN SORT BY OPTIONS
    switch (params.sortBy) {
      // SORT BY OLDEST
      case "oldest":
        orderByClause = asc(projects.createdAt);
        break;
      // SORT BY POPULAR
      case "popular":
        orderByClause = desc(projects.upvotesCount);
        break;
      // SORT BY MOST COMMENTED
      case "most_commented":
        orderByClause = desc(projects.commentsCount);
        break;
      // SORT BY TRENDING
      case "trending":
        // TRENDING = RECENT + POPULAR
        orderByClause = sql`${projects.upvotesCount} / (EXTRACT(EPOCH FROM NOW() - ${projects.createdAt}) / 3600 + 2) DESC`;
        break;
      default:
        // DEFAULT TO OLDEST
        orderByClause = desc(projects.createdAt);
    }
    // FETCH PROJECTS AND COUNT
    const [projectsResult, countResult] = await Promise.all([
      db
        .select({
          id: projects.id,
          slug: projects.slug,
          name: projects.name,
          tagline: projects.tagline,
          logoUrl: projects.logoUrl,
          upvotesCount: projects.upvotesCount,
          commentsCount: projects.commentsCount,
          techStack: projects.techStack,
          launchDate: projects.launchDate,
          status: projects.status,
          ownerId: projects.ownerId,
        })
        .from(projects)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(projects)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        ),
    ]);
    // GET OWNER ID'S FROM PROJECTS
    const ownerIds = [...new Set(projectsResult.map((p) => p.ownerId))];
    // FETCH OWNERS BY OWNER ID'S
    const owners = await db.query.profiles.findMany({
      where: inArray(profiles.id, ownerIds),
    });
    // BUILD OWNER MAP
    const ownerMap = new Map(
      owners.map((o) => [
        o.id,
        {
          id: o.id,
          username: o.username,
          displayName: o.displayName,
          avatarUrl: o.avatarUrl,
          bio: o.bio,
          isVerified: o.isVerified,
          reputationScore: o.reputationScore,
        },
      ])
    );
    // BUILD PROJECT PREVIEWS
    const projectPreviews: ProjectPreview[] = projectsResult.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      logoUrl: p.logoUrl,
      upvotesCount: p.upvotesCount,
      commentsCount: p.commentsCount,
      techStack: p.techStack ?? [],
      owner: ownerMap.get(p.ownerId)!,
      launchDate: p.launchDate,
      status: p.status,
    }));
    // GET TOTAL COUNT
    const total = countResult[0]?.count ?? 0;
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(projectPreviews, total, {
      page,
      limit,
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching projects:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch projects",
      },
    };
  }
}

// <== GET PROJECTS BY OWNER ==>
export async function getProjectsByOwner(
  ownerId: string,
  params: OffsetPaginationParams = {}
): Promise<ApiResponse<OffsetPaginatedResult<ProjectPreview>>> {
  // USE GET PROJECTS WITH OWNER ID FILTER
  return getProjects({ ...params, ownerId, status: undefined });
}

// <== GET TRENDING PROJECTS ==>
export async function getTrendingProjects(
  limit: number = 10
): Promise<ApiResponse<ProjectPreview[]>> {
  // USE GET PROJECTS WITH TRENDING SORT
  const result = await getProjects({ sortBy: "trending", limit, page: 1 });
  // CHECK IF SUCCESS
  if (!result.success) {
    return result;
  }
  // RETURN ITEMS ONLY
  return {
    success: true,
    data: result.data.items,
  };
}

// <== GET FEATURED PROJECTS ==>
export async function getFeaturedProjects(
  limit: number = 10
): Promise<ApiResponse<ProjectPreview[]>> {
  // USE GET PROJECTS WITH FEATURED STATUS
  const result = await getProjects({ status: "featured", limit, page: 1 });
  // CHECK IF SUCCESS
  if (!result.success) {
    return result;
  }
  // RETURN ITEMS ONLY
  return {
    success: true,
    data: result.data.items,
  };
}

// <== UPVOTE PROJECT ==>
export async function upvoteProject(
  projectId: string
): Promise<ApiResponse<{ upvoted: boolean; upvotesCount: number }>> {
  // TRY TO UPVOTE PROJECT
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to upvote",
        },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // CHECK IF ALREADY UPVOTED
    const existingUpvote = await db.query.upvotes.findFirst({
      where: and(
        eq(upvotes.userId, profile.id),
        eq(upvotes.projectId, projectId)
      ),
    });
    // IF ALREADY UPVOTED, REMOVE UPVOTE
    if (existingUpvote) {
      // REMOVE UPVOTE
      await db.delete(upvotes).where(eq(upvotes.id, existingUpvote.id));
      // DECREMENT UPVOTES COUNT
      const [updatedProject] = await db
        .update(projects)
        .set({ upvotesCount: sql`${projects.upvotesCount} - 1` })
        .where(eq(projects.id, projectId))
        .returning({ upvotesCount: projects.upvotesCount });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          upvoted: false,
          upvotesCount: updatedProject?.upvotesCount ?? 0,
        },
      };
    }
    // ADD UPVOTE
    await db.insert(upvotes).values({
      userId: profile.id,
      projectId,
    });
    // INCREMENT UPVOTES COUNT
    const [updatedProject] = await db
      .update(projects)
      .set({ upvotesCount: sql`${projects.upvotesCount} + 1` })
      .where(eq(projects.id, projectId))
      .returning({ upvotesCount: projects.upvotesCount });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { upvoted: true, upvotesCount: updatedProject?.upvotesCount ?? 0 },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error upvoting project:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to upvote project",
      },
    };
  }
}

// <== BOOKMARK PROJECT ==>
export async function bookmarkProject(
  projectId: string
): Promise<ApiResponse<{ bookmarked: boolean; bookmarksCount: number }>> {
  // TRY TO BOOKMARK PROJECT
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to bookmark",
        },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // CHECK IF ALREADY BOOKMARKED
    const existingBookmark = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, profile.id),
        eq(bookmarks.projectId, projectId)
      ),
    });
    // IF ALREADY BOOKMARKED, REMOVE BOOKMARK
    if (existingBookmark) {
      // REMOVE BOOKMARK
      await db.delete(bookmarks).where(eq(bookmarks.id, existingBookmark.id));
      // DECREMENT BOOKMARKS COUNT
      const [updatedProject] = await db
        .update(projects)
        .set({ bookmarksCount: sql`${projects.bookmarksCount} - 1` })
        .where(eq(projects.id, projectId))
        .returning({ bookmarksCount: projects.bookmarksCount });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          bookmarked: false,
          bookmarksCount: updatedProject?.bookmarksCount ?? 0,
        },
      };
    }
    // ADD BOOKMARK
    await db.insert(bookmarks).values({
      userId: profile.id,
      projectId,
    });
    // INCREMENT BOOKMARKS COUNT
    const [updatedProject] = await db
      .update(projects)
      .set({ bookmarksCount: sql`${projects.bookmarksCount} + 1` })
      .where(eq(projects.id, projectId))
      .returning({ bookmarksCount: projects.bookmarksCount });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        bookmarked: true,
        bookmarksCount: updatedProject?.bookmarksCount ?? 0,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error bookmarking project:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to bookmark project",
      },
    };
  }
}

// <== CHECK IF USER HAS UPVOTED PROJECT ==>
export async function hasUpvotedProject(
  projectId: string
): Promise<ApiResponse<{ hasUpvoted: boolean }>> {
  // TRY TO CHECK IF USER HAS UPVOTED PROJECT
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // IF NOT AUTHENTICATED, RETURN FALSE
    if (!user) {
      // RETURN FALSE RESPONSE
      return { success: true, data: { hasUpvoted: false } };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // IF NO PROFILE, RETURN FALSE
    if (!profile) {
      // RETURN FALSE RESPONSE
      return { success: true, data: { hasUpvoted: false } };
    }
    // CHECK IF UPVOTED
    const existingUpvote = await db.query.upvotes.findFirst({
      where: and(
        eq(upvotes.userId, profile.id),
        eq(upvotes.projectId, projectId)
      ),
    });
    // RETURN RESULT
    return { success: true, data: { hasUpvoted: !!existingUpvote } };
  } catch (error) {
    // LOG ERROR
    console.error("Error checking upvote status:", error);
    // RETURN FALSE ON ERROR
    return { success: true, data: { hasUpvoted: false } };
  }
}

// <== CHECK IF USER HAS BOOKMARKED PROJECT ==>
export async function hasBookmarkedProject(
  projectId: string
): Promise<ApiResponse<{ hasBookmarked: boolean }>> {
  // TRY TO CHECK IF USER HAS BOOKMARKED PROJECT
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // IF NOT AUTHENTICATED, RETURN FALSE
    if (!user) {
      // RETURN FALSE RESPONSE
      return { success: true, data: { hasBookmarked: false } };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // IF NO PROFILE, RETURN FALSE
    if (!profile) {
      // RETURN FALSE RESPONSE
      return { success: true, data: { hasBookmarked: false } };
    }
    // CHECK IF BOOKMARKED
    const existingBookmark = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, profile.id),
        eq(bookmarks.projectId, projectId)
      ),
    });
    // RETURN RESULT
    return { success: true, data: { hasBookmarked: !!existingBookmark } };
  } catch (error) {
    // LOG ERROR
    console.error("Error checking bookmark status:", error);
    // RETURN FALSE ON ERROR
    return { success: true, data: { hasBookmarked: false } };
  }
}
