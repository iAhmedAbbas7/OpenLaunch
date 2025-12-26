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
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons";
import { Loader2, Eye, EyeOff, CheckCircle2, PartyPopper } from "lucide-react";

// <== SIGN UP FORM COMPONENT ==>
export const SignUpForm = () => {
  // STATE FOR PASSWORD VISIBILITY
  const [showPassword, setShowPassword] = useState(false);
  // STATE FOR ERROR
  const [error, setError] = useState<string | null>(null);
  // STATE FOR SUCCESS (EMAIL CONFIRMATION REQUIRED)
  const [success, setSuccess] = useState(false);
  // STATE FOR INSTANT SUCCESS (NO EMAIL CONFIRMATION)
  const [instantSuccess, setInstantSuccess] = useState(false);
  // GET AUTH HOOK
  const { signUp, isLoading } = useAuth();
  // FORM HOOK
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      displayName: "",
    },
  });
  // FORM ERRORS
  const { errors, isSubmitting } = form.formState;
  // IS FORM DISABLED
  const isDisabled = isLoading || isSubmitting;
  // <== HANDLE FORM SUBMIT ==>
  const onSubmit = async (data: SignUpInput) => {
    // RESET ERROR
    setError(null);
    // RESET SUCCESS STATES
    setSuccess(false);
    setInstantSuccess(false);
    // SIGN UP
    const result = await signUp(data);
    // CHECK IF ERROR
    if (!result.success) {
      // SET ERROR
      setError(result.error ?? "Failed to create account");
    } else {
      // CHECK IF EMAIL CONFIRMATION IS REQUIRED
      if (result.data?.needsEmailConfirmation) {
        // SHOW EMAIL VERIFICATION STATE
        setSuccess(true);
      } else {
        // NO EMAIL CONFIRMATION REQUIRED - SHOW INSTANT SUCCESS
        setInstantSuccess(true);
      }
    }
  };
  // <== RENDER INSTANT SUCCESS STATE (NO EMAIL CONFIRMATION) ==>
  if (instantSuccess) {
    // RETURNING INSTANT SUCCESS STATE
    return (
      // AUTH CARD
      <AuthCard className="text-center">
        {/* SUCCESS ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 rounded-full bg-primary/10 ring-4 ring-primary/5">
            <PartyPopper className="size-8 text-primary" />
          </div>
        </motion.div>
        {/* SUCCESS TITLE */}
        <AuthFormSection>
          <h2 className="text-xl font-bold font-heading mb-2">
            Account Created Successfully!
          </h2>
        </AuthFormSection>
        {/* SUCCESS MESSAGE */}
        <AuthFormSection>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Your account has been created. Please sign in with your credentials
            to get started.
          </p>
        </AuthFormSection>
        {/* BACK TO SIGN IN */}
        <AuthFormSection>
          <Button
            asChild
            variant="outline"
            className="w-full h-11 transition-all duration-200 hover:bg-foreground/5"
          >
            <Link href="/sign-in">Back to Sign In</Link>
          </Button>
        </AuthFormSection>
      </AuthCard>
    );
  }
  // <== RENDER EMAIL VERIFICATION SUCCESS STATE ==>
  if (success) {
    // RETURNING SUCCESS STATE
    return (
      // AUTH CARD
      <AuthCard className="text-center">
        {/* SUCCESS ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 rounded-full bg-primary/10 ring-4 ring-primary/5">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
        </motion.div>
        {/* SUCCESS TITLE */}
        <AuthFormSection>
          <h2 className="text-xl font-bold font-heading mb-2">
            Check your email
          </h2>
        </AuthFormSection>
        {/* SUCCESS MESSAGE */}
        <AuthFormSection>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            We sent you a verification link. Please check your email to verify
            your account.
          </p>
        </AuthFormSection>
        {/* BACK TO SIGN IN */}
        <AuthFormSection>
          <Button
            asChild
            variant="outline"
            className="w-full h-11 transition-all duration-200 hover:bg-foreground/5"
          >
            <Link href="/sign-in">Back to Sign In</Link>
          </Button>
        </AuthFormSection>
      </AuthCard>
    );
  }
  // RETURNING SIGN UP FORM COMPONENT
  return (
    // AUTH CARD
    <AuthCard>
      {/* AUTH CARD HEADER */}
      <AuthCardHeader
        title="Create an account"
        description="Join OpenLaunch and start launching"
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
          {/* FULL NAME FIELD */}
          <div className="space-y-2">
            {/* LABEL */}
            <Label htmlFor="displayName" className="text-sm font-medium">
              Full Name
            </Label>
            {/* INPUT */}
            <Input
              id="displayName"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              disabled={isDisabled}
              className="h-11 transition-colors focus:border-primary"
              {...form.register("displayName")}
            />
            {/* ERROR */}
            {errors.displayName && (
              <p className="text-xs text-destructive">
                {errors.displayName.message}
              </p>
            )}
          </div>
          {/* USERNAME FIELD */}
          <div className="space-y-2">
            {/* LABEL */}
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            {/* INPUT */}
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              autoComplete="username"
              disabled={isDisabled}
              className="h-11 transition-colors focus:border-primary"
              {...form.register("username")}
            />
            {/* ERROR */}
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>
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
            {/* LABEL */}
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            {/* INPUT CONTAINER */}
            <div className="relative">
              {/* INPUT */}
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
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
            {/* PASSWORD HINT */}
            <p className="text-xs text-muted-foreground/70">
              Min 8 chars with uppercase, lowercase & number
            </p>
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
            Create Account
          </Button>
        </form>
      </AuthFormSection>
      {/* TERMS AND PRIVACY */}
      <AuthFormSection className="mt-4">
        <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
          By signing up, you agree to our{" "}
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </p>
      </AuthFormSection>
      {/* AUTH CARD FOOTER */}
      <AuthCardFooter>
        {/* SIGN IN LINK */}
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors duration-200"
        >
          Sign in
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
};
