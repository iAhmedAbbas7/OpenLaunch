// <== IMPORTS ==>
import {
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "@/server/actions/projects";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { projects } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { updateProjectSchema } from "@/lib/validations/projects";

// <== GET PROJECT BY SLUG ==>
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // TRY TO FETCH PROJECT
  try {
    // GET SLUG FROM PARAMS
    const { slug } = await params;
    // FETCH PROJECT BY SLUG
    const result = await getProjectBySlug(slug);
    // CHECK IF SUCCESS
    if (!result.success) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(result, {
        status: result.error.code === "NOT_FOUND" ? 404 : 500,
      });
    }
    // RETURN SUCCESS RESPONSE
    return NextResponse.json(result);
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching project:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch project",
        },
      },
      { status: 500 }
    );
  }
}

// <== UPDATE PROJECT ==>
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // TRY TO UPDATE PROJECT
  try {
    // GET SLUG FROM PARAMS
    const { slug } = await params;
    // PARSE REQUEST BODY
    const body = await request.json();
    // VALIDATE INPUT
    const validatedFields = updateProjectSchema.safeParse(body);
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
    // GET PROJECT ID FROM SLUG
    const project = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
    });
    // CHECK IF PROJECT EXISTS
    if (!project) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Project not found",
          },
        },
        { status: 404 }
      );
    }
    // UPDATE PROJECT
    const result = await updateProject(project.id, validatedFields.data);
    // CHECK IF SUCCESS
    if (!result.success) {
      // DETERMINE STATUS CODE
      const statusCode =
        result.error.code === "UNAUTHORIZED"
          ? 401
          : result.error.code === "FORBIDDEN"
          ? 403
          : result.error.code === "NOT_FOUND"
          ? 404
          : 500;
      // RETURN ERROR RESPONSE
      return NextResponse.json(result, { status: statusCode });
    }
    // RETURN SUCCESS RESPONSE
    return NextResponse.json(result);
  } catch (error) {
    // LOG ERROR
    console.error("Error updating project:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update project",
        },
      },
      { status: 500 }
    );
  }
}

// <== DELETE PROJECT ==>
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // TRY TO DELETE PROJECT
  try {
    // GET SLUG FROM PARAMS
    const { slug } = await params;
    // GET PROJECT ID FROM SLUG
    const project = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
    });
    // CHECK IF PROJECT EXISTS
    if (!project) {
      // RETURN ERROR RESPONSE
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Project not found",
          },
        },
        { status: 404 }
      );
    }
    // DELETE PROJECT
    const result = await deleteProject(project.id);
    // CHECK IF SUCCESS
    if (!result.success) {
      // DETERMINE STATUS CODE
      const statusCode =
        result.error.code === "UNAUTHORIZED"
          ? 401
          : result.error.code === "FORBIDDEN"
          ? 403
          : result.error.code === "NOT_FOUND"
          ? 404
          : 500;
      // RETURN ERROR RESPONSE
      return NextResponse.json(result, { status: statusCode });
    }
    // RETURN SUCCESS RESPONSE
    return NextResponse.json(result);
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting project:", error);
    // RETURN ERROR RESPONSE
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete project",
        },
      },
      { status: 500 }
    );
  }
}
