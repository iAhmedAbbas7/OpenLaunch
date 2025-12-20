// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  AuthCard,
  AuthCardHeader,
  AuthCardFooter,
  AuthFormSection,
} from "@/components/auth/auth-card";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons";

// <== SIGN IN FORM COMPONENT ==>
export const SignInForm = () => {
  // STATE FOR PASSWORD VISIBILITY
  const [showPassword, setShowPassword] = useState(false);
  // STATE FOR ERROR
  const [error, setError] = useState<string | null>(null);
  // GET AUTH HOOK
  const { signIn, isLoading } = useAuth();
  // FORM HOOK
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  // FORM ERRORS
  const { errors, isSubmitting } = form.formState;
  // IS FORM DISABLED
  const isDisabled = isLoading || isSubmitting;
  // <== HANDLE FORM SUBMIT ==>
  const onSubmit = async (data: SignInInput) => {
    // RESET ERROR
    setError(null);
    // SIGN IN
    const result = await signIn(data);
    // CHECK IF ERROR
    if (!result.success) {
      // SET ERROR
      setError(result.error ?? "Failed to sign in");
    }
  };
  // RETURNING SIGN IN FORM COMPONENT
  return (
    // AUTH CARD
    <AuthCard>
      {/* AUTH CARD HEADER */}
      <AuthCardHeader
        title="Welcome back"
        description="Sign in to your account to continue"
      />
      {/* OAUTH BUTTONS */}
      <AuthFormSection>
        <OAuthButtons disabled={isDisabled} />
      </AuthFormSection>
      {/* DIVIDER */}
      <AuthFormSection>
        <OAuthDivider />
      </AuthFormSection>
      {/* FORM */}
      <AuthFormSection>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* ERROR MESSAGE */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}
          {/* EMAIL FIELD */}
          <div className="space-y-2">
            {/* LABEL */}
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            {/* INPUT */}
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isDisabled}
              className="h-11 transition-colors focus:border-primary"
              {...form.register("email")}
            />
            {/* ERROR */}
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          {/* PASSWORD FIELD */}
          <div className="space-y-2">
            {/* LABEL AND FORGOT PASSWORD LINK */}
            <div className="flex items-center justify-between">
              {/* LABEL */}
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              {/* FORGOT PASSWORD LINK */}
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
            {/* INPUT CONTAINER */}
            <div className="relative">
              {/* INPUT */}
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isDisabled}
                className="h-11 pr-10 transition-colors focus:border-primary"
                {...form.register("password")}
              />
              {/* TOGGLE PASSWORD VISIBILITY */}
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {/* ERROR */}
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            className="w-full h-11 font-medium transition-all duration-200 hover:opacity-90"
            disabled={isDisabled}
          >
            {/* LOADING SPINNER */}
            {isDisabled && <Loader2 className="mr-2 size-4 animate-spin" />}
            {/* BUTTON TEXT */}
            Sign In
          </Button>
        </form>
      </AuthFormSection>
      {/* AUTH CARD FOOTER */}
      <AuthCardFooter>
        {/* SIGN UP LINK */}
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors duration-200"
        >
          Sign up
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
};
