// <== IMPORTS ==>
import { NextRequest, NextResponse } from "next/server";
import { createProjectSchema } from "@/lib/validations/projects";
import { getProjects, createProject } from "@/server/actions/projects";
import type {
  ProjectFiltersInput,
  ProjectSortBy,
} from "@/lib/validations/projects";

// <== GET PROJECTS ==>
export async function GET(request: NextRequest) {
  // TRY TO FETCH PROJECTS
  try {
    // GET SEARCH PARAMS
    const searchParams = request.nextUrl.searchParams;
    // BUILD FILTERS
    const filters: ProjectFiltersInput & {
      sortBy?: ProjectSortBy;
      page?: number;
      limit?: number;
    } = {};
    // ADD STATUS FILTER
    const status = searchParams.get("status");
    // CHECK IF STATUS IS VALID
    if (
      status &&
      ["draft", "pending", "launched", "featured"].includes(status)
    ) {
      // ADD STATUS FILTER
      filters.status = status as ProjectFiltersInput["status"];
    }
    // ADD CATEGORY FILTER
    const categoryId = searchParams.get("categoryId");
    // CHECK IF CATEGORY ID IS VALID
    if (categoryId) {
      // ADD CATEGORY ID FILTER
      filters.categoryId = categoryId;
    }
    // ADD OWNER FILTER
    const ownerId = searchParams.get("ownerId");
    // CHECK IF OWNER ID IS VALID
    if (ownerId) {
      // ADD OWNER ID FILTER
      filters.ownerId = ownerId;
    }
    // ADD OPEN SOURCE FILTER
    const isOpenSource = searchParams.get("isOpenSource");
    // CHECK IF OPEN SOURCE IS VALID
    if (isOpenSource !== null) {
      // ADD OPEN SOURCE FILTER
      filters.isOpenSource = isOpenSource === "true";
    }
    // ADD SEARCH FILTER
    const search = searchParams.get("search");
    // CHECK IF SEARCH IS VALID
    if (search) {
      // ADD SEARCH FILTER
      filters.search = search;
    }
    // ADD TECH STACK FILTER
    const techStack = searchParams.get("techStack");
    // CHECK IF TECH STACK IS VALID
    if (techStack) {
      // ADD TECH STACK FILTER
      filters.techStack = techStack.split(",");
    }
    // ADD SORT BY
    const sortBy = searchParams.get("sortBy");
    // CHECK IF SORT BY IS VALID
    if (
      sortBy &&
      ["newest", "oldest", "popular", "trending", "most_commented"].includes(
        sortBy
      )
    ) {
      // ADD SORT BY FILTER
      filters.sortBy = sortBy as ProjectSortBy;
    }
    // ADD PAGINATION
    const page = searchParams.get("page");
    // CHECK IF PAGE IS VALID
    if (page) {
      // ADD PAGE FILTER
      filters.page = parseInt(page, 10);
    }
    // ADD LIMIT FILTER
    const limit = searchParams.get("limit");
    // CHECK IF LIMIT IS VALID
    if (limit) {
      // ADD LIMIT FILTER
      filters.limit = parseInt(limit, 10);
    }
    // FETCH PROJECTS
    const result = await getProjects(filters);
    // CHECK IF SUCCESS
    if (!result.success) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(result, { status: 500 });
    }
    // RETURN SUCCESS RESPONSE
    return NextResponse.json(result);
  } catch (error) {
    // LOG ERROR
    console.error("Error in projects API:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch projects",
        },
      },
      { status: 500 }
    );
  }
}

// <== CREATE PROJECT ==>
export async function POST(request: NextRequest) {
  // TRY TO CREATE PROJECT
  try {
    // PARSE REQUEST BODY
    const body = await request.json();
    // VALIDATE INPUT
    const validatedFields = createProjectSchema.safeParse(body);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              validatedFields.error.issues[0]?.message ?? "Invalid input",
            details: validatedFields.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }
    // CREATE PROJECT
    const result = await createProject(validatedFields.data);
    // CHECK IF SUCCESS
    if (!result.success) {
      // DETERMINE STATUS CODE
      const statusCode =
        result.error.code === "UNAUTHORIZED"
          ? 401
          : result.error.code === "NOT_FOUND"
          ? 404
          : 500;
      // RETURN ERROR RESPONSE
      return NextResponse.json(result, { status: statusCode });
    }
    // RETURN SUCCESS RESPONSE
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // LOG ERROR
    console.error("Error creating project:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create project",
        },
      },
      { status: 500 }
    );
  }
}
