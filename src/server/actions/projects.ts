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
  projectContributors,
  projectMedia,
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
  type LaunchPeriod,
} from "@/lib/validations/projects";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Project, NewProject } from "@/lib/db/schema";

// <== PROJECT STATS BY STATUS TYPE ==>
export interface ProjectStatsByStatus {
  // <== DRAFT ==>
  draft: number;
  // <== PENDING ==>
  pending: number;
  // <== LAUNCHED ==>
  launched: number;
  // <== FEATURED ==>
  featured: number;
  // <== TOTAL ==>
  total: number;
  // <== PROJECTS ==>
  projects: Array<{
    // <== ID ==>
    id: string;
    // <== NAME ==>
    name: string;
    // <== SLUG ==>
    slug: string;
    // <== STATUS ==>
    status: string;
    // <== GITHUB URL ==>
    githubUrl: string | null;
    // <== CREATED AT ==>
    createdAt: Date;
  }>;
}

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
    // CHECK IF PROJECT WITH SAME GITHUB URL ALREADY EXISTS (FOR IMPORT FLOW)
    if (validatedFields.data.githubUrl) {
      // CHECK IF PROJECT WITH SAME GITHUB URL ALREADY EXISTS
      const existingProject = await db.query.projects.findFirst({
        where: and(
          eq(projects.ownerId, profile.id),
          eq(projects.githubUrl, validatedFields.data.githubUrl)
        ),
      });
      // IF PROJECT EXISTS, RETURN IT INSTEAD OF CREATING A NEW ONE
      if (existingProject) {
        // RETURN EXISTING PROJECT
        return {
          success: true,
          data: existingProject,
        };
      }
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
    // FETCH PROJECT WITHOUT RELATIONS (MORE ROBUST)
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    // CHECK IF PROJECT EXISTS
    if (!project || project.length === 0) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Project not found",
        },
      };
    }
    // GET PROJECT DATA
    const projectData = project[0];
    // GET OWNER PREVIEW
    const owner = await getOwnerPreview(projectData.ownerId);
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
    // FETCH MEDIA SEPARATELY
    const projectMediaList = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectData.id))
      .orderBy(asc(projectMedia.displayOrder));
    // FETCH CATEGORIES
    const projectCategories =
      projectData.categoryIds && projectData.categoryIds.length > 0
        ? await db.query.categories.findMany({
            where: inArray(categories.id, projectData.categoryIds),
          })
        : [];
    // FETCH CONTRIBUTORS SEPARATELY
    const contributorRecords = await db
      .select()
      .from(projectContributors)
      .where(eq(projectContributors.projectId, projectData.id));
    // FETCH USER DATA FOR CONTRIBUTORS
    const contributorsWithPreview = await Promise.all(
      contributorRecords.map(async (contributor) => {
        // FETCH USER PROFILE
        const userProfile = await db.query.profiles.findFirst({
          where: eq(profiles.id, contributor.userId),
        });
        // RETURN CONTRIBUTOR WITH USER PREVIEW
        return {
          id: contributor.id,
          projectId: contributor.projectId,
          userId: contributor.userId,
          role: contributor.role,
          joinedAt: contributor.joinedAt,
          user: userProfile
            ? {
                id: userProfile.id,
                username: userProfile.username,
                displayName: userProfile.displayName,
                avatarUrl: userProfile.avatarUrl,
                bio: userProfile.bio,
                isVerified: userProfile.isVerified,
                reputationScore: userProfile.reputationScore,
              }
            : null,
        };
      })
    );
    // FILTER OUT CONTRIBUTORS WITH NULL USER (SHOULDN'T HAPPEN BUT SAFETY)
    const validContributors = contributorsWithPreview.filter(
      (c) => c.user !== null
    ) as Array<{
      id: string;
      projectId: string;
      userId: string;
      role: string | null;
      joinedAt: Date;
      user: ProfilePreview;
    }>;
    // BUILD PROJECT WITH DETAILS
    const projectWithDetails: ProjectWithDetails = {
      ...projectData,
      owner,
      media: projectMediaList,
      contributors: validContributors,
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
    // ADD LAUNCH PERIOD FILTER
    if (params.launchPeriod && params.launchPeriod !== "all") {
      // GET PERIOD START DATE
      const now = new Date();
      // PERIOD START DATE
      let periodStart: Date;
      // SWITCH BETWEEN PERIODS
      switch (params.launchPeriod) {
        // TODAY
        case "today":
          // START OF TODAY (MIDNIGHT)
          periodStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        // WEEK
        case "week":
          // START OF THIS WEEK (SUNDAY)
          const dayOfWeek = now.getDay();
          periodStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - dayOfWeek
          );
          break;
        // MONTH
        case "month":
          // START OF THIS MONTH
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          // DEFAULT TO NULL
          periodStart = new Date(0);
      }
      // ADD DATE FILTER - USE LAUNCH DATE IF SET, OTHERWISE CREATED AT
      whereConditions.push(
        sql`COALESCE(${projects.launchDate}, ${
          projects.createdAt
        }) >= ${periodStart.toISOString()}`
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

// <== GET LAUNCHES BY PERIOD ==>
export async function getLaunchesByPeriod(
  period: LaunchPeriod = "today",
  limit: number = 20
): Promise<ApiResponse<ProjectPreview[]>> {
  // USE GET PROJECTS WITH PERIOD FILTER AND TRENDING SORT
  const result = await getProjects({
    launchPeriod: period,
    sortBy: "trending",
    limit,
    page: 1,
  });
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

// <== GET MY PROJECT STATS BY STATUS ==>
export async function getMyProjectStatsByStatus(): Promise<
  ApiResponse<ProjectStatsByStatus>
> {
  // TRY TO GET PROJECT STATS
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
          message: "You must be logged in",
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
    // GET ALL USER PROJECTS
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.ownerId, profile.id),
      orderBy: [desc(projects.createdAt)],
    });
    // COUNT BY STATUS
    const stats: ProjectStatsByStatus = {
      draft: 0,
      pending: 0,
      launched: 0,
      featured: 0,
      total: userProjects.length,
      projects: userProjects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        status: p.status,
        githubUrl: p.githubUrl,
        createdAt: p.createdAt,
      })),
    };
    // COUNT EACH STATUS
    for (const project of userProjects) {
      // COUNT BY STATUS
      if (project.status in stats) {
        // INCREMENT COUNT
        stats[
          project.status as keyof Omit<
            ProjectStatsByStatus,
            "total" | "projects"
          >
        ]++;
      }
    }
    // RETURN STATS
    return { success: true, data: stats };
  } catch (error) {
    // LOG ERROR
    console.error("Error getting project stats:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to get project stats",
      },
    };
  }
}

// <== DELETE DRAFT PROJECTS ==>
export async function deleteDraftProjects(): Promise<
  ApiResponse<{ deletedCount: number }>
> {
  // TRY TO DELETE DRAFT PROJECTS
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
          message: "You must be logged in",
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
    // DELETE ALL DRAFT PROJECTS FOR THIS USER
    const deletedProjects = await db
      .delete(projects)
      .where(
        and(eq(projects.ownerId, profile.id), eq(projects.status, "draft"))
      )
      .returning({ id: projects.id });
    // RETURN COUNT
    return {
      success: true,
      data: { deletedCount: deletedProjects.length },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting draft projects:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete draft projects",
      },
    };
  }
}
