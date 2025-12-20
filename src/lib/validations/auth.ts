// <== IMPORTS ==>
import { z } from "zod";
import { authConfig } from "@/config/auth";

// <== PASSWORD VALIDATION SCHEMA ==>
const passwordSchema = z
  .string()
  .min(
    authConfig.validation.passwordMinLength,
    `Password must be at least ${authConfig.validation.passwordMinLength} characters`
  )
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// <== USERNAME VALIDATION SCHEMA ==>
const usernameSchema = z
  .string()
  .min(
    authConfig.validation.usernameMinLength,
    `Username must be at least ${authConfig.validation.usernameMinLength} characters`
  )
  .max(
    authConfig.validation.usernameMaxLength,
    `Username must be at most ${authConfig.validation.usernameMaxLength} characters`
  )
  .regex(
    authConfig.validation.usernamePattern,
    "Username can only contain letters, numbers, and underscores"
  )
  .transform((val) => val.toLowerCase());

// <== EMAIL VALIDATION SCHEMA ==>
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .transform((val) => val.toLowerCase());

// <== SIGN UP SCHEMA ==>
export const signUpSchema = z.object({
  // EMAIL
  email: emailSchema,
  // PASSWORD
  password: passwordSchema,
  // USERNAME
  username: usernameSchema,
  // DISPLAY NAME (REQUIRED)
  displayName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name is too long"),
});

// <== SIGN IN SCHEMA ==>
export const signInSchema = z.object({
  // EMAIL
  email: emailSchema,
  // PASSWORD
  password: z.string().min(1, "Password is required"),
});

// <== FORGOT PASSWORD SCHEMA ==>
export const forgotPasswordSchema = z.object({
  // EMAIL
  email: emailSchema,
});

// <== RESET PASSWORD SCHEMA ==>
export const resetPasswordSchema = z
  .object({
    // PASSWORD
    password: passwordSchema,
    // CONFIRM PASSWORD
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // ERROR MESSAGE
    message: "Passwords do not match",
    // PATH TO ERROR
    path: ["confirmPassword"],
  });

// <== UPDATE PROFILE SCHEMA ==>
export const updateProfileSchema = z.object({
  // USERNAME
  username: usernameSchema.optional(),
  // DISPLAY NAME
  displayName: z.string().max(100, "Display name is too long").optional(),
  // BIO
  bio: z.string().max(500, "Bio is too long").optional(),
  // WEBSITE
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  // LOCATION
  location: z.string().max(100, "Location is too long").optional(),
  // TWITTER USERNAME
  twitterUsername: z
    .string()
    .max(15, "Twitter username is too long")
    .regex(/^[a-zA-Z0-9_]*$/, "Invalid Twitter username")
    .optional()
    .or(z.literal("")),
});

// <== SIGN UP INPUT TYPE ==>
export type SignUpInput = z.infer<typeof signUpSchema>;
// <== SIGN IN INPUT TYPE ==>
export type SignInInput = z.infer<typeof signInSchema>;
// <== FORGOT PASSWORD INPUT TYPE ==>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
// <== RESET PASSWORD INPUT TYPE ==>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
// <== UPDATE PROFILE INPUT TYPE ==>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
