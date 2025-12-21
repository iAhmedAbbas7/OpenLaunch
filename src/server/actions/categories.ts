// <== SERVER ACTIONS FOR CATEGORIES ==>
"use server";

// <== IMPORTS ==>
import { db } from "@/lib/db";
import { asc } from "drizzle-orm";
import { categories } from "@/lib/db/schema";
import type { Category } from "@/lib/db/schema";
import type { ApiResponse } from "@/types/database";

// <== GET ALL CATEGORIES ==>
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  // TRY TO FETCH CATEGORIES
  try {
    // FETCH CATEGORIES
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder), asc(categories.name));
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: allCategories,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching categories:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch categories",
      },
    };
  }
}
